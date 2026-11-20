import { z } from "zod";
import { findingSchema } from "./finding.schema";

export const scannerTypeSchema = z.enum(["secrets", "sca", "sast"]);

const baseScannerConfigSchema = z.object({
  targetPath: z.string().optional(),
  repoUrl: z.string().optional(),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  options: z.record(z.string(), z.unknown()).optional(),
});

export const secretsScannerConfigSchema = baseScannerConfigSchema.extend({
  scannerType: z.literal("secrets"),
  rules: z.array(z.string()).optional(),
  maxFileSizeBytes: z.number().int().positive().optional(),
  entropyThreshold: z.number().optional(),
});

export const scaScannerConfigSchema = baseScannerConfigSchema.extend({
  scannerType: z.literal("sca"),
  dependenciesFile: z.string().optional(),
  cveDatabasePath: z.string().optional(),
  ecosystem: z.enum(["maven", "gradle", "npm", "pip"]).optional(),
});

export const sastScannerConfigSchema = baseScannerConfigSchema.extend({
  scannerType: z.literal("sast"),
  language: z.enum(["kotlin", "java", "typescript", "javascript"]).optional(),
  rules: z.array(z.string()).optional(),
  framework: z.enum(["spring-boot", "express", "react", "none"]).optional(),
});

export const scannerConfigSchema = z.discriminatedUnion("scannerType", [
  secretsScannerConfigSchema,
  scaScannerConfigSchema,
  sastScannerConfigSchema,
]);

// Backwards-compatible aliases.
export const scanConfigSchema = scannerConfigSchema;
export const secretsScanConfigSchema = secretsScannerConfigSchema;
export const scaScanConfigSchema = scaScannerConfigSchema;
export const sastScanConfigSchema = sastScannerConfigSchema;

export const scanResultSchema = z.object({
  id: z.string().optional(),
  scanner: scannerTypeSchema,
  scannerType: scannerTypeSchema.optional(),
  status: z.enum(["pending", "running", "success", "error", "cancelled"]).optional(),
  findings: z.array(findingSchema),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  durationMs: z.number().optional(),
  summary: z.string().optional(),
  error: z.string().optional(),
  targetPath: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

