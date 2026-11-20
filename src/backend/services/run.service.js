import { createRun, getRun, updateRun, getWorkflow, listRuns } from "../store/memory.store.js";
import { executeWorkflow } from "../engine/workflow-engine.js";

export function startRun(workflowId, input = {}) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) return null;

  // snapshot workflow at run time
  const run = createRun(workflowId, {
    id: workflow.id,
    name: workflow.name,
    nodes: workflow.nodes,
    edges: workflow.edges,
  });
  run.input = input || {};
  updateRun(run.id, { input: run.input });

  // execute asynchronously
  setImmediate(async () => {
    updateRun(run.id, { status: "running" });
    try {
      const result = await executeWorkflow(run, workflow, {
        onUpdate: (patch) => updateRun(run.id, patch),
      });
      updateRun(run.id, {
        status: result.status,
        nodeStatuses: result.nodeStatuses,
        nodeResults: result.nodeResults,
        error: result.error,
        finishedAt: new Date().toISOString(),
      });
    } catch (err) {
      updateRun(run.id, {
        status: "failed",
        error: err && err.message ? err.message : String(err),
        finishedAt: new Date().toISOString(),
      });
    }
  });

  return run;
}

export function getRunStatus(runId) {
  const run = getRun(runId);
  if (!run) return null;
  return {
    id: run.id,
    workflowId: run.workflowId,
    status: run.status,
    nodeStatuses: run.nodeStatuses || {},
    nodeResults: run.nodeResults || {},
    findings: run.findings || [],
    aiReport: run.aiReport || null,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    error: run.error,
  };
}


export function listRunsStatus() {
  return listRuns().map((run) => ({
    id: run.id,
    workflowId: run.workflowId,
    status: run.status,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
  }));
}
