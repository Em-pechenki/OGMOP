/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/backend/server.js";

const app = createApp();

describe("E2E: AI generation", () => {
  it("generates workflow from description via /api/workflows/generate", async () => {
    const res = await request(app).post("/api/workflows/generate").send({
      description: "проверить репозиторий на секреты и уязвимые зависимости, уведомить в Telegram",
      scanners: ["secrets", "sca"],
      notify: "telegram",
      ai: true,
    });
    expect(res.status).toBe(201);
    const wf = res.body.data.workflow;
    expect(wf).toBeTruthy();
    expect(wf.name).toBeTruthy();
    expect(Array.isArray(wf.nodes)).toBe(true);
    expect(wf.nodes.length).toBeGreaterThan(0);
    expect(Array.isArray(wf.edges)).toBe(true);
    expect(wf.nodes.some((n: any) => n.type === "scanner")).toBe(true);
  });

  it("generates via /api/generate", async () => {
    const res = await request(app).post("/api/generate").send({ prompt: "scan secrets and notify" });
    expect(res.status).toBe(200);
    expect(res.body.data.nodes).toBeTruthy();
    expect(Array.isArray(res.body.data.nodes)).toBe(true);
  });

  it("validation 400 for short description", async () => {
    const res = await request(app).post("/api/workflows/generate").send({ description: "ab" });
    expect(res.status).toBe(400);
  });
});