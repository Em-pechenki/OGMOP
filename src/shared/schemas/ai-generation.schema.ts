import { z } from "zod";
import { flowNodeSchema } from "./node.schema";
import { flowEdgeSchema } from "./edge.schema";
import { findingSchema } from "./finding.schema";

export const aiGenerationStatusSchema = z.enum(["idle", "loading", "preview", "error", "empty-result"]);

export const aiGenerationLanguageSchema = z.enum(["kotlin-spring", "node", "python", "go", "generic"]);

export const aiGenerationScannerSchema = z.enum(["secrets", "sca", "sast"]);

export const aiGenerationNotifyChannelSchema = z.enum(["none", "telegram", "webhook", "email"]);

export const aiGenerationRequestSchema = z.object({
  prompt: z.string().min(10).max(2000),
  language: aiGenerationLanguageSchema.optional(),
  scanners: z.array(aiGenerationScannerSchema).optional(),
  notifyChannel: aiGenerationNotifyChannelSchema.optional(),
  aiEnabled: z.boolean().optional(),
  baseWorkflowName: z.string().optional(),
  maxNodes: z.number().int().positive().max(100).optional(),
});

export const aiGenerationResultSchema = z.object({
  name: z.string().min(1),
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
  warnings: z.array(z.string()).optional(),
  findingsPreview: z.array(findingSchema).optional(),
  generatedAt: z.string().optional(),
  model: z.string().optional(),
  provider: z.string().optional(),
});