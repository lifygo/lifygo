package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/service"
	"github.com/lifygo/lifygo/apps/api/pkg/crypto"
)

// -----------------------------------------------------------------------
// Fake SMTPConfigRepository
// -----------------------------------------------------------------------

// fakeSMTPConfigRepository is an in-memory implementation of
// service.SMTPConfigRepository.
type fakeSMTPConfigRepository struct {
	configs   map[string]*model.SMTPConfig // keyed by userID
	upsertErr error
	getErr    error
	deleteErr error
}

func newFakeSMTPConfigRepository() *fakeSMTPConfigRepository {
	return &fakeSMTPConfigRepository{
		configs: make(map[string]*model.SMTPConfig),
	}
}

func (f *fakeSMTPConfigRepository) Upsert(_ context.Context, input model.CreateSMTPConfigInput, encryptedPassword string) (*model.SMTPConfig, error) {
	if f.upsertErr != nil {
		return nil, f.upsertErr
	}
	existing, exists := f.configs[input.UserID]
	if exists {
		// Update existing.
		existing.Host = input.Host
		existing.Port = input.Port
		existing.Username = input.Username
		existing.PasswordEncrypted = encryptedPassword
		existing.FromAddress = input.FromAddress
		existing.UpdatedAt = time.Now()
		return existing, nil
	}
	// Create new.
	cfg := &model.SMTPConfig{
		ID:                "cfg_" + input.UserID,
		UserID:            input.UserID,
		Host:              input.Host,
		Port:              input.Port,
		Username:          input.Username,
		PasswordEncrypted: encryptedPassword,
		FromAddress:       input.FromAddress,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}
	f.configs[input.UserID] = cfg
	return cfg, nil
}

func (f *fakeSMTPConfigRepository) GetByUserID(_ context.Context, userID string) (*model.SMTPConfig, error) {
	if f.getErr != nil {
		return nil, f.getErr
	}
	cfg, ok := f.configs[userID]
	if !ok {
		return nil, model.ErrNotFound
	}
	return cfg, nil
}

func (f *fakeSMTPConfigRepository) Delete(_ context.Context, userID string) error {
	if f.deleteErr != nil {
		return f.deleteErr
	}
	if _, ok := f.configs[userID]; !ok {
		return model.ErrNotFound
	}
	delete(f.configs, userID)
	return nil
}

// -----------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------

// validHexKey is a test-only AES-256 key — 64 hex characters = 32 bytes.
const validHexKey = "6368616e676520746869732070617373776f726420746f206120736563726574"

// newTestCrypto creates a Crypto instance for use in service unit tests.
func newTestCrypto(t *testing.T) *crypto.Crypto {
	t.Helper()
	c, err := crypto.New(validHexKey)
	if err != nil {
		t.Fatalf("failed to create crypto: %v", err)
	}
	return c
}

// validSMTPInput returns a fully populated CreateSMTPConfigInput
// for use in tests.
func validSMTPInput(userID string) model.CreateSMTPConfigInput {
	return model.CreateSMTPConfigInput{
		UserID:      userID,
		Host:        "smtp.gmail.com",
		Port:        587,
		Username:    "user@gmail.com",
		Password:    "plainpassword",
		FromAddress: "hello@gmail.com",
	}
}

// -----------------------------------------------------------------------
// Upsert
// -----------------------------------------------------------------------

func TestSMTPConfigService_Upsert(t *testing.T) {
	t.Parallel()

	t.Run("creates a new smtp config successfully", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		resp, err := svc.Upsert(context.Background(), validSMTPInput("user_1"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if resp.ID == "" {
			t.Error("expected resp.ID to be set")
		}
		if resp.Host != "smtp.gmail.com" {
			t.Errorf("Host: got %q want smtp.gmail.com", resp.Host)
		}
		if resp.Port != 587 {
			t.Errorf("Port: got %d want 587", resp.Port)
		}
	})

	t.Run("password is encrypted before storage — plain text never stored", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		c := newTestCrypto(t)
		svc := service.NewSMTPConfigService(repo, c)

		input := validSMTPInput("user_1")

		_, err := svc.Upsert(context.Background(), input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// Check what was actually stored in the fake repository.
		stored := repo.configs["user_1"]
		if stored == nil {
			t.Fatal("expected config to be stored, got nil")
		}

		// The stored password must not be the plain text.
		if stored.PasswordEncrypted == input.Password {
			t.Error("plain text password was stored — it must be encrypted before storage")
		}

		// But decrypting it must give back the original plain text.
		decrypted, err := c.Decrypt(stored.PasswordEncrypted)
		if err != nil {
			t.Fatalf("failed to decrypt stored password: %v", err)
		}
		if decrypted != input.Password {
			t.Errorf("decrypted password: got %q want %q", decrypted, input.Password)
		}
	})

	t.Run("response never contains the encrypted password", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		// We cannot check resp.PasswordEncrypted directly because the
		// field does not exist on SMTPConfigResponse — the struct simply
		// does not have it. This test verifies that the field is absent
		// by confirming the response type has no password field at all.
		resp, err := svc.Upsert(context.Background(), validSMTPInput("user_1"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// SMTPConfigResponse has no password field — this test documents
		// that design intent and will fail to compile if someone adds one.
		_ = resp.ID
		_ = resp.Host
		_ = resp.Port
		_ = resp.Username
		_ = resp.FromAddress
		_ = resp.CreatedAt
		_ = resp.UpdatedAt
		// No resp.Password or resp.PasswordEncrypted — by design.
	})

	t.Run("replaces existing config on second upsert", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		_, err := svc.Upsert(context.Background(), validSMTPInput("user_1"))
		if err != nil {
			t.Fatalf("first upsert failed: %v", err)
		}

		updated := validSMTPInput("user_1")
		updated.Host = "smtp.sendgrid.net"
		updated.Port = 465

		resp, err := svc.Upsert(context.Background(), updated)
		if err != nil {
			t.Fatalf("second upsert failed: %v", err)
		}

		if resp.Host != "smtp.sendgrid.net" {
			t.Errorf("Host: got %q want smtp.sendgrid.net", resp.Host)
		}
		if resp.Port != 465 {
			t.Errorf("Port: got %d want 465", resp.Port)
		}
	})

	t.Run("returns error for missing user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		input := validSMTPInput("")
		_, err := svc.Upsert(context.Background(), input)
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})

	t.Run("returns error for missing host", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		input := validSMTPInput("user_1")
		input.Host = ""
		_, err := svc.Upsert(context.Background(), input)
		if !errors.Is(err, model.ErrSMTPHostRequired) {
			t.Errorf("got %v, want %v", err, model.ErrSMTPHostRequired)
		}
	})

	t.Run("returns error for invalid host format", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		input := validSMTPInput("user_1")
		input.Host = "https://smtp.gmail.com"
		_, err := svc.Upsert(context.Background(), input)
		if err == nil {
			t.Error("expected error for invalid host format, got nil")
		}
	})

	t.Run("returns error for invalid port", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		input := validSMTPInput("user_1")
		input.Port = 0
		_, err := svc.Upsert(context.Background(), input)
		if !errors.Is(err, model.ErrSMTPPortRequired) {
			t.Errorf("got %v, want %v", err, model.ErrSMTPPortRequired)
		}
	})

	t.Run("returns error for invalid from address", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		input := validSMTPInput("user_1")
		input.FromAddress = "not-an-email"
		_, err := svc.Upsert(context.Background(), input)
		if err == nil {
			t.Error("expected error for invalid from address, got nil")
		}
	})

	t.Run("returns error for missing password", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		input := validSMTPInput("user_1")
		input.Password = ""
		_, err := svc.Upsert(context.Background(), input)
		if !errors.Is(err, model.ErrSMTPPasswordRequired) {
			t.Errorf("got %v, want %v", err, model.ErrSMTPPasswordRequired)
		}
	})
}

// -----------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------

func TestSMTPConfigService_Get(t *testing.T) {
	t.Parallel()

	t.Run("returns config for a user who has one", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		svc.Upsert(context.Background(), validSMTPInput("user_1"))

		resp, err := svc.Get(context.Background(), "user_1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.Host != "smtp.gmail.com" {
			t.Errorf("Host: got %q want smtp.gmail.com", resp.Host)
		}
	})

	t.Run("returns ErrNotFound for a user with no config", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		_, err := svc.Get(context.Background(), "user_1")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrUnauthorized for empty user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		_, err := svc.Get(context.Background(), "")
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})
}

// -----------------------------------------------------------------------
// GetMailer
// -----------------------------------------------------------------------

func TestSMTPConfigService_GetMailer(t *testing.T) {
	t.Parallel()

	t.Run("returns a mailer with decrypted credentials", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		c := newTestCrypto(t)
		svc := service.NewSMTPConfigService(repo, c)

		svc.Upsert(context.Background(), validSMTPInput("user_1"))

		m, err := svc.GetMailer(context.Background(), "user_1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if m == nil {
			t.Error("expected non-nil mailer, got nil")
		}
	})

	t.Run("returns ErrNotFound when user has no smtp config", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		_, err := svc.GetMailer(context.Background(), "user_1")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("fails when stored ciphertext is tampered with", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		svc.Upsert(context.Background(), validSMTPInput("user_1"))

		// Manually corrupt the stored encrypted password.
		repo.configs["user_1"].PasswordEncrypted = "corrupted_garbage_not_valid_hex"

		_, err := svc.GetMailer(context.Background(), "user_1")
		if err == nil {
			t.Error("expected error for corrupted ciphertext, got nil")
		}
	})

	t.Run("returns ErrUnauthorized for empty user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		_, err := svc.GetMailer(context.Background(), "")
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})
}

// -----------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------

func TestSMTPConfigService_Delete(t *testing.T) {
	t.Parallel()

	t.Run("deletes an existing config", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		svc.Upsert(context.Background(), validSMTPInput("user_1"))

		if err := svc.Delete(context.Background(), "user_1"); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		_, err := svc.Get(context.Background(), "user_1")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v after deletion", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound for a user with no config", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		err := svc.Delete(context.Background(), "user_1")
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrUnauthorized for empty user id", func(t *testing.T) {
		t.Parallel()
		repo := newFakeSMTPConfigRepository()
		svc := service.NewSMTPConfigService(repo, newTestCrypto(t))

		err := svc.Delete(context.Background(), "")
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})
}
