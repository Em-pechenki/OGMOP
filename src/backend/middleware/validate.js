"use strict";

const { z } = require("zod");

/**
 * Zod validation middleware factory.
 *
 * Usage:
 *   const { validate } = require("./validate");
 *   router.post("/x", validate(bodySchema), handler);
 *   router.get("/y", validate({ query: querySchema, params: paramsSchema }), handler);
 *
 * On failure responds 400 with { error, issues: [{ path, message, code }] }.
 * On success replaces req.body/query/params with parsed (coerced/trimmed) data.
 */

function formatIssues(err) {
  return (err && err.issues ? err.issues : []).map((i) => ({
    path: Array.isArray(i.path) ? i.path.join(".") : String(i.path || ""),
    message: i.message,
    code: i.code,
  }));
}

function runSchema(schema, data) {
  if (!schema) return { success: true, data };
  return schema.safeParse(data);
}

function validate(input) {
  // Determine mode.
  const isMulti = input && typeof input === "object" && !("safeParse" in input) && ("body" in input || "query" in input || "params" in input);

  return function middleware(req, res, next) {
    if (!isMulti) {
      const schema = input;
      const result = runSchema(schema, req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Validation failed", issues: formatIssues(result.error) });
      }
      if (schema) req.body = result.data;
      return next();
    }

    // Multi-target validation
    const targets = ["body", "query", "params"];
    const collected = [];
    for (const t of targets) {
      if (!input[t]) continue;
      const result = runSchema(input[t], req[t]);
      if (!result.success) {
        for (const issue of formatIssues(result.error)) {
          collected.push({ target: t, ...issue });
        }
      } else {
        req[t] = result.data;
      }
    }
    if (collected.length) {
      return res.status(400).json({ error: "Validation failed", issues: collected });
    }
    return next();
  };
}

// Helpers to build common schemas reusing zod.
validate.z = z;

module.exports = { validate, z };