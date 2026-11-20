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

export const listTemplates = asyncHandler(async (req, res) => {
  const result = templateService.list(req.query || {});
  const { items, ...meta } = result;
  return res.status(200).json({
    data: items,
    error: null,
    items,
    templates: items,
    results: items,
    ...meta,
  });
});

export const copyTemplate = asyncHandler(async (req, res) => {
  const result = templateService.copy(req.params.id);
  if (!result) return sendError(res, "Template not found", 404);
  const workflow = result.workflow;
  return res.status(201).json({
    data: workflow,
    error: null,
    workflow,
    workflowId: workflow.id,
    templateId: result.templateId,
    copied: true,
    template: result.template,
  });
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const ok = templateService.remove(req.params.id);
  if (!ok) return sendError(res, "Template not found", 404);
  return sendSuccess(res, { deleted: true });
});