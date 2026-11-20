import { sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req, res) {
  const details = req && req.id ? { requestId: req.id } : null;
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, details);
}

// Note: sendError signature is (res, message, status, details). We'll pass details with requestId.
export function errorHandler(err, req, res, _next) {
  const status = err && (err.status || err.statusCode) ? err.status || err.statusCode : 500;
  const code = status >= 400 && status < 600 ? status : 500;
  const message = err && err.message ? err.message : "Internal server error";
  const safeMessage = code >= 500 ? "Internal server error" : message;

  logger.error(err instanceof Error ? err : new Error(String(message)), {
    requestId: req && req.id,
    status: code,
  });

  const details = { requestId: req && req.id };
  if (process.env.NODE_ENV !== "production" && code >= 500 && err && err.stack) {
    details.stack = err.stack;
  }
  if (err && err.details) details.validation = err.details;

  return sendError(res, safeMessage, code, details);
}