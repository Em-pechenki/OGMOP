import { z } from "zod";

export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const nodeTypeSchema = z.enum([
  "trigger.manual",
  "trigger.schedule",
  "logic.if",
  "logic.compare",
  "logic.regex",
  "notify.telegram",
  "notify.smtp",
  "notify.webhook",
  "scanner.secrets",
  "scanner.sca",
  "scanner.sast",
  "ai.analyze",
]);

export const triggerNodeDataSchema = z.object({
  kind: z.literal("trigger"),
  triggerType: z.enum(["manual", "schedule"]),
  label: z.string().optional(),
  schedule: z.string().optional(),
  params: z.record(z.string(), z.unknown()).optional(),
});

export const logicNodeDataSchema = z.object({
  kind: z.literal("logic"),
  logicType: z.enum(["if", "compare", "regex"]),
  label: z.string().optional(),
  condition: z.string().optional(),
  operator: z.enum(["eq", "ne", "gt", "lt", "gte", "lte", "contains", "regex"]).optional(),
  left: z.string().optional(),
  right: z.string().optional(),
  pattern: z.string().optional(),
});

export const notifyNodeDataSchema = z.object({
  kind: z.literal("notify"),
  channel: z.enum(["telegram", "smtp", "webhook"]),
  label: z.string().optional(),
  config: z.record(z.string(), z.unknown()),
});

export const scannerNodeDataSchema = z.object({
  kind: z.literal("scanner"),
  scannerType: z.enum(["secrets", "sca", "sast"]),
  label: z.string().optional(),
  config: z.record(z.string(), z.unknown()),
});

export const aiNodeDataSchema = z.object({
  kind: z.literal("ai"),
  label: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  prompt: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().int().positive().optional(),
});

export const nodeDataSchema = z.discriminatedUnion("kind", [
  triggerNodeDataSchema,
  logicNodeDataSchema,
  notifyNodeDataSchema,
  scannerNodeDataSchema,
  aiNodeDataSchema,
]);

export const flowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  label: z.string().optional(),
  condition: z.string().optional(),
  animated: z.boolean().optional(),
  style: z.record(z.string(), z.unknown()).optional(),
});

export const flowNodeSchema = z.object({
  id: z.string().min(1),
  type: nodeTypeSchema,
  position: positionSchema,
  data: nodeDataSchema,
  selected: z.boolean().optional(),
  draggable: z.boolean().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});