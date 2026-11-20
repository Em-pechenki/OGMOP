import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TemplatesPage } from "../../src/frontend/pages/TemplatesPage";
import { ServerErrorPage } from "../../src/frontend/pages/ServerErrorPage";
import { NotFoundPage } from "../../src/frontend/pages/NotFoundPage";
import { HomePage } from "../../src/frontend/pages/HomePage";

describe("fe pages extra", () => {
  it("renders TemplatesPage", () => {
    render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
    expect(screen.getByText(/Библиотека шаблонов/i)).toBeInTheDocument();
  });
  it("renders ServerErrorPage", () => {
    render(<MemoryRouter><ServerErrorPage /></MemoryRouter>);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });
  it("renders NotFoundPage", () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getAllByText(/404|не найдена/i).length).toBeGreaterThan(0);
  });
  it("renders HomePage", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(document.body).toBeTruthy();
  });
});