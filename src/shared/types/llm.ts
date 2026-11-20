import type { Severity } from "./finding";

export interface LlmRequest {
  provider?: string;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmResponse {
  content: string;
  model?: string;
  provider?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  raw?: unknown;
}

export interface AiReport {
  summary: string;
  riskLevel?: Severity;
  findings: import("./finding").Finding[];
  recommendations: string[];
  generatedAt?: string;
}