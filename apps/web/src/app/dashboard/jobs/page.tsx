"use client"

import React, { useState, useEffect } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { Job, CreateJobInput } from "@/features/jobs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Webhook, 
  Mail, 
  Clock, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  Server,
  Loader2,
  XCircle
} from "lucide-react"

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
      setSuccess("Job scheduled successfully.")
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
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Scheduled Jobs</h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-xs">
            <Server className="h-3.5 w-3.5 text-emerald-500" />
            <span>Open Source Tool</span>
            <span className="text-border">•</span>
            <span className="font-medium text-foreground">Deploy on your own VPS</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Automate recurring webhooks and transactional email dispatches using cron schedules or one-time executions.
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

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* New Job Creation Panel */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-5">
          <h2 className="border-b border-border pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Schedule New Job
          </h2>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                Job Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="weekly-report-sync"
                value={form.name}
                onChange={handleChange}
                className="h-9 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Target Dispatch</Label>
              <Tabs value={jobType} onValueChange={(v) => setJobType(v as "webhook" | "email")} className="w-full">
                <TabsList className="h-9 w-full rounded-lg border border-border bg-muted/40 p-1">
                  <TabsTrigger value="webhook" className="h-7 w-full gap-2 text-xs font-medium">
                    <Webhook className="h-3.5 w-3.5 text-muted-foreground" /> Webhook
                  </TabsTrigger>
                  <TabsTrigger value="email" className="h-7 w-full gap-2 text-xs font-medium">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="webhook" className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="webhook_url" className="text-xs text-muted-foreground">
                      Endpoint URL
                    </Label>
                    <Input
                      id="webhook_url"
                      name="webhook_url"
                      placeholder="https://api.yourdomain.com/v1/sync"
                      value={form.webhook_url}
                      onChange={handleChange}
                      className="h-9 bg-transparent font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="webhook_payload" className="text-xs text-muted-foreground">
                      JSON Payload (Optional)
                    </Label>
                    <Input
                      id="webhook_payload"
                      name="webhook_payload"
                      placeholder='{"event": "scheduled_sync"}'
                      value={form.webhook_payload}
                      onChange={handleChange}
                      className="h-9 bg-transparent font-mono text-xs"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email_to" className="text-xs text-muted-foreground">
                      Recipient Email
                    </Label>
                    <Input
                      id="email_to"
                      name="email_to"
                      placeholder="alerts@yourdomain.com"
                      value={form.email_to}
                      onChange={handleChange}
                      className="h-9 bg-transparent text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email_subject" className="text-xs text-muted-foreground">
                      Subject
                    </Label>
                    <Input
                      id="email_subject"
                      name="email_subject"
                      placeholder="Scheduled Job Executed"
                      value={form.email_subject}
                      onChange={handleChange}
                      className="h-9 bg-transparent text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email_body" className="text-xs text-muted-foreground">
                      Body Content
                    </Label>
                    <Input
                      id="email_body"
                      name="email_body"
                      placeholder="Automated job dispatch notice."
                      value={form.email_body}
                      onChange={handleChange}
                      className="h-9 bg-transparent text-xs"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label className="text-xs font-medium text-muted-foreground">Execution Interval</Label>
              <Tabs value={scheduleType} onValueChange={(v) => setScheduleType(v as "cron" | "one_time")} className="w-full">
                <TabsList className="h-9 w-full rounded-lg border border-border bg-muted/40 p-1">
                  <TabsTrigger value="cron" className="h-7 w-full gap-2 text-xs font-medium">
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /> Cron
                  </TabsTrigger>
                  <TabsTrigger value="one_time" className="h-7 w-full gap-2 text-xs font-medium">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" /> One-time
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cron" className="mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cron_expression" className="text-xs text-muted-foreground">
                      Cron Expression
                    </Label>
                    <Input
                      id="cron_expression"
                      name="cron_expression"
                      placeholder="*/5 * * * * (Every 5 mins)"
                      value={form.cron_expression}
                      onChange={handleChange}
                      className="h-9 bg-transparent font-mono text-xs"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="one_time" className="mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="run_at" className="text-xs text-muted-foreground">
                      Execution Date & Time
                    </Label>
                    <Input
                      id="run_at"
                      name="run_at"
                      type="datetime-local"
                      value={form.run_at}
                      onChange={handleChange}
                      className="h-9 bg-transparent font-mono text-xs"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Button onClick={handleCreate} disabled={loading || !form.name} className="h-9 w-full text-xs font-medium">
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Create Job
            </Button>
          </div>
        </div>

        {/* Active Jobs List */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Jobs ({jobs.length})
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center">
              <Clock className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No jobs scheduled</p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure a webhook or email trigger to automate background tasks.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
                      <th className="w-8 px-3 py-3" />
                      <th className="px-4 py-3 font-medium">Job Name</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Schedule</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {jobs.map((job) => {
                      const isExpanded = expandedJob === job.id
                      const isActive = job.status === "active"
                      const isCompleted = job.status === "completed"
                      const isFailed = job.status === "failed"

                      return (
                        <React.Fragment key={job.id}>
                          <tr
                            className="group transition-colors hover:bg-muted/30 cursor-pointer"
                            onClick={() => toggleExecutions(job.id)}
                          >
                            <td className="px-3 py-3.5">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="max-w-[140px] truncate px-4 py-3.5 font-medium text-foreground">
                              {job.name}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                {job.type === "webhook" ? (
                                  <Webhook className="h-3.5 w-3.5" />
                                ) : (
                                  <Mail className="h-3.5 w-3.5" />
                                )}
                                <span className="capitalize">{job.type}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-muted-foreground">
                              {job.schedule_type === "cron"
                                ? job.cron_expression
                                : job.run_at
                                  ? new Date(job.run_at).toLocaleDateString()
                                  : "—"}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                                  isActive
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : isCompleted
                                      ? "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                      : isFailed
                                        ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                                        : "border-border bg-muted text-muted-foreground"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isActive
                                      ? "bg-emerald-500"
                                      : isCompleted
                                        ? "bg-sky-500"
                                        : isFailed
                                          ? "bg-red-500"
                                          : "bg-muted-foreground/50"
                                  }`}
                                />
                                {job.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(job.id)
                                }}
                                disabled={deleting === job.id}
                                className="h-7 w-7 text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                              >
                                {deleting === job.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </td>
                          </tr>

                          {/* Executions Sub-table */}
                          {isExpanded && (
                            <tr key={`${job.id}-executions`}>
                              <td colSpan={6} className="bg-muted/20 px-6 py-4">
                                <div className="space-y-2">
                                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Recent Executions
                                  </span>
                                  {loadingExecutions === job.id ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      Loading history...
                                    </div>
                                  ) : executions[job.id]?.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-1">No executions logged yet.</p>
                                  ) : (
                                    <div className="overflow-x-auto rounded border border-border bg-card">
                                      <table className="w-full text-left text-[11px]">
                                        <thead>
                                          <tr className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
                                            <th className="px-3 py-2 font-medium">Timestamp</th>
                                            <th className="px-3 py-2 font-medium">Status</th>
                                            <th className="px-3 py-2 font-medium">HTTP Status</th>
                                            <th className="px-3 py-2 font-medium">Duration</th>
                                            <th className="px-3 py-2 font-medium">Error Details</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          {executions[job.id]?.map((exec) => {
                                            const execSuccess = exec.status === "success"
                                            const execFailed = exec.status === "failed"

                                            return (
                                              <tr key={exec.id}>
                                                <td className="whitespace-nowrap px-3 py-2 font-mono text-muted-foreground">
                                                  {new Date(exec.executed_at).toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2">
                                                  <span
                                                    className={`inline-flex items-center gap-1 font-medium ${
                                                      execSuccess
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : execFailed
                                                          ? "text-red-600 dark:text-red-400"
                                                          : "text-muted-foreground"
                                                    }`}
                                                  >
                                                    {execSuccess ? (
                                                      <CheckCircle2 className="h-3 w-3" />
                                                    ) : execFailed ? (
                                                      <XCircle className="h-3 w-3" />
                                                    ) : null}
                                                    {exec.status}
                                                  </span>
                                                </td>
                                                <td className="px-3 py-2 font-mono text-muted-foreground">
                                                  {exec.http_status ?? "—"}
                                                </td>
                                                <td className="px-3 py-2 font-mono text-muted-foreground">
                                                  {exec.duration_ms != null ? `${exec.duration_ms}ms` : "—"}
                                                </td>
                                                <td className="max-w-[180px] truncate px-3 py-2 font-mono text-muted-foreground">
                                                  {exec.error_message ?? "—"}
                                                </td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
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