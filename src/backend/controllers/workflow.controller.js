import { sendSuccess, sendError } from "../utils/response.js";
import { workflowService } from "../services/workflow.service.js";
import { asyncHandler } from "../utils/response.js";

export const createWorkflow = asyncHandler(async (req, res) => {
  const wf = workflowService.create(req.body);
  return sendSuccess(res, wf, 201);
});

export const getWorkflow = asyncHandler(async (req, res) => {
  const wf = workflowService.getById(req.params.id);
  if (!wf) return sendError(res, "Workflow not found", 404);
  return sendSuccess(res, wf);
});

export const listWorkflows = asyncHandler(async (_req, res) => {
  return sendSuccess(res, workflowService.list());
});

export const updateWorkflow = asyncHandler(async (req, res) => {
  const wf = workflowService.update(req.params.id, req.body);
  if (!wf) return sendError(res, "Workflow not found", 404);
  return sendSuccess(res, wf);
});

export const deleteWorkflow = asyncHandler(async (req, res) => {
  const ok = workflowService.remove(req.params.id);
  if (!ok) return sendError(res, "Workflow not found", 404);
  return sendSuccess(res, { deleted: true });
});
