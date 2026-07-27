package model

import "time"

type OTP struct {
	Email     string    `json:"email"`
	Code      string    `json:"code"`
	ExpiresAt time.Time `json:"expires_at"`
}

const OTPTTl = 10 * time.Minute
const OTPLength = 6

type SendOTPInput struct {
	UserID string
	To     string `json:"to"`
}

func (i *SendOTPInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.To == "" {
		return ErrToRequired
	}
	return nil
}

type SendOTPResponse struct {
	Email     string    `json:"email"`
	ExpiresAt time.Time `json:"expires_at"`
}

type VerifyOTPInput struct {
	UserID string
	Email  string `json:"email"`
	Code   string `json:"code"`
}

func (i *VerifyOTPInput) Validate() error {
	if i.UserID == "" {
		return ErrUnauthorized
	}
	if i.Email == "" {
		return ErrEmailRequired
	}
	if i.Code == "" {
		return ErrOTPInvalid
	}
	if len(i.Code) != OTPLength {
		return ErrOTPInvalid
	}
	return nil
}

type VerifyOTPResponse struct {
	Email      string    `json:"email"`
	Verified   bool      `json:"verified"`
	VerifiedAt time.Time `json:"verified_at"`
}

func OTPRedisKey(userID, email string) string {
	return "otp:" + userID + ":" + email
}
