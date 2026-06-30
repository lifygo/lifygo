import type { EmailLog } from "@/features/logs";
import type { Job } from "@/features/jobs";

export interface DashboardStats {
  total_emails_sent: number;
  total_emails_failed: number;
  success_rate: number;
  active_jobs: number;
  total_api_keys: number;
  has_smtp_config: boolean;
  recent_email_logs: EmailLog[];
  recent_jobs: Job[];
}