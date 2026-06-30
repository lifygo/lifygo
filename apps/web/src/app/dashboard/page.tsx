"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useApi } from "@/lib/use-api"
import { type DashboardStats } from "@/features/dashboard"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowUpRight, Loader2 } from "lucide-react"
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
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load statistics")
      }
    }

    fetchStats()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.06] p-4 text-sm text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <h5 className="font-medium">Couldn&apos;t load the dashboard</h5>
          <p className="mt-0.5 text-xs text-destructive/80">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Loading dashboard…
      </div>
    )
  }

  const checklist = [
    { done: stats.has_smtp_config, label: "Connect your SMTP credentials", href: "/dashboard/smtp" },
    { done: stats.total_api_keys > 0, label: "Generate an API key", href: "/dashboard/api-keys" },
    { done: stats.total_emails_sent > 0, label: "Send a test email", href: "/dashboard/send" },
  ]
  const setupIncomplete = checklist.some((c) => !c.done)

  const metrics = [
    { label: "Emails sent", value: stats.total_emails_sent.toLocaleString() },
    { label: "Success rate", value: `${stats.success_rate.toFixed(1)}%` },
    { label: "Active jobs", value: stats.active_jobs },
    { label: "API keys", value: stats.total_api_keys },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 text-foreground md:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Your active configuration, delivery metrics, and recent activity.
        </p>
      </div>

      <div className="mb-8">
        <DashboardCarousel />
      </div>

      {/* Setup checklist */}
      {setupIncomplete && (
        <div className="mb-8 max-w-2xl rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground">Finish setting up</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Complete these steps to start sending email.
          </p>

          <ul className="mt-4 flex flex-col gap-3">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    item.done
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600"
                      : "border-border bg-transparent"
                  }`}
                  aria-hidden="true"
                >
                  {item.done && (
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                      <path d="M2.5 6.5L5 9l4.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <Link
                  href={item.href}
                  className={
                    item.done
                      ? "text-muted-foreground line-through decoration-border"
                      : "text-foreground transition-colors hover:text-muted-foreground"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics */}
      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
        {metrics.map((item) => (
          <div key={item.label} className="bg-card p-4">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/jobs"
          className="group inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Manage jobs
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
        </Link>
        <Link
          href="/dashboard/logs"
          className="group inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          View activity logs
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
        </Link>
      </div>

      {/* Recent activity */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <h2 className="mb-3 border-b border-border pb-2 text-sm font-medium text-foreground">
            Recent emails
          </h2>
          {stats.recent_email_logs.length === 0 ? (
            <EmptyState label="No emails sent yet." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="w-2 px-0 py-2" aria-hidden="true" />
                    <th className="px-3 py-2 font-medium">Recipient</th>
                    <th className="px-3 py-2 font-medium">Subject</th>
                    <th className="px-3 py-2 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {stats.recent_email_logs.map((log) => {
                    const sent = log.status === "sent"
                    return (
                      <tr
                        key={log.id}
                        className={`border-t border-border transition-colors hover:bg-accent ${
                          sent ? "bg-emerald-500/[0.04]" : "bg-destructive/[0.04]"
                        }`}
                      >
                        <td className="w-2 px-0 py-2.5">
                          <span
                            className={`block h-full w-[3px] rounded-full ${
                              sent ? "bg-emerald-500" : "bg-destructive"
                            }`}
                            aria-hidden="true"
                          />
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-2.5 text-foreground">{log.to}</td>
                        <td className="max-w-[160px] truncate px-3 py-2.5 text-muted-foreground">
                          {log.subject || <span className="italic opacity-60">no subject</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className={`inline-flex items-center gap-1 font-sans font-medium ${
                              sent ? "text-emerald-600" : "text-destructive"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${sent ? "bg-emerald-500" : "bg-destructive"}`}
                              aria-hidden="true"
                            />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="mb-3 border-b border-border pb-2 text-sm font-medium text-foreground">
            Recent background jobs
          </h2>
          {stats.recent_jobs.length === 0 ? (
            <EmptyState label="No jobs running yet." />
          ) : (
            <ul className="flex flex-col gap-1.5">
              {stats.recent_jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{job.name}</p>
                    <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">{job.type}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 rounded-full border-none px-2 py-0.5 text-[10px] font-medium capitalize ${
                      job.status === "active"
                        ? "bg-brand/10 text-brand"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {job.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
      {label}
    </div>
  )
}