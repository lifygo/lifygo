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

type EmailLogRepository interface {
	Create(ctx context.Context, userID, to, subject string, status model.EmailStatus, errorMessage *string) (*model.EmailLog, error)
	List(ctx context.Context, input model.ListEmailLogsInput) ([]model.EmailLog, error)
	CountByUserID(ctx context.Context, userID string) (int, error)
}

type OTPStore interface {
	SetWithTTL(ctx context.Context, key, value string, ttl time.Duration) error
	GetAndDelete(ctx context.Context, key string) (string, error)
}

type MailerFactory func(ctx context.Context, userID string) (*mailer.Mailer, error)

type EmailService struct {
	logs      EmailLogRepository
	otp       OTPStore
	getMailer MailerFactory
}

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

func (s *EmailService) Send(ctx context.Context, input model.SendEmailInput) (*model.SendEmailResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	if err := validator.ValidateEmail(input.To); err != nil {
		return nil, fmt.Errorf("invalid to address: %w", err)
	}

	m, err := s.getMailer(ctx, input.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get mailer: %w", err)
	}

	sendErr := m.Send(mailer.Message{
		To:      input.To,
		Subject: input.Subject,
		Body:    input.Body,
		IsHTML:  input.IsHTML,
	})

	status := model.EmailStatusSent
	var errMsg *string
	if sendErr != nil {
		status = model.EmailStatusFailed
		msg := sendErr.Error()
		errMsg = &msg
	}

	log, logErr := s.logs.Create(ctx, input.UserID, input.To, input.Subject, status, errMsg)
	if logErr != nil {
		return nil, fmt.Errorf("send status: %v, log error: %w", sendErr, logErr)
	}

	if sendErr != nil {
		return nil, fmt.Errorf("failed to send email: %w", sendErr)
	}

	return &model.SendEmailResponse{
		LogID:  log.ID,
		Status: model.EmailStatusSent,
		SentAt: log.SentAt,
	}, nil
}

func (s *EmailService) SendOTP(ctx context.Context, input model.SendOTPInput) (*model.SendOTPResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	if err := validator.ValidateEmail(input.To); err != nil {
		return nil, fmt.Errorf("invalid to address: %w", err)
	}

	code, err := crypto.GenerateOTP(model.OTPLength)
	if err != nil {
		return nil, fmt.Errorf("failed to generate otp: %w", err)
	}

	redisKey := model.OTPRedisKey(input.UserID, input.To)
	if err := s.otp.SetWithTTL(ctx, redisKey, code, model.OTPTTl); err != nil {
		return nil, fmt.Errorf("failed to store otp: %w", err)
	}

	expiresAt := time.Now().Add(model.OTPTTl)

	m, err := s.getMailer(ctx, input.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get mailer: %w", err)
	}

	subject := "Your verification code"
	body := fmt.Sprintf(otpEmailTemplate, int(model.OTPTTl.Minutes()), code)

	sendErr := m.Send(mailer.Message{
		To:      input.To,
		Subject: subject,
		Body:    body,
		IsHTML:  true,
	})

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

func (s *EmailService) VerifyOTP(ctx context.Context, input model.VerifyOTPInput) (*model.VerifyOTPResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	redisKey := model.OTPRedisKey(input.UserID, input.Email)

	stored, err := s.otp.GetAndDelete(ctx, redisKey)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve otp: %w", err)
	}

	if stored == "" {
		return nil, model.ErrOTPNotFound
	}

	if stored != input.Code {
		return nil, model.ErrOTPInvalid
	}

	return &model.VerifyOTPResponse{
		Email:      input.Email,
		Verified:   true,
		VerifiedAt: time.Now(),
	}, nil
}

func (s *EmailService) ListLogs(ctx context.Context, input model.ListEmailLogsInput) ([]model.EmailLog, int, error) {
	if input.UserID == "" {
		return nil, 0, model.ErrUnauthorized
	}

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

const otpEmailTemplate = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:40px 40px 24px 40px;text-align:center;">
              <h1 style="margin:0;font-size:20px;color:#1a1a1a;">Verify your email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px 40px;text-align:center;color:#555555;font-size:15px;line-height:1.5;">
              Use the code below to verify your identity. This code will expire in %d minutes.
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px 40px;text-align:center;">
              <span style="display:inline-block;background-color:#f0f2f5;color:#1a1a1a;font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 24px;border-radius:6px;">%s</span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px 40px;text-align:center;color:#999999;font-size:13px;">
              If you didn't request this code, you can safely ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
