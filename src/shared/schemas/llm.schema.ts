import { z } from "zod";
import { severitySchema, findingSchema } from "./finding.schema";

export const llmMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  name: z.string().optional(),
});

export const llmPromptSchema = z
  .object({
    provider: z.string().optional(),
    model: z.string().optional(),
    prompt: z.string().min(1).optional(),
    systemPrompt: z.string().optional(),
    messages: z.array(llmMessageSchema).optional(),
    context: z.unknown().optional(),
    findings: z.array(findingSchema).optional(),
    temperature: z.number().optional(),
    maxTokens: z.number().int().positive().optional(),
    responseFormat: z.enum(["text", "json"]).optional(),
    jsonSchema: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((v) => Boolean(v.prompt) || (Array.isArray(v.messages) && v.messages.length > 0), {
    message: "Either prompt or messages is required",
  });

// Backwards-compatible alias.
export const llmRequestSchema = llmPromptSchema;

export const llmResponseSchema = z.object({
  content: z.string(),
  model: z.string().optional(),
  provider: z.string().optional(),
  parsed: z.unknown().optional(),
  aiReport: z.lazy(() => aiReportSchema).optional(),
  usage: z
    .object({
      promptTokens: z.number().int().nonnegative().optional(),
      completionTokens: z.number().int().nonnegative().optional(),
      totalTokens: z.number().int().nonnegative().optional(),
    })
    .optional(),
  raw: z.unknown().optional(),
  finishReason: z.string().optional(),
});

export const aiReportSchema = z.object({
  summary: z.string(),
  riskLevel: severitySchema.optional(),
  findings: z.array(findingSchema),
  recommendations: z.array(z.string()),
  generatedAt: z.string().optional(),
  model: z.string().optional(),
  provider: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// LLM structured JSON schema (Zod) for findings/summary/recommendations.
export const llmJsonSchema = aiReportSchema;
export const aiReportJsonSchema = aiReportSchema;
export const llmStructuredResponseSchema = aiReportSchema;

export const LLM_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    riskLevel: { type: "string", enum: ["critical", "high", "medium", "low", "info"] },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          severity: { type: "string", enum: ["critical", "high", "medium", "low", "info"] },
          title: { type: "string" },
          description: { type: "string" },
          file: { type: "string" },
          line: { type: "number" },
          ruleId: { type: "string" },
          scanner: { type: "string", enum: ["secrets", "sca", "sast"] },
          recommendation: { type: "string" },
        },
        required: ["id", "severity", "title"],
      },
    },
    recommendations: { type: "array", items: { type: "string" } },
    generatedAt: { type: "string" },
  },
  required: ["summary", "findings", "recommendations"],
  additionalProperties: false,
} as const;

export const AI_REPORT_JSON_SCHEMA = LLM_JSON_SCHEMA;
export const llmJsonSchemaObject = LLM_JSON_SCHEMA;