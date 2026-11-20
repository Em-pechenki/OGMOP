import type { Finding } from "./finding";
import type { AiReport } from "./llm";
import type { RunStatus, NodeRunStatus } from "./run";

export interface NodeExecutionResult {
  nodeId: string;
  nodeType?: string;
  type?: string;
  status: NodeRunStatus | "failed" | "success" | "queued";
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  output?: unknown;
  data?: unknown;
  error?: string;
  findings?: Finding[];
  logs?: string[];
}

// Backwards-compatible alias.
export type NodeResultExecution = NodeExecutionResult;

export type WorkflowRunEventType =
  | "run.queued"
  | "run.started"
  | "run.running"
  | "run.completed"
  | "run.failed"
  | "run.cancelled"
  | "node.queued"
  | "node.started"
  | "node.running"
  | "node.completed"
  | "node.failed"
  | "node.skipped"
  | "log"
  | "finding"
  | "ai.report";

export interface WorkflowRunEvent {
  type: WorkflowRunEventType | string;
  runId: string;
  workflowId?: string;
  nodeId?: string;
  status?: RunStatus | NodeRunStatus | string;
  nodeStatuses?: Record<string, NodeRunStatus | string>;
  nodeResults?: Record<string, NodeExecutionResult | unknown>;
  findings?: Finding[];
  aiReport?: AiReport;
  error?: string;
  message?: string;
  log?: string;
  timestamp?: string;
  data?: unknown;
  metadata?: Record<string, unknown>;
}