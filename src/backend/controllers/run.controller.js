import { sendSuccess, sendError } from "../utils/response.js";
import { startRun, getRunStatus } from "../services/run.service.js";
import { asyncHandler } from "../utils/response.js";

export const runWorkflow = asyncHandler(async (req, res) => {
  const run = startRun(req.params.id, req.body && req.body.input);
  if (!run) return sendError(res, "Workflow not found", 404);
  return sendSuccess(res, { runId: run.id }, 202);
});

export const getRun = asyncHandler(async (req, res) => {
  const run = getRunStatus(req.params.id);
  if (!run) return sendError(res, "Run not found", 404);
  return sendSuccess(res, run);
});
