import express from "express";
import { applySecurity } from "./middleware/security.middleware.js";
import { notFoundHandler, errorHandler } from "./middleware/error-handler.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import runRoutes from "./routes/run.routes.js";
import templateRoutes from "./routes/template.routes.js";
import generateRoutes from "./routes/generate.routes.js";
import ciRoutes from "./routes/ci.routes.js";

export function createApp() {
  const app = express();

  // Security middleware (SEC): helmet, CORS, rate-limit, body limits, request-id.
  applySecurity(app);

  // routes
  app.use("/api", healthRoutes);
  app.use("/api/workflows", workflowRoutes);
  app.use("/api", runRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/generate", generateRoutes);
  app.use("/api", generateRoutes);
  app.use("/api/ci", ciRoutes);
  app.use("/api", ciRoutes);

  // 404 + error handler (unified { data, error } format)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
