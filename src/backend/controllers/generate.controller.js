import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/response.js";
import { generateScenario } from "../services/generate.service.js";

export const generateWorkflow = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const prompt = body.prompt;
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return sendError(res, "prompt is required", 400);
  }
  if (prompt.length > 2000) {
    return sendError(res, "prompt too long", 400);
  }
  const result = generateScenario(body);
  return sendSuccess(res, result, 200);
});

export default { generateWorkflow };