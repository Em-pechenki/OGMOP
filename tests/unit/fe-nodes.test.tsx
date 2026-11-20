import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { describe, it, expect } from "vitest";

import { TriggerNode } from "../../src/frontend/components/nodes/TriggerNode";
import { LogicNode } from "../../src/frontend/components/nodes/LogicNode";
import { ScannerNode } from "../../src/frontend/components/nodes/ScannerNode";
import { NotifyNode } from "../../src/frontend/components/nodes/NotifyNode";
import { AiNode } from "../../src/frontend/components/nodes/AiNode";
import { PropertyPanel } from "../../src/frontend/components/PropertyPanel";
import { ResultsPanel } from "../../src/frontend/components/ResultsPanel";
import { useWorkflowStore } from "../../src/frontend/store/workflowStore";
import { useRunStore } from "../../src/frontend/store/runStore";

describe("FE: node components", () => {
  it("TriggerNode renders label", () => {
    render(React.createElement(ReactFlowProvider, null, React.createElement(TriggerNode as any, { id: "t1", data: { label: "Trigger X" }, selected: false })));
    expect(screen.getByText("Trigger X")).toBeInTheDocument();
  });

  it("ScannerNode renders scannerType", () => {
    render(React.createElement(ReactFlowProvider, null, React.createElement(ScannerNode as any, { id: "s1", data: { label: "Scan", scannerType: "sast" }, selected: false })));
    expect(screen.getByText("sast")).toBeInTheDocument();
  });

  it("LogicNode renders", () => {
    render(React.createElement(ReactFlowProvider, null, React.createElement(LogicNode as any, { id: "l1", data: { label: "Logic" }, selected: false })));
    expect(screen.getByText("Logic")).toBeInTheDocument();
  });

  it("NotifyNode renders", () => {
    render(React.createElement(ReactFlowProvider, null, React.createElement(NotifyNode as any, { id: "n1", data: { label: "Notify" }, selected: false })));
    expect(screen.getByText("Notify")).toBeInTheDocument();
  });

  it("AiNode renders", () => {
    render(React.createElement(ReactFlowProvider, null, React.createElement(AiNode as any, { id: "a1", data: { label: "AI" }, selected: false })));
    expect(screen.getByText("AI")).toBeInTheDocument();
  });
});

describe("FE: PropertyPanel", () => {
  it("shows select node hint when none selected", () => {
    useWorkflowStore.getState().reset();
    render(<PropertyPanel />);
    expect(screen.getByText(/Выберите ноду/)).toBeInTheDocument();
  });

  it("renders params for selected node", () => {
    useWorkflowStore.getState().reset();
    const node: any = { id: "p1", type: "default", position: { x: 0, y: 0 }, data: { kind: "scanner", scannerType: "secrets", label: "S", config: { scannerType: "secrets" } } };
    useWorkflowStore.getState().addNode(node);
    useWorkflowStore.getState().setSelectedNodeId("p1");
    render(<PropertyPanel />);
    expect(screen.getByText("Сканер")).toBeInTheDocument();
  });
});

describe("FE: ResultsPanel", () => {
  it("shows empty state", () => {
    useRunStore.getState().reset();
    render(<ResultsPanel />);
    expect(screen.getByText("Нет находок.")).toBeInTheDocument();
  });

  it("renders finding card", () => {
    useRunStore.getState().reset();
    useRunStore.getState().setRun({
      findings: [{ id: "f1", severity: "high", title: "Leak", scanner: "secrets" } as any],
    });
    render(<ResultsPanel />);
    expect(screen.getByText("Leak")).toBeInTheDocument();
  });

  it("filters by search", () => {
    useRunStore.getState().reset();
    useRunStore.getState().setRun({
      findings: [
        { id: "f1", severity: "high", title: "Leak", scanner: "secrets" } as any,
        { id: "f2", severity: "low", title: "Other", scanner: "sca" } as any,
      ],
    });
    render(<ResultsPanel />);
    const input = screen.getByPlaceholderText("Поиск...");
    fireEvent.change(input, { target: { value: "Other" } });
    expect(screen.getByText("Other")).toBeInTheDocument();
    expect(screen.queryByText("Leak")).not.toBeInTheDocument();
  });
});
