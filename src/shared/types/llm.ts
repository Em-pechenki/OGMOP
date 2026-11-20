import type { Severity } from "./finding";
import type { Finding } from "./finding";

export interface LlmMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
}

export interface LlmPrompt {
  provider?: string;
  model?: string;
  prompt?: string;
  systemPrompt?: string;
  messages?: LlmMessage[];
  context?: unknown;
  findings?: Finding[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
  jsonSchema?: Record<string, unknown>;
}

// Backwards-compatible alias.
export type LlmRequest = LlmPrompt;

export interface LlmResponse {
  content: string;
  model?: string;
  provider?: string;
  parsed?: unknown;
  aiReport?: AiReport;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  raw?: unknown;
  finishReason?: string;
}

export interface AiReport {
  summary: string;
  riskLevel?: Severity;
  findings: Finding[];
  recommendations: string[];
  generatedAt?: string;
  model?: string;
  provider?: string;
  metadata?: Record<string, unknown>;
}

// Forward reference handled via interface hoisting? AiReport defined after LlmResponse uses it.
// To avoid TS ordering issues, declare AiReport above usage by re-exporting type.
export type AiReportAlias = AiReport;