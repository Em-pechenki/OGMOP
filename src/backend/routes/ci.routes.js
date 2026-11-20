import { Router } from "express";
import { runCi } from "../controllers/ci.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { CiRunSchema } from "../validators/workflow.validator.js";

const router = Router();
router.post("/", validateBody(CiRunSchema), runCi);
router.post("/run", validateBody(CiRunSchema), runCi);
router.post("/runs", validateBody(CiRunSchema), runCi);
router.post("/ci", validateBody(CiRunSchema), runCi);
router.post("/ci/run", validateBody(CiRunSchema), runCi);
router.post("/ci/runs", validateBody(CiRunSchema), runCi);
export default router;