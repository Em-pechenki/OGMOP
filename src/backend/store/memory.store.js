// In-memory store for OGMOP backend (hackathon phase 1).
// All data is volatile and resets on process restart.

const workflows = new Map();
const runs = new Map();
const templates = new Map();

function now() {
  return new Date().toISOString();
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Workflows ----------
export function createWorkflow(data) {
  const id = data.id || newId("wf");
  const workflow = {
    id,
    name: data.name || "Untitled workflow",
    description: data.description || "",
    nodes: Array.isArray(data.nodes) ? data.nodes : [],
    edges: Array.isArray(data.edges) ? data.edges : [],
    createdAt: now(),
    updatedAt: now(),
  };
  workflows.set(id, workflow);
  return workflow;
}

export function getWorkflow(id) {
  return workflows.get(id) || null;
}

export function listWorkflows() {
  return Array.from(workflows.values());
}

export function updateWorkflow(id, patch) {
  const existing = workflows.get(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now(),
  };
  workflows.set(id, updated);
  return updated;
}

export function deleteWorkflow(id) {
  return workflows.delete(id);
}

// ---------- Runs ----------
export function createRun(workflowId, workflowSnapshot) {
  const id = newId("run");
  const run = {
    id,
    workflowId,
    status: "queued", // queued | running | success | failed | cancelled
    nodeStatuses: {},
    nodeResults: {},
    startedAt: now(),
    finishedAt: null,
    error: null,
    workflow: workflowSnapshot || null,
  };
  runs.set(id, run);
  return run;
}

export function getRun(id) {
  return runs.get(id) || null;
}

export function listRuns() {
  return Array.from(runs.values());
}

export function updateRun(id, patch) {
  const existing = runs.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  runs.set(id, updated);
  return updated;
}

// ---------- Templates (star) ----------
export function createTemplate(data) {
  const id = data.id || newId("tpl");
  const template = {
    id,
    name: data.name || "Untitled template",
    description: data.description || "",
    workflow: data.workflow || null,
    createdAt: now(),
  };
  templates.set(id, template);
  return template;
}

export function getTemplate(id) {
  return templates.get(id) || null;
}

export function listTemplates() {
  return Array.from(templates.values());
}

export function updateTemplate(id, patch) {
  const existing = templates.get(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...(patch || {}),
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now(),
  };
  templates.set(id, updated);
  return updated;
}

export function deleteTemplate(id) {
  return templates.delete(id);
}

export const store = {
  workflows,
  runs,
  templates,
};

export default {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
  createRun,
  getRun,
  listRuns,
  updateRun,
  createTemplate,
  getTemplate,
  listTemplates,
  deleteTemplate,
  store,
};
