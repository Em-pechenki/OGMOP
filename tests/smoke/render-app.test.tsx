import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it } from "vitest";
import App from "../../src/frontend/App";

describe("render App", () => {
  it("renders without throwing", async () => {
    render(React.createElement(MemoryRouter, null, React.createElement(App)));
    await new Promise((r) => setTimeout(r, 2000));
    console.log("HTML:", document.body.innerHTML.slice(0, 800));
  });
});
