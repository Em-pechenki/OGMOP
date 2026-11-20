export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  condition?: "true" | "false" | string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

export type Edge = FlowEdge;