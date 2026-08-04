"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { SmtpConfig, UpsertSmtpConfigInput } from "@/features/smtp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2, Info, ChevronDown } from "lucide-react"

const emptyForm: UpsertSmtpConfigInput = {
  host: "",
  port: 587,
  username: "",
  password: "",
  from_address: "",
}

export default function SmtpPage() {
  const { call } = useApi()
  const [form, setForm] = useState<UpsertSmtpConfigInput>(emptyForm)
  const [config, setConfig] = useState<SmtpConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showSmtpFields, setShowSmtpFields] = useState(false)

  const hasFullSMTP = config !== null && config.host !== ""

  const fetchConfig = useCallback(async () => {
    try {
      const data = await call<SmtpConfig>(ENDPOINTS.SMTP.GET)
      if (data.host) {
        setConfig(data)
        setForm({
          host: data.host,
          port: data.port,
          username: data.username,
          password: "",
          from_address: data.from_address,
        })
      } else if (data.from_address) {
        setConfig({ ...data, host: "", port: 0, username: "" })
        setForm((prev) => ({ ...prev, from_address: data.from_address }))
      } else {
        setConfig({ ...data, host: "", port: 0, username: "", from_address: "" })
      }
      setIsDirty(false)
    } catch {
      // No config yet — that's fine.
    }
  }, [call])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "port" ? Number(value) : value,
    }))
    setIsDirty(true)
  }

  async function handleSave() {
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        from_address: form.from_address,
      }
      if (form.host) {
        payload.host = form.host
        payload.port = form.port
        payload.username = form.username
        payload.password = form.password
      }

      const data = await call<SmtpConfig>(ENDPOINTS.SMTP.UPSERT, {
        method: "POST",
        body: JSON.stringify(payload),
      })
      setConfig(data)
      setSuccess(hasFullSMTP || form.host
        ? "SMTP configuration saved successfully."
        : "From address saved. Emails will be sent through the free relay.")
      setForm((prev) => ({ ...prev, password: "" }))
      setIsDirty(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration")
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveSmtp() {
    setError("")
    setSuccess("")
    setDeleting(true)
    try {
      await call(ENDPOINTS.SMTP.DELETE, { method: "DELETE" })
      setConfig(null)
      setForm(emptyForm)
      setShowSmtpFields(false)
      setIsDirty(false)
      setSuccess("SMTP configuration removed. You're back on the free relay.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete configuration")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Email Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Set the address your recipients see. LifyGo handles delivery through the free relay.
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
              <p className="font-medium text-foreground">You&apos;re using your own SMTP server. Unlimited sending.</p>
              <p className="mt-1 text-muted-foreground">All limits are lifted. You control the mail server, you set the rules.</p>
            </>
          ) : (
            <>
              <p className="font-medium text-foreground">You&apos;re using the free relay.</p>
              <p className="mt-1 text-muted-foreground">
                Emails are sent via LifyGo. Set your from address below and you&apos;re ready.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-sm font-medium text-foreground">Sender Settings</span>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${hasFullSMTP ? "bg-emerald-500" : config?.from_address ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {hasFullSMTP ? "Custom SMTP" : config?.from_address ? "Free Relay" : "Not Configured"}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* From Address — always visible */}
          <div>
            <div className="space-y-2">
              <Label htmlFor="from_address" className="text-xs font-medium text-muted-foreground">
                From Address
              </Label>
              <Input
                id="from_address"
                name="from_address"
                placeholder="hello@yourdomain.com"
                value={form.from_address}
                onChange={handleChange}
                className="h-9 bg-transparent"
              />
              <p className="text-[11px] text-muted-foreground">
                The address your recipients see as the sender.
              </p>
            </div>
          </div>

          {/* Full SMTP section (always visible for full SMTP users, collapsible for free) */}
          {hasFullSMTP ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="space-y-2 sm:col-span-8">
                  <Label htmlFor="host" className="text-xs font-medium text-muted-foreground">Host</Label>
                  <Input id="host" name="host" placeholder="smtp.gmail.com" value={form.host} onChange={handleChange} className="h-9 bg-transparent" />
                </div>
                <div className="space-y-2 sm:col-span-4">
                  <Label htmlFor="port" className="text-xs font-medium text-muted-foreground">Port</Label>
                  <Input id="port" name="port" type="number" placeholder="587" value={form.port} onChange={handleChange} className="h-9 font-mono text-sm bg-transparent" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
                <Input id="username" name="username" placeholder="you@domain.com" value={form.username} onChange={handleChange} className="h-9 bg-transparent" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                  <span className="text-xs text-muted-foreground/60">Encrypted at rest</span>
                </div>
                <Input id="password" name="password" type="password" placeholder="Enter new password" value={form.password} onChange={handleChange} className="h-9 bg-transparent" />
              </div>
            </>
          ) : (
            <>
              {/* Collapsible "Add your own SMTP" section */}
              <div className="rounded-md border border-border bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowSmtpFields((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Want to use your own SMTP? Add your credentials for full control.</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showSmtpFields ? "rotate-180" : ""}`} />
                </button>
                {showSmtpFields && (
                  <div className="space-y-4 border-t border-border px-4 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                      <div className="space-y-2 sm:col-span-8">
                        <Label htmlFor="host" className="text-xs font-medium text-muted-foreground">Host</Label>
                        <Input id="host" name="host" placeholder="smtp.gmail.com" value={form.host} onChange={handleChange} className="h-9 bg-transparent" />
                      </div>
                      <div className="space-y-2 sm:col-span-4">
                        <Label htmlFor="port" className="text-xs font-medium text-muted-foreground">Port</Label>
                        <Input id="port" name="port" type="number" placeholder="587" value={form.port} onChange={handleChange} className="h-9 font-mono text-sm bg-transparent" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
                      <Input id="username" name="username" placeholder="you@domain.com" value={form.username} onChange={handleChange} className="h-9 bg-transparent" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                      <Input id="password" name="password" type="password" placeholder="Enter your SMTP password" value={form.password} onChange={handleChange} className="h-9 bg-transparent" />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {hasFullSMTP
              ? "Updates take effect for future dispatches."
              : "Your from address is all you need. Everything else is handled by LifyGo."}
          </p>

          <div className="flex items-center gap-2">
            {(config?.host || config?.from_address) && (
              <Button
                variant="ghost"
                onClick={handleRemoveSmtp}
                disabled={deleting || loading}
                className="h-9 text-xs font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Remove"}
              </Button>
            )}

            <Button
              onClick={handleSave}
              disabled={loading || deleting || (!!config && !isDirty)}
              className="h-9 px-4 text-xs font-medium"
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {config ? "Save Changes" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
