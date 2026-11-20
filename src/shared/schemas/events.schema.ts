import { z } from "zod";
import { findingSchema } from "./finding.schema";
import { aiReportSchema } from "./llm.schema";
import { runStatusSchema, nodeRunStatusSchema } from "./run.schema";

export const nodeExecutionResultSchema = z.object({
  nodeId: z.string().min(1),
  nodeType: z.string().optional(),
  type: z.string().optional(),
  status: z.union([nodeRunStatusSchema, z.enum(["failed", "success", "queued"])]),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  durationMs: z.number().optional(),
  output: z.unknown().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  findings: z.array(findingSchema).optional(),
  logs: z.array(z.string()).optional(),
});

export const workflowRunEventTypeSchema = z.enum([
  "run.queued",
  "run.started",
  "run.running",
  "run.completed",
  "run.failed",
  "run.cancelled",
  "node.queued",
  "node.started",
  "node.running",
  "node.completed",
  "node.failed",
  "node.skipped",
  "log",
  "finding",
  "ai.report",
]);

export const workflowRunEventSchema = z.object({
  type: z.union([workflowRunEventTypeSchema, z.string()]),
  runId: z.string().min(1),
  workflowId: z.string().optional(),
  nodeId: z.string().optional(),
  status: z.union([runStatusSchema, nodeRunStatusSchema, z.string()]).optional(),
  nodeStatuses: z.record(z.string(), z.union([nodeRunStatusSchema, z.string()])).optional(),
  nodeResults: z.record(z.string(), z.unknown()).optional(),
  findings: z.array(findingSchema).optional(),
  aiReport: aiReportSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  log: z.string().optional(),
  timestamp: z.string().optional(),
  data: z.unknown().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});