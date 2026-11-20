import { sendError } from "../utils/response.js";

export function notFoundHandler(req, res) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error("[error]", err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : "Internal server error";
  return sendError(res, message, status);
}
