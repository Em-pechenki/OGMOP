import { z } from "zod";

export const severitySchema = z.enum(["critical", "high", "medium", "low", "info"]);

export const findingSchema = z.object({
  id: z.string().min(1),
  severity: severitySchema,
  title: z.string().min(1),
  description: z.string().optional(),
  file: z.string().optional(),
  line: z.number().int().positive().optional(),
  column: z.number().int().positive().optional(),
  ruleId: z.string().optional(),
  scanner: z.enum(["secrets", "sca", "sast"]).optional(),
  cve: z.string().optional(),
  packageName: z.string().optional(),
  package: z.string().optional(),
  version: z.string().optional(),
  fixedVersion: z.string().optional(),
  recommendation: z.string().optional(),
  snippet: z.string().optional(),
});

export const scanFindingSchema = findingSchema;