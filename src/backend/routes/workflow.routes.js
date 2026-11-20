import { Router } from "express";
import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
  generateWorkflow,
} from "../controllers/workflow.controller.js";
import { validateBody, validateParams } from "../middleware/validate.middleware.js";
import { WorkflowCreateSchema, WorkflowUpdateSchema, IdParamSchema, WorkflowGenerateSchema } from "../validators/workflow.validator.js";

const router = Router();

router.get("/", listWorkflows);
router.post("/generate", validateBody(WorkflowGenerateSchema), generateWorkflow);
router.post("/", validateBody(WorkflowCreateSchema), createWorkflow);
router.get("/:id", validateParams(IdParamSchema), getWorkflow);
router.put("/:id", validateParams(IdParamSchema), validateBody(WorkflowUpdateSchema), updateWorkflow);
router.patch("/:id", validateParams(IdParamSchema), validateBody(WorkflowUpdateSchema), updateWorkflow);
router.delete("/:id", validateParams(IdParamSchema), deleteWorkflow);

export default router;
