import React, { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@frontend/store/workflowStore";
import { useLocalStorage } from "@frontend/hooks/useLocalStorage";
import Container from "@frontend/components/layout/Container";
import Button from "@frontend/components/ui/Button";
import Card from "@frontend/components/ui/Card";
import { useToast } from "@frontend/components/ui/Toast";
import { nodeTypes } from "@frontend/components/nodes";
import PropertyPanel from "@frontend/components/PropertyPanel";
import { api } from "@frontend/services/api";
import { runWorkflow } from "@frontend/services/workflowRunner";
import type { NodeData, NodeType } from "@shared/types";

interface PaletteItem {
  nodeType: NodeType;
  label: string;
  color: string;
  data: NodeData;
}

const PALETTE: PaletteItem[] = [
  { nodeType: "trigger.manual", label: "Триггер: кнопка", color: "#50B848", data: { kind: "trigger", triggerType: "manual", label: "Триггер: кнопка" } },
  { nodeType: "trigger.schedule", label: "Триггер: расписание", color: "#50B848", data: { kind: "trigger", triggerType: "schedule", label: "Триггер: расписание", schedule: "0 14 * * *" } },
  { nodeType: "logic.if", label: "Логика: if/else", color: "#494B52", data: { kind: "logic", logicType: "if", label: "Логика: if/else", condition: "" } },
  { nodeType: "logic.compare", label: "Логика: сравнение", color: "#494B52", data: { kind: "logic", logicType: "compare", label: "Логика: сравнение", operator: "eq" } },
  { nodeType: "logic.regex", label: "Логика: regex", color: "#494B52", data: { kind: "logic", logicType: "regex", label: "Логика: regex", pattern: "" } },
  { nodeType: "scanner.secrets", label: "Сканер: секреты", color: "#D32F2F", data: { kind: "scanner", scannerType: "secrets", label: "Сканер: секреты", config: { scannerType: "secrets" } } },
  { nodeType: "scanner.sca", label: "Сканер: SCA", color: "#E65100", data: { kind: "scanner", scannerType: "sca", label: "Сканер: SCA", config: { scannerType: "sca" } } },
  { nodeType: "scanner.sast", label: "Сканер: SAST", color: "#B8860B", data: { kind: "scanner", scannerType: "sast", label: "Сканер: SAST", config: { scannerType: "sast" } } },
  { nodeType: "notify.telegram", label: "Уведомление: Telegram", color: "#1976D2", data: { kind: "notify", channel: "telegram", label: "Уведомление: Telegram", config: { channel: "telegram" } } },
  { nodeType: "notify.smtp", label: "Уведомление: SMTP", color: "#1976D2", data: { kind: "notify", channel: "smtp", label: "Уведомление: SMTP", config: { channel: "smtp" } } },
  { nodeType: "notify.webhook", label: "Уведомление: Webhook", color: "#1976D2", data: { kind: "notify", channel: "webhook", label: "Уведомление: Webhook", config: { channel: "webhook" } } },
];

const nodeColor = (data: NodeData) => {
  const item = PALETTE.find((p) => p.nodeType === (data as { nodeType?: string }).nodeType);
  // fallback by kind
  if (item) return item.color;
  if (data.kind === "trigger") return "#50B848";
  if (data.kind === "logic") return "#494B52";
  if (data.kind === "scanner") return "#D32F2F";
  if (data.kind === "notify") return "#1976D2";
  return "#494B52";
};

export const EditorPageInner: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setNodes, setEdges } =
    useWorkflowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [stored, setStored] = useLocalStorage<string>("ogmop_workflow", "");
  const { show } = useToast();

  const onDragStart = (event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData("application/ogmop-node", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/ogmop-node");
      if (!raw) return;
      const item = JSON.parse(raw) as PaletteItem;
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      const position = {
        x: event.clientX - (bounds?.left ?? 0) - 80,
        y: event.clientY - (bounds?.top ?? 0) - 20,
      };
      const node: Node<NodeData> = {
        id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: (item.data as { kind?: string }).kind || "default",
        position,
        data: { ...item.data },
      };
      addNode(node);
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const save = () => {
    setStored(JSON.stringify({ nodes, edges }));
    show("Workflow сохранён", "success");
  };

  const load = () => {
    try {
      if (!stored) {
        show("Нет сохранённого workflow", "warning");
        return;
      }
      const parsed = JSON.parse(stored) as { nodes: Node<NodeData>[]; edges: typeof edges };
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      show("Workflow загружен", "success");
    } catch {
      show("Ошибка загрузки", "error");
    }
  };

  const clear = () => {
    setNodes([]);
    setEdges([]);
    show("Очищено", "info");
  };

  const handleRun = async () => {
    try {
      const res = await api.post("/api/workflows", { name: "Workflow", nodes, edges });
      const wf = (res.data as { data?: { id?: string } })?.data;
      const id = wf?.id;
      if (!id) throw new Error("Не удалось сохранить workflow");
      show("Запуск...", "info");
      await runWorkflow(id);
      show("Запуск завершён", "success");
    } catch (e) {
      show((e as Error).message, "error");
    }
  };


  return (
    <Container size="full">
      <div className="py-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-text">Редактор workflow</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={load}>Загрузить</Button>
          <Button onClick={save}>Сохранить (local)</Button>
          <Button variant="ghost" onClick={clear}>Очистить</Button>
          <Button onClick={handleRun}>Запустить</Button>
        </div>
      </div>
      <div className="flex gap-4 h-[calc(100vh-160px)]">
        <Card padding="sm" className="w-64 shrink-0 overflow-auto">
          <h2 className="text-sm font-semibold text-text mb-2">Палитра нод</h2>
          <div className="flex flex-col gap-2">
            {PALETTE.map((item) => (
              <div
                key={item.label}
                draggable
                onDragStart={(e) => onDragStart(e, item)}
                className="cursor-grab active:cursor-grabbing rounded-lg border border-border bg-white px-3 py-2 text-sm text-text hover:shadow-card transition-shadow"
                style={{ borderLeft: `4px solid ${item.color}` }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </Card>
        <div ref={reactFlowWrapper} className="flex-1 rounded-lg border border-border overflow-hidden bg-surface">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap nodeColor={(n) => nodeColor(n.data as NodeData)} />
          </ReactFlow>
        </div>
        <div className="w-80 shrink-0 overflow-auto">
          <PropertyPanel />
        </div>
      </div>
    </Container>
  );
};

export const EditorPage: React.FC = () => (
  <ReactFlowProvider>
    <EditorPageInner />
  </ReactFlowProvider>
);

export default EditorPage;
