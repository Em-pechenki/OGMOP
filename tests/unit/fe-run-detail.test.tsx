import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock("@frontend/services/api", () => ({
  api: { get: getMock, post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
  default: { get: getMock, post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));

import RunDetailPage from "../../src/frontend/pages/RunDetailPage";

describe("fe RunDetailPage", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("renders run detail after load", async () => {
    getMock
      .mockResolvedValueOnce({ data: { data: { id: "r1", workflowId: "w1", status: "success", nodeStatuses: {}, nodeResults: {}, findings: [], aiReport: null, startedAt: "s", finishedAt: "f", error: null } } })
      .mockResolvedValueOnce({ data: { data: { id: "w1", name: "wf", nodes: [], edges: [] } } });
    render(<MemoryRouter initialEntries={["/run/r1"]}><RunDetailPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Запуск/i)).toBeInTheDocument());
  });
});