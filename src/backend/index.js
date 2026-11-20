import { createApp } from "./server.js";
import { logger } from "./utils/logger.js";

const app = createApp();
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.info(`OGMOP backend on :${PORT}`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
  // force exit if not closed in time
  setTimeout(() => {
    logger.warn("Forced shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  logger.error(err);
});
process.on("unhandledRejection", (reason) => {
  logger.error(reason instanceof Error ? reason : new Error(String(reason)));
});

export default app;