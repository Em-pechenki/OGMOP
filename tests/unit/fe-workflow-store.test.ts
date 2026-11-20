/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { useWorkflowStore } from "../../src/frontend/store/workflowStore";

describe("FE: workflowStore", () => {
  it("adds and removes nodes", () => {
    const store = useWorkflowStore.getState();
    store.reset();
    const node: any = { id: "n1", type: "default", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual", label: "t" } };
    store.addNode(node);
    expect(useWorkflowStore.getState().nodes).toHaveLength(1);
    store.removeNode("n1");
    expect(useWorkflowStore.getState().nodes).toHaveLength(0);
  });

  it("selects node", () => {
    const store = useWorkflowStore.getState();
    store.reset();
    const node: any = { id: "n2", type: "default", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual", label: "t" } };
    store.addNode(node);
    store.setSelectedNodeId("n2");
    expect(useWorkflowStore.getState().selectedNodeId).toBe("n2");
    expect(useWorkflowStore.getState().selectedNode?.id).toBe("n2");
  });

  it("updates node data", () => {
    const store = useWorkflowStore.getState();
    store.reset();
    const node: any = { id: "n3", type: "default", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual", label: "t" } };
    store.addNode(node);
    store.updateNodeData("n3", { label: "updated" });
    expect((useWorkflowStore.getState().nodes[0].data as any).label).toBe("updated");
  });

  it("setNodes/setEdges and connect", () => {
    const store = useWorkflowStore.getState();
    store.reset();
    const node: any = { id: "a", type: "default", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual", label: "t" } };
    store.setNodes([node]);
    store.setEdges([]);
    store.onConnect({ source: "a", target: "b" } as any);
    expect(useWorkflowStore.getState().edges.length).toBe(1);
    store.setSelectedNodeId("a");
    expect(useWorkflowStore.getState().selectedNode?.id).toBe("a");
    store.removeNode("a");
    expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
  });

  it("reset clears state", () => {
    const store = useWorkflowStore.getState();
    store.reset();
    expect(useWorkflowStore.getState().nodes).toHaveLength(0);
    expect(useWorkflowStore.getState().edges).toHaveLength(0);
  });
});
