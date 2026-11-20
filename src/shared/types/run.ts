import type { Finding } from "./finding";
import type { AiReport } from "./llm";

export type RunStatus = "pending" | "running" | "success" | "error" | "cancelled";
export type NodeRunStatus = "idle" | "running" | "success" | "error" | "skipped";

export interface NodeResult {
  nodeId: string;
  status: NodeRunStatus;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  output?: unknown;
  error?: string;
  findings?: Finding[];
  logs?: string[];
}

export interface RunResult {
  id: string;
  workflowId: string;
  status: RunStatus;
  startedAt?: string;
  finishedAt?: string;
  nodeResults: NodeResult[];
  findings: Finding[];
  aiReport?: AiReport;
  error?: string;
}