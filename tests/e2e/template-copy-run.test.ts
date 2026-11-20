/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/backend/server.js";

const app = createApp();

describe("E2E: template copy -> run -> result", () => {
  it("copies template workflow into a workflow, runs it and gets results", async () => {
    const nodes = [
      { id: "n1", type: "trigger.manual", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual", label: "Start" } },
      { id: "n2", type: "scanner.secrets", position: { x: 100, y: 0 }, data: { kind: "scanner", scannerType: "secrets", label: "Secrets", config: { scannerType: "secrets" } } },
      { id: "n3", type: "ai.analyze", position: { x: 200, y: 0 }, data: { kind: "ai", label: "AI" } },
    ];
    const edges = [
      { source: "n1", target: "n2" },
      { source: "n2", target: "n3" },
    ];

    // 1. Create a template
    const createTpl = await request(app)
      .post("/api/templates")
      .send({ name: "template-copy-e2e", description: "d", workflow: { nodes, edges }, tags: ["security"] });
    expect(createTpl.status).toBe(201);
    const templateId = createTpl.body.data.id;
    expect(templateId).toBeTruthy();

    // 2. "Copy" template: fetch it and create a new workflow from its workflow
    const getTpl = await request(app).get(`/api/templates/${templateId}`);
    expect(getTpl.status).toBe(200);
    const copiedWorkflow = getTpl.body.data.workflow;
    expect(copiedWorkflow).toBeTruthy();

    const createWf = await request(app)
      .post("/api/workflows")
      .send({ name: "from-template", nodes: copiedWorkflow.nodes, edges: copiedWorkflow.edges });
    expect(createWf.status).toBe(201);
    const workflowId = createWf.body.data.id;
    expect(workflowId).toBeTruthy();

    // 3. Run
    const runRes = await request(app).post(`/api/workflows/${workflowId}/run`).send({});
    expect(runRes.status).toBe(202);
    const runId = runRes.body.data.runId;
    expect(runId).toBeTruthy();

    let status = "queued";
    for (let i = 0; i < 40; i++) {
      const r = await request(app).get(`/api/runs/${runId}`);
      status = r.body.data.status;
      if (status === "success" || status === "failed") break;
      await new Promise((r) => setTimeout(r, 100));
    }
    const final = await request(app).get(`/api/runs/${runId}`);
    expect(final.status).toBe(200);
    expect(final.body.data.status).toBe("success");

    expect(Array.isArray(final.body.data.findings)).toBe(true);
    expect(final.body.data.findings.length).toBeGreaterThan(0);
    expect(final.body.data.aiReport).toBeTruthy();
  });

  it("returns 404 when copying from unknown template", async () => {
    const res = await request(app).get("/api/templates/does-not-exist");
    expect(res.status).toBe(404);
  });
});
