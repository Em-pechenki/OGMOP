// Structured logger (console-based, pino-compatible-ish).
// Outputs one JSON object per line to stdout/stderr. Never logs secrets by design:
// callers should pass redacted data; helpers in utils/secrets.js can redact.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel = (process.env.LOG_LEVEL || "info").toLowerCase();
const minRank = LEVELS[minLevel] ?? LEVELS.info;

function write(level, message, meta) {
  if ((LEVELS[level] ?? 99) < minRank) return;
  const entry = {
    level,
    time: new Date().toISOString(),
    msg: typeof message === "string" ? message : undefined,
  };
  if (meta && typeof meta === "object") {
    // merge meta, but never overwrite level/time/msg with undefined
    for (const [k, v] of Object.entries(meta)) {
      if (v !== undefined) entry[k] = v;
    }
  }
  if (message !== null && typeof message !== "string") {
    entry.msg = message instanceof Error ? message.message : String(message);
    if (message instanceof Error && message.stack) entry.stack = message.stack;
  }
  const line = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (message, meta) => write("debug", message, meta),
  info: (message, meta) => write("info", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  error: (message, meta) => write("error", message, meta),
  child(bindings) {
    const base = bindings || {};
    return {
      debug: (m, meta) => write("debug", m, { ...base, ...(meta || {}) }),
      info: (m, meta) => write("info", m, { ...base, ...(meta || {}) }),
      warn: (m, meta) => write("warn", m, { ...base, ...(meta || {}) }),
      error: (m, meta) => write("error", m, { ...base, ...(meta || {}) }),
    };
  },
};

export default logger;