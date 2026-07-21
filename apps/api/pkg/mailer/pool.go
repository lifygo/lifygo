package mailer

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"sync"
	"time"
)

type pooledClient struct {
	client   *smtp.Client
	host     string
	addr     string
	auth     smtp.Auth
	port     int
	lastUsed time.Time
}

type Pool struct {
	mu          sync.Mutex
	clients     map[string]*pooledClient
	idleTimeout time.Duration
	stopCh      chan struct{}
	stopOnce    sync.Once
}

func NewPool(idleTimeout time.Duration) *Pool {
	p := &Pool{
		clients:     make(map[string]*pooledClient),
		idleTimeout: idleTimeout,
		stopCh:      make(chan struct{}),
	}
	go p.reapLoop()
	return p
}

func (p *Pool) key(host string, port int, username string) string {
	return fmt.Sprintf("%s:%d:%s", host, port, username)
}

func (p *Pool) getClient(cfg Config) (*smtp.Client, error) {
	key := p.key(cfg.Host, cfg.Port, cfg.Username)
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	auth := smtp.PlainAuth("", cfg.Username, cfg.Password, cfg.Host)

	p.mu.Lock()
	pc, ok := p.clients[key]
	if ok {
		pc.lastUsed = time.Now()
		client := pc.client
		p.mu.Unlock()

		if err := client.Noop(); err != nil {
			client.Close()
			p.mu.Lock()
			delete(p.clients, key)
			p.mu.Unlock()
			return p.dialAndAuth(cfg, addr, auth)
		}

		if err := client.Reset(); err != nil {
			client.Close()
			p.mu.Lock()
			delete(p.clients, key)
			p.mu.Unlock()
			return p.dialAndAuth(cfg, addr, auth)
		}

		return client, nil
	}
	p.mu.Unlock()

	return p.dialAndAuth(cfg, addr, auth)
}

func (p *Pool) dialAndAuth(cfg Config, addr string, auth smtp.Auth) (*smtp.Client, error) {
	var client *smtp.Client
	var err error

	if cfg.Port == 465 {
		client, err = p.dialTLS(cfg, addr)
	} else {
		client, err = p.dialSTARTTLS(cfg, addr)
	}
	if err != nil {
		return nil, err
	}

	if err := client.Auth(auth); err != nil {
		client.Close()
		return nil, fmt.Errorf("smtp authentication failed: %w", err)
	}

	return client, nil
}

func (p *Pool) dialSTARTTLS(cfg Config, addr string) (*smtp.Client, error) {
	conn, err := net.DialTimeout("tcp", addr, dialTimeout)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to smtp server: %w", err)
	}

	client, err := smtp.NewClient(conn, cfg.Host)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create smtp client: %w", err)
	}

	tlsConfig := cfg.TLSConfig
	if tlsConfig == nil {
		tlsConfig = &tls.Config{
			ServerName: cfg.Host,
			MinVersion: tls.VersionTLS12,
		}
	} else {
		if tlsConfig.ServerName == "" {
			tlsConfig.ServerName = cfg.Host
		}
	}

	if err := client.StartTLS(tlsConfig); err != nil {
		client.Close()
		return nil, fmt.Errorf("starttls failed: %w", err)
	}

	return client, nil
}

func (p *Pool) dialTLS(cfg Config, addr string) (*smtp.Client, error) {
	tlsConfig := cfg.TLSConfig
	if tlsConfig == nil {
		tlsConfig = &tls.Config{
			ServerName: cfg.Host,
			MinVersion: tls.VersionTLS12,
		}
	} else {
		if tlsConfig.ServerName == "" {
			tlsConfig.ServerName = cfg.Host
		}
	}

	conn, err := tls.DialWithDialer(
		&net.Dialer{Timeout: dialTimeout},
		"tcp",
		addr,
		tlsConfig,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to establish tls connection: %w", err)
	}

	client, err := smtp.NewClient(conn, cfg.Host)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create smtp client: %w", err)
	}

	return client, nil
}

func (p *Pool) returnClient(key string, client *smtp.Client) {
	pc := &pooledClient{
		client:   client,
		lastUsed: time.Now(),
	}

	p.mu.Lock()
	p.clients[key] = pc
	p.mu.Unlock()
}

func (p *Pool) reapLoop() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			p.reap()
		case <-p.stopCh:
			return
		}
	}
}

func (p *Pool) reap() {
	now := time.Now()
	p.mu.Lock()
	defer p.mu.Unlock()

	for key, pc := range p.clients {
		if now.Sub(pc.lastUsed) > p.idleTimeout {
			pc.client.Close()
			delete(p.clients, key)
		}
	}
}

func (p *Pool) Shutdown() {
	p.stopOnce.Do(func() {
		close(p.stopCh)
	})

	p.mu.Lock()
	defer p.mu.Unlock()

	for key, pc := range p.clients {
		pc.client.Close()
		delete(p.clients, key)
	}
}
