import { Router } from "express";
import {
  createTemplate,
  getTemplate,
  listTemplates,
  deleteTemplate,
} from "../controllers/template.controller.js";
import { validateBody, validateParams } from "../middleware/validate.middleware.js";
import { TemplateCreateSchema, IdParamSchema } from "../validators/workflow.validator.js";

const router = Router();

router.get("/", listTemplates);
router.post("/", validateBody(TemplateCreateSchema), createTemplate);
router.get("/:id", validateParams(IdParamSchema), getTemplate);
router.delete("/:id", validateParams(IdParamSchema), deleteTemplate);

export default router;
