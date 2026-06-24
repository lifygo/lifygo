export type JobType = "webhook" | "email";
export type JobScheduleType = "cron" | "one_time";
export type JobStatus = "active" | "paused" | "completed" | "failed";

export interface Job {
  id: string;
  name: string;
  type: JobType;
  schedule_type: JobScheduleType;
  cron_expression: string | null;
  run_at: string | null;
  webhook_url: string | null;
  webhook_payload: string | null;
  email_to: string | null;
  email_subject: string | null;
  email_body: string | null;
  status: JobStatus;
  enabled: boolean;
  created_at: string;
}

export interface JobExecution {
  id: string;
  job_id: string;
  status: "success" | "failed";
  http_status: number | null;
  error_message: string | null;
  duration_ms: number | null;
  executed_at: string;
}

export interface CreateWebhookJobInput {
  name: string;
  type: "webhook";
  schedule_type: JobScheduleType;
  cron_expression?: string;
  run_at?: string;
  webhook_url: string;
  webhook_payload?: string;
}

export interface CreateEmailJobInput {
  name: string;
  type: "email";
  schedule_type: JobScheduleType;
  cron_expression?: string;
  run_at?: string;
  email_to: string;
  email_subject: string;
  email_body: string;
}

export type CreateJobInput = CreateWebhookJobInput | CreateEmailJobInput;