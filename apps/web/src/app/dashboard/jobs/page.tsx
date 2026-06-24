"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/use-api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Job, CreateJobInput } from "@/features/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusColors: Record<string, "default" | "destructive" | "outline"> = {
  active: "default",
  failed: "destructive",
  completed: "outline",
  paused: "outline",
};

export default function JobsPage() {
  const { call } = useApi();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [jobType, setJobType] = useState<"webhook" | "email">("webhook");
  const [scheduleType, setScheduleType] = useState<"cron" | "one_time">("cron");
  const [form, setForm] = useState({
    name: "",
    cron_expression: "",
    run_at: "",
    webhook_url: "",
    webhook_payload: "",
    email_to: "",
    email_subject: "",
    email_body: "",
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      try {
        const data = await call<Job[]>(ENDPOINTS.JOBS.LIST);
        if (!cancelled) setJobs(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load jobs");
      }
    }
    fetchJobs();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreate() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const input: CreateJobInput = {
        name: form.name,
        type: jobType,
        schedule_type: scheduleType,
        ...(scheduleType === "cron"
          ? { cron_expression: form.cron_expression }
          : { run_at: new Date(form.run_at).toISOString() }),
        ...(jobType === "webhook"
          ? {
              webhook_url: form.webhook_url,
              ...(form.webhook_payload ? { webhook_payload: form.webhook_payload } : {}),
            }
          : {
              email_to: form.email_to,
              email_subject: form.email_subject,
              email_body: form.email_body,
            }),
      };

      const created = await call<Job>(ENDPOINTS.JOBS.CREATE, {
        method: "POST",
        body: JSON.stringify(input),
      });

      setJobs((prev) => [created, ...prev]);
      setSuccess("Job created successfully.");
      setForm({
        name: "",
        cron_expression: "",
        run_at: "",
        webhook_url: "",
        webhook_payload: "",
        email_to: "",
        email_subject: "",
        email_body: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setError("");
    try {
      await call(ENDPOINTS.JOBS.DELETE(id), { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Scheduled Jobs</h1>
      <p className="text-gray-500 text-sm mb-6">
        Free tier: up to 3 active jobs. Upgrade for unlimited.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

      {/* Create form */}
      <div className="border rounded p-4 mb-8">
        <h2 className="font-semibold mb-4">Create New Job</h2>

        <div className="flex flex-col gap-3">
          <div>
            <Label>Job Name</Label>
            <Input
              name="name"
              placeholder="weekly-report"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Job type tabs */}
          <Tabs value={jobType} onValueChange={(v) => setJobType(v as "webhook" | "email")}>
            <TabsList>
              <TabsTrigger value="webhook">Webhook</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="webhook" className="flex flex-col gap-3 mt-3">
              <div>
                <Label>Webhook URL</Label>
                <Input
                  name="webhook_url"
                  placeholder="https://myapp.com/webhook"
                  value={form.webhook_url}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Payload (optional JSON)</Label>
                <Input
                  name="webhook_payload"
                  placeholder='{"event": "scheduled"}'
                  value={form.webhook_payload}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>

            <TabsContent value="email" className="flex flex-col gap-3 mt-3">
              <div>
                <Label>To</Label>
                <Input
                  name="email_to"
                  placeholder="user@example.com"
                  value={form.email_to}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  name="email_subject"
                  placeholder="Weekly digest"
                  value={form.email_subject}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Body</Label>
                <Input
                  name="email_body"
                  placeholder="Here is your weekly digest."
                  value={form.email_body}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Schedule type */}
          <Tabs value={scheduleType} onValueChange={(v) => setScheduleType(v as "cron" | "one_time")}>
            <TabsList>
              <TabsTrigger value="cron">Recurring (Cron)</TabsTrigger>
              <TabsTrigger value="one_time">One Time</TabsTrigger>
            </TabsList>

            <TabsContent value="cron" className="mt-3">
              <Label>Cron Expression</Label>
              <Input
                name="cron_expression"
                placeholder="0 9 * * 1  (every Monday at 9am)"
                value={form.cron_expression}
                onChange={handleChange}
              />
            </TabsContent>

            <TabsContent value="one_time" className="mt-3">
              <Label>Run At</Label>
              <Input
                name="run_at"
                type="datetime-local"
                value={form.run_at}
                onChange={handleChange}
              />
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleCreate}
            disabled={loading || !form.name}
            className="mt-2"
          >
            {loading ? "Creating..." : "Create Job"}
          </Button>
        </div>
      </div>

      {/* Jobs list */}
      {jobs.length === 0 ? (
        <p className="text-gray-400 text-sm">No jobs yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Schedule</th>
              <th className="pb-2">Status</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{job.name}</td>
                <td className="py-3 text-gray-500">{job.type}</td>
                <td className="py-3 text-gray-500">
                  {job.schedule_type === "cron"
                    ? job.cron_expression
                    : job.run_at
                    ? new Date(job.run_at).toLocaleString()
                    : "-"}
                </td>
                <td className="py-3">
                  <Badge variant={statusColors[job.status] || "outline"}>
                    {job.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    disabled={deleting === job.id}
                  >
                    {deleting === job.id ? "Deleting..." : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}