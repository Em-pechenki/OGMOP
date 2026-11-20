import { describe, it, expect } from "vitest";
import { flowNodeSchema, nodeTypeSchema } from "../../src/shared/schemas/node.schema";
import { findingSchema } from "../../src/shared/schemas/finding.schema";

describe("shared schemas", () => {
  it("validates node type", () => {
    expect(nodeTypeSchema.safeParse("scanner.secrets").success).toBe(true);
    expect(nodeTypeSchema.safeParse("nope").success).toBe(false);
  });

  it("validates flow node", () => {
    const node = {
      id: "n1",
      type: "trigger.manual",
      position: { x: 0, y: 0 },
      data: { kind: "trigger", triggerType: "manual", label: "t" },
    };
    expect(flowNodeSchema.safeParse(node).success).toBe(true);
  });

  it("validates finding", () => {
    const f = { id: "f1", severity: "high", title: "Leak" };
    expect(findingSchema.safeParse(f).success).toBe(true);
  });
});
