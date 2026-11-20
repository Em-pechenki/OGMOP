import type { NotifyChannel, NotifyConfig } from "./notification";
import type { ScannerType, ScanConfig } from "./scanner";

export type NodeType =
  | "trigger.manual"
  | "trigger.schedule"
  | "logic.if"
  | "logic.compare"
  | "logic.regex"
  | "notify.telegram"
  | "notify.smtp"
  | "notify.webhook"
  | "scanner.secrets"
  | "scanner.sca"
  | "scanner.sast"
  | "ai.analyze";

export interface Position {
  x: number;
  y: number;
}

export interface TriggerNodeData {
  kind: "trigger";
  triggerType: "manual" | "schedule";
  label?: string;
  schedule?: string;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LogicNodeData {
  kind: "logic";
  logicType: "if" | "compare" | "regex";
  label?: string;
  condition?: string;
  operator?: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "contains" | "regex";
  left?: string;
  right?: string;
  pattern?: string;
  [key: string]: unknown;
}

export interface NotifyNodeData {
  kind: "notify";
  channel: NotifyChannel;
  label?: string;
  config: NotifyConfig;
  [key: string]: unknown;
}

export interface ScannerNodeData {
  kind: "scanner";
  scannerType: ScannerType;
  label?: string;
  config: ScanConfig;
  [key: string]: unknown;
}

export interface AiNodeData {
  kind: "ai";
  label?: string;
  provider?: string;
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: unknown;
}

export type NodeData =
  | TriggerNodeData
  | LogicNodeData
  | NotifyNodeData
  | ScannerNodeData
  | AiNodeData;

export interface FlowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
  selected?: boolean;
  draggable?: boolean;
  width?: number;
  height?: number;
}

// Aliases expected by the department spec.
export type Node = FlowNode;
export type TriggerNode = TriggerNodeData;
export type LogicNode = LogicNodeData;
export type NotifyNode = NotifyNodeData;
export type ScannerNode = ScannerNodeData;
export type AiNode = AiNodeData;