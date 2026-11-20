// Workflow engine: topological sort + full node handlers (phase 2).
import path from "node:path";
import { scanSecrets } from "../services/scanner-secrets.service.js";
import { scanSca } from "../services/scanner-sca.service.js";
import { scanSast } from "../services/scanner-sast.service.js";
import { analyze } from "../services/ai.service.js";
import { notify } from "../services/notify.service.js";

export function topologicalSort(nodes, edges) {
  const safeNodes = Array.isArray(nodes) ? nodes.filter((n) => n && n.id !== undefined && n.id !== null) : [];
  // dedupe by id, keep first occurrence
  const seen = new Set();
  const uniqueNodes = [];
  for (const n of safeNodes) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    uniqueNodes.push(n);
  }
  const nodeIds = uniqueNodes.map((n) => n.id);
  const idSet = new Set(nodeIds);
  const adjacency = new Map(nodeIds.map((id) => [id, []]));
  const indegree = new Map(nodeIds.map((id) => [id, 0]));

  const safeEdges = Array.isArray(edges) ? edges : [];
  for (const e of safeEdges) {
    if (!e || !idSet.has(e.source) || !idSet.has(e.target)) continue;
    if (e.source === e.target) {
      // self-loop: count as dependency so node is still appended later
      indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
      adjacency.get(e.source).push(e.target);
      continue;
    }
    adjacency.get(e.source).push(e.target);
    indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
  }

  const queue = nodeIds.filter((id) => (indegree.get(id) || 0) === 0);
  const ordered = [];
  while (queue.length) {
    const id = queue.shift();
    ordered.push(id);
    for (const next of adjacency.get(id) || []) {
      indegree.set(next, (indegree.get(next) || 0) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }

  // append cycle / remaining nodes deterministically
  for (const id of nodeIds) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  const byId = new Map(uniqueNodes.map((n) => [n.id, n]));
  return ordered.map((id) => byId.get(id)).filter(Boolean);
}

function getNodeData(node) {
  return (node && node.data) || {};
}

function asString(v) {
  if (v === undefined || v === null) return "";
  return String(v);
}

function getValue(expr, context) {
  // supports "input.x", "nodeId.output", or literal
  if (typeof expr !== "string") return expr;
  if (expr.startsWith("input.")) {
    const key = expr.slice(6);
    return context.input?.[key];
  }
  const m = expr.match(/^([A-Za-z0-9_-]+)\.(.+)$/);
  if (m && context.nodeOutputs?.[m[1]]) {
    return context.nodeOutputs[m[1]]?.[m[2]];
  }
  return expr;
}

function compare(left, op, right) {
  const l = Number(left);
  const r = Number(right);
  const useNum = !isNaN(l) && !isNaN(r) && String(left).trim() !== "" && String(right).trim() !== "";
  switch (op) {
    case "eq": return useNum ? l === r : asString(left) === asString(right);
    case "ne": return useNum ? l !== r : asString(left) !== asString(right);
    case "gt": return useNum ? l > r : asString(left) > asString(right);
    case "lt": return useNum ? l < r : asString(left) < asString(right);
    case "gte": return useNum ? l >= r : asString(left) >= asString(right);
    case "lte": return useNum ? l <= r : asString(left) <= asString(right);
    case "contains": return asString(left).includes(asString(right));
    case "regex": try { return new RegExp(asString(right)).test(asString(left)); } catch { return false; }
    default: return false;
  }
}

function resolveRoot(input) {
  if (input?.repoPath) {
    const p = input.repoPath;
    if (typeof p !== "string" || p.includes("\0")) {
      throw new Error("Invalid repository path");
    }
    const normalized = p.replace(/\\\\/g, "/");
    if (normalized.split("/").includes("..")) {
      throw new Error("Invalid repository path");
    }
    if (path.isAbsolute(p)) return p;
    return path.resolve(process.cwd(), p);
  }
  // default demo repo
  return path.resolve(process.cwd(), "src", "backend", "seed", "demo-repo");
}

import fs from "node:fs";

function cvePath() {
  const candidates = [
    path.resolve(process.cwd(), "src", "backend", "seed", "cve-database.json"),
    path.resolve(process.cwd(), "cve-database.json"),
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch (e) { /* ignore */ }
  }
  return candidates[0];
}

function resolveType(node) {
  const t = node && node.type;
  if (t && String(t).includes(".")) return String(t);
  const d = (node && node.data) || {};
  if (d.kind === "trigger") return `trigger.${d.triggerType || "manual"}`;
  if (d.kind === "logic") return `logic.${d.logicType || "if"}`;
  if (d.kind === "scanner") return `scanner.${d.scannerType || "secrets"}`;
  if (d.kind === "notify") return `notify.${d.channel || "webhook"}`;
  if (d.kind === "ai") return "ai.analyze";
  return String(t || "");
}

async function handleNode(node, context) {
  const type = resolveType(node);
  const data = getNodeData(node);

  if (type === "trigger.manual" || type === "trigger.schedule") {
    return { status: "success", output: { triggered: true, triggerType: data.triggerType || "manual", input: context.input || {} } };
  }

  if (type === "logic.if") {
    const left = getValue(data.left ?? "", context);
    const right = getValue(data.right ?? "", context);
    const op = data.operator || "eq";
    const result = data.condition ? evalCondition(data.condition, context) : compare(left, op, right);
    return { status: "success", output: { result: !!result, branch: result ? "true" : "false" } };
  }

  if (type === "logic.compare") {
    const left = getValue(data.left ?? "", context);
    const right = getValue(data.right ?? "", context);
    const op = data.operator || "eq";
    const result = compare(left, op, right);
    return { status: "success", output: { result: !!result, left, right, operator: op } };
  }

  if (type === "logic.regex") {
    const value = asString(getValue(data.left ?? data.value ?? "", context));
    const pattern = data.pattern || data.right || "";
    if (typeof pattern !== "string" || pattern.length > 200) {
      return { status: "success", output: { result: false, value, pattern } };
    }
    let result = false;
    try { result = new RegExp(pattern).test(value); } catch { result = false; }
    return { status: "success", output: { result, value, pattern } };
  }

  if (type === "scanner.secrets") {
    const root = resolveRoot(context.input || {});
    const findings = await scanSecrets({ root, config: data.config || {} });
    return { status: "success", output: { scanner: "secrets", findings, count: findings.length } };
  }

  if (type === "scanner.sca") {
    const root = resolveRoot(context.input || {});
    const findings = await scanSca({ root, config: { ...(data.config || {}), cvePath: cvePath() } });
    return { status: "success", output: { scanner: "sca", findings, count: findings.length } };
  }

  if (type === "scanner.sast") {
    const root = resolveRoot(context.input || {});
    const findings = await scanSast({ root, config: data.config || {} });
    return { status: "success", output: { scanner: "sast", findings, count: findings.length } };
  }

  if (type === "ai.analyze") {
    // collect findings from all previous scanner nodes
    const allFindings = [];
    for (const [, out] of Object.entries(context.nodeOutputs || {})) {
      if (out && Array.isArray(out.findings)) allFindings.push(...out.findings);
    }
    const report = await analyze(allFindings);
    return { status: "success", output: { aiReport: report, findingsCount: allFindings.length } };
  }

  if (type.startsWith("notify.")) {
    const allFindings = [];
    for (const out of Object.values(context.nodeOutputs || {})) {
      if (out && Array.isArray(out.findings)) allFindings.push(...out.findings);
    }
    const aiNode = Object.values(context.nodeOutputs || {}).find((o) => o && o.aiReport);
    const payload = {
      workflowId: context.workflowId,
      workflowName: context.workflowName,
      status: "completed",
      findings: allFindings,
      aiReport: aiNode ? aiNode.aiReport : null,
    };
    const result = await notify(data.config || {}, payload);
    return { status: "success", output: { notified: true, result } };
  }

  // unknown node type -> skipped (not a hard failure)
  // eslint-disable-next-line no-console
  console.warn("[engine] unknown node type, skipping:", type, node && node.id);
  return { status: "skipped", output: { nodeId: node && node.id, type, data, skipped: true, reason: "unknown node type" } };
}

function evalCondition(cond, context) {
  // Safe (non-eval) mini-evaluator: supports "input.x OP 'literal'" / "nodeId.path OP value".
  // Never executes arbitrary code.
  try {
    const m = String(cond).match(/^\s*(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+?)\s*$/);
    if (!m) return false;
    const leftExpr = m[1].trim();
    const op = m[2];
    const rightRaw = m[3].trim();
    const left = getValue(leftExpr, context);
    let right;
    if (/^(['"]).*\1$/.test(rightRaw)) {
      right = rightRaw.slice(1, -1);
    } else if (rightRaw === "true") {
      right = true;
    } else if (rightRaw === "false") {
      right = false;
    } else if (rightRaw === "null") {
      right = null;
    } else {
      right = getValue(rightRaw, context);
    }
    const opMap = { "==": "eq", "===": "eq", "!=": "ne", "!==": "ne", ">": "gt", "<": "lt", ">=": "gte", "<=": "lte" };
    return compare(left, opMap[op] || op, right);
  } catch {
    return false;
  }
}

export async function executeWorkflow(run, workflow, { onUpdate } = {}) {
  if (!workflow || typeof workflow !== "object") {
    return {
      status: "failed",
      nodeStatuses: {},
      nodeResults: {},
      findings: [],
      aiReport: null,
      error: "Workflow is required",
    };
  }
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const edges = Array.isArray(workflow.edges) ? workflow.edges : [];
  const ordered = topologicalSort(nodes, edges);

  const nodeStatuses = {};
  const nodeResults = {};
  const context = {
    input: (run && run.input) || {},
    nodeOutputs: {},
    workflowId: workflow.id,
    workflowName: workflow.name,
  };

  if (typeof onUpdate === "function") onUpdate({ status: "running", nodeStatuses: { ...nodeStatuses } });

  for (const node of ordered) {
    if (!node || !node.id) continue;
    nodeStatuses[node.id] = "running";
    if (typeof onUpdate === "function") onUpdate({ nodeStatuses: { ...nodeStatuses }, currentNode: node.id });

    try {
      await new Promise((r) => setTimeout(r, 30));
      const result = await handleNode(node, context);
      const status = (result && result.status) || "success";
      nodeStatuses[node.id] = status;
      nodeResults[node.id] = result && result.output ? result.output : null;
      if (result && result.output) context.nodeOutputs[node.id] = result.output;
    } catch (err) {
      nodeStatuses[node.id] = "failed";
      nodeResults[node.id] = { error: err && err.message ? err.message : String(err) };
      if (typeof onUpdate === "function") onUpdate({ nodeStatuses: { ...nodeStatuses }, nodeResults: { ...nodeResults } });
      return {
        status: "failed",
        nodeStatuses,
        nodeResults,
        findings: collectFindings(context),
        aiReport: collectAiReport(context),
        error: err && err.message ? err.message : String(err),
      };
    }
    if (typeof onUpdate === "function") onUpdate({ nodeStatuses: { ...nodeStatuses }, nodeResults: { ...nodeResults } });
  }

  const statuses = Object.values(nodeStatuses);
  const allSuccess = statuses.length === 0 || statuses.every((s) => s === "success" || s === "skipped");
  const findings = collectFindings(context);
  const aiReport = collectAiReport(context);
  return {
    status: allSuccess ? "success" : "failed",
    nodeStatuses,
    nodeResults,
    findings,
    aiReport,
    error: null,
  };
}

function collectFindings(context) {
  const all = [];
  for (const out of Object.values(context.nodeOutputs || {})) {
    if (out && Array.isArray(out.findings)) {
      for (const f of out.findings) {
        if (f && typeof f === "object") all.push(f);
      }
    }
  }
  const seen = new Set();
  return all.filter((f) => {
    const key = f && f.id ? f.id : JSON.stringify(f);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectAiReport(context) {
  for (const out of Object.values(context.nodeOutputs || {})) {
    if (out && out.aiReport) return out.aiReport;
  }
  return null;
}