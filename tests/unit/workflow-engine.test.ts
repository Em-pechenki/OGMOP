/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { topologicalSort, executeWorkflow } from "../../src/backend/engine/workflow-engine.js";

describe("workflow engine: topologicalSort", () => {
  it("sorts linear chain", () => {
    const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ];
    const ordered = topologicalSort(nodes, edges).map((n: any) => n.id);
    expect(ordered).toEqual(["a", "b", "c"]);
  });

  it("handles branching (diamond)", () => {
    const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
    const edges = [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
      { source: "b", target: "d" },
      { source: "c", target: "d" },
    ];
    const ordered = topologicalSort(nodes, edges).map((n: any) => n.id);
    expect(ordered.indexOf("a")).toBeLessThan(ordered.indexOf("b"));
    expect(ordered.indexOf("a")).toBeLessThan(ordered.indexOf("c"));
    expect(ordered.indexOf("b")).toBeLessThan(ordered.indexOf("d"));
    expect(ordered.indexOf("c")).toBeLessThan(ordered.indexOf("d"));
  });

  it("handles missing edges / empty", () => {
    const nodes = [{ id: "x" }, { id: "y" }];
    expect(topologicalSort(nodes, []).map((n: any) => n.id)).toEqual(["x", "y"]);
    expect(topologicalSort([], []).length).toBe(0);
  });

  it("appends cycle nodes at end", () => {
    const nodes = [{ id: "a" }, { id: "b" }];
    const edges = [{ source: "a", target: "b" }, { source: "b", target: "a" }];
    const ordered = topologicalSort(nodes, edges).map((n: any) => n.id);
    expect(ordered).toHaveLength(2);
    expect(ordered).toContain("a");
    expect(ordered).toContain("b");
  });

  it("ignores edges referencing unknown nodes", () => {
    const nodes = [{ id: "a" }, { id: "b" }];
    const edges = [{ source: "a", target: "ghost" }, { source: "ghost", target: "b" }];
    const ordered = topologicalSort(nodes, edges).map((n: any) => n.id);
    expect(ordered).toEqual(["a", "b"]);
  });
});

describe("workflow engine: executeWorkflow", () => {
  it("runs all nodes and returns success", async () => {
    const workflow = {
      nodes: [
        { id: "n1", type: "trigger.manual", data: {} },
        { id: "n2", type: "scanner.secrets", data: {} },
      ],
      edges: [{ source: "n1", target: "n2" }],
    };
    const run: any = { input: {}, nodeStatuses: {}, nodeResults: {} };
    const result: any = await executeWorkflow(run, workflow, {});
    expect(result.status).toBe("success");
    expect(result.nodeStatuses.n1).toBe("success");
    expect(result.nodeStatuses.n2).toBe("success");
    expect(result.nodeResults.n1).toBeTruthy();
  });

  it("passes input via run", async () => {
    const workflow = { nodes: [{ id: "n1", type: "trigger.manual", data: {} }], edges: [] };
    const run: any = { input: { foo: "bar" }, nodeStatuses: {}, nodeResults: {} };
    const result: any = await executeWorkflow(run, workflow, {});
    expect(result.status).toBe("success");
  });

  it("calls onUpdate", async () => {
    const workflow = { nodes: [{ id: "n1", type: "trigger.manual", data: {} }], edges: [] };
    const run: any = { input: {}, nodeStatuses: {}, nodeResults: {} };
    const updates: any[] = [];
    await executeWorkflow(run, workflow, { onUpdate: (p: any) => updates.push(p) });
    expect(updates.length).toBeGreaterThan(0);
  });
});
