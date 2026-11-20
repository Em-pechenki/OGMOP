import { z } from "zod";
import { severitySchema } from "./finding.schema";

export const ciCdProviderSchema = z.enum(["github"]);

export const ciCdStatusSchema = z.enum(["disconnected", "connecting", "connected", "error"]);

export const ciTriggerSchema = z.enum(["push", "pull_request", "schedule"]);

export const ciRunStatusSchema = z.enum(["pending", "running", "success", "failure", "neutral", "cancelled"]);

export const ciCdConfigSchema = z.object({
  id: z.string().optional(),
  provider: ciCdProviderSchema,
  repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
  tokenMasked: z.string().optional(),
  branches: z.array(z.string().min(1)).min(1),
  triggers: z.array(ciTriggerSchema).min(1),
  workflowId: z.string().optional(),
  severityThreshold: severitySchema.optional(),
  commentOnPr: z.boolean(),
  status: ciCdStatusSchema,
  lastSyncAt: z.string().optional(),
  error: z.string().optional(),
});

export const ciRunSchema = z.object({
  id: z.string().min(1),
  ciConfigId: z.string().optional(),
  runId: z.string().optional(),
  status: ciRunStatusSchema,
  branch: z.string().optional(),
  commitSha: z.string().optional(),
  prNumber: z.number().int().positive().optional(),
  title: z.string().optional(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  durationMs: z.number().nonnegative().optional(),
  findingsCount: z.number().int().nonnegative().optional(),
  findingsBySeverity: z.record(severitySchema, z.number().int().nonnegative()).optional(),
  url: z.string().url().optional(),
});