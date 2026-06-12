package mailer_test

import (
	"bufio"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"math/big"
	"net"
	"strings"
	"testing"
	"time"

	"github.com/lifygo/lifygo/apps/api/pkg/mailer"
)

// -----------------------------------------------------------------------
// Mock SMTP Server
// -----------------------------------------------------------------------

// mockSMTPServer is a minimal in-process SMTP server used for testing.
// It speaks just enough of the SMTP protocol to satisfy net/smtp clients
// without requiring a real mail server.
type mockSMTPServer struct {
	listener    net.Listener
	starttlsCfg *tls.Config // server-side TLS config used during STARTTLS upgrade
	addr        string
	requireAuth bool
	rejectRcpt  bool
	rejectData  bool
	rejectAuth  bool
	received    chan mockMessage
}

// mockMessage holds the data captured from a completed SMTP transaction.
type mockMessage struct {
	from string
	to   string
	data string
}

// newMockSMTPServer starts a plain TCP mock SMTP server on a random port.
// Returns the server and the TLS config the mailer should use to trust
// the server's self-signed certificate during STARTTLS negotiation.
func newMockSMTPServer(t *testing.T) (*mockSMTPServer, *tls.Config) {
	t.Helper()

	cert, certPEM, keyPEM := generateSelfSignedCert(t)

	tlsCert, err := tls.X509KeyPair(certPEM, keyPEM)
	if err != nil {
		t.Fatalf("failed to load key pair: %v", err)
	}

	// Server TLS config used when upgrading a plain connection via STARTTLS.
	serverTLSConfig := &tls.Config{
		Certificates: []tls.Certificate{tlsCert},
		MinVersion:   tls.VersionTLS12,
	}

	// Client TLS config that trusts the server's self-signed certificate.
	// Injected into the mailer via Config.TLSConfig so production code
	// is never changed to skip verification.
	certPool := x509.NewCertPool()
	certPool.AddCert(cert)
	clientTLSConfig := &tls.Config{
		RootCAs:    certPool,
		MinVersion: tls.VersionTLS12,
	}

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to start mock smtp server: %v", err)
	}

	s := &mockSMTPServer{
		listener:    ln,
		starttlsCfg: serverTLSConfig,
		addr:        ln.Addr().String(),
		requireAuth: true,
		received:    make(chan mockMessage, 10),
	}
	go s.serve()
	return s, clientTLSConfig
}

// serve accepts connections and handles each in a goroutine.
func (s *mockSMTPServer) serve() {
	for {
		conn, err := s.listener.Accept()
		if err != nil {
			return
		}
		go s.handleConn(conn)
	}
}

// handleConn drives the SMTP state machine for a single connection.
// Implements: greeting, EHLO, STARTTLS, AUTH, MAIL, RCPT, DATA, QUIT.
func (s *mockSMTPServer) handleConn(conn net.Conn) {
	defer conn.Close()

	host, _, _ := net.SplitHostPort(s.addr)
	if host == "" {
		host = "127.0.0.1"
	}

	rw := bufio.NewReadWriter(bufio.NewReader(conn), bufio.NewWriter(conn))

	writeLine := func(line string) {
		fmt.Fprintf(rw, "%s\r\n", line)
		rw.Flush()
	}

	readLine := func() string {
		line, _ := rw.ReadString('\n')
		return strings.TrimSpace(line)
	}

	writeLine("220 " + host + " ESMTP mock")

	var (
		from string
		to   string
		body strings.Builder
	)

	for {
		line := readLine()
		upper := strings.ToUpper(line)

		switch {
		case strings.HasPrefix(upper, "EHLO"), strings.HasPrefix(upper, "HELO"):
			writeLine("250-" + host + " Hello")
			writeLine("250-STARTTLS")
			writeLine("250-AUTH PLAIN LOGIN")
			writeLine("250 8BITMIME")

		case strings.HasPrefix(upper, "STARTTLS"):
			writeLine("220 Ready to start TLS")
			// Upgrade the plain connection to TLS using the server's certificate.
			// The client must trust this certificate via its TLSConfig.RootCAs.
			tlsConn := tls.Server(conn, s.starttlsCfg)
			if err := tlsConn.Handshake(); err != nil {
				return
			}
			conn = tlsConn
			rw = bufio.NewReadWriter(bufio.NewReader(conn), bufio.NewWriter(conn))

		case strings.HasPrefix(upper, "AUTH"):
			if s.rejectAuth {
				writeLine("535 Authentication credentials invalid")
				continue
			}
			writeLine("235 Authentication successful")

		case strings.HasPrefix(upper, "MAIL FROM"):
			from = extractAngle(line)
			writeLine("250 OK")

		case strings.HasPrefix(upper, "RCPT TO"):
			if s.rejectRcpt {
				writeLine("550 No such user")
				continue
			}
			to = extractAngle(line)
			writeLine("250 OK")

		case strings.HasPrefix(upper, "DATA"):
			if s.rejectData {
				writeLine("554 Transaction failed")
				continue
			}
			writeLine("354 Start mail input; end with <CRLF>.<CRLF>")
			for {
				dataLine := readLine()
				if dataLine == "." {
					break
				}
				body.WriteString(dataLine + "\n")
			}
			s.received <- mockMessage{from: from, to: to, data: body.String()}
			writeLine("250 OK: message queued")

		case strings.HasPrefix(upper, "QUIT"):
			writeLine("221 Bye")
			return

		default:
			writeLine("500 unrecognized command")
		}
	}
}

// close shuts down the mock server.
func (s *mockSMTPServer) close() {
	s.listener.Close()
}

// extractAngle extracts the email address from an SMTP command like:
// MAIL FROM:<user@example.com> → user@example.com
func extractAngle(line string) string {
	start := strings.Index(line, "<")
	end := strings.Index(line, ">")
	if start == -1 || end == -1 || end <= start {
		return ""
	}
	return line[start+1 : end]
}

// generateSelfSignedCert creates an in-memory self-signed certificate
// for use in TLS tests. Returns the parsed cert and PEM-encoded cert/key.
func generateSelfSignedCert(t *testing.T) (*x509.Certificate, []byte, []byte) {
	t.Helper()

	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatalf("failed to generate private key: %v", err)
	}

	template := x509.Certificate{
		SerialNumber: big.NewInt(1),
		Subject: pkix.Name{
			Organization: []string{"LifyGo Test"},
		},
		IPAddresses:           []net.IP{net.ParseIP("127.0.0.1")},
		NotBefore:             time.Now().Add(-time.Hour),
		NotAfter:              time.Now().Add(time.Hour),
		KeyUsage:              x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	pubKey := &priv.PublicKey
	certDER, err := x509.CreateCertificate(rand.Reader, &template, &template, pubKey, priv)
	if err != nil {
		t.Fatalf("failed to create certificate: %v", err)
	}

	cert, err := x509.ParseCertificate(certDER)
	if err != nil {
		t.Fatalf("failed to parse certificate: %v", err)
	}

	certPEM := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certDER})

	privDER, err := x509.MarshalECPrivateKey(priv)
	if err != nil {
		t.Fatalf("failed to marshal private key: %v", err)
	}
	keyPEM := pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: privDER})

	return cert, certPEM, keyPEM
}

// newMailer is a test helper that creates a mailer pointed at the mock
// server address, injecting the provided client TLS config so the mailer
// trusts the server's self-signed certificate.
func newMailer(t *testing.T, addr string, clientTLS *tls.Config) *mailer.Mailer {
	t.Helper()

	host, portStr, err := net.SplitHostPort(addr)
	if err != nil {
		t.Fatalf("failed to split host port: %v", err)
	}

	var port int
	if _, err := fmt.Sscan(portStr, &port); err != nil {
		t.Fatalf("failed to parse port: %v", err)
	}

	m, err := mailer.New(mailer.Config{
		Host:        host,
		Port:        port,
		Username:    "user@example.com",
		Password:    "secret",
		FromAddress: "sender@example.com",
		TLSConfig:   clientTLS,
	})
	if err != nil {
		t.Fatalf("failed to create mailer: %v", err)
	}

	return m
}

// -----------------------------------------------------------------------
// Config Validation
// -----------------------------------------------------------------------

func TestNewValidation(t *testing.T) {
	t.Parallel()

	base := mailer.Config{
		Host:        "smtp.example.com",
		Port:        587,
		Username:    "user@example.com",
		Password:    "secret",
		FromAddress: "hello@example.com",
	}

	tests := []struct {
		name    string
		mutate  func(c *mailer.Config)
		wantErr bool
	}{
		{
			name:    "valid config",
			mutate:  func(c *mailer.Config) {},
			wantErr: false,
		},
		{
			name:    "missing host",
			mutate:  func(c *mailer.Config) { c.Host = "" },
			wantErr: true,
		},
		{
			name:    "missing port",
			mutate:  func(c *mailer.Config) { c.Port = 0 },
			wantErr: true,
		},
		{
			name:    "missing username",
			mutate:  func(c *mailer.Config) { c.Username = "" },
			wantErr: true,
		},
		{
			name:    "missing password",
			mutate:  func(c *mailer.Config) { c.Password = "" },
			wantErr: true,
		},
		{
			name:    "missing from address",
			mutate:  func(c *mailer.Config) { c.FromAddress = "" },
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			cfg := base
			tt.mutate(&cfg)
			m, err := mailer.New(cfg)
			if tt.wantErr {
				if err == nil {
					t.Errorf("expected error but got nil")
				}
				if m != nil {
					t.Errorf("expected nil mailer but got non-nil")
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if m == nil {
				t.Errorf("expected non-nil mailer but got nil")
			}
		})
	}
}

// -----------------------------------------------------------------------
// Message Validation
// -----------------------------------------------------------------------

func TestSendMessageValidation(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	// t.Cleanup is used instead of defer to ensure the server stays alive
	// until all parallel subtests have completed. defer would fire when
	// the parent function returns, closing the server before subtests run.
	t.Cleanup(func() { srv.close() })

	m := newMailer(t, srv.addr, clientTLS)

	tests := []struct {
		name    string
		msg     mailer.Message
		wantErr bool
	}{
		{
			name: "valid message — plain text",
			msg: mailer.Message{
				To:      "recipient@example.com",
				Subject: "Hello",
				Body:    "World",
				IsHTML:  false,
			},
			wantErr: false,
		},
		{
			name: "valid message — html",
			msg: mailer.Message{
				To:      "recipient@example.com",
				Subject: "Hello",
				Body:    "<h1>World</h1>",
				IsHTML:  true,
			},
			wantErr: false,
		},
		{
			name: "missing to",
			msg: mailer.Message{
				Subject: "Hello",
				Body:    "World",
			},
			wantErr: true,
		},
		{
			name: "missing subject",
			msg: mailer.Message{
				To:   "recipient@example.com",
				Body: "World",
			},
			wantErr: true,
		},
		{
			name: "missing body",
			msg: mailer.Message{
				To:      "recipient@example.com",
				Subject: "Hello",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := m.Send(tt.msg)
			if tt.wantErr {
				if err == nil {
					t.Errorf("expected error but got nil")
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}

// -----------------------------------------------------------------------
// STARTTLS Send (port 587)
// -----------------------------------------------------------------------

func TestSendSTARTTLS(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	t.Cleanup(func() { srv.close() })

	m := newMailer(t, srv.addr, clientTLS)

	msg := mailer.Message{
		To:      "recipient@example.com",
		Subject: "Test Subject",
		Body:    "Test body content.",
		IsHTML:  false,
	}

	if err := m.Send(msg); err != nil {
		t.Fatalf("unexpected send error: %v", err)
	}

	select {
	case received := <-srv.received:
		if received.to != msg.To {
			t.Errorf("recipient: got %s want %s", received.to, msg.To)
		}
		if !strings.Contains(received.data, msg.Subject) {
			t.Errorf("message data does not contain subject %q", msg.Subject)
		}
		if !strings.Contains(received.data, msg.Body) {
			t.Errorf("message data does not contain body %q", msg.Body)
		}
	case <-time.After(3 * time.Second):
		t.Error("timed out waiting for message to be received by mock server")
	}
}

func TestSendSTARTTLSPlainTextContentType(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	t.Cleanup(func() { srv.close() })

	m := newMailer(t, srv.addr, clientTLS)

	if err := m.Send(mailer.Message{
		To:      "recipient@example.com",
		Subject: "Plain text test",
		Body:    "plain body",
		IsHTML:  false,
	}); err != nil {
		t.Fatalf("unexpected send error: %v", err)
	}

	select {
	case received := <-srv.received:
		if !strings.Contains(received.data, "text/plain") {
			t.Errorf("expected text/plain content type in message data, got: %s", received.data)
		}
	case <-time.After(3 * time.Second):
		t.Error("timed out waiting for message")
	}
}

func TestSendSTARTTLSHTMLContentType(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	t.Cleanup(func() { srv.close() })

	m := newMailer(t, srv.addr, clientTLS)

	if err := m.Send(mailer.Message{
		To:      "recipient@example.com",
		Subject: "HTML test",
		Body:    "<h1>Hello</h1>",
		IsHTML:  true,
	}); err != nil {
		t.Fatalf("unexpected send error: %v", err)
	}

	select {
	case received := <-srv.received:
		if !strings.Contains(received.data, "text/html") {
			t.Errorf("expected text/html content type in message data, got: %s", received.data)
		}
	case <-time.After(3 * time.Second):
		t.Error("timed out waiting for message")
	}
}

// -----------------------------------------------------------------------
// Connection Failure Cases
// -----------------------------------------------------------------------

func TestSendConnectionRefused(t *testing.T) {
	t.Parallel()

	// Use a port that is guaranteed to have nothing listening.
	m, err := mailer.New(mailer.Config{
		Host:        "127.0.0.1",
		Port:        19999,
		Username:    "user@example.com",
		Password:    "secret",
		FromAddress: "sender@example.com",
	})
	if err != nil {
		t.Fatalf("failed to create mailer: %v", err)
	}

	err = m.Send(mailer.Message{
		To:      "recipient@example.com",
		Subject: "Test",
		Body:    "Test",
	})

	if err == nil {
		t.Errorf("expected connection refused error but got nil")
	}
}

func TestSendAuthRejected(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	srv.rejectAuth = true
	t.Cleanup(func() { srv.close() })

	m := newMailer(t, srv.addr, clientTLS)

	err := m.Send(mailer.Message{
		To:      "recipient@example.com",
		Subject: "Test",
		Body:    "Test",
	})

	if err == nil {
		t.Errorf("expected authentication error but got nil")
	}
}

func TestSendRcptRejected(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	srv.rejectRcpt = true
	t.Cleanup(func() { srv.close() })

	m := newMailer(t, srv.addr, clientTLS)

	err := m.Send(mailer.Message{
		To:      "nonexistent@example.com",
		Subject: "Test",
		Body:    "Test",
	})

	if err == nil {
		t.Errorf("expected rcpt rejected error but got nil")
	}
}

func TestSendDataRejected(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	srv.rejectData = true
	t.Cleanup(func() { srv.close() })

	m := newMailer(t, srv.addr, clientTLS)

	err := m.Send(mailer.Message{
		To:      "recipient@example.com",
		Subject: "Test",
		Body:    "Test",
	})

	if err == nil {
		t.Errorf("expected data rejected error but got nil")
	}
}

// -----------------------------------------------------------------------
// Multiple Sequential Sends
// -----------------------------------------------------------------------

// TestSendMultipleMessages verifies that the mailer can send multiple
// independent messages correctly one after another.
// Each send creates its own SMTP connection — connections are not reused.
func TestSendMultipleMessages(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	t.Cleanup(func() { srv.close() })

	m := newMailer(t, srv.addr, clientTLS)

	recipients := []string{
		"alice@example.com",
		"bob@example.com",
		"charlie@example.com",
	}

	for _, to := range recipients {
		if err := m.Send(mailer.Message{
			To:      to,
			Subject: "Hello " + to,
			Body:    "Body for " + to,
		}); err != nil {
			t.Errorf("failed to send to %s: %v", to, err)
		}
	}

	received := make([]mockMessage, 0, len(recipients))
	timeout := time.After(5 * time.Second)
	for i := 0; i < len(recipients); i++ {
		select {
		case msg := <-srv.received:
			received = append(received, msg)
		case <-timeout:
			t.Fatalf("timed out after receiving %d of %d messages", i, len(recipients))
		}
	}

	if len(received) != len(recipients) {
		t.Errorf("received %d messages want %d", len(received), len(recipients))
	}
}

// -----------------------------------------------------------------------
// Message Headers
// -----------------------------------------------------------------------

func TestSendMessageHeaders(t *testing.T) {
	t.Parallel()

	srv, clientTLS := newMockSMTPServer(t)
	t.Cleanup(func() { srv.close() })

	fromAddress := "sender@example.com"

	host, portStr, _ := net.SplitHostPort(srv.addr)
	var port int
	fmt.Sscan(portStr, &port)

	m, err := mailer.New(mailer.Config{
		Host:        host,
		Port:        port,
		Username:    "user@example.com",
		Password:    "secret",
		FromAddress: fromAddress,
		TLSConfig:   clientTLS,
	})
	if err != nil {
		t.Fatalf("failed to create mailer: %v", err)
	}

	msg := mailer.Message{
		To:      "recipient@example.com",
		Subject: "Header Check Subject",
		Body:    "Header check body.",
	}

	if err := m.Send(msg); err != nil {
		t.Fatalf("unexpected send error: %v", err)
	}

	select {
	case received := <-srv.received:
		checks := []struct {
			header string
			value  string
		}{
			{"From:", fromAddress},
			{"To:", msg.To},
			{"Subject:", msg.Subject},
			{"MIME-Version:", "1.0"},
		}
		for _, check := range checks {
			if !strings.Contains(received.data, check.value) {
				t.Errorf("message missing %s %s\nfull data:\n%s", check.header, check.value, received.data)
			}
		}
	case <-time.After(3 * time.Second):
		t.Error("timed out waiting for message")
	}
}
