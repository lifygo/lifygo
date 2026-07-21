package mailer

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"strings"
	"time"
)

type Mailer struct {
	host        string
	port        int
	username    string
	password    string
	fromAddress string
	tlsConfig   *tls.Config
	pool        *Pool
}

type Config struct {
	Host        string
	Port        int
	Username    string
	Password    string
	FromAddress string
	TLSConfig   *tls.Config
	Pool        *Pool
}

type Message struct {
	To      string
	Subject string
	Body    string
	IsHTML  bool
}

const dialTimeout = 10 * time.Second

func New(cfg Config) (*Mailer, error) {
	if err := cfg.validate(); err != nil {
		return nil, err
	}
	return &Mailer{
		host:        cfg.Host,
		port:        cfg.Port,
		username:    cfg.Username,
		password:    cfg.Password,
		fromAddress: cfg.FromAddress,
		tlsConfig:   cfg.TLSConfig,
		pool:        cfg.Pool,
	}, nil
}

func (m *Mailer) Send(msg Message) error {
	if err := msg.validate(); err != nil {
		return err
	}

	addr := fmt.Sprintf("%s:%d", m.host, m.port)
	raw := m.buildRaw(msg)
	key := ""

	var client *smtp.Client
	var err error

	if m.pool != nil {
		key = m.pool.key(m.host, m.port, m.username)
		client, err = m.pool.getClient(Config{
			Host:      m.host,
			Port:      m.port,
			Username:  m.username,
			Password:  m.password,
			TLSConfig: m.tlsConfig,
		})
	} else {
		auth := smtp.PlainAuth("", m.username, m.password, m.host)
		if m.port == 465 {
			client, err = dialTLSDirect(addr, m.host, m.tlsConfig, auth)
		} else {
			client, err = dialSTARTTLS(addr, m.host, m.tlsConfig, auth)
		}
	}

	if err != nil {
		return fmt.Errorf("smtp send failed: %w", err)
	}

	defer func() {
		if m.pool != nil && key != "" {
			m.pool.returnClient(key, client)
		} else {
			client.Close()
		}
	}()

	if err := client.Mail(m.fromAddress); err != nil {
		return fmt.Errorf("smtp MAIL FROM failed: %w", err)
	}

	if err := client.Rcpt(msg.To); err != nil {
		return fmt.Errorf("smtp RCPT TO failed: %w", err)
	}

	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp DATA command failed: %w", err)
	}
	defer writer.Close()

	if _, err := writer.Write(raw); err != nil {
		return fmt.Errorf("failed to write message body: %w", err)
	}

	return nil
}

func (m *Mailer) buildRaw(msg Message) []byte {
	contentType := "text/plain; charset=UTF-8"
	if msg.IsHTML {
		contentType = "text/html; charset=UTF-8"
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("From: %s\r\n", m.fromAddress))
	sb.WriteString(fmt.Sprintf("To: %s\r\n", msg.To))
	sb.WriteString(fmt.Sprintf("Subject: %s\r\n", msg.Subject))
	sb.WriteString(fmt.Sprintf("Content-Type: %s\r\n", contentType))
	sb.WriteString(fmt.Sprintf("Date: %s\r\n", time.Now().UTC().Format(time.RFC1123Z)))
	sb.WriteString("MIME-Version: 1.0\r\n")
	sb.WriteString("\r\n")
	sb.WriteString(msg.Body)

	return []byte(sb.String())
}

func dialSTARTTLS(addr, host string, tlsConfig *tls.Config, auth smtp.Auth) (*smtp.Client, error) {
	conn, err := net.DialTimeout("tcp", addr, dialTimeout)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to smtp server: %w", err)
	}

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create smtp client: %w", err)
	}

	cfg := tlsConfig
	if cfg == nil {
		cfg = &tls.Config{
			ServerName: host,
			MinVersion: tls.VersionTLS12,
		}
	} else if cfg.ServerName == "" {
		cfg.ServerName = host
	}

	if err := client.StartTLS(cfg); err != nil {
		client.Close()
		return nil, fmt.Errorf("starttls failed: %w", err)
	}

	if err := client.Auth(auth); err != nil {
		client.Close()
		return nil, fmt.Errorf("smtp authentication failed: %w", err)
	}

	return client, nil
}

func dialTLSDirect(addr, host string, tlsConfig *tls.Config, auth smtp.Auth) (*smtp.Client, error) {
	cfg := tlsConfig
	if cfg == nil {
		cfg = &tls.Config{
			ServerName: host,
			MinVersion: tls.VersionTLS12,
		}
	} else if cfg.ServerName == "" {
		cfg.ServerName = host
	}

	conn, err := tls.DialWithDialer(
		&net.Dialer{Timeout: dialTimeout},
		"tcp",
		addr,
		cfg,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to establish tls connection: %w", err)
	}

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create smtp client: %w", err)
	}

	if err := client.Auth(auth); err != nil {
		client.Close()
		return nil, fmt.Errorf("smtp authentication failed: %w", err)
	}

	return client, nil
}

func (cfg Config) validate() error {
	if cfg.Host == "" {
		return fmt.Errorf("smtp host is required")
	}
	if cfg.Port == 0 {
		return fmt.Errorf("smtp port is required")
	}
	if cfg.Username == "" {
		return fmt.Errorf("smtp username is required")
	}
	if cfg.Password == "" {
		return fmt.Errorf("smtp password is required")
	}
	if cfg.FromAddress == "" {
		return fmt.Errorf("smtp from address is required")
	}
	return nil
}

func (msg Message) validate() error {
	if msg.To == "" {
		return fmt.Errorf("to address is required")
	}
	if msg.Subject == "" {
		return fmt.Errorf("subject is required")
	}
	if msg.Body == "" {
		return fmt.Errorf("body is required")
	}
	return nil
}
