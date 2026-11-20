import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import express from "express";

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getAllowedOrigins() {
  const fromEnv = parseOrigins(
    process.env.CORS_ORIGINS || process.env.FRONTEND_ORIGIN || process.env.ALLOWED_ORIGINS
  );
  if (fromEnv.length) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:4173"];
}

function buildCorsOriginChecker() {
  const allowed = getAllowedOrigins();
  return function originChecker(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    const err = new Error("CORS: origin not allowed");
    err.status = 403;
    return cb(err);
  };
}

export function applySecurity(app, options) {
  options = options || {};
  app.set("trust proxy", process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 1);

  const allowedOrigins = getAllowedOrigins();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", ...allowedOrigins],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      strictTransportSecurity:
        process.env.NODE_ENV === "production"
          ? { maxAge: 31536000, includeSubDomains: true, preload: true }
          : false,
    })
  );

  app.use(
    cors({
      origin: buildCorsOriginChecker(),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
      maxAge: 600,
    })
  );

  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const max = Number(process.env.RATE_LIMIT_MAX) || 300;
  const authMax = Number(process.env.RATE_LIMIT_AUTH_MAX) || 20;
  app.use(
    "/api/",
    rateLimit({
      windowMs,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests, please try again later." },
    })
  );
  app.use(
    ["/api/auth", "/api/login", "/api/register"],
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: authMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many authentication attempts." },
    })
  );

  const bodyLimit = process.env.BODY_LIMIT || "1mb";
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: bodyLimit, parameterLimit: 1000 }));

  app.use((req, res, next) => {
    const id = req.headers["x-request-id"] || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    req.id = String(id);
    res.setHeader("X-Request-Id", req.id);
    res.removeHeader("X-Powered-By");
    next();
  });

  if (options.registerErrorHandler) {
    app.use(errorHandler);
  }
  return app;
}

export function errorHandler(err, req, res, _next) {
  const status = err && (err.status || err.statusCode) ? err.status || err.statusCode : 500;
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    console.error("[security:error]", req && req.id, err && err.stack ? err.stack : err);
  } else {
    console.error("[security:error]", req && req.id, err && err.message);
  }

  let code = status;
  if (err && /CORS/.test(err.message || "")) code = 403;

  const message = code >= 500 ? "Internal server error" : err && err.message ? err.message : "Error";
  const body = { error: message, requestId: req && req.id };
  if (!isProd && code >= 500 && err && err.stack) body.stack = err.stack;
  res.status(code).json(body);
}

export default { applySecurity, errorHandler, getAllowedOrigins };
