import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Job, JobExecution, CreateJobInput } from "./jobs.types";

export function createJob(apiKey: string, input: CreateJobInput) {
  return apiFetch<Job>(ENDPOINTS.JOBS.CREATE, apiKey, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listJobs(apiKey: string) {
  return apiFetch<Job[]>(ENDPOINTS.JOBS.LIST, apiKey);
}

export function getJob(apiKey: string, id: string) {
  return apiFetch<Job>(ENDPOINTS.JOBS.GET(id), apiKey);
}

export function deleteJob(apiKey: string, id: string) {
  return apiFetch<{ message: string }>(ENDPOINTS.JOBS.DELETE(id), apiKey, {
    method: "DELETE",
  });
}

export function listJobExecutions(apiKey: string, id: string) {
  return apiFetch<JobExecution[]>(ENDPOINTS.JOBS.EXECUTIONS(id), apiKey);
}