import express from "express";
import { securityMiddleware } from "./middleware/security.middleware.js";
import { notFoundHandler, errorHandler } from "./middleware/error-handler.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import runRoutes from "./routes/run.routes.js";
import templateRoutes from "./routes/template.routes.js";

export function createApp() {
  const app = express();

  // security + parsing
  securityMiddleware().forEach((m) => app.use(m));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // routes
  app.use("/api", healthRoutes);
  app.use("/api/workflows", workflowRoutes);
  app.use("/api", runRoutes);
  app.use("/api/templates", templateRoutes);

  // 404 + error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
