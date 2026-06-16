package service

import (
	"context"
	"fmt"
	"time"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/pkg/crypto"
	"github.com/lifygo/lifygo/apps/api/pkg/mailer"
	"github.com/lifygo/lifygo/apps/api/pkg/validator"
)

// EmailLogRepository defines the database operations the EmailService needs.
type EmailLogRepository interface {
	Create(ctx context.Context, userID, to, subject string, status model.EmailStatus, errorMessage *string) (*model.EmailLog, error)
	List(ctx context.Context, input model.ListEmailLogsInput) ([]model.EmailLog, error)
	CountByUserID(ctx context.Context, userID string) (int, error)
}

// OTPStore defines the Redis operations the EmailService needs for OTPs.
// We use Redis for OTP storage because:
//   - Redis TTL handles expiry automatically — no cleanup job needed.
//   - GetAndDelete makes verification atomic — a code can only be used once.
type OTPStore interface {
	SetWithTTL(ctx context.Context, key, value string, ttl time.Duration) error
	GetAndDelete(ctx context.Context, key string) (string, error)
}

// MailerFactory is a function that returns a ready-to-use mailer for a user.
// In production this calls SMTPConfigService.GetMailer.
// In tests this is replaced with a function that returns a fake mailer.
type MailerFactory func(ctx context.Context, userID string) (*mailer.Mailer, error)

// EmailService handles all business logic related to email sending and OTPs.
type EmailService struct {
	logs      EmailLogRepository
	otp       OTPStore
	getMailer MailerFactory
}

// NewEmailService creates a new EmailService.
func NewEmailService(
	logs EmailLogRepository,
	otp OTPStore,
	getMailer MailerFactory,
) *EmailService {
	return &EmailService{
		logs:      logs,
		otp:       otp,
		getMailer: getMailer,
	}
}

// Send sends a single email using the user's SMTP config.
// Always creates an email log entry — regardless of success or failure.
// This means the log is the source of truth for what was attempted.
func (s *EmailService) Send(ctx context.Context, input model.SendEmailInput) (*model.SendEmailResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	if err := validator.ValidateEmail(input.To); err != nil {
		return nil, fmt.Errorf("invalid to address: %w", err)
	}

	// Get the mailer configured with the user's decrypted SMTP credentials.
	m, err := s.getMailer(ctx, input.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get mailer: %w", err)
	}

	// Attempt to send the email.
	sendErr := m.Send(mailer.Message{
		To:      input.To,
		Subject: input.Subject,
		Body:    input.Body,
		IsHTML:  input.IsHTML,
	})

	// Determine the status and error message to log.
	status := model.EmailStatusSent
	var errMsg *string
	if sendErr != nil {
		status = model.EmailStatusFailed
		msg := sendErr.Error()
		errMsg = &msg
	}

	// Always log the attempt — success or failure.
	log, logErr := s.logs.Create(ctx, input.UserID, input.To, input.Subject, status, errMsg)
	if logErr != nil {
		// Logging failure is serious but should not override the send result.
		// We report both errors to the caller.
		return nil, fmt.Errorf("send status: %v, log error: %w", sendErr, logErr)
	}

	// If the send itself failed, return the send error now that we have logged it.
	if sendErr != nil {
		return nil, fmt.Errorf("failed to send email: %w", sendErr)
	}

	return &model.SendEmailResponse{
		LogID:  log.ID,
		Status: model.EmailStatusSent,
		SentAt: log.SentAt,
	}, nil
}

// SendOTP generates a 6-digit OTP, stores it in Redis with a TTL,
// and sends it to the recipient via email.
// The OTP code is never returned in the response — it is only sent
// to the recipient's inbox. The client receives only the expiry time,
// which it can use to display a countdown timer.
func (s *EmailService) SendOTP(ctx context.Context, input model.SendOTPInput) (*model.SendOTPResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	if err := validator.ValidateEmail(input.To); err != nil {
		return nil, fmt.Errorf("invalid to address: %w", err)
	}

	// Generate a cryptographically secure 6-digit OTP.
	code, err := crypto.GenerateOTP(model.OTPLength)
	if err != nil {
		return nil, fmt.Errorf("failed to generate otp: %w", err)
	}

	// Store the OTP in Redis. The key is namespaced by userID and email
	// so two different users sending an OTP to the same address don't collide.
	// Redis will automatically delete this key after OTPTTl expires.
	redisKey := model.OTPRedisKey(input.UserID, input.To)
	if err := s.otp.SetWithTTL(ctx, redisKey, code, model.OTPTTl); err != nil {
		return nil, fmt.Errorf("failed to store otp: %w", err)
	}

	expiresAt := time.Now().Add(model.OTPTTl)

	// Get the mailer and send the OTP email.
	m, err := s.getMailer(ctx, input.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get mailer: %w", err)
	}

	subject := "Your verification code"
	body := fmt.Sprintf("Your verification code is: %s\n\nThis code expires in %d minutes.", code, int(model.OTPTTl.Minutes()))

	sendErr := m.Send(mailer.Message{
		To:      input.To,
		Subject: subject,
		Body:    body,
		IsHTML:  false,
	})

	// Log the OTP send attempt.
	status := model.EmailStatusSent
	var errMsg *string
	if sendErr != nil {
		status = model.EmailStatusFailed
		msg := sendErr.Error()
		errMsg = &msg
	}

	if _, logErr := s.logs.Create(ctx, input.UserID, input.To, subject, status, errMsg); logErr != nil {
		return nil, fmt.Errorf("send status: %v, log error: %w", sendErr, logErr)
	}

	if sendErr != nil {
		return nil, fmt.Errorf("failed to send otp email: %w", sendErr)
	}

	return &model.SendOTPResponse{
		Email:     input.To,
		ExpiresAt: expiresAt,
	}, nil
}

// VerifyOTP checks whether the provided code matches the one stored
// in Redis for the given user and email combination.
// Uses GetAndDelete — which atomically reads and removes the key —
// so the same OTP code can never be used twice, even under concurrent requests.
func (s *EmailService) VerifyOTP(ctx context.Context, input model.VerifyOTPInput) (*model.VerifyOTPResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	redisKey := model.OTPRedisKey(input.UserID, input.Email)

	// GetAndDelete atomically retrieves and removes the OTP from Redis.
	// If the key does not exist (never set, already used, or expired),
	// stored will be an empty string.
	stored, err := s.otp.GetAndDelete(ctx, redisKey)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve otp: %w", err)
	}

	// Empty string means the OTP was not found — expired, already used,
	// or never generated for this email.
	if stored == "" {
		return nil, model.ErrOTPNotFound
	}

	// Compare the stored code against what the caller provided.
	if stored != input.Code {
		return nil, model.ErrOTPInvalid
	}

	return &model.VerifyOTPResponse{
		Email:      input.Email,
		Verified:   true,
		VerifiedAt: time.Now(),
	}, nil
}

// ListLogs returns a paginated list of email logs for a user.
// Applies sensible defaults and caps for Limit to prevent abuse.
func (s *EmailService) ListLogs(ctx context.Context, input model.ListEmailLogsInput) ([]model.EmailLog, int, error) {
	if input.UserID == "" {
		return nil, 0, model.ErrUnauthorized
	}

	// Apply default and maximum limits.
	if input.Limit <= 0 {
		input.Limit = 50
	}
	if input.Limit > 100 {
		input.Limit = 100
	}
	if input.Offset < 0 {
		input.Offset = 0
	}

	logs, err := s.logs.List(ctx, input)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list email logs: %w", err)
	}

	total, err := s.logs.CountByUserID(ctx, input.UserID)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count email logs: %w", err)
	}

	return logs, total, nil
}
