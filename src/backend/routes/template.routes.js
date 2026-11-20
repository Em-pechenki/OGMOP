import { Router } from "express";
import {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  copyTemplate,
} from "../controllers/template.controller.js";
import { validateBody, validateParams } from "../middleware/validate.middleware.js";
import {
  TemplateCreateSchema,
  TemplateUpdateSchema,
  IdParamSchema,
} from "../validators/workflow.validator.js";

const router = Router();

router.get("/", listTemplates);
router.post("/", validateBody(TemplateCreateSchema), createTemplate);
router.post("/:id/copy", validateParams(IdParamSchema), copyTemplate);
router.get("/:id", validateParams(IdParamSchema), getTemplate);
router.patch(
  "/:id",
  validateParams(IdParamSchema),
  validateBody(TemplateUpdateSchema),
  updateTemplate
);
router.put(
  "/:id",
  validateParams(IdParamSchema),
  validateBody(TemplateUpdateSchema),
  updateTemplate
);
router.delete("/:id", validateParams(IdParamSchema), deleteTemplate);

export default router;
