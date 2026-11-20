import { Router } from "express";
import { runCi } from "../controllers/ci.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { z } from "zod";

const CiRunSchema = z.object({
  workflowId: z.string().min(1).optional(),
  workflow_id: z.string().min(1).optional(),
  id: z.string().min(1).optional(),
  branch: z.string().optional(),
  repo: z.string().optional(),
  input: z.record(z.any()).optional().default({}),
}).passthrough().refine((o) => o.workflowId || o.workflow_id || o.id, { message: "workflowId required" });

const router = Router();
router.post("/", validateBody(CiRunSchema), runCi);
router.post("/run", validateBody(CiRunSchema), runCi);
router.post("/runs", validateBody(CiRunSchema), runCi);
router.post("/ci", validateBody(CiRunSchema), runCi);
router.post("/ci/run", validateBody(CiRunSchema), runCi);
router.post("/ci/runs", validateBody(CiRunSchema), runCi);
export default router;