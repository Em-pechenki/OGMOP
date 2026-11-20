import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnimatedEdge } from "../../src/frontend/components/edges/AnimatedEdge";

describe("fe AnimatedEdge", () => {
  it("renders without crashing", () => {
    const props: any = {
      id: "e1",
      sourceX: 0,
      sourceY: 0,
      targetX: 100,
      targetY: 100,
      sourcePosition: "right",
      targetPosition: "left",
    };
    const { container } = render(<AnimatedEdge {...props} />);
    expect(container).toBeTruthy();
  });
});