import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/response.js";
import { startRun } from "../services/run.service.js";

export const runCi = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const workflowId = req.params?.id || body.workflowId || body.workflow_id || body.id;
  if (!workflowId) return sendError(res, "workflowId is required", 400);
  const input = { ...(body.input || {}), source: "ci", branch: body.branch, repo: body.repo };
  const run = startRun(workflowId, input);
  if (!run) return sendError(res, "Workflow not found", 404);
  return sendSuccess(res, { runId: run.id, source: "ci" }, 202);
});

export default { runCi };