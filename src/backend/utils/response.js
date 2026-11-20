// Unified response helpers: { data, error }

export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ data, error: null });
}

export function sendError(res, message, status = 400, details = null) {
  const payload = { data: null, error: message };
  if (details) payload.details = details;
  return res.status(status).json(payload);
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
