import { Router } from "express";
import { generateWorkflow } from "../controllers/generate.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { z } from "zod";

const GenerateSchema = z.object({
  prompt: z.string().min(3).max(2000),
  name: z.string().max(200).optional(),
  stack: z.string().optional(),
  scanners: z.array(z.string()).optional(),
  notify: z.string().optional(),
  notification: z.string().optional(),
  aiReport: z.boolean().optional(),
  targetPath: z.string().optional(),
  webhookUrl: z.string().optional(),
}).passthrough();

const router = Router();
router.post("/", validateBody(GenerateSchema), generateWorkflow);
router.post("/generate", validateBody(GenerateSchema), generateWorkflow);
router.post("/scenario", validateBody(GenerateSchema), generateWorkflow);
export default router;