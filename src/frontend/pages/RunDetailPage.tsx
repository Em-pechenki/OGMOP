import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, ControlButton, useReactFlow } from "@xyflow/react";
import { AnimatedEdge } from "@frontend/components/edges/AnimatedEdge";
import "@xyflow/react/dist/style.css";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";
import Button from "@frontend/components/ui/Button";
import Spinner from "@frontend/components/ui/Spinner";
import { nodeTypes } from "@frontend/components/nodes";
import PropertyPanel from "@frontend/components/PropertyPanel";
import ResultsPanel from "@frontend/components/ResultsPanel";
import { api } from "@frontend/services/api";
import { useRunStore } from "@frontend/store/runStore";
import { useWorkflowStore } from "@frontend/store/workflowStore";
import type { NodeData } from "@shared/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const statusColor: Record<string, string> = {
  pending: "bg-surface text-text-muted",
  queued: "bg-surface text-text-muted",
  running: "bg-primary-light text-primary-darker",
  success: "bg-success-bg text-primary-darker",
  completed: "bg-success-bg text-primary-darker",
  failed: "bg-error-bg text-error",
  error: "bg-error-bg text-error",
  cancelled: "bg-surface text-text-muted",
};

export const RunDetailPage: React.FC = () => {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<{ nodes: any[]; edges: any[]; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setNodes = useWorkflowStore((s) => s.setNodes);
  const setEdges = useWorkflowStore((s) => s.setEdges);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const status = useRunStore((s) => s.status);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      try {
        const runRes = await api.get(`/api/runs/${id}`);
        const run = (runRes.data as { data?: any })?.data ?? runRes.data;
        useRunStore.getState().setRun({
          runId: run.id,
          workflowId: run.workflowId,
          status: run.status,
          nodeStatuses: run.nodeStatuses || {},
          nodeResults: run.nodeResults || {},
          findings: run.findings || [],
          aiReport: run.aiReport || null,
          error: run.error || null,
          startedAt: run.startedAt || null,
          finishedAt: run.finishedAt || null,
        });

        const wfRes = await api.get(`/api/workflows/${run.workflowId}`);
        const wf = (wfRes.data as { data?: any })?.data ?? wfRes.data;
        if (cancelled) return;
        setWorkflow(wf);
        setNodes(wf?.nodes || []);
        setEdges(wf?.edges || []);

        if (run.status === "running" || run.status === "pending" || run.status === "queued") {
          while (!cancelled) {
            await sleep(800);
            const r = await api.get(`/api/runs/${id}`);
            const next = (r.data as { data?: any })?.data ?? r.data;
            useRunStore.getState().setRun({
              status: next.status,
              nodeStatuses: next.nodeStatuses || {},
              nodeResults: next.nodeResults || {},
              findings: next.findings || useRunStore.getState().findings,
              aiReport: next.aiReport || useRunStore.getState().aiReport,
              error: next.error || null,
              finishedAt: next.finishedAt || null,
            });
            if (["success", "error", "failed", "cancelled", "completed"].includes(next.status)) break;
          }
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, setNodes, setEdges]);

  if (loading) {
    return (
      <ReactFlowProvider>
        <Container size="full">
          <div className="py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text">Запуск #{id}</h1>
          </div>
          <div className="flex flex-col items-center gap-3 py-16" role="status" aria-live="polite">
            <Spinner size="lg" />
            <span className="text-sm text-text-muted">Загрузка...</span>
          </div>
        </Container>
      </ReactFlowProvider>
    );
  }

  if (error) {
    return (
      <ReactFlowProvider>
        <Container size="full">
          <div className="py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text">Запуск #{id}</h1>
            <Button variant="secondary" onClick={() => window.history.back()}>
              Назад
            </Button>
          </div>
          <Card>
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-error">{error}</p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Повторить
              </Button>
            </div>
          </Card>
        </Container>
      </ReactFlowProvider>
    );
  }

  return (
    <ReactFlowProvider>
      <Container size="full">
        <div className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-text">Запуск #{id}</h1>
            {status && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[status] ?? "bg-surface text-text-muted"}`}
                role="status"
                aria-live="polite"
              >
                {status}
              </span>
            )}
          </div>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Назад
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-200px)]">
          <div className="flex-1 min-h-[320px] rounded-lg border border-border overflow-hidden bg-surface">
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={{ animated: AnimatedEdge }} defaultEdgeOptions={{ type: "animated", animated: true }} fitView minZoom={0.2} maxZoom={2}>
              <Background />
              <Controls />
              <MiniMap
                nodeColor={(n) => {
                  const d = n.data as NodeData;
                  if (d.kind === "trigger") return "#50B848";
                  if (d.kind === "logic") return "#494B52";
                  if (d.kind === "scanner") return "#E65100";
                  if (d.kind === "notify") return "#1976D2";
                  return "#7B1FA2";
                }}
              />
            </ReactFlow>
          </div>
          <div className="w-full lg:w-96 lg:shrink-0 lg:overflow-auto">
            <ResultsPanel />
          </div>
        </div>
      </Container>
    </ReactFlowProvider>
  );
};

export default RunDetailPage;