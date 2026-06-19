export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  is_html: boolean;
}

export interface SendEmailResponse {
  log_id: string;
  status: "sent" | "failed";
  sent_at: string;
}

export interface SendOtpInput {
  to: string;
}

export interface SendOtpResponse {
  email: string;
  expires_at: string;
}

export interface VerifyOtpInput {
  email: string;
  code: string;
}

export interface VerifyOtpResponse {
  email: string;
  verified: boolean;
  verified_at: string;
}