import { z } from "zod";

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

export const edgeSchema = flowEdgeSchema;