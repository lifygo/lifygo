export type EmailStatus = "sent" | "failed";

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: EmailStatus;
  error_message: string | null;
  sent_at: string;
}

export interface ListLogsParams {
  limit?: number;
  offset?: number;
  status?: EmailStatus;
}

export interface ListLogsResponse {
  logs: EmailLog[];
  total: number;
  limit: number;
  offset: number;
}