import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
    render(<TriggerNode id="t1" data={{ label: "Trigger X" } as any} selected={false} />);
    expect(screen.getByText("Trigger X")).toBeInTheDocument();
  });

  it("ScannerNode renders scannerType", () => {
    render(<ScannerNode id="s1" data={{ label: "Scan", scannerType: "sast" } as any} selected={false} />);
    expect(screen.getByText("sast")).toBeInTheDocument();
  });

  it("LogicNode renders", () => {
    render(<LogicNode id="l1" data={{ label: "Logic" } as any} selected={false} />);
    expect(screen.getByText("Logic")).toBeInTheDocument();
  });

  it("NotifyNode renders", () => {
    render(<NotifyNode id="n1" data={{ label: "Notify" } as any} selected={false} />);
    expect(screen.getByText("Notify")).toBeInTheDocument();
  });

  it("AiNode renders", () => {
    render(<AiNode id="a1" data={{ label: "AI" } as any} selected={false} />);
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
