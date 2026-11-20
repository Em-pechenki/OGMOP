import type { FlowNode } from "./node";
import type { FlowEdge } from "./edge";

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  templateId?: string;
  metadata?: Record<string, unknown>;
}