/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Container from "@frontend/components/layout/Container";
import Button from "@frontend/components/ui/Button";
import { nodeTypes } from "@frontend/components/nodes";
import ResultsPanel from "@frontend/components/ResultsPanel";
import { api } from "@frontend/services/api";
import { useRunStore } from "@frontend/store/runStore";
import { useWorkflowStore } from "@frontend/store/workflowStore";
import type { NodeData } from "@shared/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const RunDetailPage: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setNodes = useWorkflowStore((s) => s.setNodes);
  const setEdges = useWorkflowStore((s) => s.setEdges);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);

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
          <div className="py-8 text-text-muted">Загрузка...</div>
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
          </div>
          <div className="py-8 text-error">{error}</div>
        </Container>
      </ReactFlowProvider>
    );
  }

  return (
    <ReactFlowProvider>
      <Container size="full">
        <div className="py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text">Запуск #{id}</h1>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Назад
          </Button>
        </div>
        <div className="flex gap-4 h-[calc(100vh-200px)]">
          <div className="flex-1 rounded-lg border border-border overflow-hidden bg-surface">
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
              <Background />
              <Controls />
              <MiniMap nodeColor={(n) => {
                const d = n.data as NodeData;
                if (d.kind === "trigger") return "#50B848";
                if (d.kind === "logic") return "#494B52";
                if (d.kind === "scanner") return "#E65100";
                if (d.kind === "notify") return "#1976D2";
                return "#7B1FA2";
              }} />
            </ReactFlow>
          </div>
          <div className="w-96 shrink-0 overflow-auto">
            <ResultsPanel />
          </div>
        </div>
      </Container>
    </ReactFlowProvider>
  );
};

export default RunDetailPage;