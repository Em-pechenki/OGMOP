import { Router } from "express";
import { runWorkflow, getRun } from "../controllers/run.controller.js";
import { validateParams, validateBody } from "../middleware/validate.middleware.js";
import { IdParamSchema, WorkflowRunSchema } from "../validators/workflow.validator.js";

const router = Router();

router.post("/workflows/:id/run", validateParams(IdParamSchema), validateBody(WorkflowRunSchema), runWorkflow);
router.get("/runs/:id", validateParams(IdParamSchema), getRun);

export default router;
