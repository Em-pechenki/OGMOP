import { describe, it, expect, vi, beforeEach } from "vitest";

const { postMock, getMock } = vi.hoisted(() => ({ postMock: vi.fn(), getMock: vi.fn() }));
vi.mock("@frontend/services/api", () => ({
  api: { post: postMock, get: getMock, interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
  default: { post: postMock, get: getMock, interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));

import { runWorkflow } from "../../src/frontend/services/workflowRunner";
import { useRunStore } from "../../src/frontend/store/runStore";

describe("fe workflowRunner", () => {
  beforeEach(() => {
    postMock.mockReset();
    getMock.mockReset();
    useRunStore.getState().reset();
  });

  it("runs workflow and polls to success", async () => {
    postMock.mockResolvedValue({ data: { data: { runId: "run-1" } } });
    getMock
      .mockResolvedValueOnce({ data: { data: { status: "running", nodeStatuses: {}, nodeResults: {}, findings: [], aiReport: null, error: null, startedAt: "s", finishedAt: null } } })
      .mockResolvedValueOnce({ data: { data: { status: "success", nodeStatuses: { n1: "success" }, nodeResults: {}, findings: [], aiReport: null, error: null, startedAt: "s", finishedAt: "f" } } });

    const id = await runWorkflow("wf-1", { pollIntervalMs: 1 });
    expect(id).toBe("run-1");
    expect(useRunStore.getState().status).toBe("success");
  });

  it("throws if no runId", async () => {
    postMock.mockResolvedValue({ data: { data: {} } });
    await expect(runWorkflow("wf-2", { pollIntervalMs: 1 })).rejects.toThrow();
  });
});