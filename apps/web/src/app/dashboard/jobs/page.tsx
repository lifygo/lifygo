"use client"

import React, { useState, useEffect } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { Job, CreateJobInput } from "@/features/jobs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Trash2, Webhook, Mail, Clock, RefreshCw, ChevronDown, ChevronRight } from "lucide-react"

const statusStyles: Record<string, string> = {
  active: "text-emerald-600 dark:text-emerald-400",
  failed: "text-destructive",
  completed: "text-sky-600 dark:text-sky-400",
  paused: "text-muted-foreground",
}

const statusDot: Record<string, string> = {
  active: "bg-emerald-500",
  failed: "bg-destructive",
  completed: "bg-sky-500",
  paused: "bg-muted-foreground/50",
}

interface JobExecution {
  id: string
  job_id: string
  user_id: string
  status: string
  http_status: number | null
  error_message: string | null
  duration_ms: number | null
  executed_at: string
}

export default function JobsPage() {
  const { call } = useApi()
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [executions, setExecutions] = useState<Record<string, JobExecution[]>>({})
  const [loadingExecutions, setLoadingExecutions] = useState<string | null>(null)

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
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load jobs")
      }
    }
    fetchJobs()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggleExecutions(jobId: string) {
    if (expandedJob === jobId) {
      setExpandedJob(null)
      return
    }
    setExpandedJob(jobId)
    if (!executions[jobId]) {
      setLoadingExecutions(jobId)
      try {
        const data = await call<JobExecution[]>(ENDPOINTS.JOBS.EXECUTIONS(jobId))
        setExecutions((prev) => ({ ...prev, [jobId]: data }))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load executions")
      } finally {
        setLoadingExecutions(null)
      }
    }
  }

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
          : { schedule_type: "one_time" as const, run_at: new Date(form.run_at).toISOString() }

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
            }

      const created = await call<Job>(ENDPOINTS.JOBS.CREATE, {
        method: "POST",
        body: JSON.stringify(input),
      })

      setJobs((prev) => [created, ...prev])
      setSuccess("Job scheduled.")
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
      setError(err instanceof Error ? err.message : "Failed to schedule job")
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
      setError(err instanceof Error ? err.message : "Failed to delete job")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-4xl text-foreground">
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Scheduled jobs</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Free tier includes up to 3 active jobs.</span>
          <a href="#" className="text-sm font-medium text-brand hover:opacity-80">
            Upgrade for unlimited →
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.06] p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <h5 className="font-medium">Something went wrong</h5>
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

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="rounded-lg border border-border bg-card p-6 lg:col-span-5">
          <h2 className="mb-5 border-b border-border pb-3 text-sm font-medium text-foreground">
            New job
          </h2>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Name</Label>
              <Input
                name="name"
                placeholder="weekly-report"
                value={form.name}
                onChange={handleChange}
                className="text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground">What runs</Label>
              <Tabs value={jobType} onValueChange={(v) => setJobType(v as "webhook" | "email")} className="w-full">
                <TabsList className="grid h-9 grid-cols-2 rounded-md border border-border bg-muted p-1">
                  <TabsTrigger
                    value="webhook"
                    className="gap-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <Webhook className="h-3.5 w-3.5" aria-hidden="true" /> Webhook
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="gap-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="webhook" className="mt-3 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Endpoint URL</Label>
                    <Input
                      name="webhook_url"
                      placeholder="https://myapp.com/api/webhook"
                      value={form.webhook_url}
                      onChange={handleChange}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Payload (optional JSON)</Label>
                    <Input
                      name="webhook_payload"
                      placeholder='{"event": "scheduled_sync"}'
                      value={form.webhook_payload}
                      onChange={handleChange}
                      className="font-mono text-xs"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="mt-3 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      name="email_to"
                      placeholder="dev-alerts@yourdomain.com"
                      value={form.email_to}
                      onChange={handleChange}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Subject</Label>
                    <Input
                      name="email_subject"
                      placeholder="Scheduled job notification"
                      value={form.email_subject}
                      onChange={handleChange}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Body</Label>
                    <Input
                      name="email_body"
                      placeholder="Job ran successfully."
                      value={form.email_body}
                      onChange={handleChange}
                      className="text-xs"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Label className="text-xs font-medium text-muted-foreground">When it runs</Label>
              <Tabs value={scheduleType} onValueChange={(v) => setScheduleType(v as "cron" | "one_time")} className="w-full">
                <TabsList className="grid h-9 grid-cols-2 rounded-md border border-border bg-muted p-1">
                  <TabsTrigger
                    value="cron"
                    className="gap-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Recurring
                  </TabsTrigger>
                  <TabsTrigger
                    value="one_time"
                    className="gap-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> One-time
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cron" className="mt-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Cron expression</Label>
                    <Input
                      name="cron_expression"
                      placeholder="*/5 * * * * (every 5 minutes)"
                      value={form.cron_expression}
                      onChange={handleChange}
                      className="font-mono text-xs"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="one_time" className="mt-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Run at</Label>
                    <Input
                      name="run_at"
                      type="datetime-local"
                      value={form.run_at}
                      onChange={handleChange}
                      className="font-mono text-xs"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Button onClick={handleCreate} disabled={loading || !form.name} className="mt-1 h-10 w-full text-xs font-medium">
              {loading ? "Scheduling…" : "Create job"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-7">
          <h2 className="border-b border-border px-1 pb-3 text-sm font-medium text-foreground">
            Active jobs ({jobs.length})
          </h2>

          {jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <Clock className="mx-auto mb-3 h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No jobs scheduled yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="w-8 px-3 py-3" />
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Schedule</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                        <React.Fragment key={job.id}>
                          <tr
                            className="group border-t border-border transition-colors hover:bg-accent cursor-pointer"
                            onClick={() => toggleExecutions(job.id)}
                          >
                          <td className="px-3 py-3.5">
                            {expandedJob === job.id ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </td>
                          <td className="max-w-[140px] truncate px-4 py-3.5 font-medium text-foreground">
                            {job.name}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
                              {job.type === "webhook" ? (
                                <Webhook className="h-3.5 w-3.5" aria-hidden="true" />
                              ) : (
                                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                              {job.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                            {job.schedule_type === "cron"
                              ? job.cron_expression
                              : job.run_at
                                ? new Date(job.run_at).toLocaleDateString()
                                : "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${
                                statusStyles[job.status] || "text-muted-foreground"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[job.status] || "bg-muted-foreground/50"}`} aria-hidden="true" />
                              {job.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(job.id)
                              }}
                              disabled={deleting === job.id}
                              className="h-8 w-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Delete job ${job.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                          </td>
                        </tr>
                        {expandedJob === job.id && (
                          <tr key={`${job.id}-executions`}>
                            <td colSpan={6} className="border-t border-border bg-muted/20 px-4 py-3">
                              {loadingExecutions === job.id ? (
                                <p className="text-xs text-muted-foreground">Loading executions...</p>
                              ) : executions[job.id]?.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No executions yet.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-muted-foreground">
                                        <th className="px-2 py-1 text-left font-medium">Time</th>
                                        <th className="px-2 py-1 text-left font-medium">Status</th>
                                        <th className="px-2 py-1 text-left font-medium">HTTP</th>
                                        <th className="px-2 py-1 text-left font-medium">Duration</th>
                                        <th className="px-2 py-1 text-left font-medium">Error</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {executions[job.id]?.map((exec) => (
                                        <tr key={exec.id} className="border-t border-border/50">
                                          <td className="px-2 py-1.5 font-mono text-muted-foreground">
                                            {new Date(exec.executed_at).toLocaleString()}
                                          </td>
                                          <td className="px-2 py-1.5">
                                            <span className={`inline-flex items-center gap-1 ${exec.status === "success" ? "text-emerald-600" : exec.status === "failed" ? "text-destructive" : "text-muted-foreground"}`}>
                                              <span className={`h-1.5 w-1.5 rounded-full ${exec.status === "success" ? "bg-emerald-500" : exec.status === "failed" ? "bg-destructive" : "bg-muted-foreground/50"}`} />
                                              {exec.status}
                                            </span>
                                          </td>
                                          <td className="px-2 py-1.5 font-mono text-muted-foreground">
                                            {exec.http_status ?? "—"}
                                          </td>
                                          <td className="px-2 py-1.5 font-mono text-muted-foreground">
                                            {exec.duration_ms != null ? `${exec.duration_ms}ms` : "—"}
                                          </td>
                                          <td className="max-w-[200px] truncate px-2 py-1.5 text-muted-foreground">
                                            {exec.error_message ?? "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                     </React.Fragment>
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