/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import request from "supertest";
import { createApp } from "../../src/backend/server.js";

const app = createApp();

describe("E2E: critical path (build scenario -> run -> result -> notify)", () => {
  let webhookServer: http.Server;
  let webhookPort: number;
  const received: unknown[] = [];

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      webhookServer = http.createServer((req, res) => {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", () => {
          try {
            received.push(JSON.parse(body));
          } catch {
            received.push({ raw: body });
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        });
      });
      webhookServer.listen(0, "127.0.0.1", () => {
        const addr = webhookServer.address();
        webhookPort = typeof addr === "object" && addr ? addr.port : 0;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => webhookServer.close(() => resolve()));
  });

  it("creates, runs workflow and notifies", async () => {
    const nodes = [
      { id: "n1", type: "trigger.manual", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual", label: "Start" } },
      { id: "n2", type: "scanner.secrets", position: { x: 100, y: 0 }, data: { kind: "scanner", scannerType: "secrets", label: "Secrets", config: { scannerType: "secrets" } } },
      { id: "n3", type: "scanner.sca", position: { x: 200, y: 0 }, data: { kind: "scanner", scannerType: "sca", label: "SCA", config: { scannerType: "sca" } } },
      { id: "n4", type: "scanner.sast", position: { x: 300, y: 0 }, data: { kind: "scanner", scannerType: "sast", label: "SAST", config: { scannerType: "sast" } } },
      { id: "n5", type: "ai.analyze", position: { x: 400, y: 0 }, data: { kind: "ai", label: "AI" } },
      { id: "n6", type: "notify.webhook", position: { x: 500, y: 0 }, data: { kind: "notify", channel: "webhook", label: "Notify", config: { channel: "webhook", url: `http://127.0.0.1:${webhookPort}/webhook` } } },
    ];
    const edges = [
      { source: "n1", target: "n2" },
      { source: "n2", target: "n3" },
      { source: "n3", target: "n4" },
      { source: "n4", target: "n5" },
      { source: "n5", target: "n6" },
    ];

    const create = await request(app).post("/api/workflows").send({ name: "e2e-critical", nodes, edges });
    expect(create.status).toBe(201);
    const workflowId = create.body.data.id;
    expect(workflowId).toBeTruthy();

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

    const nodeStatuses = final.body.data.nodeStatuses;
    for (const id of ["n1", "n2", "n3", "n4", "n5", "n6"]) {
      expect(nodeStatuses[id]).toBe("success");
    }

    expect(Array.isArray(final.body.data.findings)).toBe(true);
    expect(final.body.data.findings.length).toBeGreaterThan(0);
    expect(final.body.data.aiReport).toBeTruthy();
    expect(final.body.data.aiReport.summary).toBeTruthy();

    // notification delivered
    // allow a little time for notify (already awaited in run, but webhook handler async)
    for (let i = 0; i < 20 && received.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
    expect(received.length).toBeGreaterThan(0);
    const payload = received[received.length - 1] as { findings?: unknown[] };
    expect(payload.findings).toBeTruthy();
    expect(Array.isArray(payload.findings)).toBe(true);
    expect((payload.findings as unknown[]).length).toBeGreaterThan(0);
  });
});