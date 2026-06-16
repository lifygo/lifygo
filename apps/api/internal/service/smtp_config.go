package service

import (
	"context"
	"fmt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/pkg/crypto"
	"github.com/lifygo/lifygo/apps/api/pkg/mailer"
	"github.com/lifygo/lifygo/apps/api/pkg/validator"
)

// SMTPConfigRepository defines the database operations the SMTPConfigService needs.
type SMTPConfigRepository interface {
	Upsert(ctx context.Context, input model.CreateSMTPConfigInput, encryptedPassword string) (*model.SMTPConfig, error)
	GetByUserID(ctx context.Context, userID string) (*model.SMTPConfig, error)
	Delete(ctx context.Context, userID string) error
}

// SMTPConfigService handles all business logic related to SMTP configurations.
// It is responsible for encrypting passwords before storage and decrypting
// them before use. The repository layer never sees a plain-text password.
type SMTPConfigService struct {
	configs SMTPConfigRepository
	crypto  *crypto.Crypto
}

// NewSMTPConfigService creates a new SMTPConfigService.
// crypto is the AES-256 instance used to encrypt and decrypt passwords.
func NewSMTPConfigService(configs SMTPConfigRepository, c *crypto.Crypto) *SMTPConfigService {
	return &SMTPConfigService{
		configs: configs,
		crypto:  c,
	}
}

// Upsert creates or replaces the SMTP config for a user.
// The plain-text password from the input is encrypted with AES-256
// before being passed to the repository. The plain-text password is
// never written to the database.
// Validates all input fields before proceeding.
func (s *SMTPConfigService) Upsert(ctx context.Context, input model.CreateSMTPConfigInput) (*model.SMTPConfigResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	// Validate the email format of the from address.
	if err := validator.ValidateEmail(input.FromAddress); err != nil {
		return nil, fmt.Errorf("invalid from address: %w", err)
	}

	// Validate the SMTP host format.
	if err := validator.ValidateHost(input.Host); err != nil {
		return nil, fmt.Errorf("invalid smtp host: %w", err)
	}

	// Validate the port is within valid TCP range.
	if err := validator.ValidateSMTPPort(input.Port); err != nil {
		return nil, fmt.Errorf("invalid smtp port: %w", err)
	}

	// Encrypt the password before storing it.
	// The plain-text password is only held in memory for the duration
	// of this function call and never written anywhere.
	encryptedPassword, err := s.crypto.Encrypt(input.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt smtp password: %w", err)
	}

	cfg, err := s.configs.Upsert(ctx, input, encryptedPassword)
	if err != nil {
		return nil, fmt.Errorf("failed to save smtp config: %w", err)
	}

	return toSMTPConfigResponse(cfg), nil
}

// Get returns the SMTP config for a user.
// The password is NOT decrypted here — this response is safe to
// return to the client through the API. The encrypted password
// is excluded from SMTPConfigResponse entirely.
// Returns model.ErrNotFound if the user has no SMTP config.
func (s *SMTPConfigService) Get(ctx context.Context, userID string) (*model.SMTPConfigResponse, error) {
	if userID == "" {
		return nil, model.ErrUnauthorized
	}

	cfg, err := s.configs.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get smtp config: %w", err)
	}

	return toSMTPConfigResponse(cfg), nil
}

// GetMailer fetches the user's SMTP config, decrypts the password,
// and returns a ready-to-use *mailer.Mailer instance.
// This is called internally by the email service before every send —
// it is never exposed directly via the API.
// Returns model.ErrNotFound if the user has not set up SMTP yet.
func (s *SMTPConfigService) GetMailer(ctx context.Context, userID string) (*mailer.Mailer, error) {
	if userID == "" {
		return nil, model.ErrUnauthorized
	}

	cfg, err := s.configs.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get smtp config: %w", err)
	}

	// Decrypt the password — only at the moment we need to use it.
	plainPassword, err := s.crypto.Decrypt(cfg.PasswordEncrypted)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt smtp password: %w", err)
	}

	m, err := mailer.New(mailer.Config{
		Host:        cfg.Host,
		Port:        cfg.Port,
		Username:    cfg.Username,
		Password:    plainPassword,
		FromAddress: cfg.FromAddress,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create mailer: %w", err)
	}

	return m, nil
}

// Delete removes the SMTP config for a user.
// Returns model.ErrNotFound if the user has no SMTP config.
func (s *SMTPConfigService) Delete(ctx context.Context, userID string) error {
	if userID == "" {
		return model.ErrUnauthorized
	}

	if err := s.configs.Delete(ctx, userID); err != nil {
		return fmt.Errorf("failed to delete smtp config: %w", err)
	}

	return nil
}

// toSMTPConfigResponse converts a model.SMTPConfig to a model.SMTPConfigResponse.
// The encrypted password is deliberately excluded from the response —
// it must never be returned to the client via the API.
func toSMTPConfigResponse(cfg *model.SMTPConfig) *model.SMTPConfigResponse {
	return &model.SMTPConfigResponse{
		ID:          cfg.ID,
		Host:        cfg.Host,
		Port:        cfg.Port,
		Username:    cfg.Username,
		FromAddress: cfg.FromAddress,
		CreatedAt:   cfg.CreatedAt,
		UpdatedAt:   cfg.UpdatedAt,
	}
}
