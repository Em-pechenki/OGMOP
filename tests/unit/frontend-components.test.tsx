import React from "react";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";

import { TriggerNode } from "../../src/frontend/components/nodes/TriggerNode";
import { LogicNode } from "../../src/frontend/components/nodes/LogicNode";
import { ScannerNode } from "../../src/frontend/components/nodes/ScannerNode";
import { NotifyNode } from "../../src/frontend/components/nodes/NotifyNode";
import { AiNode } from "../../src/frontend/components/nodes/AiNode";
import PropertyPanel from "../../src/frontend/components/PropertyPanel";
import ResultsPanel from "../../src/frontend/components/ResultsPanel";
import { useWorkflowStore } from "../../src/frontend/store/workflowStore";
import { useRunStore } from "../../src/frontend/store/runStore";

describe("Custom nodes render", () => {
  it("renders trigger node", () => {
    render(
      React.createElement(ReactFlowProvider, null,
        React.createElement(TriggerNode as any, { id: "n1", data: { kind: "trigger", triggerType: "manual", label: "T" }, selected: false })
      )
    );
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders logic node", () => {
    render(
      React.createElement(ReactFlowProvider, null,
        React.createElement(LogicNode as any, { id: "n2", data: { kind: "logic", logicType: "if", label: "L" }, selected: false })
      )
    );
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("renders scanner node", () => {
    render(
      React.createElement(ReactFlowProvider, null,
        React.createElement(ScannerNode as any, { id: "n3", data: { kind: "scanner", scannerType: "secrets", label: "S", config: { scannerType: "secrets" } }, selected: false })
      )
    );
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("renders notify node", () => {
    render(
      React.createElement(ReactFlowProvider, null,
        React.createElement(NotifyNode as any, { id: "n4", data: { kind: "notify", channel: "webhook", label: "N", config: { channel: "webhook" } }, selected: false })
      )
    );
    expect(screen.getByText("N")).toBeInTheDocument();
  });

  it("renders ai node", () => {
    render(
      React.createElement(ReactFlowProvider, null,
        React.createElement(AiNode as any, { id: "n5", data: { kind: "ai", label: "A", model: "gpt-4o" }, selected: false })
      )
    );
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});

describe("PropertyPanel", () => {
  beforeEach(() => {
    useWorkflowStore.getState().reset();
  });
  it("shows empty state when no selection", () => {
    render(React.createElement(PropertyPanel));
    expect(screen.getByText(/Выберите ноду/)).toBeInTheDocument();
  });
});

describe("ResultsPanel", () => {
  beforeEach(() => {
    useRunStore.getState().reset();
  });
  it("renders findings count", () => {
    useRunStore.getState().setRun({ findings: [{ id: "f1", severity: "high", title: "Secret found" }] as any });
    render(React.createElement(ResultsPanel));
    expect(screen.getByText(/Находки \(1\)/)).toBeInTheDocument();
    expect(screen.getByText("Secret found")).toBeInTheDocument();
  });
});