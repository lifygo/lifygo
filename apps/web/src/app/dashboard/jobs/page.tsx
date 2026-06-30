"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { Job, CreateJobInput } from "@/features/jobs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CalendarRange, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  Webhook, 
  Mail, 
  Clock, 
  RefreshCw, 
  Layers 
} from "lucide-react"

// Dynamic status tokens optimized for light and dark environments
const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  paused: "bg-muted text-muted-foreground border-border",
}

export default function JobsPage() {
  const { call } = useApi()
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [jobType, setJobType] = useState<"webhook" | "email">("webhook")
  const [scheduleType, setScheduleType] = useState<"cron" | "one_time">("cron")
  const [form, setForm] = useState({
    name: "",
    cron_expression: "",
    run_at: "",
    webhook_url: "",
    webhook_payload: "",
    email_to: "",
    email_subject: "",
    email_body: "",
  })

  useEffect(() => {
    let cancelled = false
    async function fetchJobs() {
      try {
        const data = await call<Job[]>(ENDPOINTS.JOBS.LIST)
        if (!cancelled) setJobs(data)
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load cron runtime instances")
      }
    }
    fetchJobs()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleCreate() {
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const scheduleFields =
        scheduleType === "cron"
          ? { schedule_type: "cron" as const, cron_expression: form.cron_expression }
          : { schedule_type: "one_time" as const, run_at: new Date(form.run_at).toISOString() };

      const input: CreateJobInput =
        jobType === "webhook"
          ? {
              name: form.name,
              type: "webhook",
              ...scheduleFields,
              webhook_url: form.webhook_url,
              ...(form.webhook_payload ? { webhook_payload: form.webhook_payload } : {}),
            }
          : {
              name: form.name,
              type: "email",
              ...scheduleFields,
              email_to: form.email_to,
              email_subject: form.email_subject,
              email_body: form.email_body,
            };
      const created = await call<Job>(ENDPOINTS.JOBS.CREATE, {
        method: "POST",
        body: JSON.stringify(input),
      })

      setJobs((prev) => [created, ...prev])
      setSuccess("Background task worker scheduled successfully.")
      setForm({
        name: "",
        cron_expression: "",
        run_at: "",
        webhook_url: "",
        webhook_payload: "",
        email_to: "",
        email_subject: "",
        email_body: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to provision cron schedule")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    setError("")
    try {
      await call(ENDPOINTS.JOBS.DELETE(id), { method: "DELETE" })
      setJobs((prev) => prev.filter((j) => j.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to terminate task runner")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-4xl text-foreground">
      {/* Header Block Info */}
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          <CalendarRange className="h-3.5 w-3.5 text-brand" />
          Task Scheduler System
        </div>
        <h1 className="font-heading text-3xl font-black text-foreground uppercase tracking-tight mt-1">
          Scheduled Jobs
        </h1>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span>Free tier: up to 3 active runner nodes.</span>
          <span className="h-3 w-px bg-border" />
          <span className="text-brand font-semibold cursor-pointer hover:underline text-xs tracking-tight">
            Upgrade for unlimited concurrency &rarr;
          </span>
        </div>
      </div>

      {/* Messaging Layers */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold tracking-tight">Pipeline Error</h5>
            <p className="text-destructive/90 text-xs mt-0.5 font-mono">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-500">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold tracking-tight">Schedule Initiated</h5>
            <p className="text-emerald-500/90 text-xs mt-0.5">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Form Container Card */}
        <div 
          style={{ borderRadius: "12px 0px 12px 12px" }}
          className="border border-border bg-card p-6 shadow-xs relative overflow-hidden lg:col-span-5"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-5">
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-heading font-bold text-foreground text-sm uppercase tracking-tight">
              Provision New Runner
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            {/* Job Name */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Task Alias Name
              </Label>
              <Input
                name="name"
                placeholder="weekly-report-worker"
                value={form.name}
                onChange={handleChange}
                className="bg-muted/30 border-border focus-visible:ring-brand font-medium text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Job Dispatch Target Type */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Dispatch Protocol Target
              </Label>
              <Tabs value={jobType} onValueChange={(v) => setJobType(v as "webhook" | "email")} className="w-full">
                <TabsList className="grid grid-cols-2 bg-muted p-1 rounded-md h-9 border border-border">
                  <TabsTrigger value="webhook" className="text-xs font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                    <Webhook className="h-3.5 w-3.5" /> Webhook
                  </TabsTrigger>
                  <TabsTrigger value="email" className="text-xs font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="webhook" className="flex flex-col gap-3 mt-3 animate-none">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-mono text-muted-foreground">Endpoint Target URL</Label>
                    <Input
                      name="webhook_url"
                      placeholder="https://myapp.com/api/v1/webhook"
                      value={form.webhook_url}
                      onChange={handleChange}
                      className="text-xs font-mono bg-muted/30 border-border"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-mono text-muted-foreground">Payload Context (Optional JSON String)</Label>
                    <Input
                      name="webhook_payload"
                      placeholder='{"event": "scheduled_report_sync"}'
                      value={form.webhook_payload}
                      onChange={handleChange}
                      className="text-xs font-mono bg-muted/30 border-border"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="flex flex-col gap-3 mt-3 animate-none">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-mono text-muted-foreground">Recipient Email (To)</Label>
                    <Input
                      name="email_to"
                      placeholder="dev-alerts@yourdomain.com"
                      value={form.email_to}
                      onChange={handleChange}
                      className="text-xs bg-muted/30 border-border"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-mono text-muted-foreground">Subject Prefix</Label>
                    <Input
                      name="email_subject"
                      placeholder="System Cron Notification Trace"
                      value={form.email_subject}
                      onChange={handleChange}
                      className="text-xs bg-muted/30 border-border"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-mono text-muted-foreground">Body Payload Description</Label>
                    <Input
                      name="email_body"
                      placeholder="Automated job runtime executed successfully on node cluster."
                      value={form.email_body}
                      onChange={handleChange}
                      className="text-xs bg-muted/30 border-border"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Interval Trigger Timeline Type */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Interval Engine Execution
              </Label>
              <Tabs value={scheduleType} onValueChange={(v) => setScheduleType(v as "cron" | "one_time")} className="w-full">
                <TabsList className="grid grid-cols-2 bg-muted p-1 rounded-md h-9 border border-border">
                  <TabsTrigger value="cron" className="text-xs font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                    <RefreshCw className="h-3.5 w-3.5" /> Recurring Cron
                  </TabsTrigger>
                  <TabsTrigger value="one_time" className="text-xs font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                    <Clock className="h-3.5 w-3.5" /> One-Time
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cron" className="mt-3 animate-none">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-mono text-muted-foreground">Standard Cron Syntax Structure</Label>
                    <Input
                      name="cron_expression"
                      placeholder="*/5 * * * * (every 5 minutes)"
                      value={form.cron_expression}
                      onChange={handleChange}
                      className="text-xs font-mono text-brand font-semibold bg-muted/30 border-border"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="one_time" className="mt-3 animate-none">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-mono text-muted-foreground">Specific Execution Target Time</Label>
                    <Input
                      name="run_at"
                      type="datetime-local"
                      value={form.run_at}
                      onChange={handleChange}
                      className="text-xs font-mono bg-muted/30 border-border"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Button
              onClick={handleCreate}
              disabled={loading || !form.name}
              className="mt-2 w-full bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-medium h-10 shadow-xs"
            >
              {loading ? "Spawning Runtime Instance..." : "Deploy Schedule Worker"}
            </Button>
          </div>
        </div>

        {/* Runtime Instances List Layout Grid Table */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1 border-b border-border pb-3">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-heading font-bold text-foreground text-sm uppercase tracking-tight">
              Active Registry Node Instances ({jobs.length})
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-12 text-center bg-card/50">
              <Clock className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
                No pipeline workloads registered.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 font-semibold">Node Route Identifier</th>
                      <th className="p-4 font-semibold">Protocol</th>
                      <th className="p-4 font-semibold">Interval Engine</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="p-4 font-medium text-foreground truncate max-w-[140px]">
                          {job.name}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono capitalize">
                            {job.type === "webhook" ? <Webhook className="h-3 w-3 text-sky-500" /> : <Mail className="h-3 w-3 text-amber-500" />}
                            {job.type}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {job.schedule_type === "cron"
                            ? job.cron_expression
                            : job.run_at
                            ? new Date(job.run_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="outline"
                            className={`rounded-sm px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider border transition-none shadow-none ${
                              statusColors[job.status] || "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {job.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right opacity-80 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(job.id)}
                            disabled={deleting === job.id}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                            aria-label="Terminate Job Instance"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}