import { sendSuccess } from "../utils/response.js";

export function healthController(req, res) {
  return sendSuccess(res, {
    status: "ok",
    project: "OGMOP",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
