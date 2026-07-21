package service

import (
	"context"
	"fmt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/pkg/crypto"
	"github.com/lifygo/lifygo/apps/api/pkg/mailer"
	"github.com/lifygo/lifygo/apps/api/pkg/validator"
)

type SMTPConfigRepository interface {
	Upsert(ctx context.Context, input model.CreateSMTPConfigInput, encryptedPassword string) (*model.SMTPConfig, error)
	GetByUserID(ctx context.Context, userID string) (*model.SMTPConfig, error)
	Delete(ctx context.Context, userID string) error
}

type SMTPConfigService struct {
	configs SMTPConfigRepository
	crypto  *crypto.Crypto
	pool    *mailer.Pool
}

func NewSMTPConfigService(configs SMTPConfigRepository, c *crypto.Crypto, pool *mailer.Pool) *SMTPConfigService {
	return &SMTPConfigService{
		configs: configs,
		crypto:  c,
		pool:    pool,
	}
}

func (s *SMTPConfigService) Upsert(ctx context.Context, input model.CreateSMTPConfigInput) (*model.SMTPConfigResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	if err := validator.ValidateEmail(input.FromAddress); err != nil {
		return nil, fmt.Errorf("invalid from address: %w", err)
	}

	if err := validator.ValidateHost(input.Host); err != nil {
		return nil, fmt.Errorf("invalid smtp host: %w", err)
	}

	if err := validator.ValidateSMTPPort(input.Port); err != nil {
		return nil, fmt.Errorf("invalid smtp port: %w", err)
	}

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

func (s *SMTPConfigService) GetMailer(ctx context.Context, userID string) (*mailer.Mailer, error) {
	if userID == "" {
		return nil, model.ErrUnauthorized
	}

	cfg, err := s.configs.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get smtp config: %w", err)
	}

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
		Pool:        s.pool,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create mailer: %w", err)
	}

	return m, nil
}

func (s *SMTPConfigService) Delete(ctx context.Context, userID string) error {
	if userID == "" {
		return model.ErrUnauthorized
	}

	if err := s.configs.Delete(ctx, userID); err != nil {
		return fmt.Errorf("failed to delete smtp config: %w", err)
	}

	return nil
}

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
