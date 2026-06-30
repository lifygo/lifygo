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

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/go-chi/cors"
)

func main() {
	// -----------------------------------------------------------------------
	// Config
	// Load and validate all environment variables on startup.
	// The server will not start if any required variable is missing.
	// -----------------------------------------------------------------------
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	clerk.SetKey(cfg.ClerkSecretKey)

	// -----------------------------------------------------------------------
	// Database
	// Open a PostgreSQL connection pool.
	// -----------------------------------------------------------------------
	ctx := context.Background()

	db, err := database.Connect(ctx, database.DefaultConfig(cfg.DatabaseURL))
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("connected to postgresql")

	// -----------------------------------------------------------------------
	// Redis
	// Open a Redis connection.
	// -----------------------------------------------------------------------
	redis, err := redisClient.Connect(ctx, redisClient.DefaultConfig(cfg.RedisURL))
	if err != nil {
		log.Fatalf("failed to connect to redis: %v", err)
	}
	defer redis.Close()

	log.Println("connected to redis")

	// -----------------------------------------------------------------------
	// Crypto
	// Initialize the AES-256 encryption instance used to encrypt and
	// decrypt SMTP passwords at rest.
	// -----------------------------------------------------------------------
	cryptoClient, err := crypto.New(cfg.EncryptionKey)
	if err != nil {
		log.Fatalf("failed to initialize crypto: %v", err)
	}

	// -----------------------------------------------------------------------
	// Repositories
	// Each repository receives the database pool and talks only to the DB.
	// -----------------------------------------------------------------------
	userRepo := repository.NewUserRepository(db)
	apiKeyRepo := repository.NewAPIKeyRepository(db)
	smtpRepo := repository.NewSMTPConfigRepository(db)
	emailLogRepo := repository.NewEmailLogRepository(db)
	jobRepo := repository.NewJobRepository(db)

	// -----------------------------------------------------------------------
	// Services
	// Each service receives its repository and contains all business logic.
	// -----------------------------------------------------------------------
	userSvc := service.NewUserService(userRepo)
	apiKeySvc := service.NewAPIKeyService(apiKeyRepo)
	smtpSvc := service.NewSMTPConfigService(smtpRepo, cryptoClient)
	emailSvc := service.NewEmailService(
		emailLogRepo,
		redis,
		smtpSvc.GetMailer,
	)
	jobSvc := service.NewJobService(jobRepo)
	scheduler := service.NewScheduler(jobRepo, smtpSvc)
	dashboardSvc := service.NewDashboardService(emailLogRepo, jobRepo, apiKeyRepo, smtpRepo)

	// -----------------------------------------------------------------------
	// Handlers
	// Each handler receives its service and translates HTTP to service calls.
	// -----------------------------------------------------------------------
	healthHandler := handler.NewHealthHandler(db, redis)
	userHandler := handler.NewUserHandler(userSvc, cfg.ClerkWebhookSecret)
	apiKeyHandler := handler.NewAPIKeyHandler(apiKeySvc)
	smtpConfigHandler := handler.NewSMTPConfigHandler(smtpSvc)
	emailHandler := handler.NewEmailHandler(emailSvc)
	jobHandler := handler.NewJobHandler(jobSvc)
	dashboardHandler := handler.NewDashboardHandler(dashboardSvc)

	// -----------------------------------------------------------------------
	// Router
	// Build the chi router and register all routes.
	// -----------------------------------------------------------------------
	r := chi.NewRouter()

	// Global middleware — runs on every request in this order:
	// 1. Recovery    — catches panics, returns 500 instead of crashing
	// 2. RequestID   — assigns a unique ID to every request
	// 3. Logger      — logs method, path, status, duration as JSON
	// 4. chi Timeout — cancels requests that take longer than 30 seconds
	r.Use(middleware.Recovery())
	r.Use(middleware.RequestID())
	r.Use(middleware.Logger())
	r.Use(chiMiddleware.Timeout(30 * time.Second))

	// CORS — allows the Next.js dashboard (running on a different port)
	// to call this API from the browser. In production this should be
	// restricted to the real dashboard domain only.
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "X-API-Key", "Authorization"},
		AllowCredentials: true,
	}))

	// -----------------------------------------------------------------------
	// Public routes — no authentication required.
	// -----------------------------------------------------------------------
	r.Get("/health", healthHandler.Health)

	// Clerk webhook — called by Clerk when a user signs up.
	// Not behind API key auth because Clerk is the caller, not a user.
	r.Post("/webhooks/clerk", userHandler.ClerkWebhook)

	// -----------------------------------------------------------------------
	// Protected routes — require a valid X-API-Key header.
	// -----------------------------------------------------------------------
	r.Group(func(r chi.Router) {
		// Auth middleware — validates X-API-Key and stores user ID in context.
		r.Use(middleware.FlexibleAuth(apiKeySvc, userSvc))

		r.Use(middleware.RateLimit(redis, 10000))

		// Account
		r.Delete("/account", userHandler.DeleteAccount)

		// API Keys
		r.Post("/api-keys", apiKeyHandler.Create)
		r.Get("/api-keys", apiKeyHandler.List)
		r.Delete("/api-keys/{id}", apiKeyHandler.Delete)

		// SMTP Config
		r.Post("/smtp-config", smtpConfigHandler.Upsert)
		r.Get("/smtp-config", smtpConfigHandler.Get)
		r.Delete("/smtp-config", smtpConfigHandler.Delete)

		// Email
		r.Post("/send", emailHandler.Send)
		r.Post("/send/otp", emailHandler.SendOTP)
		r.Post("/verify/otp", emailHandler.VerifyOTP)
		r.Get("/logs", emailHandler.Logs)

		// Jobs
		r.Post("/jobs", jobHandler.Create)
		r.Get("/jobs", jobHandler.List)
		r.Get("/jobs/{id}", jobHandler.Get)
		r.Delete("/jobs/{id}", jobHandler.Delete)
		r.Get("/jobs/{id}/executions", jobHandler.ListExecutions)

		// dashboard
		// Dashboard
		r.Get("/dashboard/stats", dashboardHandler.Stats)
	})

	// -----------------------------------------------------------------------
	// Server
	// Configure and start the HTTP server with graceful shutdown.
	// -----------------------------------------------------------------------
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Start the server in a goroutine so we can listen for shutdown signals.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("server started on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// Start the background scheduler.
	scheduler.Start()
	defer scheduler.Stop()

	// Block until we receive SIGINT or SIGTERM (Ctrl+C or docker stop).
	<-quit
	log.Println("shutting down server...")

	// Give in-flight requests up to 30 seconds to finish.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}

	log.Println("server stopped cleanly")
}
