import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { workflowSchema } from "../../src/shared/schemas/workflow.schema";

describe("seed data", () => {
  it("demo-workflow.json parses and validates", () => {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "src/backend/seed/demo-workflow.json"), "utf8");
    const json = JSON.parse(raw);
    const res = workflowSchema.safeParse(json);
    if (!res.success) console.error(res.error);
    expect(res.success).toBe(true);
  });

  it("cve-database.json parses as array", () => {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "src/backend/seed/cve-database.json"), "utf8");
    const json = JSON.parse(raw);
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBeGreaterThan(0);
    for (const e of json) {
      expect(typeof e.id).toBe("string");
      expect(typeof e.package).toBe("string");
      expect(typeof e.severity).toBe("string");
      expect(typeof e.fixedVersion).toBe("string");
    }
  });
});
