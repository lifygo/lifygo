import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type {
  SendEmailInput,
  SendEmailResponse,
  SendOtpInput,
  SendOtpResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
} from "./email.types";

export function sendEmail(apiKey: string, input: SendEmailInput) {
  return apiFetch<SendEmailResponse>(ENDPOINTS.EMAIL.SEND, apiKey, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function sendOtp(apiKey: string, input: SendOtpInput) {
  return apiFetch<SendOtpResponse>(ENDPOINTS.EMAIL.SEND_OTP, apiKey, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyOtp(apiKey: string, input: VerifyOtpInput) {
  return apiFetch<VerifyOtpResponse>(ENDPOINTS.EMAIL.VERIFY_OTP, apiKey, {
    method: "POST",
    body: JSON.stringify(input),
  });
}