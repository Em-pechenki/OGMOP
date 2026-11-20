import { z } from "zod";
import { severitySchema, findingSchema } from "./finding.schema";

export const llmRequestSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().int().positive().optional(),
});

export const llmResponseSchema = z.object({
  content: z.string(),
  model: z.string().optional(),
  provider: z.string().optional(),
  usage: z
    .object({
      promptTokens: z.number().int().nonnegative().optional(),
      completionTokens: z.number().int().nonnegative().optional(),
      totalTokens: z.number().int().nonnegative().optional(),
    })
    .optional(),
  raw: z.unknown().optional(),
});

export const aiReportSchema = z.object({
  summary: z.string(),
  riskLevel: severitySchema.optional(),
  findings: z.array(findingSchema),
  recommendations: z.array(z.string()),
  generatedAt: z.string().optional(),
});