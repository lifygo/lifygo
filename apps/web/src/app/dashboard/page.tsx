"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useApi } from "@/lib/use-api"
import { type DashboardStats } from "@/features/dashboard"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowUpRight, Loader2, CheckCircle2, Circle, Mail, Clock, Activity, Key } from "lucide-react"
import { DashboardCarousel } from "@/components/dashboard/overview/DashboardCarousel"

export default function DashboardOverview() {
  const { call } = useApi()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      try {
        const data = await call<DashboardStats>("/dashboard/stats")
        if (!cancelled) setStats(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load statistics")
        }
      }
    }

    fetchStats()
    return () => {
      cancelled = true
    }
  }, [call])

  if (error) {
    return (
      <div className="mx-auto flex max-w-5xl items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <h5 className="font-medium">Dashboard unavailable</h5>
          <p className="mt-1 text-red-600/80 dark:text-red-400/80">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
        <p>Loading your workspace...</p>
      </div>
    )
  }

  const checklist = [
    { done: stats.has_smtp_config, label: "Connect SMTP credentials", href: "/dashboard/smtp" },
    { done: stats.total_api_keys > 0, label: "Generate API key", href: "/dashboard/api-keys" },
    { done: stats.total_emails_sent > 0, label: "Send test email", href: "/dashboard/send" },
  ]
  const setupIncomplete = checklist.some((c) => !c.done)
  const progress = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)

  const metrics = [
    { label: "Emails Sent", value: stats.total_emails_sent.toLocaleString(), icon: Mail },
    { label: "Delivery Rate", value: `${stats.success_rate.toFixed(1)}%`, icon: Activity },
    { label: "Active Jobs", value: stats.active_jobs.toLocaleString(), icon: Clock },
    { label: "API Keys", value: stats.total_api_keys.toLocaleString(), icon: Key },
  ]

  const jobNames = new Map(stats.recent_jobs.map((job) => [job.id, job.name]))
  const activities = [
    ...stats.recent_email_logs.map((log) => ({
      id: `email-${log.id}`,
      kind: "email" as const,
      timestamp: log.sent_at,
      title: log.subject || "Email delivery",
      detail: log.to,
      status: log.status,
    })),
    ...(stats.recent_job_executions ?? []).map((execution) => ({
      id: `job-${execution.id}`,
      kind: "job" as const,
      timestamp: execution.executed_at,
      title: jobNames.get(execution.job_id) || "Scheduled job",
      detail: "Cron execution",
      status: execution.status,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-4 pb-12 pt-8 md:px-8">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Monitor your email delivery and job execution in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/jobs"
            className="group flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          >
            Jobs
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </Link>
          <Link
            href="/dashboard/logs"
            className="group flex h-9 items-center gap-2 rounded-md border border-border bg-foreground px-4 text-sm font-medium text-background transition-all hover:bg-foreground/90"
          >
            Logs
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </header>

      <DashboardCarousel />

      {setupIncomplete && (
        <section className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-1 flex-col justify-center space-y-2 border-b border-border p-6 md:border-b-0 md:border-r">
              <h2 className="text-base font-medium tracking-tight">Get Started</h2>
              <p className="text-sm text-muted-foreground">
                Complete your workspace setup to start sending emails.
              </p>
              <div className="mt-4 flex items-center gap-3 pt-2">
                <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full bg-foreground transition-all duration-500 ease-in-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="text-xs font-medium font-mono text-muted-foreground">{progress}%</span>
              </div>
            </div>
            <div className="flex-1 p-6">
              <ul className="flex flex-col gap-4">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-3 group">
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                    )}
                    <Link
                      href={item.href}
                      className={`text-sm font-medium transition-colors ${
                        item.done
                          ? "text-muted-foreground line-through decoration-muted-foreground/30"
                          : "text-foreground hover:text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <div key={item.label} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              <item.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium tracking-tight text-foreground">Activity Stream</h2>
        </div>
        
        {activities.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-transparent text-sm text-muted-foreground">
            No activity recorded yet
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/20">
                <tr>
                  <th className="h-10 px-4 align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 align-middle font-medium text-muted-foreground">Event</th>
                  <th className="h-10 px-4 align-middle font-medium text-muted-foreground">Details</th>
                  <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activities.map((activity) => {
                  const successful = activity.status === "sent" || activity.status === "success"
                  return (
                    <tr key={activity.id} className="group transition-colors hover:bg-muted/20">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${successful ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-xs font-medium capitalize text-foreground">
                            {activity.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase font-semibold">
                            {activity.kind}
                          </Badge>
                          <span className="font-medium text-foreground">{activity.title}</span>
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate p-4 align-middle text-muted-foreground">
                        {activity.detail}
                      </td>
                      <td className="p-4 text-right align-middle font-mono text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}