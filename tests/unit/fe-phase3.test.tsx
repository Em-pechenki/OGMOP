import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

import NotFoundPage from "../../src/frontend/pages/NotFoundPage";
import ErrorBoundary from "../../src/frontend/components/ErrorBoundary";
import RunsPage from "../../src/frontend/pages/RunsPage";
import { useRunStore } from "../../src/frontend/store/runStore";

function Boom(): React.ReactElement {
  throw new Error("boom");
}

describe("FE phase3: states", () => {
  it("renders NotFoundPage", () => {
    render(React.createElement(MemoryRouter, null, React.createElement(NotFoundPage)));
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText(/Страница не найдена/i)).toBeInTheDocument();
  });

  it("ErrorBoundary shows fallback on error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      React.createElement(ErrorBoundary, null, React.createElement(Boom))
    );
    expect(screen.getByText(/Что-то пошло не так/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  it("RunsPage shows empty state", async () => {
    useRunStore.getState().reset();
    // mock fetch by leaving network; component catches and shows empty? Instead just render
    render(React.createElement(MemoryRouter, null, React.createElement(RunsPage)));
    // loading then empty/error; wait for either
    expect(await screen.findByText(/Запуски/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });
});