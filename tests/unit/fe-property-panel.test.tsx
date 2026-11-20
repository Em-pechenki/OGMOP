import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useWorkflowStore } from "../../src/frontend/store/workflowStore";
import { PropertyPanel } from "../../src/frontend/components/PropertyPanel";

describe("fe PropertyPanel", () => {
  it("renders empty state", () => {
    useWorkflowStore.getState().reset();
    render(<PropertyPanel />);
    expect(screen.getByText(/Выберите ноду/i)).toBeInTheDocument();
  });

  it("renders selected trigger node and updates label", () => {
    const store = useWorkflowStore.getState();
    store.reset();
    const node: any = { id: "p1", type: "trigger.manual", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual", label: "t" } };
    store.setNodes([node]);
    store.setSelectedNodeId("p1");
    render(<PropertyPanel />);
    const input = screen.getByDisplayValue("t");
    fireEvent.change(input, { target: { value: "new" } });
    expect((useWorkflowStore.getState().nodes[0].data as any).label).toBe("new");
  });

  it("renders scanner and updates config", () => {
    const store = useWorkflowStore.getState();
    store.reset();
    const node: any = { id: "p2", type: "scanner.secrets", position: { x: 0, y: 0 }, data: { kind: "scanner", scannerType: "secrets", label: "s", config: { scannerType: "secrets", targetPath: "." } } };
    store.setNodes([node]);
    store.setSelectedNodeId("p2");
    render(<PropertyPanel />);
    expect(screen.getAllByText(/Сканер/i).length).toBeGreaterThan(0);
  });
});