import { Router } from "express";
import { generateWorkflow } from "../controllers/generate.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { GenerateScenarioSchema } from "../validators/workflow.validator.js";

const router = Router();
router.post("/", validateBody(GenerateScenarioSchema), generateWorkflow);
router.post("/generate", validateBody(GenerateScenarioSchema), generateWorkflow);
router.post("/scenario", validateBody(GenerateScenarioSchema), generateWorkflow);
export default router;