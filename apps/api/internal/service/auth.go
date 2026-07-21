package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

type AuthRepository interface {
	Create(ctx context.Context, input model.CreateUserInput) (*model.User, error)
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	GetByID(ctx context.Context, id string) (*model.User, error)
}

type AuthService struct {
	repo      AuthRepository
	jwtSecret []byte
}

func NewAuthService(repo AuthRepository, jwtSecret string) *AuthService {
	return &AuthService{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
	}
}

type RegisterInput struct {
	Name     string
	Email    string
	Password string
}

func (i RegisterInput) Validate() error {
	if i.Name == "" {
		return model.ErrNameRequired
	}
	if i.Email == "" {
		return model.ErrEmailRequired
	}
	if len(i.Password) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}
	return nil
}

type LoginInput struct {
	Email    string
	Password string
}

func (i LoginInput) Validate() error {
	if i.Email == "" {
		return model.ErrEmailRequired
	}
	if i.Password == "" {
		return fmt.Errorf("password is required")
	}
	return nil
}

type AuthResponse struct {
	User  *model.User `json:"user"`
	Token string      `json:"token"`
}

func (s *AuthService) Register(ctx context.Context, input RegisterInput) (*AuthResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	hashStr := string(hash)

	user, err := s.repo.Create(ctx, model.CreateUserInput{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: &hashStr,
	})
	if err != nil {
		if err == model.ErrAlreadyExists {
			return nil, fmt.Errorf("a user with this email already exists")
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	token, err := s.issueToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to issue token: %w", err)
	}

	return &AuthResponse{User: user, Token: token}, nil
}

func (s *AuthService) Login(ctx context.Context, input LoginInput) (*AuthResponse, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}

	user, err := s.repo.GetByEmail(ctx, input.Email)
	if err != nil {
		if err == model.ErrNotFound {
			return nil, fmt.Errorf("invalid email or password")
		}
		return nil, fmt.Errorf("failed to lookup user: %w", err)
	}

	if user.PasswordHash == nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	token, err := s.issueToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to issue token: %w", err)
	}

	return &AuthResponse{User: user, Token: token}, nil
}

func (s *AuthService) ValidateToken(ctx context.Context, tokenString string) (*model.User, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid token subject")
	}

	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	return user, nil
}

func (s *AuthService) issueToken(user *model.User) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"iat":   now.Unix(),
		"exp":   now.Add(7 * 24 * time.Hour).Unix(),
		"jti":   newID(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func newID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}
