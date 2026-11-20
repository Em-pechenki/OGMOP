import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";

import EditorPage from "../../src/frontend/pages/EditorPage";
import RunDetailPage from "../../src/frontend/pages/RunDetailPage";
import HomePage from "../../src/frontend/pages/HomePage";

describe("FE: pages", () => {
  it("renders EditorPage", async () => {
    render(
      React.createElement(MemoryRouter, null, React.createElement(EditorPage))
    );
    expect(await screen.findByText("Конструктор workflow")).toBeInTheDocument();
  });

  it("renders RunDetailPage", () => {
    render(
      React.createElement(MemoryRouter, { initialEntries: ["/run/123"] }, React.createElement(RunDetailPage))
    );
    expect(screen.getByRole("heading", { name: /Запуск/i })).toBeInTheDocument();
  });

  it("renders HomePage", async () => {
    render(
      React.createElement(MemoryRouter, null, React.createElement(HomePage))
    );
    expect(await screen.findByText("Cyber Garden 2026")).toBeInTheDocument();
  });
});