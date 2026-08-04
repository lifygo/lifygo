package service

import (
	"context"
	"errors"
	"fmt"
	"log"

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
	configs         SMTPConfigRepository
	crypto          *crypto.Crypto
	pool            *mailer.Pool
	defaultSMTPHost string
	defaultSMTPPort int
	defaultSMTPUser string
	defaultSMTPPass string
	defaultSMTPFrom string
}

func NewSMTPConfigService(
	configs SMTPConfigRepository,
	c *crypto.Crypto,
	pool *mailer.Pool,
	defaultHost string,
	defaultPort int,
	defaultUser string,
	defaultPass string,
	defaultFrom string,
) *SMTPConfigService {
	return &SMTPConfigService{
		configs:         configs,
		crypto:          c,
		pool:            pool,
		defaultSMTPHost: defaultHost,
		defaultSMTPPort: defaultPort,
		defaultSMTPUser: defaultUser,
		defaultSMTPPass: defaultPass,
		defaultSMTPFrom: defaultFrom,
	}
}

func (s *SMTPConfigService) Upsert(ctx context.Context, input model.CreateSMTPConfigInput) (*model.SMTPConfigResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	if err := validator.ValidateEmail(input.FromAddress); err != nil {
		return nil, fmt.Errorf("invalid from address: %w", err)
	}

	if input.IsFullConfig() {
		if err := validator.ValidateHost(input.Host); err != nil {
			return nil, fmt.Errorf("invalid smtp host: %w", err)
		}

		if err := validator.ValidateSMTPPort(input.Port); err != nil {
			return nil, fmt.Errorf("invalid smtp port: %w", err)
		}
	} else if input.Port == 0 {
		input.Port = 587
	}

	var encryptedPassword string
	if input.Password != "" {
		var err error
		encryptedPassword, err = s.crypto.Encrypt(input.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt smtp password: %w", err)
		}
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
		if errors.Is(err, model.ErrNotFound) {
			return nil, nil
		}
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

	if cfg.Host == "" {
		return nil, model.ErrNotFound
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

func (s *SMTPConfigService) GetDefaultMailer(ctx context.Context, userID string) (Sender, error) {
	if s.defaultSMTPPass == "" {
		return nil, fmt.Errorf("no default smtp relay configured")
	}

	fromAddress := s.defaultSMTPFrom

	cfg, err := s.configs.GetByUserID(ctx, userID)
	if err == nil && cfg.FromAddress != "" {
		fromAddress = cfg.FromAddress
	} else if err != nil && !errors.Is(err, model.ErrNotFound) {
		return nil, fmt.Errorf("failed to get smtp config: %w", err)
	}

	log.Printf("smtp.GetDefaultMailer: sending via Resend for user %s (from=%s)", userID, fromAddress)
	return newResendMailer(s.defaultSMTPPass, fromAddress), nil
}

func (s *SMTPConfigService) HasSMTPConfig(ctx context.Context, userID string) bool {
	cfg, err := s.configs.GetByUserID(ctx, userID)
	return err == nil && cfg.Host != ""
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
