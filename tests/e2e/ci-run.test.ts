/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/backend/server.js";

const app = createApp();

describe("E2E: CI/CD run", () => {
  it("creates workflow and triggers ci run", async () => {
    const create = await request(app).post("/api/workflows").send({ name: "ci-e2e", nodes: [{ id: "n1", type: "trigger.manual", data: {} }], edges: [] });
    expect(create.status).toBe(201);
    const workflowId = create.body.data.id;

    const res = await request(app).post("/api/ci/run").send({ workflowId });
    expect(res.status).toBe(202);
    expect(res.body.data.runId).toBeTruthy();
    expect(res.body.data.source).toBe("ci");

    const runId = res.body.data.runId;
    let status = "queued";
    for (let i = 0; i < 20; i++) {
      const r = await request(app).get(`/api/runs/${runId}`);
      status = r.body.data.status;
      if (status === "success" || status === "failed") break;
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(status).toBe("success");
  });

  it("ci run 404 for unknown workflow", async () => {
    const res = await request(app).post("/api/ci/run").send({ workflowId: "does-not-exist" });
    expect(res.status).toBe(404);
  });

  it("ci run validation 400 without workflowId", async () => {
    const res = await request(app).post("/api/ci/run").send({});
    expect(res.status).toBe(400);
  });
});