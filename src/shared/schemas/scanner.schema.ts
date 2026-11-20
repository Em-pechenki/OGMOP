import { z } from "zod";

export const scannerTypeSchema = z.enum(["secrets", "sca", "sast"]);

export const scanConfigSchema = z.object({
  scannerType: scannerTypeSchema,
  targetPath: z.string().optional(),
  repoUrl: z.string().optional(),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  options: z.record(z.string(), z.unknown()).optional(),
});