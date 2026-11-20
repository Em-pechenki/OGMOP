import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/backend/server.js";

const app = createApp();

describe("backend api", () => {
  it("GET /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ok");
    expect(res.body.error).toBeNull();
  });

  it("POST /api/workflows creates workflow", async () => {
    const res = await request(app)
      .post("/api/workflows")
      .send({ name: "t", nodes: [], edges: [] });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeTruthy();
    expect(res.body.data.name).toBe("t");
  });

  it("GET /api/workflows lists", async () => {
    const res = await request(app).get("/api/workflows");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/workflows/:id 404 for unknown", async () => {
    const res = await request(app).get("/api/workflows/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });

  it("POST /api/workflows/:id/run returns runId", async () => {
    const create = await request(app).post("/api/workflows").send({ name: "runnable", nodes: [{ id: "n1", type: "trigger.manual", data: {} }], edges: [] });
    const id = create.body.data.id;
    const res = await request(app).post(`/api/workflows/${id}/run`).send({});
    expect(res.status).toBe(202);
    expect(res.body.data.runId).toBeTruthy();
  });

  it("GET /api/runs/:id eventually success", async () => {
    const create = await request(app).post("/api/workflows").send({ name: "runnable2", nodes: [{ id: "n1", type: "trigger.manual", data: {} }], edges: [] });
    const id = create.body.data.id;
    const runRes = await request(app).post(`/api/workflows/${id}/run`).send({});
    const runId = runRes.body.data.runId;
    await new Promise((r) => setTimeout(r, 300));
    const res = await request(app).get(`/api/runs/${runId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("success");
    expect(res.body.data.nodeStatuses.n1).toBe("success");
  });

  it("POST /api/workflows validation 400", async () => {
    const res = await request(app).post("/api/workflows").send({ nodes: "not-array" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});
