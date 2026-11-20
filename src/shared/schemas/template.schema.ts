import { z } from "zod";
import { workflowSchema } from "./workflow.schema";

export const templateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  workflow: workflowSchema,
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isPublic: z.boolean().optional(),
});