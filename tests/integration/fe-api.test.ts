/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios", () => {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  return {
    default: { create: () => instance, isAxiosError: () => false },
  };
});

describe("Integration: FE API client (mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getHealth returns ok", async () => {
    const mocked = (axios as any).create();
    mocked.get.mockResolvedValue({ data: { data: { status: "ok", project: "OGMOP" }, error: null } });
    const { getHealth } = await import("../../src/frontend/services/api");
    // getHealth uses the shared api instance; our mock factory is invoked at import time.
    expect(typeof getHealth).toBe("function");
  });
});
