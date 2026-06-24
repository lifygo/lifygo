package executor

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/tls"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/smtp"
	"strings"
	"time"

	"github.com/lifygo/lifygo/apps/worker/internal/resolver"
)

// Executor runs a job — either a webhook HTTP call or an email send.
// It receives a Resolver to fetch job config and log results,
// and an AES-256 key to decrypt SMTP passwords.
type Executor struct {
	resolver   *resolver.Resolver
	cryptoKey  []byte
	httpClient *http.Client
}

// New creates a new Executor.
// hexKey must be a 64-character hex string representing 32 bytes (AES-256).
func New(res *resolver.Resolver, hexKey string) (*Executor, error) {
	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return nil, fmt.Errorf("failed to decode encryption key: %w", err)
	}
	if len(key) != 32 {
		return nil, fmt.Errorf("encryption key must be exactly 32 bytes, got %d", len(key))
	}

	return &Executor{
		resolver:  res,
		cryptoKey: key,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}, nil
}

// Execute fetches a job by ID and runs it.
// Always logs the execution result back to PostgreSQL regardless
// of success or failure.
func (e *Executor) Execute(ctx context.Context, jobID, userID string) error {
	job, err := e.resolver.GetJob(ctx, jobID, userID)
	if err != nil {
		return fmt.Errorf("failed to resolve job: %w", err)
	}

	// Skip jobs that are not active.
	// This can happen if a job was deleted or paused after
	// EventBridge already queued the message.
	if job.Status != "active" {
		log.Printf("skipping job %s with status %s", jobID, job.Status)
		return nil
	}

	var execErr error
	var httpStatus *int
	start := time.Now()

	switch job.Type {
	case "webhook":
		httpStatus, execErr = e.executeWebhook(ctx, job)
	case "email":
		execErr = e.executeEmail(ctx, job)
	default:
		execErr = fmt.Errorf("unknown job type: %s", job.Type)
	}

	durationMs := int(time.Since(start).Milliseconds())
	status := "success"
	var errMsg *string

	if execErr != nil {
		status = "failed"
		msg := execErr.Error()
		errMsg = &msg
	}

	// Always log the execution result.
	if logErr := e.resolver.LogExecution(ctx, jobID, userID, status, httpStatus, errMsg, durationMs); logErr != nil {
		log.Printf("failed to log execution for job %s: %v", jobID, logErr)
	}

	// For one-time jobs, update the job status after execution.
	if job.ScheduleType == "one_time" {
		if execErr != nil {
			if err := e.resolver.MarkJobFailed(ctx, jobID); err != nil {
				log.Printf("failed to mark job %s as failed: %v", jobID, err)
			}
		} else {
			if err := e.resolver.MarkJobCompleted(ctx, jobID); err != nil {
				log.Printf("failed to mark job %s as completed: %v", jobID, err)
			}
		}
	}

	return execErr
}

// executeWebhook fires an HTTP POST request to the job's webhook URL.
// Returns the HTTP status code and any error.
func (e *Executor) executeWebhook(ctx context.Context, job *resolver.Job) (*int, error) {
	if job.WebhookURL == nil {
		return nil, fmt.Errorf("webhook url is nil")
	}

	var body io.Reader
	if job.WebhookPayload != nil && *job.WebhookPayload != "" {
		body = strings.NewReader(*job.WebhookPayload)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, *job.WebhookURL, body)
	if err != nil {
		return nil, fmt.Errorf("failed to build request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "LifyGo-Scheduler/1.0")

	resp, err := e.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("webhook request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read and discard the body to allow connection reuse.
	io.Copy(io.Discard, resp.Body)

	status := resp.StatusCode

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return &status, fmt.Errorf("webhook returned non-2xx status: %d", resp.StatusCode)
	}

	return &status, nil
}

// executeEmail sends an email using the user's SMTP credentials.
// Fetches and decrypts the SMTP password from PostgreSQL.
func (e *Executor) executeEmail(ctx context.Context, job *resolver.Job) error {
	if job.EmailTo == nil || job.EmailSubject == nil || job.EmailBody == nil {
		return fmt.Errorf("email job missing required fields")
	}

	cfg, err := e.resolver.GetSMTPConfig(ctx, job.UserID)
	if err != nil {
		return fmt.Errorf("failed to get smtp config: %w", err)
	}

	// Decrypt the SMTP password.
	password, err := e.decrypt(cfg.PasswordEncrypted)
	if err != nil {
		return fmt.Errorf("failed to decrypt smtp password: %w", err)
	}

	// Send the email.
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	auth := smtp.PlainAuth("", cfg.Username, password, cfg.Host)

	raw := buildRawEmail(cfg.FromAddress, *job.EmailTo, *job.EmailSubject, *job.EmailBody)

	var sendErr error
	if cfg.Port == 465 {
		sendErr = sendTLS(addr, cfg.Host, auth, cfg.FromAddress, *job.EmailTo, raw)
	} else {
		sendErr = sendSTARTTLS(addr, cfg.Host, auth, cfg.FromAddress, *job.EmailTo, raw)
	}

	if sendErr != nil {
		return fmt.Errorf("failed to send email: %w", sendErr)
	}

	return nil
}

// decrypt decrypts an AES-256-GCM ciphertext using the executor's key.
func (e *Executor) decrypt(hexCiphertext string) (string, error) {
	ciphertext, err := hex.DecodeString(hexCiphertext)
	if err != nil {
		return "", fmt.Errorf("invalid ciphertext encoding: %w", err)
	}

	block, err := aes.NewCipher(e.cryptoKey)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("decryption failed — ciphertext may be tampered")
	}

	return string(plaintext), nil
}

// buildRawEmail constructs a minimal RFC 2822 email message.
func buildRawEmail(from, to, subject, body string) []byte {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("From: %s\r\n", from))
	sb.WriteString(fmt.Sprintf("To: %s\r\n", to))
	sb.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	sb.WriteString(fmt.Sprintf("Date: %s\r\n", time.Now().UTC().Format(time.RFC1123Z)))
	sb.WriteString("MIME-Version: 1.0\r\n")
	sb.WriteString("Content-Type: text/plain; charset=UTF-8\r\n")
	sb.WriteString("\r\n")
	sb.WriteString(body)
	return []byte(sb.String())
}

// sendSTARTTLS sends an email using STARTTLS (port 587).
func sendSTARTTLS(addr, host string, auth smtp.Auth, from, to string, raw []byte) error {
	conn, err := net.DialTimeout("tcp", addr, 10*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect: %w", err)
	}

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return fmt.Errorf("failed to create smtp client: %w", err)
	}
	defer client.Close()

	if err := client.StartTLS(&tls.Config{
		ServerName: host,
		MinVersion: tls.VersionTLS12,
	}); err != nil {
		return fmt.Errorf("starttls failed: %w", err)
	}

	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("smtp auth failed: %w", err)
	}

	if err := client.Mail(from); err != nil {
		return fmt.Errorf("MAIL FROM failed: %w", err)
	}

	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("RCPT TO failed: %w", err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("DATA failed: %w", err)
	}
	defer w.Close()

	if _, err := w.Write(raw); err != nil {
		return fmt.Errorf("failed to write message: %w", err)
	}

	return nil
}

// sendTLS sends an email using direct TLS (port 465).
func sendTLS(addr, host string, auth smtp.Auth, from, to string, raw []byte) error {
	conn, err := tls.DialWithDialer(
		&net.Dialer{Timeout: 10 * time.Second},
		"tcp",
		addr,
		&tls.Config{
			ServerName: host,
			MinVersion: tls.VersionTLS12,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to establish tls connection: %w", err)
	}

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return fmt.Errorf("failed to create smtp client: %w", err)
	}
	defer client.Close()

	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("smtp auth failed: %w", err)
	}

	if err := client.Mail(from); err != nil {
		return fmt.Errorf("MAIL FROM failed: %w", err)
	}

	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("RCPT TO failed: %w", err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("DATA failed: %w", err)
	}
	defer w.Close()

	if _, err := w.Write(raw); err != nil {
		return fmt.Errorf("failed to write message: %w", err)
	}

	return nil
}
