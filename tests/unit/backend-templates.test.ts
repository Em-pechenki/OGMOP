import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/backend/server.js";

const app = createApp();

describe("backend templates phase", () => {
  it("seeds at least 5 templates", async () => {
    const res = await request(app).get("/api/templates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    expect(res.body.total).toBeGreaterThanOrEqual(5);
  });

  it("filters by search", async () => {
    const res = await request(app).get("/api/templates?search=nightly");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some((t: any) => /nightly/i.test(t.name))).toBe(true);
  });

  it("filters by tag", async () => {
    const res = await request(app).get("/api/templates?tag=sca");
    expect(res.status).toBe(200);
    expect(res.body.data.every((t: any) => (t.tags || []).some((x: string) => /sca/i.test(x)))).toBe(true);
  });

  it("paginates", async () => {
    const res = await request(app).get("/api/templates?page=1&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.totalPages).toBeGreaterThanOrEqual(2);
    expect(res.body.page).toBe(1);
  });

  it("gets template by id", async () => {
    const list = await request(app).get("/api/templates");
    const id = list.body.data[0].id;
    const res = await request(app).get(`/api/templates/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.workflow).toBeTruthy();
  });

  it("copies template to workspace", async () => {
    const list = await request(app).get("/api/templates");
    const id = list.body.data[0].id;
    const res = await request(app).post(`/api/templates/${id}/copy`);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeTruthy();
    expect(res.body.workflowId).toBe(res.body.data.id);
    expect(res.body.copied).toBe(true);
  });

  it("publishes template via POST", async () => {
    const res = await request(app).post("/api/templates").send({
      name: "Published tpl",
      description: "d",
      workflow: { name: "w", nodes: [], edges: [] },
      isPublic: true,
      tags: ["x"],
    });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Published tpl");
    expect(res.body.data.isPublic).toBe(true);
  });
});