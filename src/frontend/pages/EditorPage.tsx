import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ControlButton,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@frontend/store/workflowStore";
import { useLocalStorage } from "@frontend/hooks/useLocalStorage";
import { useI18n } from "@frontend/hooks/useI18n";
import Container from "@frontend/components/layout/Container";
import Button from "@frontend/components/ui/Button";
import NodePalette, { type PaletteItem } from "@frontend/components/NodePalette";
import Card from "@frontend/components/ui/Card";
import { useToast } from "@frontend/components/ui/Toast";
import { nodeTypes } from "@frontend/components/nodes";
import { AnimatedEdge } from "@frontend/components/edges/AnimatedEdge";
import { AiGenerationModal } from "@frontend/components/AiGenerationModal";
import PropertyPanel from "@frontend/components/PropertyPanel";
import { api } from "@frontend/services/api";
import type { NodeData, NodeType } from "@shared/types";


const SaveIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </svg>
);
const LoadIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const ClearIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  </svg>
);
const RunIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const AiIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const TriggerIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
const LogicIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 3v6m0 6v6M5 9l7 6 7-6" />
  </svg>
);
const ScannerIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const NotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const AiNodeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
  </svg>
);

const kindIcon = (kind: string) => {
  if (kind === "trigger") return <TriggerIcon />;
  if (kind === "logic") return <LogicIcon />;
  if (kind === "scanner") return <ScannerIcon />;
  if (kind === "notify") return <NotifyIcon />;
  return <AiNodeIcon />;
};

const nodeColor = (data: NodeData) => {
  if (data.kind === "trigger") return "#50B848";
  if (data.kind === "logic") return "#494B52";
  if (data.kind === "scanner") return "#D32F2F";
  if (data.kind === "notify") return "#1976D2";
  return "#7B1FA2";
};

const edgeTypes = { animated: AnimatedEdge };

export const EditorPageInner: React.FC = () => {
  const { t } = useI18n();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setNodes, setEdges } =
    useWorkflowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [stored, setStored] = useLocalStorage<string>("ogmop_workflow", "");
  const { show } = useToast();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const PALETTE: PaletteItem[] = [
    { nodeType: "trigger.manual", group: "trigger", label: t("node.trigger.manual"), description: t("node.desc.trigger.manual"), color: "var(--color-node-trigger)", icon: <TriggerIcon />, data: { kind: "trigger", triggerType: "manual", label: t("node.trigger.manual") } },
    { nodeType: "trigger.schedule", group: "trigger", label: t("node.trigger.schedule"), description: t("node.desc.trigger.schedule"), color: "var(--color-node-trigger)", icon: <TriggerIcon />, data: { kind: "trigger", triggerType: "schedule", label: t("node.trigger.schedule"), schedule: "0 14 * * *" } },
    { nodeType: "logic.if", group: "logic", label: t("node.logic.if"), description: t("node.desc.logic.if"), color: "var(--color-node-logic)", icon: <LogicIcon />, data: { kind: "logic", logicType: "if", label: t("node.logic.if"), condition: "" } },
    { nodeType: "logic.compare", group: "logic", label: t("node.logic.compare"), description: t("node.desc.logic.compare"), color: "var(--color-node-logic)", icon: <LogicIcon />, data: { kind: "logic", logicType: "compare", label: t("node.logic.compare"), operator: "eq" } },
    { nodeType: "logic.regex", group: "logic", label: t("node.logic.regex"), description: t("node.desc.logic.regex"), color: "var(--color-node-logic)", icon: <LogicIcon />, data: { kind: "logic", logicType: "regex", label: t("node.logic.regex"), pattern: "" } },
    { nodeType: "scanner.secrets", group: "scanner", subtype: "secrets", label: t("node.scanner.secrets"), description: t("node.desc.scanner.secrets"), color: "var(--color-node-scanner)", icon: <ScannerIcon />, data: { kind: "scanner", scannerType: "secrets", label: t("node.scanner.secrets"), config: { scannerType: "secrets" } } },
    { nodeType: "scanner.sca", group: "scanner", subtype: "sca", label: t("node.scanner.sca"), description: t("node.desc.scanner.sca"), color: "var(--color-node-scanner)", icon: <ScannerIcon />, data: { kind: "scanner", scannerType: "sca", label: t("node.scanner.sca"), config: { scannerType: "sca" } } },
    { nodeType: "scanner.sast", group: "scanner", subtype: "sast", label: t("node.scanner.sast"), description: t("node.desc.scanner.sast"), color: "var(--color-node-scanner)", icon: <ScannerIcon />, data: { kind: "scanner", scannerType: "sast", label: t("node.scanner.sast"), config: { scannerType: "sast" } } },
    { nodeType: "notify.telegram", group: "notify", label: t("node.notify.telegram"), description: t("node.desc.notify.telegram"), color: "var(--color-node-notify)", icon: <NotifyIcon />, data: { kind: "notify", channel: "telegram", label: t("node.notify.telegram"), config: { channel: "telegram" } } },
    { nodeType: "notify.smtp", group: "notify", label: t("node.notify.smtp"), description: t("node.desc.notify.smtp"), color: "var(--color-node-notify)", icon: <NotifyIcon />, data: { kind: "notify", channel: "smtp", label: t("node.notify.smtp"), config: { channel: "smtp" } } },
    { nodeType: "notify.webhook", group: "notify", label: t("node.notify.webhook"), description: t("node.desc.notify.webhook"), color: "var(--color-node-notify)", icon: <NotifyIcon />, data: { kind: "notify", channel: "webhook", label: t("node.notify.webhook"), config: { channel: "webhook" } } },
    { nodeType: "ai.analyze", group: "ai", label: t("node.ai.analyze"), description: t("node.desc.ai.analyze"), color: "var(--color-node-ai)", icon: <AiNodeIcon />, data: { kind: "ai", label: t("node.ai.analyze"), model: "gpt-4o" } },
  ];

  const onDragStart = (event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData("application/ogmop-node", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/ogmop-node");
      if (!raw) return;
      let item: PaletteItem;
      try {
        item = JSON.parse(raw) as PaletteItem;
      } catch {
        return;
      }
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      const gridSize = 20;
      const x = Math.max(0, Math.round(((event.clientX - (bounds?.left ?? 0) - 80) / gridSize)) * gridSize);
      const y = Math.max(0, Math.round(((event.clientY - (bounds?.top ?? 0) - 20) / gridSize)) * gridSize);
      let finalX = x;
      let finalY = y;
      const exists = nodes.some((n) => n.position.x === finalX && n.position.y === finalY);
      if (exists) {
        finalX += gridSize * 2;
        finalY += gridSize * 2;
      }
      const node: Node<NodeData> = {
        id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: (item.data as { kind?: string }).kind || "default",
        position: { x: finalX, y: finalY },
        data: { ...item.data },
      };
      addNode(node);
    },
    [addNode, nodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const save = () => {
    setStored(JSON.stringify({ nodes, edges }));
    show(t("toast.saved"), "success");
  };

  const load = () => {
    try {
      if (!stored) {
        show(t("toast.noSaved"), "warning");
        return;
      }
      const parsed = JSON.parse(stored) as { nodes: Node<NodeData>[]; edges: typeof edges };
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      show(t("toast.loaded"), "success");
    } catch {
      show(t("toast.loadError"), "error");
    }
  };

  const clear = () => {
    setNodes([]);
    setEdges([]);
    show(t("toast.cleared"), "info");
  };

  const handleRun = async () => {
    if (nodes.length === 0) {
      show(t("toast.needNodes"), "warning");
      return;
    }
    try {
      const res = await api.post("/api/workflows", { name: "Workflow", nodes, edges });
      const wf = (res.data as { data?: { id?: string } })?.data;
      const id = wf?.id;
      if (!id) throw new Error(t("toast.createError"));
      const runRes = await api.post(`/api/workflows/${id}/run`, { input: {} });
      const runId = (runRes.data as { data?: { runId?: string } })?.data?.runId;
      if (!runId) throw new Error(t("toast.runError"));
      show(t("toast.runStarted"), "info");
      navigate(`/run/${runId}`);
    } catch (e) {
      show((e as Error).message, "error");
    }
  };

  const applyGenerated = (wf: { name?: string; nodes: any[]; edges: any[] }) => {
    setNodes(wf.nodes || []);
    setEdges(wf.edges || []);
    show(t("toast.aiApplied"), "success");
  };

  return (
    <Container size="full">
      <div className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg sm:text-xl font-semibold text-text">{t("editor.title")}</h1>
        <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label={t("editor.title")}>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1" role="group" aria-label={t("editor.group.file")}>
            <span className="px-2 text-xs font-semibold text-text-muted">{t("editor.group.file")}</span>
            <Button variant="secondary" size="sm" leftIcon={<LoadIcon />} onClick={load} title={t("editor.load")} aria-label={t("editor.load")}>
              {t("editor.load")}
            </Button>
            <Button variant="primary" size="sm" leftIcon={<SaveIcon />} onClick={save} title={t("editor.saveLocal")} aria-label={t("editor.saveLocal")}>
              {t("editor.saveLocal")}
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<ClearIcon />} onClick={clear} title={t("editor.clear")} aria-label={t("editor.clear")}>
              {t("editor.clear")}
            </Button>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1" role="group" aria-label={t("editor.group.run")}>
            <span className="px-2 text-xs font-semibold text-text-muted">{t("editor.group.run")}</span>
            <Button variant="primary" size="sm" leftIcon={<RunIcon />} onClick={handleRun} title={t("editor.run")} aria-label={t("editor.run")}>
              {t("editor.run")}
            </Button>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1" role="group" aria-label={t("editor.group.ai")}>
            <span className="px-2 text-xs font-semibold text-text-muted">{t("editor.group.ai")}</span>
            <Button variant="secondary" size="sm" leftIcon={<AiIcon />} onClick={() => setAiOpen(true)} title={t("editor.aiGenerate")} aria-label={t("editor.aiGenerate")}>
              {t("editor.aiGenerate")}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-160px)]">
        <Card padding="sm" className="w-full lg:w-64 lg:shrink-0 lg:overflow-auto">
          <h2 className="text-sm font-semibold text-text mb-2">{t("editor.palette")}</h2>
          <NodePalette items={PALETTE} onDragStart={onDragStart} />
        </Card>
        <div ref={reactFlowWrapper} className="flex-1 min-h-[320px] rounded-lg border border-border overflow-hidden bg-surface" role="application" aria-label={t("editor.canvas")}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: "animated", animated: true }}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            deleteKeyCode={["Delete", "Backspace"]}
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Control"
            panOnScroll
            zoomOnScroll
            snapToGrid
            snapGrid={[20, 20]}
            minZoom={0.2}
            maxZoom={2}
            fitView
          >
            <Background />
            <Controls showZoom={false} showFitView={false} showInteractive={false}>
              <ControlButton onClick={() => zoomIn()} aria-label={t("canvas.zoomIn")} title={t("canvas.zoomIn")}>
                +
              </ControlButton>
              <ControlButton onClick={() => zoomOut()} aria-label={t("canvas.zoomOut")} title={t("canvas.zoomOut")}>
                −
              </ControlButton>
              <ControlButton onClick={() => fitView()} aria-label={t("canvas.fitView")} title={t("canvas.fitView")}>
                ⌂
              </ControlButton>
            </Controls>
            <MiniMap nodeColor={(n) => nodeColor(n.data as NodeData)} />
          </ReactFlow>
        </div>
        <div className="w-full lg:w-80 lg:shrink-0 lg:overflow-auto">
          <PropertyPanel />
        </div>
      </div>

      <AiGenerationModal open={aiOpen} onClose={() => setAiOpen(false)} onApply={applyGenerated} />
    </Container>
  );
};

export const EditorPage: React.FC = () => (
  <ReactFlowProvider>
    <EditorPageInner />
  </ReactFlowProvider>
);

export default EditorPage;