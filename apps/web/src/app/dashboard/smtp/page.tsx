"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { SmtpConfig, UpsertSmtpConfigInput } from "@/features/smtp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, AlertCircle, CheckCircle2, Server, Trash2, KeyRound } from "lucide-react"

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
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
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
      setSuccess("SMTP configuration saved successfully.")
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
      {/* Header Info Stream */}
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          <Server className="h-3.5 w-3.5 text-brand" />
          Infrastructure Gateway
        </div>
        <h1 className="font-heading text-3xl font-black text-foreground uppercase tracking-tight mt-1">
          SMTP Config
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-xl mt-1">
          LifyGo routes transactional deliveries securely through your own verified custom mail servers. Your system credentials are encrypted at rest with military-grade AES-256 protocols and are never stored in plain text.
        </p>
      </div>

      {/* Alert Callouts */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold tracking-tight">Configuration Error</h5>
            <p className="text-destructive/90 text-xs mt-0.5 font-mono">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-500">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold tracking-tight">Success</h5>
            <p className="text-emerald-500/90 text-xs mt-0.5">{success}</p>
          </div>
        </div>
      )}

      {/* Main Structural Input Card */}
      <div 
        style={{ borderRadius: "12px 0px 12px 12px" }}
        className="border border-border bg-card p-6 md:p-8 shadow-xs relative overflow-hidden"
      >
        {/* Dynamic Security Badge Status Layer */}
        <div className="absolute top-0 right-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider border-b border-l ${
            config 
              ? "bg-foreground text-background border-border" 
              : "bg-amber-500 text-white border-amber-600"
          }`}>
            <ShieldCheck className="h-3 w-3 text-brand" />
            {config ? "Encrypted Live" : "Awaiting Setup"}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-12">
          {/* Host input */}
          <div className="sm:col-span-8 flex flex-col gap-2">
            <Label htmlFor="host" className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              SMTP Host Server
            </Label>
            <Input
              id="host"
              name="host"
              placeholder="smtp.gmail.com"
              value={form.host}
              onChange={handleChange}
              className="bg-muted/30 border-border focus-visible:ring-brand font-medium text-sm text-foreground"
            />
          </div>

          {/* Port input */}
          <div className="sm:col-span-4 flex flex-col gap-2">
            <Label htmlFor="port" className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              Port Number
            </Label>
            <Input
              id="port"
              name="port"
              type="number"
              placeholder="587"
              value={form.port}
              onChange={handleChange}
              className="bg-muted/30 border-border focus-visible:ring-brand font-mono text-sm text-foreground"
            />
          </div>

          {/* Username */}
          <div className="sm:col-span-12 flex flex-col gap-2">
            <Label htmlFor="username" className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              Account Username
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="you@domain.com"
              value={form.username}
              onChange={handleChange}
              className="bg-muted/30 border-border focus-visible:ring-brand text-sm text-foreground"
            />
          </div>

          {/* Password */}
          <div className="sm:col-span-12 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Access Token / Password
              </Label>
              {config && (
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                  Token is securely set
                </span>
              )}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={config ? "••••••••••••••••••••" : "Enter cluster secret pass"}
              value={form.password}
              onChange={handleChange}
              className="bg-muted/30 border-border focus-visible:ring-brand text-sm text-foreground"
            />
          </div>

          {/* From Address */}
          <div className="sm:col-span-12 flex flex-col gap-2">
            <Label htmlFor="from_address" className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              Default From Sender Email
            </Label>
            <Input
              id="from_address"
              name="from_address"
              placeholder="hello@yourdomain.com"
              value={form.from_address}
              onChange={handleChange}
              className="bg-muted/30 border-border focus-visible:ring-brand text-sm text-foreground"
            />
          </div>
        </div>

        {/* Action Triggers Footer Block */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-[11px] font-mono text-muted-foreground">
            {config ? "Last modified node configuration active." : "Fields required for cluster linkage."}
          </div>

          <div className="flex items-center gap-2.5">
            {config && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent transition-colors text-xs font-medium px-4 h-10 flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "Removing..." : "Remove Node"}
              </Button>
            )}

            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-medium px-5 h-10 shadow-xs"
            >
              {loading ? "Saving Node..." : config ? "Update Infrastructure" : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}