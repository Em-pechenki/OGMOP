import { describe, it, expect } from "vitest";
import {
  WorkflowCreateSchema,
  IdParamSchema,
  PositionSchema,
} from "../../src/backend/validators/workflow.validator.js";

describe("backend validators", () => {
  it("accepts valid workflow", () => {
    const res = WorkflowCreateSchema.safeParse({ name: "t", nodes: [], edges: [] });
    expect(res.success).toBe(true);
  });

  it("rejects invalid nodes", () => {
    const res = WorkflowCreateSchema.safeParse({ nodes: "nope" });
    expect(res.success).toBe(false);
  });

  it("validates id param", () => {
    expect(IdParamSchema.safeParse({ id: "abc" }).success).toBe(true);
    expect(IdParamSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("validates position", () => {
    expect(PositionSchema.safeParse({ x: 1, y: 2 }).success).toBe(true);
    expect(PositionSchema.safeParse({ x: "a", y: 2 }).success).toBe(false);
  });
});
