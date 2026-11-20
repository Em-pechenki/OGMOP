import type { Severity } from "./finding";

export type CiCdProvider = "github";

export type CiCdStatus = "disconnected" | "connecting" | "connected" | "error";

export type CiTrigger = "push" | "pull_request" | "schedule";

export type CiRunStatus = "pending" | "running" | "success" | "failure" | "neutral" | "cancelled";

export interface CiCdConfig {
  id?: string;
  provider: CiCdProvider;
  repository: string;
  tokenMasked?: string;
  branches: string[];
  triggers: CiTrigger[];
  workflowId?: string;
  severityThreshold?: Severity;
  commentOnPr: boolean;
  status: CiCdStatus;
  lastSyncAt?: string;
  error?: string;
}

export interface CiRun {
  id: string;
  ciConfigId?: string;
  runId?: string;
  status: CiRunStatus;
  branch?: string;
  commitSha?: string;
  prNumber?: number;
  title?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  findingsCount?: number;
  findingsBySeverity?: Partial<Record<Severity, number>>;
  url?: string;
}