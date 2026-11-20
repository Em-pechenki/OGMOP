import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@frontend/services/api", () => ({
  api: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
  default: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import TemplatesPage from "../../src/frontend/pages/TemplatesPage";

describe("fe TemplatesPage", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("renders templates from API", async () => {
    getMock.mockResolvedValue({ data: { data: [{ id: "t1", name: "Tpl", description: "d", workflow: { nodes: [], edges: [] }, isPublic: false }] } });
    render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Tpl")).toBeInTheDocument());
  });

  it("shows empty state on no templates", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });
    render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Шаблоны не найдены/i)).toBeInTheDocument());
  });

  it("creates template", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });
    postMock.mockResolvedValue({ data: { data: { id: "t2" } } });
    render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
    await waitFor(() => screen.getAllByText(/Создать шаблон/i).length > 0);
    fireEvent.click(screen.getAllByText(/Создать шаблон/i)[0]);
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "New" } });
    fireEvent.click(screen.getByText(/^Создать$/i));
    await waitFor(() => expect(postMock).toHaveBeenCalled());
  });
});