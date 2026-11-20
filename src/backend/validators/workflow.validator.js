import { z } from "zod";

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: PositionSchema.optional(),
  data: z.record(z.any()).optional().default({}),
});

export const EdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
});

export const WorkflowCreateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  nodes: z.array(NodeSchema).optional().default([]),
  edges: z.array(EdgeSchema).optional().default([]),
});

export const WorkflowUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  nodes: z.array(NodeSchema).optional(),
  edges: z.array(EdgeSchema).optional(),
});

export const WorkflowRunSchema = z.object({
  input: z
    .record(z.any())
    .optional()
    .default({})
    .refine((obj) => {
      if (!obj || typeof obj !== "object") return true;
      const rp = obj.repoPath;
      if (rp === undefined) return true;
      if (typeof rp !== "string") return false;
      if (rp.includes("\0")) return false;
      const normalized = rp.replace(/\\\\/g, "/");
      if (normalized.split("/").includes("..")) return false;
      return true;
    }, { message: "Invalid repoPath" }),
});

export const TemplateCreateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  workflow: z.any().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().max(100).optional(),
});

export const TemplateUpdateSchema = TemplateCreateSchema;

export const IdParamSchema = z.object({
  id: z.string().min(1),
});

export const WorkflowGenerateSchema = z.object({
  description: z.string().min(3).max(2000),
  name: z.string().min(1).max(200).optional(),
  language: z.string().max(64).optional(),
  scanners: z.array(z.string()).optional(),
  notify: z.string().max(32).optional(),
  ai: z.boolean().optional(),
});
