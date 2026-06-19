export interface SmtpConfig {
  id: string;
  host: string;
  port: number;
  username: string;
  from_address: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertSmtpConfigInput {
  host: string;
  port: number;
  username: string;
  password: string;
  from_address: string;
}