/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/backend/server.js";

const app = createApp();

describe("E2E: templates", () => {
  it("create, get, list, delete template", async () => {
    const create = await request(app).post("/api/templates").send({ name: "tpl-e2e", description: "d", workflow: { nodes: [], edges: [] } });
    expect(create.status).toBe(201);
    const id = create.body.data.id;
    expect(id).toBeTruthy();

    const get = await request(app).get(`/api/templates/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.name).toBe("tpl-e2e");

    const list = await request(app).get("/api/templates");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);

    const del = await request(app).delete(`/api/templates/${id}`);
    expect(del.status).toBe(200);
    expect(del.body.data.deleted).toBe(true);

    const get404 = await request(app).get(`/api/templates/${id}`);
    expect(get404.status).toBe(404);
  });

  it("template validation 400", async () => {
    const res = await request(app).post("/api/templates").send({ name: "" });
    expect(res.status).toBe(400);
  });
});