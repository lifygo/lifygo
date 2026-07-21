"use client"

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { SmtpConfig, UpsertSmtpConfigInput } from "@/features/smtp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react"

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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let cancelled = false
    async function fetchConfig() {
      try {
        const data = await call<SmtpConfig>(ENDPOINTS.SMTP.GET)
        if (!cancelled) {
          setConfig(data)
          setForm((prev) => ({
            ...prev,
            host: data.host,
            port: data.port,
            username: data.username,
            from_address: data.from_address,
          }))
        }
      } catch {
        // No config yet — show empty form.
      }
    }
    fetchConfig()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "port" ? Number(value) : value,
    }))
  }

  async function handleSave() {
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const data = await call<SmtpConfig>(ENDPOINTS.SMTP.UPSERT, {
        method: "POST",
        body: JSON.stringify(form),
      })
      setConfig(data)
      setSuccess("SMTP configuration saved.")
      setForm((prev) => ({ ...prev, password: "" }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setError("")
    setDeleting(true)
    try {
      await call(ENDPOINTS.SMTP.DELETE, { method: "DELETE" })
      setConfig(null)
      setForm(emptyForm)
      setSuccess("SMTP configuration removed.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete configuration")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl text-foreground">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">SMTP configuration</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          LifyGo sends transactional email through your own mail server. Credentials are
          encrypted at rest with AES-256 and never stored in plain text.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.06] p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <h5 className="font-medium">Couldn&apos;t save configuration</h5>
            <p className="mt-0.5 text-xs text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{success}</p>
        </div>
      )}

      {/* Form card */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-8">
          <span className="text-sm font-medium text-foreground">Mail server</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              config
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${config ? "bg-emerald-500" : "bg-amber-500"}`}
              aria-hidden="true"
            />
            {config ? "Connected" : "Not connected"}
          </span>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-12 sm:p-8">
          {/* Host */}
          <div className="flex flex-col gap-2 sm:col-span-8">
            <Label htmlFor="host" className="text-xs font-medium text-muted-foreground">
              Host
            </Label>
            <Input
              id="host"
              name="host"
              placeholder="smtp.gmail.com"
              value={form.host}
              onChange={handleChange}
              className="text-sm"
            />
          </div>

          {/* Port */}
          <div className="flex flex-col gap-2 sm:col-span-4">
            <Label htmlFor="port" className="text-xs font-medium text-muted-foreground">
              Port
            </Label>
            <Input
              id="port"
              name="port"
              type="number"
              placeholder="587"
              value={form.port}
              onChange={handleChange}
              className="font-mono text-sm"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2 sm:col-span-12">
            <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="you@domain.com"
              value={form.username}
              onChange={handleChange}
              className="text-sm"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2 sm:col-span-12">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </Label>
              {config && <span className="text-xs text-muted-foreground">Currently set</span>}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={config ? "••••••••••••••••" : "Enter password"}
              value={form.password}
              onChange={handleChange}
              className="text-sm"
            />
          </div>

          {/* From address */}
          <div className="flex flex-col gap-2 sm:col-span-12">
            <Label htmlFor="from_address" className="text-xs font-medium text-muted-foreground">
              From address
            </Label>
            <Input
              id="from_address"
              name="from_address"
              placeholder="hello@yourdomain.com"
              value={form.from_address}
              onChange={handleChange}
              className="text-sm"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col items-stretch justify-between gap-4 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:px-8">
          <span className="text-xs text-muted-foreground">
            {config ? "Changes apply to new email sends immediately." : "All fields are required to connect."}
          </span>

          <div className="flex items-center gap-2.5">
            {config && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 gap-2 border-border bg-transparent text-xs font-medium text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {deleting ? "Removing…" : "Remove"}
              </Button>
            )}

            <Button onClick={handleSave} disabled={loading} className="h-9 px-5 text-xs font-medium">
              {loading ? "Saving…" : config ? "Save changes" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}