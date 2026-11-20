import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";

import HomePage from "../../src/frontend/pages/HomePage";

describe("FE: HomePage", () => {
  it("renders hero and features", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByText("Cyber Garden 2026")).toBeInTheDocument();
    expect(screen.getByText(/AI Security Workflow/i)).toBeInTheDocument();
    expect(screen.getByText("Визуальный конструктор")).toBeInTheDocument();
    expect(screen.getByText("Сканеры безопасности")).toBeInTheDocument();
    expect(screen.getByText("AI-анализ")).toBeInTheDocument();
  });

  it("navigates to editor", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<div>Editor route</div>} />
        </Routes>
      </MemoryRouter>
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Открыть редактор/i));
    await waitFor(() => expect(screen.getByText("Editor route")).toBeInTheDocument());
  });

  it("navigates to templates", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/templates" element={<div>Templates route</div>} />
        </Routes>
      </MemoryRouter>
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Все шаблоны/i));
    await waitFor(() => expect(screen.getByText("Templates route")).toBeInTheDocument());
  });
});
