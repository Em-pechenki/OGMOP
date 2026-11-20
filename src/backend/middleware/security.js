"use strict";

/**
 * Security middleware bundle for OGMOP backend.
 *
 * Usage:
 *   const { applySecurity, errorHandler } = require("./middleware/security");
 *   applySecurity(app);          // helmet, CORS, rate-limit, body limits, request-id
 *   // ... register routes ...
 *   app.use(errorHandler);       // must be LAST
 */

const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

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
  // Safe dev defaults only; production must set CORS_ORIGINS.
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:4173"];
}

function buildCorsOriginChecker() {
  const allowed = getAllowedOrigins();
  return function originChecker(origin, cb) {
    // No Origin header (same-origin, curl, server-to-server) — allow.
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    // In dev, be permissive for localhost origins only.
    if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    const err = new Error("CORS: origin not allowed");
    err.status = 403;
    return cb(err);
  };
}

function applySecurity(app, options) {
  options = options || {};
  app.set("trust proxy", process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 1);

  const allowedOrigins = getAllowedOrigins();

  // Helmet + CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", ...allowedOrigins, "https://api.openai.com", "https://api.anthropic.com"],
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

  // CORS
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

  // Rate limiting
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
      message: { data: null, error: "Too many requests, please try again later." },
    })
  );
  // Stricter limit for auth endpoints (if any).
  app.use(
    ["/api/auth", "/api/login", "/api/register"],
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: authMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { data: null, error: "Too many authentication attempts." },
    })
  );

  // Body size limits
  const bodyLimit = process.env.BODY_LIMIT || "1mb";
  app.use(require("express").json({ limit: bodyLimit }));
  app.use(require("express").urlencoded({ extended: true, limit: bodyLimit, parameterLimit: 1000 }));

  // Request id + hardening headers
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

function errorHandler(err, req, res, _next) {
  const status = err && (err.status || err.statusCode) ? err.status || err.statusCode : 500;
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    // eslint-disable-next-line no-console
    console.error("[security:error]", req && req.id, err && err.stack ? err.stack : err);
  } else {
    // eslint-disable-next-line no-console
    console.error("[security:error]", req && req.id, err && err.message);
  }

  // CORS errors → 403
  let code = status;
  if (err && /CORS/.test(err.message || "")) code = 403;

  const message = code >= 500 ? "Internal server error" : err && err.message ? err.message : "Error";
  const body = { data: null, error: message, requestId: req && req.id };
  if (!isProd && code >= 500 && err && err.stack) body.stack = err.stack;
  res.status(code).json(body);
}

module.exports = {
  applySecurity,
  errorHandler,
  getAllowedOrigins,
};