"use client"

export const dynamic = "force-dynamic";
import { useState } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { SendEmailResponse, SendOtpResponse, VerifyOtpResponse } from "@/features/email"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Send, 
  Mail, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Terminal, 
  ShieldCheck,
  Clock 
} from "lucide-react"

export default function SendPage() {
  const { call } = useApi()

  // Send email state
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    body: "",
  })
  const [emailResult, setEmailResult] = useState<SendEmailResponse | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState("")

  // OTP state
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
    <div className="max-w-4xl text-foreground">
      {/* Header Context */}
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          <Send className="h-3.5 w-3.5 text-brand" />
          API Playground
        </div>
        <h1 className="font-heading text-3xl font-black text-foreground uppercase tracking-tight mt-1">
          Send Test
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-xl mt-1">
          Simulate manual API transaction triggers. Run raw tests to guarantee your server routing parameters and authentication instances perform optimally.
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="inline-flex bg-muted p-1 rounded-md h-10 mb-8 border border-border">
          <TabsTrigger value="email" className="text-xs font-medium gap-2 px-4 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Mail className="h-4 w-4" /> Standard Mail Dispatch
          </TabsTrigger>
          <TabsTrigger value="otp" className="text-xs font-medium gap-2 px-4 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <KeyRound className="h-4 w-4" /> Secure OTP Gateway
          </TabsTrigger>
        </TabsList>

        {/* Send Email View */}
        <TabsContent value="email" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-none">
          <div 
            style={{ borderRadius: "12px 0px 12px 12px" }}
            className="border border-border bg-card p-6 shadow-xs relative overflow-hidden lg:col-span-7 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Recipient (To)
              </Label>
              <Input
                placeholder="recipient@example.com"
                value={emailForm.to}
                onChange={(e) => setEmailForm((p) => ({ ...p, to: e.target.value }))}
                className="bg-muted/30 border-border focus-visible:ring-brand text-sm text-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Subject
              </Label>
              <Input
                placeholder="Hello from LifyGo Pipeline"
                value={emailForm.subject}
                onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                className="bg-muted/30 border-border focus-visible:ring-brand text-sm font-medium text-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Body Plaintext Content
              </Label>
              <Input
                placeholder="This is a secure manual routing execution payload."
                value={emailForm.body}
                onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))}
                className="bg-muted/30 border-border focus-visible:ring-brand text-sm text-foreground"
              />
            </div>

            <Button
              onClick={handleSendEmail}
              disabled={emailLoading || !emailForm.to || !emailForm.subject || !emailForm.body}
              className="mt-2 bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-medium h-10 shadow-xs"
            >
              {emailLoading ? "Routing Transaction..." : "Fire Test Transaction"}
            </Button>
          </div>

          {/* Response Console Layer */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-heading font-bold text-foreground text-xs uppercase tracking-wider">
                Instance Output Stream
              </h2>
            </div>

            {emailError && (
              <div className="flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="font-mono text-xs">{emailError}</div>
              </div>
            )}

            {emailResult ? (
              <div className="flex items-start gap-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-500">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold tracking-tight text-xs text-foreground">Transaction Dispatched</h5>
                  <div className="mt-1 font-mono text-[11px] bg-card/60 border border-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-500 w-fit">
                    log_id: {emailResult.log_id}
                  </div>
                </div>
              </div>
            ) : !emailError ? (
              <div className="border border-dashed border-border bg-muted/20 rounded-lg p-8 text-center text-xs font-mono text-muted-foreground">
                Awaiting dispatch initiation...
              </div>
            ) : null}
          </div>
        </TabsContent>

        {/* OTP Verification View */}
        <TabsContent value="otp" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-none">
          <div 
            style={{ borderRadius: "12px 0px 12px 12px" }}
            className="border border-border bg-card p-6 shadow-xs relative overflow-hidden lg:col-span-7 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Recipient Target Email
              </Label>
              <Input
                placeholder="auth-user@example.com"
                value={otpTo}
                onChange={(e) => setOtpTo(e.target.value)}
                disabled={!!otpSent}
                className="bg-muted/30 border-border focus-visible:ring-brand text-sm text-foreground"
              />
            </div>

            {!otpSent ? (
              <Button
                onClick={handleSendOtp}
                disabled={otpLoading || !otpTo}
                className="mt-2 bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-medium h-10 shadow-xs"
              >
                {otpLoading ? "Generating Token..." : "Issue Verification Token"}
              </Button>
            ) : (
              <div className="mt-2 pt-4 border-t border-border flex flex-col gap-5 animate-none">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Enter 6-Digit Secure OTP
                    </Label>
                    <span 
                      onClick={() => { setOtpSent(null); setOtpCode(""); setOtpResult(null); }}
                      className="text-[10px] font-mono text-brand hover:underline cursor-pointer"
                    >
                      Reset Gateway
                    </span>
                  </div>
                  <Input
                    placeholder="000000"
                    value={otpCode}
                    maxLength={6}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="bg-muted/30 border-border focus-visible:ring-brand tracking-widest text-center font-mono text-base font-bold text-foreground"
                  />
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={verifyLoading || otpCode.length !== 6 || !!otpResult}
                  className="bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-medium h-10 shadow-xs"
                >
                  {verifyLoading ? "Validating Cryptographic Node..." : "Verify Token Authentication"}
                </Button>
              </div>
            )}
          </div>

          {/* OTP Console Output Layer */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-heading font-bold text-foreground text-xs uppercase tracking-wider">
                Auth Channel Status
              </h2>
            </div>

            {otpError && (
              <div className="flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="font-mono text-xs">{otpError}</div>
              </div>
            )}

            {otpSent && !otpResult && (
              <div className="flex items-start gap-3 rounded-md bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-500">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold block text-foreground">Secure Token Dispatched</span>
                  Expires at <span className="font-mono font-bold">{new Date(otpSent.expires_at).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {otpResult && (
              <div className="flex items-start gap-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-500">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold tracking-tight text-xs text-foreground">Identity Authenticated</h5>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Handshake signature validated successfully.</p>
                </div>
              </div>
            )}

            {!otpSent && !otpError && (
              <div className="border border-dashed border-border bg-muted/20 rounded-lg p-8 text-center text-xs font-mono text-muted-foreground">
                Awaiting token handshake generation...
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}