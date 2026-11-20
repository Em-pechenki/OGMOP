/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { Button } from "../../src/frontend/components/ui/Button";

// axe-core is optional; if not installed, these tests are skipped.
let axe: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  axe = require("axe-core");
} catch {
  axe = null;
}

const hasAxe = !!axe;

describe("A11y (optional axe)", () => {
  if (!hasAxe) {
    it.skip("axe-core not installed - skipped", () => {});
    return;
  }

  it("Button has no axe violations", async () => {
    const { container } = render(React.createElement(Button, null, "Click me"));
    const runner = axe as { run: (c: unknown) => Promise<{ violations: unknown[] }> };
    const results = await runner.run(container);
    expect(results.violations).toHaveLength(0);
  });
});