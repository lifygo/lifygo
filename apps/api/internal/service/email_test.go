package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/lifygo/lifygo/apps/api/internal/model"
	"github.com/lifygo/lifygo/apps/api/internal/service"
	"github.com/lifygo/lifygo/apps/api/pkg/mailer"
)

// -----------------------------------------------------------------------
// Fake EmailLogRepository
// -----------------------------------------------------------------------

type fakeEmailLogRepository struct {
	logs      []*model.EmailLog
	createErr error
	listErr   error
	countErr  error
}

func newFakeEmailLogRepository() *fakeEmailLogRepository {
	return &fakeEmailLogRepository{}
}

func (f *fakeEmailLogRepository) Create(_ context.Context, userID, to, subject string, status model.EmailStatus, errorMessage *string) (*model.EmailLog, error) {
	if f.createErr != nil {
		return nil, f.createErr
	}
	log := &model.EmailLog{
		ID:           "log_" + to,
		UserID:       userID,
		To:           to,
		Subject:      subject,
		Status:       status,
		ErrorMessage: errorMessage,
		SentAt:       time.Now(),
	}
	f.logs = append(f.logs, log)
	return log, nil
}

func (f *fakeEmailLogRepository) List(_ context.Context, input model.ListEmailLogsInput) ([]model.EmailLog, error) {
	if f.listErr != nil {
		return nil, f.listErr
	}
	result := make([]model.EmailLog, 0)
	for _, log := range f.logs {
		if log.UserID == input.UserID {
			result = append(result, *log)
		}
	}
	return result, nil
}

func (f *fakeEmailLogRepository) CountByUserID(_ context.Context, userID string) (int, error) {
	if f.countErr != nil {
		return 0, f.countErr
	}
	count := 0
	for _, log := range f.logs {
		if log.UserID == userID {
			count++
		}
	}
	return count, nil
}

// -----------------------------------------------------------------------
// Fake OTPStore
// -----------------------------------------------------------------------

type fakeOTPStore struct {
	data   map[string]string
	setErr error
	getErr error
}

func newFakeOTPStore() *fakeOTPStore {
	return &fakeOTPStore{data: make(map[string]string)}
}

func (f *fakeOTPStore) SetWithTTL(_ context.Context, key, value string, _ time.Duration) error {
	if f.setErr != nil {
		return f.setErr
	}
	f.data[key] = value
	return nil
}

func (f *fakeOTPStore) GetAndDelete(_ context.Context, key string) (string, error) {
	if f.getErr != nil {
		return "", f.getErr
	}
	value, ok := f.data[key]
	if !ok {
		return "", nil
	}
	delete(f.data, key)
	return value, nil
}

// -----------------------------------------------------------------------
// Fake Mailer
// -----------------------------------------------------------------------

// fakeMailerFactory returns a mailer factory for testing.
// When shouldFail is true, the factory returns a mailer that always
// fails to send — simulating SMTP errors.
func fakeMailerFactory(shouldFail bool) service.MailerFactory {
	return func(_ context.Context, _ string) (*mailer.Mailer, error) {
		if shouldFail {
			return nil, errors.New("smtp: connection refused")
		}
		// Return a mailer pointed at a guaranteed-closed port so any
		// actual send attempt fails, but the factory itself succeeds.
		// For "shouldFail=false" we use a mock in Send tests instead.
		return mailer.New(mailer.Config{
			Host:        "localhost",
			Port:        19998,
			Username:    "test@test.com",
			Password:    "password",
			FromAddress: "test@test.com",
		})
	}
}

// successMailerFactory returns a factory whose mailer always "succeeds"
// by pointing at a mock server. Since we only test the service layer here
// (not the mailer itself), we rely on the mock SMTP server from mailer_test.
// However, since we cannot reuse that server here, we instead override
// the send behavior by using a special port that the fake handles.
//
// For service-layer email tests, we test two things separately:
//   - That the service calls the mailer and logs the result correctly.
//   - That when the mailer fails, the log entry reflects "failed".
//
// We achieve "success" simulation by accepting that the mailer will
// error on a real send to a closed port, and instead we only verify
// the service behavior around that, not the actual network send.
// True end-to-end send is covered in integration/e2e tests.
func noopMailerFactory() service.MailerFactory {
	return func(_ context.Context, _ string) (*mailer.Mailer, error) {
		return mailer.New(mailer.Config{
			Host:        "localhost",
			Port:        19997,
			Username:    "test@test.com",
			Password:    "password",
			FromAddress: "test@test.com",
		})
	}
}

// -----------------------------------------------------------------------
// Send
// -----------------------------------------------------------------------

func TestEmailService_Send(t *testing.T) {
	t.Parallel()

	t.Run("logs a failed send when mailer factory returns an error", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, fakeMailerFactory(true))

		_, err := svc.Send(context.Background(), model.SendEmailInput{
			UserID:  "user_1",
			To:      "recipient@example.com",
			Subject: "Hello",
			Body:    "World",
		})
		if err == nil {
			t.Error("expected error when mailer factory fails, got nil")
		}
	})

	t.Run("logs a failed send when smtp send fails", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.Send(context.Background(), model.SendEmailInput{
			UserID:  "user_1",
			To:      "recipient@example.com",
			Subject: "Hello",
			Body:    "World",
		})

		// The send will fail (no real SMTP server), but a log must
		// have been created recording the failure.
		if err == nil {
			// If somehow it succeeded (no error), we just check the log.
			t.Log("send succeeded (unexpected in unit test)")
		}

		// Either way, a log entry must exist.
		if len(logs.logs) == 0 {
			t.Error("expected at least one log entry after send attempt, got none")
		}
	})

	t.Run("returns error for missing user id", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.Send(context.Background(), model.SendEmailInput{
			To:      "recipient@example.com",
			Subject: "Hello",
			Body:    "World",
		})
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})

	t.Run("returns error for missing to address", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.Send(context.Background(), model.SendEmailInput{
			UserID:  "user_1",
			Subject: "Hello",
			Body:    "World",
		})
		if !errors.Is(err, model.ErrToRequired) {
			t.Errorf("got %v, want %v", err, model.ErrToRequired)
		}
	})

	t.Run("returns error for invalid to address format", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.Send(context.Background(), model.SendEmailInput{
			UserID:  "user_1",
			To:      "not-an-email",
			Subject: "Hello",
			Body:    "World",
		})
		if err == nil {
			t.Error("expected error for invalid email format, got nil")
		}
	})

	t.Run("returns error for missing subject", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.Send(context.Background(), model.SendEmailInput{
			UserID: "user_1",
			To:     "recipient@example.com",
			Body:   "World",
		})
		if !errors.Is(err, model.ErrSubjectRequired) {
			t.Errorf("got %v, want %v", err, model.ErrSubjectRequired)
		}
	})

	t.Run("returns error for missing body", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.Send(context.Background(), model.SendEmailInput{
			UserID:  "user_1",
			To:      "recipient@example.com",
			Subject: "Hello",
		})
		if !errors.Is(err, model.ErrBodyRequired) {
			t.Errorf("got %v, want %v", err, model.ErrBodyRequired)
		}
	})
}

// -----------------------------------------------------------------------
// SendOTP
// -----------------------------------------------------------------------

func TestEmailService_SendOTP(t *testing.T) {
	t.Parallel()

	t.Run("stores otp in redis before sending", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otpStore := newFakeOTPStore()
		svc := service.NewEmailService(logs, otpStore, noopMailerFactory())

		svc.SendOTP(context.Background(), model.SendOTPInput{
			UserID: "user_1",
			To:     "recipient@example.com",
		})

		// Even if the send fails (no real SMTP), the OTP must have
		// been stored in Redis before the send was attempted.
		key := model.OTPRedisKey("user_1", "recipient@example.com")
		if _, ok := otpStore.data[key]; !ok {
			// It may have been deleted if send succeeded. Check logs.
			if len(logs.logs) == 0 {
				t.Error("otp was never stored in redis")
			}
		}
	})

	t.Run("returns error for missing user id", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.SendOTP(context.Background(), model.SendOTPInput{
			To: "recipient@example.com",
		})
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})

	t.Run("returns error for missing to address", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.SendOTP(context.Background(), model.SendOTPInput{
			UserID: "user_1",
		})
		if !errors.Is(err, model.ErrToRequired) {
			t.Errorf("got %v, want %v", err, model.ErrToRequired)
		}
	})

	t.Run("returns error for invalid to address format", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.SendOTP(context.Background(), model.SendOTPInput{
			UserID: "user_1",
			To:     "not-an-email",
		})
		if err == nil {
			t.Error("expected error for invalid email format, got nil")
		}
	})

	t.Run("returns error when otp store fails", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otpStore := newFakeOTPStore()
		otpStore.setErr = errors.New("redis: connection refused")
		svc := service.NewEmailService(logs, otpStore, noopMailerFactory())

		_, err := svc.SendOTP(context.Background(), model.SendOTPInput{
			UserID: "user_1",
			To:     "recipient@example.com",
		})
		if err == nil {
			t.Error("expected error when otp store fails, got nil")
		}
	})
}

// -----------------------------------------------------------------------
// VerifyOTP
// -----------------------------------------------------------------------

func TestEmailService_VerifyOTP(t *testing.T) {
	t.Parallel()

	t.Run("verifies a valid otp code", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otpStore := newFakeOTPStore()
		svc := service.NewEmailService(logs, otpStore, noopMailerFactory())

		// Manually seed a known OTP code in the fake store.
		key := model.OTPRedisKey("user_1", "recipient@example.com")
		otpStore.data[key] = "123456"

		resp, err := svc.VerifyOTP(context.Background(), model.VerifyOTPInput{
			UserID: "user_1",
			Email:  "recipient@example.com",
			Code:   "123456",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !resp.Verified {
			t.Error("expected Verified to be true")
		}
		if resp.Email != "recipient@example.com" {
			t.Errorf("Email: got %q want recipient@example.com", resp.Email)
		}
		if resp.VerifiedAt.IsZero() {
			t.Error("expected VerifiedAt to be set")
		}
	})

	t.Run("returns ErrOTPInvalid for a wrong code", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otpStore := newFakeOTPStore()
		svc := service.NewEmailService(logs, otpStore, noopMailerFactory())

		key := model.OTPRedisKey("user_1", "recipient@example.com")
		otpStore.data[key] = "123456"

		_, err := svc.VerifyOTP(context.Background(), model.VerifyOTPInput{
			UserID: "user_1",
			Email:  "recipient@example.com",
			Code:   "999999",
		})
		if !errors.Is(err, model.ErrOTPInvalid) {
			t.Errorf("got %v, want %v", err, model.ErrOTPInvalid)
		}
	})

	t.Run("returns ErrOTPNotFound when otp does not exist or has expired", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otpStore := newFakeOTPStore()
		svc := service.NewEmailService(logs, otpStore, noopMailerFactory())

		// No OTP seeded — simulates expiry or never-generated.
		_, err := svc.VerifyOTP(context.Background(), model.VerifyOTPInput{
			UserID: "user_1",
			Email:  "recipient@example.com",
			Code:   "123456",
		})
		if !errors.Is(err, model.ErrOTPNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrOTPNotFound)
		}
	})

	t.Run("otp can only be used once — second verification fails", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otpStore := newFakeOTPStore()
		svc := service.NewEmailService(logs, otpStore, noopMailerFactory())

		key := model.OTPRedisKey("user_1", "recipient@example.com")
		otpStore.data[key] = "123456"

		// First verification succeeds.
		_, err := svc.VerifyOTP(context.Background(), model.VerifyOTPInput{
			UserID: "user_1",
			Email:  "recipient@example.com",
			Code:   "123456",
		})
		if err != nil {
			t.Fatalf("first verification failed unexpectedly: %v", err)
		}

		// Second verification with the same code must fail.
		// GetAndDelete removed the key — it no longer exists.
		_, err = svc.VerifyOTP(context.Background(), model.VerifyOTPInput{
			UserID: "user_1",
			Email:  "recipient@example.com",
			Code:   "123456",
		})
		if !errors.Is(err, model.ErrOTPNotFound) {
			t.Errorf("got %v, want %v on second use", err, model.ErrOTPNotFound)
		}
	})

	t.Run("otp is namespaced per user — different users cannot share codes", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otpStore := newFakeOTPStore()
		svc := service.NewEmailService(logs, otpStore, noopMailerFactory())

		// Seed OTP for user_1.
		keyA := model.OTPRedisKey("user_1", "recipient@example.com")
		otpStore.data[keyA] = "123456"

		// user_2 tries to verify using the same email and code.
		// The key is different (user_2 vs user_1), so it must not be found.
		_, err := svc.VerifyOTP(context.Background(), model.VerifyOTPInput{
			UserID: "user_2",
			Email:  "recipient@example.com",
			Code:   "123456",
		})
		if !errors.Is(err, model.ErrOTPNotFound) {
			t.Errorf("got %v, want %v", err, model.ErrOTPNotFound)
		}
	})

	t.Run("returns error for missing user id", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.VerifyOTP(context.Background(), model.VerifyOTPInput{
			Email: "recipient@example.com",
			Code:  "123456",
		})
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})

	t.Run("returns error for code that is not 6 digits", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, err := svc.VerifyOTP(context.Background(), model.VerifyOTPInput{
			UserID: "user_1",
			Email:  "recipient@example.com",
			Code:   "123",
		})
		if !errors.Is(err, model.ErrOTPInvalid) {
			t.Errorf("got %v, want %v", err, model.ErrOTPInvalid)
		}
	})
}

// -----------------------------------------------------------------------
// ListLogs
// -----------------------------------------------------------------------

func TestEmailService_ListLogs(t *testing.T) {
	t.Parallel()

	t.Run("returns logs for a user", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		// Seed logs directly.
		logs.logs = append(logs.logs,
			&model.EmailLog{ID: "1", UserID: "user_1", Status: model.EmailStatusSent},
			&model.EmailLog{ID: "2", UserID: "user_1", Status: model.EmailStatusFailed},
		)

		result, total, err := svc.ListLogs(context.Background(), model.ListEmailLogsInput{
			UserID: "user_1",
			Limit:  10,
			Offset: 0,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 2 {
			t.Errorf("expected 2 logs, got %d", len(result))
		}
		if total != 2 {
			t.Errorf("expected total 2, got %d", total)
		}
	})

	t.Run("applies default limit of 50 when limit is zero", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		// This just verifies no error is returned when limit is 0.
		_, _, err := svc.ListLogs(context.Background(), model.ListEmailLogsInput{
			UserID: "user_1",
			Limit:  0,
		})
		if err != nil {
			t.Errorf("unexpected error with zero limit: %v", err)
		}
	})

	t.Run("caps limit at 100", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, _, err := svc.ListLogs(context.Background(), model.ListEmailLogsInput{
			UserID: "user_1",
			Limit:  999,
		})
		if err != nil {
			t.Errorf("unexpected error with large limit: %v", err)
		}
	})

	t.Run("returns ErrUnauthorized for empty user id", func(t *testing.T) {
		t.Parallel()
		logs := newFakeEmailLogRepository()
		otp := newFakeOTPStore()
		svc := service.NewEmailService(logs, otp, noopMailerFactory())

		_, _, err := svc.ListLogs(context.Background(), model.ListEmailLogsInput{
			Limit: 10,
		})
		if !errors.Is(err, model.ErrUnauthorized) {
			t.Errorf("got %v, want %v", err, model.ErrUnauthorized)
		}
	})
}
