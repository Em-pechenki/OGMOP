import { z } from "zod";
import { severitySchema, findingSchema } from "./finding.schema";
import { aiReportSchema } from "./llm.schema";

export const notifyChannelSchema = z.enum(["telegram", "smtp", "webhook"]);

export const notifyConfigSchema = z.object({
  channel: notifyChannelSchema,
  botToken: z.string().optional(),
  chatId: z.string().optional(),
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  secure: z.boolean().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  from: z.string().optional(),
  to: z.array(z.string()).optional(),
  subject: z.string().optional(),
  url: z.string().optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH"]).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  bodyTemplate: z.string().optional(),
});

export const notificationPayloadSchema = z.object({
  channel: notifyChannelSchema.optional(),
  title: z.string().optional(),
  message: z.string().min(1),
  summary: z.string().optional(),
  severity: severitySchema.optional(),
  findings: z.array(findingSchema).optional(),
  aiReport: aiReportSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().optional(),
});