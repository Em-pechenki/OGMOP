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
  scanners: z.array(z.enum(["secrets", "sca", "sast"])).optional(),
  notify: z.enum(["none", "telegram", "smtp", "webhook", "email"]).optional(),
  ai: z.boolean().optional(),
});

export const GenerateScenarioSchema = z.object({
  prompt: z.string().min(3).max(2000),
  name: z.string().max(200).optional(),
  stack: z.string().max(64).optional(),
  scanners: z.array(z.enum(["secrets", "sca", "sast"])).optional(),
  notify: z.enum(["none", "telegram", "smtp", "webhook", "email"]).optional(),
  notification: z.enum(["none", "telegram", "smtp", "webhook", "email"]).optional(),
  aiReport: z.boolean().optional(),
  targetPath: z
    .string()
    .max(4096)
    .optional()
    .refine((p) => {
      if (p === undefined) return true;
      if (typeof p !== "string" || p.length === 0) return false;
      if (p.includes("\0")) return false;
      const normalized = p.replace(/\\/g, "/");
      if (normalized.split("/").includes("..")) return false;
      return true;
    }, { message: "Invalid targetPath" }),
  webhookUrl: z
    .string()
    .max(2048)
    .optional()
    .refine((u) => {
      if (u === undefined) return true;
      try {
        const url = new URL(String(u));
        if (url.protocol !== "http:" && url.protocol !== "https:") return false;
        if (url.username || url.password) return false;
        const host = url.hostname.toLowerCase();
        if (!host) return false;
        const allowLocal = process.env.NODE_ENV !== "production";
        const isPrivate =
          host === "localhost" ||
          host === "127.0.0.1" ||
          host === "::1" ||
          host.endsWith(".localhost") ||
          host === "0.0.0.0" ||
          host === "169.254.169.254" ||
          host === "metadata.google.internal" ||
          /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/.test(host) ||
          /^(fc|fd|fe80)/.test(host);
        if (isPrivate && !allowLocal) return false;
        return true;
      } catch {
        return false;
      }
    }, { message: "Invalid or unsafe webhookUrl" }),
});

export const CiRunSchema = z
  .object({
    workflowId: z.string().min(1).optional(),
    workflow_id: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    branch: z.string().max(200).optional(),
    repo: z
      .string()
      .max(200)
      .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
      .optional(),
    commitSha: z.string().max(64).optional(),
    prNumber: z.number().int().positive().optional(),
    title: z.string().max(500).optional(),
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
        const normalized = rp.replace(/\\/g, "/");
        if (normalized.split("/").includes("..")) return false;
        return true;
      }, { message: "Invalid repoPath" }),
  })
  .refine((o) => o.workflowId || o.workflow_id || o.id, { message: "workflowId required" });
