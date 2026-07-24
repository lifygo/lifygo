package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/lifygo/lifygo/apps/api/internal/config"
	"github.com/lifygo/lifygo/apps/api/internal/database"
	"github.com/lifygo/lifygo/apps/api/internal/handler"
	"github.com/lifygo/lifygo/apps/api/internal/middleware"
	redisClient "github.com/lifygo/lifygo/apps/api/internal/redis"
	"github.com/lifygo/lifygo/apps/api/internal/repository"
	"github.com/lifygo/lifygo/apps/api/internal/service"
	"github.com/lifygo/lifygo/apps/api/pkg/crypto"
	"github.com/lifygo/lifygo/apps/api/pkg/mailer"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/go-chi/cors"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	if cfg.AuthProvider == "clerk" {
		clerk.SetKey(cfg.ClerkSecretKey)
	}

	ctx := context.Background()

	db, err := database.Connect(ctx, database.DefaultConfig(cfg.DatabaseURL))
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("connected to postgresql")

	redis, err := redisClient.Connect(ctx, redisClient.DefaultConfig(cfg.RedisURL))
	if err != nil {
		log.Fatalf("failed to connect to redis: %v", err)
	}
	defer redis.Close()

	log.Println("connected to redis")

	cryptoClient, err := crypto.New(cfg.EncryptionKey)
	if err != nil {
		log.Fatalf("failed to initialize crypto: %v", err)
	}

	mailerPool := mailer.NewPool(5 * time.Minute)
	defer mailerPool.Shutdown()

	userRepo := repository.NewUserRepository(db)
	apiKeyRepo := repository.NewAPIKeyRepository(db)
	smtpRepo := repository.NewSMTPConfigRepository(db)
	emailLogRepo := repository.NewEmailLogRepository(db)
	jobRepo := repository.NewJobRepository(db)

	userSvc := service.NewUserService(userRepo)
	apiKeySvc := service.NewAPIKeyService(apiKeyRepo)
	smtpSvc := service.NewSMTPConfigService(smtpRepo, cryptoClient, mailerPool)
	emailSvc := service.NewEmailService(
		emailLogRepo,
		redis,
		smtpSvc.GetMailer,
	)

	eventbridgeSvc := service.NewEventBridgeService(service.EventBridgeConfig{
		Region:           cfg.AWSRegion,
		AccessKeyID:      cfg.AWSAccessKeyID,
		SecretAccessKey:  cfg.AWSSecretAccessKey,
		SQSQueueARN:      cfg.SQSQueueARN,
		SchedulerRoleARN: cfg.SchedulerRoleARN,
	})

	if eventbridgeSvc != nil {
		log.Println("eventbridge scheduler enabled")
	} else {
		log.Println("eventbridge scheduler disabled — using self-hosted scheduler")
	}

	var authSvc *service.AuthService
	if cfg.AuthProvider == "local" {
		authSvc = service.NewAuthService(userRepo, cfg.JWTSecret)
	}

	jobSvc := service.NewJobService(jobRepo, eventbridgeSvc)
	scheduler := service.NewScheduler(jobRepo, smtpSvc)
	dashboardSvc := service.NewDashboardService(emailLogRepo, jobRepo, apiKeyRepo, smtpRepo)

	healthHandler := handler.NewHealthHandler(db, redis)
	userHandler := handler.NewUserHandler(userSvc, cfg.ClerkWebhookSecret)
	apiKeyHandler := handler.NewAPIKeyHandler(apiKeySvc)
	smtpConfigHandler := handler.NewSMTPConfigHandler(smtpSvc)
	emailHandler := handler.NewEmailHandler(emailSvc)
	jobHandler := handler.NewJobHandler(jobSvc)
	dashboardHandler := handler.NewDashboardHandler(dashboardSvc)
	authHandler := handler.NewAuthHandler(authSvc)

	r := chi.NewRouter()

	r.Use(middleware.Recovery())
	r.Use(middleware.RequestID())
	r.Use(middleware.Logger())
	r.Use(chiMiddleware.Timeout(30 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"https://lifygo.com",
			"https://www.lifygo.com",
			"https://dashboard.lifygo.com",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "X-API-Key", "Authorization"},
		AllowCredentials: true,
	}))

	r.Get("/health", healthHandler.Health)

	if cfg.AuthProvider == "clerk" {
		r.Post("/webhooks/clerk", userHandler.ClerkWebhook)
	}

	if cfg.AuthProvider == "local" {
		r.Post("/auth/signup", authHandler.SignUp)
		r.Post("/auth/signin", authHandler.SignIn)
	}

	r.Group(func(r chi.Router) {
		var localUsers middleware.LocalUserResolver
		var clerkUsers middleware.ClerkUserResolver

		if cfg.AuthProvider == "local" {
			localUsers = authSvc
		}
		if cfg.AuthProvider == "clerk" {
			clerkUsers = userSvc
		}

		r.Use(middleware.FlexibleAuth(apiKeySvc, clerkUsers, localUsers))

		r.Use(middleware.RateLimit(redis, 10000))

		r.Delete("/account", userHandler.DeleteAccount)

		r.Post("/api-keys", apiKeyHandler.Create)
		r.Get("/api-keys", apiKeyHandler.List)
		r.Delete("/api-keys/{id}", apiKeyHandler.Delete)

		r.Post("/smtp-config", smtpConfigHandler.Upsert)
		r.Get("/smtp-config", smtpConfigHandler.Get)
		r.Delete("/smtp-config", smtpConfigHandler.Delete)

		r.Post("/send", emailHandler.Send)
		r.Post("/send/otp", emailHandler.SendOTP)
		r.Post("/verify/otp", emailHandler.VerifyOTP)
		r.Get("/logs", emailHandler.Logs)

		r.Post("/jobs", jobHandler.Create)
		r.Get("/jobs", jobHandler.List)
		r.Get("/jobs/{id}", jobHandler.Get)
		r.Delete("/jobs/{id}", jobHandler.Delete)
		r.Get("/jobs/{id}/executions", jobHandler.ListExecutions)

		r.Get("/dashboard/stats", dashboardHandler.Stats)
	})

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("server started on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	scheduler.Start()
	defer scheduler.Stop()

	<-quit
	log.Println("shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}

	log.Println("server stopped cleanly")
}
