//go:build integration

package repository_test

import (
	"context"
	"errors"
	"testing"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/repository"
)

// -----------------------------------------------------------------------
// Upsert
// -----------------------------------------------------------------------

func TestSMTPConfigRepository_Upsert(t *testing.T) {
	pool := newTestPool(t)

	t.Run("creates a new smtp config successfully", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewSMTPConfigRepository(tx)

		input := model.CreateSMTPConfigInput{
			UserID:      user.ID,
			Host:        "smtp.gmail.com",
			Port:        587,
			Username:    "user@gmail.com",
			Password:    "plainpassword",
			FromAddress: "hello@gmail.com",
		}
		encryptedPassword := "encrypted_password_" + randomSuffix()

		cfg, err := repo.Upsert(context.Background(), input, encryptedPassword)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if cfg.ID == "" {
			t.Error("expected cfg.ID to be set, got empty string")
		}
		if cfg.UserID != user.ID {
			t.Errorf("UserID: got %q want %q", cfg.UserID, user.ID)
		}
		if cfg.Host != input.Host {
			t.Errorf("Host: got %q want %q", cfg.Host, input.Host)
		}
		if cfg.Port != input.Port {
			t.Errorf("Port: got %d want %d", cfg.Port, input.Port)
		}
		if cfg.Username != input.Username {
			t.Errorf("Username: got %q want %q", cfg.Username, input.Username)
		}
		if cfg.PasswordEncrypted != encryptedPassword {
			t.Errorf("PasswordEncrypted: got %q want %q", cfg.PasswordEncrypted, encryptedPassword)
		}
		if cfg.FromAddress != input.FromAddress {
			t.Errorf("FromAddress: got %q want %q", cfg.FromAddress, input.FromAddress)
		}
		if cfg.CreatedAt.IsZero() {
			t.Error("expected cfg.CreatedAt to be set, got zero time")
		}
		if cfg.UpdatedAt.IsZero() {
			t.Error("expected cfg.UpdatedAt to be set, got zero time")
		}
	})

	t.Run("replaces existing config when upserting for the same user", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewSMTPConfigRepository(tx)

		// First upsert — sets up the initial config.
		first, err := repo.Upsert(context.Background(), model.CreateSMTPConfigInput{
			UserID:      user.ID,
			Host:        "smtp.old.com",
			Port:        587,
			Username:    "old@old.com",
			Password:    "oldpassword",
			FromAddress: "old@old.com",
		}, "encrypted_old")
		if err != nil {
			t.Fatalf("first upsert failed: %v", err)
		}

		// Second upsert — updates all fields with new values.
		second, err := repo.Upsert(context.Background(), model.CreateSMTPConfigInput{
			UserID:      user.ID,
			Host:        "smtp.new.com",
			Port:        465,
			Username:    "new@new.com",
			Password:    "newpassword",
			FromAddress: "new@new.com",
		}, "encrypted_new")
		if err != nil {
			t.Fatalf("second upsert failed: %v", err)
		}

		// The ID must be the same — it is the same row, just updated.
		if second.ID != first.ID {
			t.Errorf("ID changed after upsert: got %q want %q", second.ID, first.ID)
		}

		// The new values must be reflected.
		if second.Host != "smtp.new.com" {
			t.Errorf("Host: got %q want %q", second.Host, "smtp.new.com")
		}
		if second.Port != 465 {
			t.Errorf("Port: got %d want %d", second.Port, 465)
		}
		if second.PasswordEncrypted != "encrypted_new" {
			t.Errorf("PasswordEncrypted: got %q want %q", second.PasswordEncrypted, "encrypted_new")
		}

		// updated_at must be after or equal to created_at.
		if second.UpdatedAt.Before(second.CreatedAt) {
			t.Errorf("UpdatedAt (%v) must not be before CreatedAt (%v)", second.UpdatedAt, second.CreatedAt)
		}
	})

	t.Run("two different users can each have their own smtp config", func(t *testing.T) {
		tx := beginTx(t, pool)
		userA := insertTestUser(t, tx)
		userB := insertTestUser(t, tx)
		repo := repository.NewSMTPConfigRepository(tx)

		_, err := repo.Upsert(context.Background(), model.CreateSMTPConfigInput{
			UserID:      userA.ID,
			Host:        "smtp.a.com",
			Port:        587,
			Username:    "a@a.com",
			Password:    "pass",
			FromAddress: "a@a.com",
		}, "encrypted_a")
		if err != nil {
			t.Fatalf("userA upsert failed: %v", err)
		}

		_, err = repo.Upsert(context.Background(), model.CreateSMTPConfigInput{
			UserID:      userB.ID,
			Host:        "smtp.b.com",
			Port:        465,
			Username:    "b@b.com",
			Password:    "pass",
			FromAddress: "b@b.com",
		}, "encrypted_b")
		if err != nil {
			t.Fatalf("userB upsert failed: %v", err)
		}

		cfgA, err := repo.GetByUserID(context.Background(), userA.ID)
		if err != nil {
			t.Fatalf("failed to get userA config: %v", err)
		}
		if cfgA.Host != "smtp.a.com" {
			t.Errorf("userA Host: got %q want smtp.a.com", cfgA.Host)
		}

		cfgB, err := repo.GetByUserID(context.Background(), userB.ID)
		if err != nil {
			t.Fatalf("failed to get userB config: %v", err)
		}
		if cfgB.Host != "smtp.b.com" {
			t.Errorf("userB Host: got %q want smtp.b.com", cfgB.Host)
		}
	})

	t.Run("rejects smtp config for a user that does not exist", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewSMTPConfigRepository(tx)

		const randomUUID = "00000000-0000-0000-0000-000000000000"

		_, err := repo.Upsert(context.Background(), model.CreateSMTPConfigInput{
			UserID:      randomUUID,
			Host:        "smtp.example.com",
			Port:        587,
			Username:    "user@example.com",
			Password:    "pass",
			FromAddress: "user@example.com",
		}, "encrypted_pass")
		if err == nil {
			t.Error("expected an error for non-existent user_id, got nil")
		}
	})

	t.Run("rejects port zero", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewSMTPConfigRepository(tx)

		_, err := repo.Upsert(context.Background(), model.CreateSMTPConfigInput{
			UserID:      user.ID,
			Host:        "smtp.example.com",
			Port:        0,
			Username:    "user@example.com",
			Password:    "pass",
			FromAddress: "user@example.com",
		}, "encrypted_pass")
		if err == nil {
			t.Error("expected an error for port 0 (violates CHECK constraint), got nil")
		}
	})

	t.Run("rejects port above 65535", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewSMTPConfigRepository(tx)

		_, err := repo.Upsert(context.Background(), model.CreateSMTPConfigInput{
			UserID:      user.ID,
			Host:        "smtp.example.com",
			Port:        99999,
			Username:    "user@example.com",
			Password:    "pass",
			FromAddress: "user@example.com",
		}, "encrypted_pass")
		if err == nil {
			t.Error("expected an error for port 99999 (violates CHECK constraint), got nil")
		}
	})
}

// -----------------------------------------------------------------------
// GetByUserID
// -----------------------------------------------------------------------

func TestSMTPConfigRepository_GetByUserID(t *testing.T) {
	pool := newTestPool(t)

	t.Run("finds an existing smtp config", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		created := insertTestSMTPConfig(t, tx, user.ID)
		repo := repository.NewSMTPConfigRepository(tx)

		found, err := repo.GetByUserID(context.Background(), user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if found.ID != created.ID {
			t.Errorf("ID: got %q want %q", found.ID, created.ID)
		}
		if found.Host != created.Host {
			t.Errorf("Host: got %q want %q", found.Host, created.Host)
		}
		if found.PasswordEncrypted != created.PasswordEncrypted {
			t.Errorf("PasswordEncrypted: got %q want %q", found.PasswordEncrypted, created.PasswordEncrypted)
		}
	})

	t.Run("returns ErrNotFound when user has no smtp config", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewSMTPConfigRepository(tx)

		_, err := repo.GetByUserID(context.Background(), user.ID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound for a user that does not exist", func(t *testing.T) {
		tx := beginTx(t, pool)
		repo := repository.NewSMTPConfigRepository(tx)

		const randomUUID = "00000000-0000-0000-0000-000000000000"

		_, err := repo.GetByUserID(context.Background(), randomUUID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})
}

// -----------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------

func TestSMTPConfigRepository_Delete(t *testing.T) {
	pool := newTestPool(t)

	t.Run("deletes an existing smtp config", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		insertTestSMTPConfig(t, tx, user.ID)
		repo := repository.NewSMTPConfigRepository(tx)

		if err := repo.Delete(context.Background(), user.ID); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// After deleting, looking it up again must return ErrNotFound.
		_, err := repo.GetByUserID(context.Background(), user.ID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v after deletion", err, model.ErrNotFound)
		}
	})

	t.Run("returns ErrNotFound when user has no smtp config", func(t *testing.T) {
		tx := beginTx(t, pool)
		user := insertTestUser(t, tx)
		repo := repository.NewSMTPConfigRepository(tx)

		err := repo.Delete(context.Background(), user.ID)
		if !errors.Is(err, model.ErrNotFound) {
			t.Errorf("got error %v, want %v", err, model.ErrNotFound)
		}
	})

	t.Run("deleting one user's config does not affect another user's config", func(t *testing.T) {
		tx := beginTx(t, pool)
		userA := insertTestUser(t, tx)
		userB := insertTestUser(t, tx)
		repo := repository.NewSMTPConfigRepository(tx)

		insertTestSMTPConfig(t, tx, userA.ID)
		insertTestSMTPConfig(t, tx, userB.ID)

		// Delete userA's config.
		if err := repo.Delete(context.Background(), userA.ID); err != nil {
			t.Fatalf("failed to delete userA config: %v", err)
		}

		// userB's config must still be there.
		_, err := repo.GetByUserID(context.Background(), userB.ID)
		if err != nil {
			t.Errorf("userB config should still exist after deleting userA config, got error: %v", err)
		}
	})
}
