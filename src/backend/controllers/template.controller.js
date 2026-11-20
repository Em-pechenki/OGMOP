import { sendSuccess, sendError } from "../utils/response.js";
import { templateService } from "../services/template.service.js";
import { asyncHandler } from "../utils/response.js";

export const createTemplate = asyncHandler(async (req, res) => {
  const t = templateService.create(req.body);
  return sendSuccess(res, t, 201);
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const t = templateService.update(req.params.id, req.body);
  if (!t) return sendError(res, "Template not found", 404);
  return sendSuccess(res, t);
});

export const getTemplate = asyncHandler(async (req, res) => {
  const t = templateService.getById(req.params.id);
  if (!t) return sendError(res, "Template not found", 404);
  return sendSuccess(res, t);
});

export const listTemplates = asyncHandler(async (_req, res) => {
  return sendSuccess(res, templateService.list());
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const ok = templateService.remove(req.params.id);
  if (!ok) return sendError(res, "Template not found", 404);
  return sendSuccess(res, { deleted: true });
});
