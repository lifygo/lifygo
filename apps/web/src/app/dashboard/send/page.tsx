"use client"

import { useState } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { SendEmailResponse, SendOtpResponse, VerifyOtpResponse } from "@/features/email"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  KeyRound, 
  Send, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Loader2,
  RotateCcw
} from "lucide-react"

export default function SendPage() {
  const { call } = useApi()

  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    body: "",
  })
  const [emailResult, setEmailResult] = useState<SendEmailResponse | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState("")

  const [otpTo, setOtpTo] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState<SendOtpResponse | null>(null)
  const [otpResult, setOtpResult] = useState<VerifyOtpResponse | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [otpError, setOtpError] = useState("")

  async function handleSendEmail() {
    setEmailError("")
    setEmailResult(null)
    setEmailLoading(true)
    try {
      const result = await call<SendEmailResponse>(ENDPOINTS.EMAIL.SEND, {
        method: "POST",
        body: JSON.stringify({ ...emailForm, is_html: false }),
      })
      setEmailResult(result)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to execute delivery")
    } finally {
      setEmailLoading(false)
    }
  }

  async function handleSendOtp() {
    setOtpError("")
    setOtpSent(null)
    setOtpResult(null)
    setOtpLoading(true)
    try {
      const result = await call<SendOtpResponse>(ENDPOINTS.EMAIL.SEND_OTP, {
        method: "POST",
        body: JSON.stringify({ to: otpTo }),
      })
      setOtpSent(result)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to dispatch auth token")
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setOtpError("")
    setOtpResult(null)
    setVerifyLoading(true)
    try {
      const result = await call<VerifyOtpResponse>(ENDPOINTS.EMAIL.VERIFY_OTP, {
        method: "POST",
        body: JSON.stringify({ email: otpTo, code: otpCode }),
      })
      setOtpResult(result)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Verification rejected")
    } finally {
      setVerifyLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">API Playground</h1>
        <p className="text-sm text-muted-foreground">
          Simulate email dispatches and test authentication workflows in real-time.
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full space-y-6">
        <TabsList className="h-9 w-fit rounded-lg border border-border bg-muted/40 p-1">
          <TabsTrigger value="email" className="h-7 gap-2 px-3 text-xs font-medium">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Transactional Email
          </TabsTrigger>
          <TabsTrigger value="otp" className="h-7 gap-2 px-3 text-xs font-medium">
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
            OTP Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="m-0">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-7">
              <div className="space-y-2">
                <Label htmlFor="email-to" className="text-xs font-medium text-muted-foreground">
                  Recipient
                </Label>
                <Input
                  id="email-to"
                  placeholder="recipient@example.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm((p) => ({ ...p, to: e.target.value }))}
                  className="h-9 bg-transparent"
                  disabled={emailLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject" className="text-xs font-medium text-muted-foreground">
                  Subject
                </Label>
                <Input
                  id="email-subject"
                  placeholder="Test Email Subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                  className="h-9 bg-transparent"
                  disabled={emailLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-body" className="text-xs font-medium text-muted-foreground">
                  Message Body
                </Label>
                <Input
                  id="email-body"
                  placeholder="Enter message body text..."
                  value={emailForm.body}
                  onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))}
                  className="h-9 bg-transparent"
                  disabled={emailLoading}
                />
              </div>

              <Button
                onClick={handleSendEmail}
                disabled={emailLoading || !emailForm.to || !emailForm.subject || !emailForm.body}
                className="h-9 w-full text-xs font-medium"
              >
                {emailLoading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-3.5 w-3.5" />
                )}
                Send Test Email
              </Button>
            </div>

            <div className="space-y-4 lg:col-span-5">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Response Stream
                </h2>
              </div>

              {emailError && (
                <div className="flex items-start gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="font-mono text-xs leading-relaxed">{emailError}</p>
                </div>
              )}

              {emailResult ? (
                <div className="flex items-start gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Email sent successfully</p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                      Your test email was accepted for delivery.
                    </p>
                  </div>
                </div>
              ) : !emailError ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-transparent text-xs text-muted-foreground">
                  Awaiting dispatch request...
                </div>
              ) : null}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="otp" className="m-0">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-7">
              <div className="space-y-2">
                <Label htmlFor="otp-to" className="text-xs font-medium text-muted-foreground">
                  Recipient Target Email
                </Label>
                <Input
                  id="otp-to"
                  placeholder="user@example.com"
                  value={otpTo}
                  onChange={(e) => setOtpTo(e.target.value)}
                  disabled={!!otpSent || otpLoading}
                  className="h-9 bg-transparent"
                />
              </div>

              {!otpSent ? (
                <Button
                  onClick={handleSendOtp}
                  disabled={otpLoading || !otpTo.trim()}
                  className="h-9 w-full text-xs font-medium"
                >
                  {otpLoading ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-3.5 w-3.5" />
                  )}
                  Send Verification Code
                </Button>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="otp-code" className="text-xs font-medium text-muted-foreground">
                        6-Digit Code
                      </Label>
                      <button
                        onClick={() => {
                          setOtpSent(null)
                          setOtpCode("")
                          setOtpResult(null)
                          setOtpError("")
                        }}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </button>
                    </div>
                    <Input
                      id="otp-code"
                      placeholder="000000"
                      value={otpCode}
                      maxLength={6}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="h-9 bg-transparent font-mono text-center tracking-widest"
                      disabled={verifyLoading || !!otpResult}
                    />
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading || otpCode.length !== 6 || !!otpResult}
                    className="h-9 w-full text-xs font-medium"
                  >
                    {verifyLoading ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                    )}
                    Verify Code
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4 lg:col-span-5">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Authentication Status
                </h2>
              </div>

              {otpError && (
                <div className="flex items-start gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="font-mono text-xs leading-relaxed">{otpError}</p>
                </div>
              )}

              {otpSent && !otpResult && !otpError && (
                <div className="flex items-start gap-3 rounded-md border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium">Verification Code Sent</p>
                    <p className="mt-0.5 text-amber-700/80 dark:text-amber-400/80">
                      Expires at {new Date(otpSent.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}

              {otpResult && (
                <div className="flex items-start gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">OTP Verified</p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                      Identity token authenticated successfully.
                    </p>
                  </div>
                </div>
              )}

              {!otpSent && !otpError && (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-transparent text-xs text-muted-foreground">
                  Awaiting OTP dispatch...
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
