package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/lifygo/lifygo/apps/api/pkg/mailer"
)

type resendMailer struct {
	apiKey      string
	fromAddress string
	client      *http.Client
}

func newResendMailer(apiKey, fromAddress string) *resendMailer {
	return &resendMailer{
		apiKey:      apiKey,
		fromAddress: fromAddress,
		client:      &http.Client{Timeout: 15 * time.Second},
	}
}

func (r *resendMailer) Send(msg mailer.Message) error {
	req := map[string]string{
		"from":    r.fromAddress,
		"to":      msg.To,
		"subject": msg.Subject,
	}
	if msg.IsHTML {
		req["html"] = msg.Body
	} else {
		req["text"] = msg.Body
	}

	payload, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal resend request: %w", err)
	}

	log.Printf("resend: sending to %s from %s", msg.To, r.fromAddress)

	httpReq, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("failed to create resend request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+r.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(httpReq)
	if err != nil {
		log.Printf("resend: HTTP request failed: %v", err)
		return fmt.Errorf("resend request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		log.Printf("resend: API error %d: %s", resp.StatusCode, string(body))
		return fmt.Errorf("resend returned %d: %s", resp.StatusCode, string(body))
	}

	log.Printf("resend: email sent successfully (status %d)", resp.StatusCode)
	return nil
}
