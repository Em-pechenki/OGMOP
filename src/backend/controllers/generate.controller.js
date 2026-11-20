import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/response.js";
import { workflowService } from "../services/workflow.service.js";

export const generateWorkflow = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const prompt = body.prompt || body.description;
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return sendError(res, "prompt is required", 400);
  }
  if (prompt.length > 2000) {
    return sendError(res, "prompt too long", 400);
  }
  const wf = workflowService.generate({ description: prompt, ...body });
  return sendSuccess(res, { name: wf.name, nodes: wf.nodes, edges: wf.edges, warnings: wf.warnings || [] }, 200);
});

export default { generateWorkflow };