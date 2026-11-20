"use strict";

/**
 * Optional authentication scaffolding.
 *
 * MVP: authentication is OPTIONAL. If AUTH_REQUIRED !== "true", all requests
 * are treated as anonymous and `req.user` is set to null. When enabled, a
 * Bearer token is expected in Authorization header; verification uses a
 * simple shared-secret HMAC (HS256) if jsonwebtoken is available, otherwise
 * falls back to comparing against AUTH_TOKEN env (demo only).
 *
 * Secrets come from env only: AUTH_SECRET, AUTH_TOKEN.
 */

const crypto = require("crypto");

function isAuthRequired() {
  return String(process.env.AUTH_REQUIRED || "").toLowerCase() === "true";
}

function parseBearer(req) {
  const h = req.headers && req.headers.authorization;
  if (!h || typeof h !== "string") return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

function verifyToken(token) {
  if (!token) return null;
  // Try jsonwebtoken if installed.
  try {
    const jwt = require("jsonwebtoken");
    const secret = process.env.AUTH_SECRET;
    if (secret) {
      const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
      return payload && typeof payload === "object" ? payload : null;
    }
  } catch (e) {
    // fall through to demo comparison
  }
  // Demo fallback: constant-time compare against AUTH_TOKEN.
  const expected = process.env.AUTH_TOKEN;
  if (expected && token.length === expected.length) {
    try {
      if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
        return { sub: "demo", role: "admin" };
      }
    } catch (e) {
      /* ignore */
    }
  }
  return null;
}

// Optional auth: never blocks, sets req.user if valid.
function authenticate(req, res, next) {
  const token = parseBearer(req);
  const user = token ? verifyToken(token) : null;
  req.user = user;
  // If auth required and no valid user -> 401
  if (isAuthRequired() && !user) {
    return res.status(401).json({ error: "Authentication required", requestId: req.id });
  }
  return next();
}

// Strict auth: blocks anonymous.
function requireAuth(req, res, next) {
  const token = parseBearer(req);
  const user = token ? verifyToken(token) : null;
  if (!user) {
    return res.status(401).json({ error: "Authentication required", requestId: req.id });
  }
  req.user = user;
  return next();
}

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required", requestId: req.id });
    }
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role].filter(Boolean);
    if (!roles.includes(role) && req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden", requestId: req.id });
    }
    return next();
  };
}

module.exports = {
  authenticate,
  requireAuth,
  requireRole,
  verifyToken,
  isAuthRequired,
};