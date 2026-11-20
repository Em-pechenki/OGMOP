import { api } from "@frontend/services/api";
import { useRunStore } from "@frontend/store/runStore";
import type { RunStatus } from "@shared/types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RunWorkflowOptions {
  input?: Record<string, unknown>;
  pollIntervalMs?: number;
}

export async function runWorkflow(workflowId: string, opts: RunWorkflowOptions = {}): Promise<string> {
  const store = useRunStore.getState();
  store.reset();
  store.setRun({ workflowId, status: "running" });

  const res = await api.post(`/api/workflows/${workflowId}/run`, { input: opts.input || {} });
  const runId = (res.data as { data?: { runId?: string } })?.data?.runId || (res.data as { runId?: string })?.runId;
  if (!runId) throw new Error("Не получен runId");
  store.setRun({ runId });

  const interval = opts.pollIntervalMs ?? 800;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(interval);
    const r = await api.get(`/api/runs/${runId}`);
    const run = (r.data as { data?: unknown })?.data ?? r.data;
    if (!run) continue;
    const nodeStatuses = (run as { nodeStatuses?: Record<string, string> }).nodeStatuses || {};
    const nodeResults = (run as { nodeResults?: Record<string, unknown> }).nodeResults || {};
    const status = (run as { status?: RunStatus }).status || "running";
    const findings = (run as { findings?: unknown[] }).findings || [];
    const aiReport = (run as { aiReport?: unknown }).aiReport || null;
    const error = (run as { error?: string | null }).error || null;
    const startedAt = (run as { startedAt?: string | null }).startedAt || null;
    const finishedAt = (run as { finishedAt?: string | null }).finishedAt || null;

    store.setRun({
      status,
      nodeStatuses: nodeStatuses as Record<string, any>,
      nodeResults: nodeResults as Record<string, any>,
      findings: findings as any,
      aiReport: aiReport as any,
      error,
      startedAt,
      finishedAt,
    });

    if (status === "success" || status === "error" || status === "failed" || status === "cancelled" || status === "completed") {
      break;
    }
  }

  return runId;
}

export default runWorkflow;