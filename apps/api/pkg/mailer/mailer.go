package mailer

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"strings"
	"time"
)

// Mailer handles outgoing email delivery via SMTP.
// Each instance is configured for a single user's SMTP credentials.
// Instantiate a new Mailer per send operation — do not share instances
// across users or goroutines.
type Mailer struct {
	host        string
	port        int
	username    string
	password    string
	fromAddress string
	tlsConfig   *tls.Config
}

// Config holds the SMTP connection parameters for a single send operation.
// These values come from the user's decrypted SMTPConfig record.
type Config struct {
	// Host is the SMTP server hostname. Example: smtp.gmail.com
	Host string

	// Port is the SMTP server port.
	// 587 = STARTTLS (recommended)
	// 465 = SMTPS (SSL)
	// 25  = plain (avoid — blocked by most providers)
	Port int

	// Username is the SMTP authentication username.
	Username string

	// Password is the decrypted SMTP password.
	// This is the plain text value — decrypted from AES-256 storage
	// immediately before use and never held in memory longer than needed.
	Password string

	// FromAddress is the address used in the From header.
	FromAddress string

	// TLSConfig is an optional custom TLS configuration.
	// If nil, a default TLS config is used.
	// Primarily used for testing with self-signed certificates.
	TLSConfig *tls.Config
}

// Message holds the content of a single outgoing email.
type Message struct {
	// To is the recipient email address.
	To string

	// Subject is the email subject line.
	Subject string

	// Body is the email content.
	Body string

	// IsHTML indicates whether Body is HTML or plain text.
	// When true, Content-Type is set to text/html.
	// When false, Content-Type is set to text/plain.
	IsHTML bool
}

// dialTimeout is the maximum time allowed to establish a TCP connection
// to the SMTP server. Prevents hanging indefinitely on unreachable hosts.
const dialTimeout = 10 * time.Second

// New creates a new Mailer from the provided Config.
// Validates that all required fields are present before returning.
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
	}, nil
}

// Send delivers a single email message via SMTP.
// Automatically selects the correct connection method based on port:
//   - Port 465: direct TLS (SMTPS)
//   - Port 587 and all others: STARTTLS upgrade
//
// Returns a non-nil error if the connection, authentication, or
// message delivery fails at any step.
func (m *Mailer) Send(msg Message) error {
	if err := msg.validate(); err != nil {
		return err
	}

	addr := fmt.Sprintf("%s:%d", m.host, m.port)
	auth := smtp.PlainAuth("", m.username, m.password, m.host)
	raw := m.buildRaw(msg)

	var err error
	if m.port == 465 {
		err = m.sendTLS(addr, auth, msg.To, raw)
	} else {
		err = m.sendSTARTTLS(addr, auth, msg.To, raw)
	}

	if err != nil {
		return fmt.Errorf("smtp send failed: %w", err)
	}

	return nil
}

// sendSTARTTLS connects to the SMTP server on the given address,
// upgrades the connection to TLS using STARTTLS, authenticates,
// and sends the message. Used for port 587 and non-SSL connections.
func (m *Mailer) sendSTARTTLS(addr string, auth smtp.Auth, to string, raw []byte) error {
	conn, err := net.DialTimeout("tcp", addr, dialTimeout)
	if err != nil {
		return fmt.Errorf("failed to connect to smtp server: %w", err)
	}

	client, err := smtp.NewClient(conn, m.host)
	if err != nil {
		return fmt.Errorf("failed to create smtp client: %w", err)
	}
	defer client.Close()

	tlsConfig := m.tlsConfig
	if tlsConfig == nil {
		tlsConfig = &tls.Config{
			ServerName: m.host,
			MinVersion: tls.VersionTLS12,
		}
	} else {
		// Ensure ServerName is set if not already
		if tlsConfig.ServerName == "" {
			tlsConfig.ServerName = m.host
		}
	}

	if err := client.StartTLS(tlsConfig); err != nil {
		return fmt.Errorf("starttls failed: %w", err)
	}

	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("smtp authentication failed: %w", err)
	}

	if err := client.Mail(m.fromAddress); err != nil {
		return fmt.Errorf("smtp MAIL FROM failed: %w", err)
	}

	if err := client.Rcpt(to); err != nil {
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

// sendTLS connects to the SMTP server using direct TLS (port 465 / SMTPS),
// authenticates, and sends the message. Unlike STARTTLS, TLS is established
// immediately on connection rather than via an upgrade command.
func (m *Mailer) sendTLS(addr string, auth smtp.Auth, to string, raw []byte) error {
	tlsConfig := m.tlsConfig
	if tlsConfig == nil {
		tlsConfig = &tls.Config{
			ServerName: m.host,
			MinVersion: tls.VersionTLS12,
		}
	} else {
		// Ensure ServerName is set if not already
		if tlsConfig.ServerName == "" {
			tlsConfig.ServerName = m.host
		}
	}

	conn, err := tls.DialWithDialer(
		&net.Dialer{Timeout: dialTimeout},
		"tcp",
		addr,
		tlsConfig,
	)
	if err != nil {
		return fmt.Errorf("failed to establish tls connection: %w", err)
	}

	client, err := smtp.NewClient(conn, m.host)
	if err != nil {
		return fmt.Errorf("failed to create smtp client: %w", err)
	}
	defer client.Close()

	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("smtp authentication failed: %w", err)
	}

	if err := client.Mail(m.fromAddress); err != nil {
		return fmt.Errorf("smtp MAIL FROM failed: %w", err)
	}

	if err := client.Rcpt(to); err != nil {
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

// buildRaw constructs the raw RFC 2822 email message bytes from a Message.
// Sets the correct Content-Type header based on IsHTML.
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

// validate checks that all required Config fields are present.
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

// validate checks that all required Message fields are present.
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
