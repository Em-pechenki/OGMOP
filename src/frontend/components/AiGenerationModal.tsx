import React, { useState } from "react";
import { ReactFlow, ReactFlowProvider, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Modal from "@frontend/components/ui/Modal";
import Button from "@frontend/components/ui/Button";
import Input from "@frontend/components/ui/Input";
import Spinner from "@frontend/components/ui/Spinner";
import { api } from "@frontend/services/api";
import { nodeTypes } from "@frontend/components/nodes";
import { AnimatedEdge } from "@frontend/components/edges/AnimatedEdge";
import type { NodeData } from "@shared/types";

const edgeTypes = { animated: AnimatedEdge };

const SCANNERS = ["secrets", "sca", "sast"] as const;

export interface GeneratedWorkflow {
  name?: string;
  description?: string;
  nodes: any[];
  edges: any[];
  warnings?: string[];
}

export interface AiGenerationModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (wf: GeneratedWorkflow) => void;
}

export const AiGenerationModal: React.FC<AiGenerationModalProps> = ({ open, onClose, onApply }) => {
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("Kotlin/Spring Boot");
  const [notify, setNotify] = useState("none");
  const [scanners, setScanners] = useState<string[]>(["secrets", "sca", "sast"]);
  const [status, setStatus] = useState<"idle" | "loading" | "preview" | "error" | "empty">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedWorkflow | null>(null);

  const toggleScanner = (s: string) => {
    setScanners((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const generate = async () => {
    if (prompt.trim().length < 10) {
      setError("Опишите задачу подробнее (минимум 10 символов).");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await api.post("/api/workflows/generate", {
        description: prompt.trim(),
        name: name.trim() || undefined,
        language,
        scanners,
        notify,
        ai: true,
      });
      const data = (res.data as { data?: any })?.data ?? res.data;
      const wf = (data?.workflow ?? data) as GeneratedWorkflow;
      if (!wf || !Array.isArray(wf.nodes) || wf.nodes.length === 0) {
        setStatus("empty");
        return;
      }
      const warnings: string[] = [];
      if (wf.nodes.length > 50) warnings.push("Сгенерировано много узлов — проверьте граф вручную.");
      if (!wf.edges || wf.edges.length === 0) warnings.push("Связи между узлами не найдены — возможно, граф неполный.");
      setResult({ ...wf, warnings });
      setStatus("preview");
    } catch (e) {
      setError((e as Error).message || "Не удалось сгенерировать workflow");
      setStatus("error");
    }
  };

  const apply = () => {
    if (!result) return;
    onApply(result);
    // reset
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  const close = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="AI-генерация workflow" size="lg">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          <span>Описание</span>
          <textarea
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            rows={4}
            maxLength={2000}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Опишите, что должен делать workflow..."
          />
          <span className="text-xs text-text-subtle">{prompt.length}/2000</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>Язык/стек</span>
            <select
              className="rounded-md border border-border bg-white px-2 py-1.5 text-sm text-text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>Kotlin/Spring Boot</option>
              <option>Node.js</option>
              <option>Python</option>
              <option>Go</option>
              <option>Generic</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>Уведомления</span>
            <select
              className="rounded-md border border-border bg-white px-2 py-1.5 text-sm text-text"
              value={notify}
              onChange={(e) => setNotify(e.target.value)}
            >
              <option value="none">Нет</option>
              <option value="telegram">Telegram</option>
              <option value="webhook">Webhook</option>
              <option value="email">Email</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-text-muted">Сканеры</span>
          <div className="flex flex-wrap gap-2">
            {SCANNERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleScanner(s)}
                className={`rounded-full px-3 py-1 text-xs border ${
                  scanners.includes(s)
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-text-muted border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          <span>Имя workflow (необязательно)</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="AI workflow" />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} disabled={status === "loading"}>
            {status === "loading" ? "Генерация..." : "Сгенерировать"}
          </Button>
          {status === "loading" && <Spinner size="sm" />}
        </div>

        {status === "error" && error && (
          <div className="rounded-md bg-error-bg text-error px-3 py-2 text-sm">{error}</div>
        )}

        {status === "empty" && (
          <div className="rounded-md bg-surface text-text-muted px-3 py-2 text-sm">
            Не удалось построить workflow. Попробуйте изменить описание.
          </div>
        )}

        {status === "preview" && result && (
          <div className="flex flex-col gap-3">
            {(result.warnings || []).length > 0 && (
              <div className="rounded-md bg-warning-bg text-warning-text px-3 py-2 text-sm">
                <ul className="list-disc pl-4">
                  {(result.warnings || []).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm text-text-muted">
              Узлов: {result.nodes.length}, связей: {result.edges.length}
            </div>
            <div className="h-[280px] rounded-lg border border-border overflow-hidden bg-surface">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={result.nodes}
                  edges={result.edges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  minZoom={0.6}
                  maxZoom={1.2}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                >
                  <Background />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={close}>
          Отмена
        </Button>
        <Button onClick={apply} disabled={status !== "preview" || !result}>
          Применить к холсту
        </Button>
      </div>
    </Modal>
  );
};

export default AiGenerationModal;