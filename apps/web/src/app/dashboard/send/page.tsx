"use client";

import { useState } from "react";
import { useApi } from "@/lib/use-api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { SendEmailResponse, SendOtpResponse, VerifyOtpResponse } from "@/features/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SendPage() {
  const { call } = useApi();

  // Send email state
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [emailResult, setEmailResult] = useState<SendEmailResponse | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // OTP state
  const [otpTo, setOtpTo] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState<SendOtpResponse | null>(null);
  const [otpResult, setOtpResult] = useState<VerifyOtpResponse | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  async function handleSendEmail() {
    setEmailError("");
    setEmailResult(null);
    setEmailLoading(true);
    try {
      const result = await call<SendEmailResponse>(ENDPOINTS.EMAIL.SEND, {
        method: "POST",
        body: JSON.stringify({ ...emailForm, is_html: false }),
      });
      setEmailResult(result);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleSendOtp() {
    setOtpError("");
    setOtpSent(null);
    setOtpResult(null);
    setOtpLoading(true);
    try {
      const result = await call<SendOtpResponse>(ENDPOINTS.EMAIL.SEND_OTP, {
        method: "POST",
        body: JSON.stringify({ to: otpTo }),
      });
      setOtpSent(result);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setOtpError("");
    setOtpResult(null);
    setVerifyLoading(true);
    try {
      const result = await call<VerifyOtpResponse>(ENDPOINTS.EMAIL.VERIFY_OTP, {
        method: "POST",
        body: JSON.stringify({ email: otpTo, code: otpCode }),
      });
      setOtpResult(result);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Send Test</h1>

      <Tabs defaultValue="email">
        <TabsList className="mb-6">
          <TabsTrigger value="email">Send Email</TabsTrigger>
          <TabsTrigger value="otp">OTP</TabsTrigger>
        </TabsList>

        {/* Send Email Tab */}
        <TabsContent value="email">
          <div className="flex flex-col gap-4">
            <div>
              <Label>To</Label>
              <Input
                placeholder="recipient@example.com"
                value={emailForm.to}
                onChange={(e) => setEmailForm((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Hello from LifyGo"
                value={emailForm.subject}
                onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label>Body</Label>
              <Input
                placeholder="Your message here"
                value={emailForm.body}
                onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))}
              />
            </div>

            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

            {emailResult && (
              <p className="text-green-600 text-sm">
                Email sent. Log ID: {emailResult.log_id}
              </p>
            )}

            <Button
              onClick={handleSendEmail}
              disabled={emailLoading || !emailForm.to || !emailForm.subject || !emailForm.body}
            >
              {emailLoading ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </TabsContent>

        {/* OTP Tab */}
        <TabsContent value="otp">
          <div className="flex flex-col gap-4">
            <div>
              <Label>Recipient Email</Label>
              <Input
                placeholder="user@example.com"
                value={otpTo}
                onChange={(e) => setOtpTo(e.target.value)}
              />
            </div>

            {otpError && <p className="text-red-500 text-sm">{otpError}</p>}

            {otpSent && (
              <p className="text-green-600 text-sm">
                OTP sent. Expires at {new Date(otpSent.expires_at).toLocaleTimeString()}.
              </p>
            )}

            <Button
              onClick={handleSendOtp}
              disabled={otpLoading || !otpTo}
            >
              {otpLoading ? "Sending..." : "Send OTP"}
            </Button>

            {otpSent && (
              <>
                <div>
                  <Label>Enter OTP Code</Label>
                  <Input
                    placeholder="6-digit code"
                    value={otpCode}
                    maxLength={6}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>

                {otpResult && (
                  <p className="text-green-600 text-sm">
                    OTP verified successfully.
                  </p>
                )}

                <Button
                  onClick={handleVerifyOtp}
                  disabled={verifyLoading || otpCode.length !== 6}
                >
                  {verifyLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}