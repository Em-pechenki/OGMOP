import type { FlowNode } from "./node";
import type { FlowEdge } from "./edge";
import type { Finding } from "./finding";

export type AiGenerationStatus = "idle" | "loading" | "preview" | "error" | "empty-result";

export type AiGenerationLanguage =
  | "kotlin-spring"
  | "node"
  | "python"
  | "go"
  | "generic";

export type AiGenerationScanner = "secrets" | "sca" | "sast";

export type AiGenerationNotifyChannel = "none" | "telegram" | "webhook" | "email";

export interface AiGenerationRequest {
  prompt: string;
  language?: AiGenerationLanguage;
  scanners?: AiGenerationScanner[];
  notifyChannel?: AiGenerationNotifyChannel;
  aiEnabled?: boolean;
  baseWorkflowName?: string;
  maxNodes?: number;
}

export interface AiGenerationResult {
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  warnings?: string[];
  findingsPreview?: Finding[];
  generatedAt?: string;
  model?: string;
  provider?: string;
}