"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@/lib/use-api";
import { type DashboardStats } from "@/features/dashboard";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverview() {
  const { call } = useApi();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const data = await call<DashboardStats>("/dashboard/stats");
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load stats");
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  if (!stats) {
    return <p className="text-gray-400 text-sm">Loading...</p>;
  }

  const setupIncomplete = !stats.has_smtp_config || stats.total_api_keys === 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      {/* Setup checklist — only shown if something is missing */}
      {setupIncomplete && (
        <div className="border rounded p-4 mb-8 bg-yellow-50">
          <h2 className="font-semibold mb-3">Finish setting up LifyGo</h2>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-center gap-2">
              <Badge variant={stats.has_smtp_config ? "default" : "outline"}>
                {stats.has_smtp_config ? "Done" : "Pending"}
              </Badge>
              <Link href="/dashboard/smtp" className="hover:underline">
                Add your SMTP credentials
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant={stats.total_api_keys > 0 ? "default" : "outline"}>
                {stats.total_api_keys > 0 ? "Done" : "Pending"}
              </Badge>
              <Link href="/dashboard/api-keys" className="hover:underline">
                Generate an API key
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant={stats.total_emails_sent > 0 ? "default" : "outline"}>
                {stats.total_emails_sent > 0 ? "Done" : "Pending"}
              </Badge>
              <Link href="/dashboard/send" className="hover:underline">
                Send your first test email
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border rounded p-4">
          <p className="text-gray-500 text-xs mb-1">Emails Sent</p>
          <p className="text-2xl font-bold">{stats.total_emails_sent}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-gray-500 text-xs mb-1">Success Rate</p>
          <p className="text-2xl font-bold">{stats.success_rate.toFixed(1)}%</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-gray-500 text-xs mb-1">Active Jobs</p>
          <p className="text-2xl font-bold">{stats.active_jobs}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-gray-500 text-xs mb-1">API Keys</p>
          <p className="text-2xl font-bold">{stats.total_api_keys}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 text-sm">
        <Link href="/dashboard/jobs" className="text-blue-600 hover:underline">
          Manage Jobs →
        </Link>
        <Link href="/dashboard/logs" className="text-blue-600 hover:underline">
          View Logs →
        </Link>
      </div>
    </div>
  );
}