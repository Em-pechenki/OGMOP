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

  it("run lifecycle: polling reaches success", async () => {
    const create = await request(app)
      .post("/api/workflows")
      .send({
        name: "lifecycle",
        nodes: [
          { id: "a", type: "trigger.manual", data: {} },
          { id: "b", type: "scanner.secrets", data: {} },
        ],
        edges: [{ source: "a", target: "b" }],
      });
    const id = create.body.data.id;
    const runRes = await request(app).post(`/api/workflows/${id}/run`).send({});
    expect(runRes.status).toBe(202);
    const runId = runRes.body.data.runId;

    // poll until finished
    let status = "queued";
    for (let i = 0; i < 20; i++) {
      const r = await request(app).get(`/api/runs/${runId}`);
      status = r.body.data.status;
      if (status === "success" || status === "failed") break;
      await new Promise((r) => setTimeout(r, 100));
    }
    const final = await request(app).get(`/api/runs/${runId}`);
    expect(final.status).toBe(200);
    expect(final.body.data.status).toBe("success");
    expect(final.body.data.nodeStatuses.a).toBe("success");
    expect(final.body.data.nodeStatuses.b).toBe("success");
  });

  it("GET /api/runs/:id 404 for unknown", async () => {
    const res = await request(app).get("/api/runs/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });

  it("POST /api/workflows/:id/run 404 for unknown workflow", async () => {
    const res = await request(app).post("/api/workflows/does-not-exist/run").send({});
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });

  it("templates CRUD", async () => {
    const create = await request(app).post("/api/templates").send({ name: "tpl", description: "d" });
    expect(create.status).toBe(201);
    const id = create.body.data.id;
    const get = await request(app).get(`/api/templates/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.name).toBe("tpl");
    const list = await request(app).get("/api/templates");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    const del = await request(app).delete(`/api/templates/${id}`);
    expect(del.status).toBe(200);
    expect(del.body.data.deleted).toBe(true);
  });
});
