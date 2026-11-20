import { sendError } from "../utils/response.js";

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return sendError(res, "Validation failed", 400, result.error.flatten());
    }
    req.body = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params ?? {});
    if (!result.success) {
      return sendError(res, "Invalid params", 400, result.error.flatten());
    }
    req.params = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query ?? {});
    if (!result.success) {
      return sendError(res, "Invalid query", 400, result.error.flatten());
    }
    req.query = result.data;
    next();
  };
}
