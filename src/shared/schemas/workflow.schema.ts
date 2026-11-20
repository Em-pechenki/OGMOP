import { z } from "zod";
import { flowNodeSchema, flowEdgeSchema } from "./node.schema";

export const workflowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().int().positive().optional(),
  templateId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});