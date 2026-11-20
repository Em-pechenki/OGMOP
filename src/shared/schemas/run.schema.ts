import { z } from "zod";
import { findingSchema } from "./finding.schema";
import { aiReportSchema } from "./llm.schema";

export const runStatusSchema = z.enum(["pending", "queued", "running", "success", "error", "failed", "completed", "cancelled"]);
export const nodeRunStatusSchema = z.enum(["idle", "running", "success", "error", "skipped"]);

export const nodeResultSchema = z.object({
  nodeId: z.string().min(1),
  status: nodeRunStatusSchema,
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  durationMs: z.number().optional(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  findings: z.array(findingSchema).optional(),
  logs: z.array(z.string()).optional(),
});

export const runResultSchema = z.object({
  id: z.string().min(1),
  workflowId: z.string().min(1),
  status: runStatusSchema,
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  nodeResults: z.array(nodeResultSchema),
  findings: z.array(findingSchema),
  aiReport: aiReportSchema.optional(),
  error: z.string().optional(),
});