import { describe, it, expect } from "vitest";

import { workflowRunEventSchema, workflowRunEventTypeSchema } from "../../src/shared/schemas/events.schema";
import { runResultSchema, runStatusSchema } from "../../src/shared/schemas/run.schema";
import { templateSchema } from "../../src/shared/schemas/template.schema";
import { ciCdConfigSchema, ciRunSchema } from "../../src/shared/schemas/cicd.schema";
import { aiGenerationRequestSchema, aiGenerationResultSchema } from "../../src/shared/schemas/ai-generation.schema";

describe("shared schemas: events", () => {
  it("parses valid event", () => {
    const e = { type: "run.started", runId: "r1", timestamp: new Date().toISOString() };
    expect(() => workflowRunEventSchema.parse(e)).not.toThrow();
  });
  it("rejects missing runId", () => {
    expect(() => workflowRunEventSchema.parse({ type: "run.started" })).toThrow();
  });
});

describe("shared schemas: run", () => {
  it("parses run status enum", () => {
    expect(runStatusSchema.parse("success")).toBe("success");
  });
  it("parses run result", () => {
    const r = { id: "r1", workflowId: "w1", status: "success", nodeResults: [], findings: [] };
    expect(() => runResultSchema.parse(r)).not.toThrow();
  });
});

describe("shared schemas: template", () => {
  it("parses template", () => {
    const t = { id: "t1", name: "tpl", workflow: { name: "w", nodes: [], edges: [] } };
    expect(() => templateSchema.parse(t)).not.toThrow();
  });
});

describe("shared schemas: cicd", () => {
  it("parses ci config", () => {
    const c = {
      provider: "github",
      repository: "owner/repo",
      branches: ["main"],
      triggers: ["push"],
      commentOnPr: true,
      status: "connected",
    };
    expect(() => ciCdConfigSchema.parse(c)).not.toThrow();
  });
  it("parses ci run", () => {
    const r = { id: "c1", status: "success" };
    expect(() => ciRunSchema.parse(r)).not.toThrow();
  });
});

describe("shared schemas: ai-generation", () => {
  it("parses request", () => {
    const r = { prompt: "generate a workflow for secrets scan" };
    expect(() => aiGenerationRequestSchema.parse(r)).not.toThrow();
  });
  it("parses result", () => {
    const r = { name: "wf", nodes: [], edges: [] };
    expect(() => aiGenerationResultSchema.parse(r)).not.toThrow();
  });
});