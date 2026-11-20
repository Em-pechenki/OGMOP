// In-memory store for OGMOP backend (hackathon phase 1).
// All data is volatile and resets on process restart.

import fs from "node:fs";
import path from "node:path";

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
  const d = data || {};
  const id = d.id || newId("tpl");
  const template = {
    id,
    name: d.name || "Untitled template",
    description: d.description || "",
    workflow: d.workflow || null,
    author: d.author,
    tags: Array.isArray(d.tags) ? d.tags : (d.tags ? [String(d.tags)] : []),
    createdAt: d.createdAt || now(),
    updatedAt: d.updatedAt || now(),
    isPublic: d.isPublic !== undefined ? Boolean(d.isPublic) : true,
    usageCount: typeof d.usageCount === "number" ? d.usageCount : 0,
    previewSvg: d.previewSvg,
    version: d.version,
    category: d.category,
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

// ---------- Seed templates ----------
function seedTemplates() {
  const candidates = [
    path.resolve(process.cwd(), "src", "backend", "seed", "templates"),
    path.resolve(process.cwd(), "src/backend/seed/templates"),
  ];
  let dir = null;
  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isDirectory()) { dir = c; break; }
    } catch { /* ignore */ }
  }
  if (!dir) return;
  let files = [];
  try { files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json")); } catch { return; }
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const data = JSON.parse(raw);
      const id = data && data.id ? String(data.id) : f.replace(/\.json$/i, "");
      if (templates.has(id)) continue;
      const template = {
        id,
        name: data.name || data.workflow?.name || f.replace(/\.json$/i, ""),
        description: data.description || data.workflow?.description || "",
        workflow: data.workflow && typeof data.workflow === "object" ? data.workflow : (data.nodes ? { name: data.name, nodes: data.nodes, edges: data.edges } : null),
        author: data.author,
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now(),
        isPublic: data.isPublic !== false,
        usageCount: typeof data.usageCount === "number" ? data.usageCount : 0,
        previewSvg: data.previewSvg,
        version: data.version,
        category: data.category,
      };
      templates.set(id, template);
    } catch (e) {
      // ignore malformed seed files
    }
  }
}

seedTemplates();

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
