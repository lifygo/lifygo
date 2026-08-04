"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { SmtpConfig, UpsertSmtpConfigInput } from "@/features/smtp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react"

const emptyForm: UpsertSmtpConfigInput = {
  host: "",
  port: 587,
  username: "",
  password: "",
  from_address: "",
}

export default function SmtpPage() {
  const { call } = useApi()
  const [fromAddress, setFromAddress] = useState("")
  const [smtp, setSmtp] = useState({
    host: "",
    port: 587,
    username: "",
    password: "",
  })
  const [config, setConfig] = useState<SmtpConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const hasFullSMTP = config !== null && config.host !== ""

  const fetchConfig = useCallback(async () => {
    try {
      const data = await call<SmtpConfig>(ENDPOINTS.SMTP.GET)
      setConfig(data)
      setFromAddress(data.from_address || "")
      if (data.host) {
        setSmtp({ host: data.host, port: data.port, username: data.username, password: "" })
      }
    } catch {
      // No config yet — that's fine.
    }
  }, [call])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  async function handleSaveFrom() {
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const data = await call<SmtpConfig>(ENDPOINTS.SMTP.UPSERT, {
        method: "POST",
        body: JSON.stringify({ from_address: fromAddress }),
      })
      setConfig(data)
      setSuccess("From address saved. Emails will be sent through the free relay.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveSmtp() {
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const data = await call<SmtpConfig>(ENDPOINTS.SMTP.UPSERT, {
        method: "POST",
        body: JSON.stringify({
          from_address: fromAddress || config?.from_address,
          host: smtp.host,
          port: smtp.port,
          username: smtp.username,
          password: smtp.password,
        }),
      })
      setConfig(data)
      setSmtp((prev) => ({ ...prev, password: "" }))
      setSuccess("SMTP configuration saved. You now have unlimited sending.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save SMTP configuration")
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove() {
    setError("")
    setSuccess("")
    setDeleting(true)
    try {
      await call(ENDPOINTS.SMTP.DELETE, { method: "DELETE" })
      setConfig(null)
      setFromAddress("")
      setSmtp({ host: "", port: 587, username: "", password: "" })
      setSuccess("Configuration removed. You are back on the free relay.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove configuration")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Email Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Set the address your recipients see. LifyGo handles delivery.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Status banner */}
      <div className="flex items-start gap-3 rounded-lg border border-brand/20 bg-brand/5 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <div>
          {hasFullSMTP ? (
            <>
              <p className="font-medium text-foreground">You are using your own SMTP server. Unlimited sending.</p>
              <p className="mt-1 text-muted-foreground">All limits are lifted. You control the mail server.</p>
            </>
          ) : (
            <>
              <p className="font-medium text-foreground">You are using the free relay.</p>
              <p className="mt-1 text-muted-foreground">
                Emails are sent via LifyGo. No SMTP configuration needed — just set your from address below.
              </p>
            </>
          )}
        </div>
      </div>

      {/* From Address */}
      <div className="max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-sm font-medium text-foreground">From Address</span>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${config?.from_address ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {config?.from_address ? "Configured" : "Not set"}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="from_address" className="text-xs font-medium text-muted-foreground">
              From Address
            </Label>
            <Input
              id="from_address"
              name="from_address"
              placeholder="hello@yourdomain.com"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className="h-9 bg-transparent"
            />
            <p className="text-[11px] text-muted-foreground">
              The address your recipients see as the sender.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Your from address is all you need. Everything else is handled by LifyGo.
          </p>

          <div className="flex items-center gap-2">
            {config?.from_address && (
              <Button
                variant="ghost"
                onClick={handleRemove}
                disabled={deleting || loading}
                className="h-9 text-xs font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Remove"}
              </Button>
            )}

            <Button
              onClick={handleSaveFrom}
              disabled={loading || deleting || !fromAddress}
              className="h-9 px-4 text-xs font-medium"
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {config?.from_address ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Self-hosted SMTP section */}
      {!hasFullSMTP && (
        <div className="max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <span className="text-sm font-medium text-foreground">Bring your own SMTP (optional)</span>
          </div>

          <div className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-8">
                <Label htmlFor="host" className="text-xs font-medium text-muted-foreground">Host</Label>
                <Input id="host" name="host" placeholder="smtp.gmail.com" value={smtp.host} onChange={(e) => setSmtp((p) => ({ ...p, host: e.target.value }))} className="h-9 bg-transparent" />
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label htmlFor="port" className="text-xs font-medium text-muted-foreground">Port</Label>
                <Input id="port" name="port" type="number" placeholder="587" value={smtp.port} onChange={(e) => setSmtp((p) => ({ ...p, port: Number(e.target.value) }))} className="h-9 font-mono text-sm bg-transparent" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
              <Input id="username" name="username" placeholder="you@domain.com" value={smtp.username} onChange={(e) => setSmtp((p) => ({ ...p, username: e.target.value }))} className="h-9 bg-transparent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter your SMTP password" value={smtp.password} onChange={(e) => setSmtp((p) => ({ ...p, password: e.target.value }))} className="h-9 bg-transparent" />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button
              onClick={handleSaveSmtp}
              disabled={loading || deleting || !smtp.host}
              className="h-9 px-4 text-xs font-medium"
            >
              {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : "Connect SMTP"}
            </Button>
          </div>
        </div>
      )}

      {/* Full SMTP section — edit existing */}
      {hasFullSMTP && (
        <div className="max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-sm font-medium text-foreground">SMTP Server Settings</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">Connected</span>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-8">
                <Label htmlFor="host" className="text-xs font-medium text-muted-foreground">Host</Label>
                <Input id="host" name="host" placeholder="smtp.gmail.com" value={smtp.host} onChange={(e) => setSmtp((p) => ({ ...p, host: e.target.value }))} className="h-9 bg-transparent" />
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label htmlFor="port" className="text-xs font-medium text-muted-foreground">Port</Label>
                <Input id="port" name="port" type="number" placeholder="587" value={smtp.port} onChange={(e) => setSmtp((p) => ({ ...p, port: Number(e.target.value) }))} className="h-9 font-mono text-sm bg-transparent" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
              <Input id="username" name="username" placeholder="you@domain.com" value={smtp.username} onChange={(e) => setSmtp((p) => ({ ...p, username: e.target.value }))} className="h-9 bg-transparent" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                <span className="text-xs text-muted-foreground/60">Encrypted at rest</span>
              </div>
              <Input id="password" name="password" type="password" placeholder="Enter new password" value={smtp.password} onChange={(e) => setSmtp((p) => ({ ...p, password: e.target.value }))} className="h-9 bg-transparent" />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button
              variant="ghost"
              onClick={handleRemove}
              disabled={deleting || loading}
              className="h-9 text-xs font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Disconnect"}
            </Button>
            <Button
              onClick={handleSaveSmtp}
              disabled={loading || deleting || !smtp.host}
              className="h-9 px-4 text-xs font-medium"
            >
              {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {!hasFullSMTP && (
        <p className="text-sm text-muted-foreground text-center">
          Want unlimited sending and full control?{" "}
          <a href="https://docs.lifygo.com/guides/self-hosting" target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand/80 transition-colors">
            Self-host LifyGo
          </a>{" "}
          and bring your own SMTP.
        </p>
      )}
    </div>
  )
}
