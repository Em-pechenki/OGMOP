// Client-side mock backend for GitHub Pages (no server required).
// Mirrors src/backend logic: engine, scanners, AI, notify, templates.

import type { FlowNode, FlowEdge, Workflow, Finding, Severity } from "@shared/types";

// ---------- Demo repo bundle ----------
let demoBundle: { files: Record<string, string>; cve: any[]; templates: any[] } | null = null;
async function loadBundle() {
  if (demoBundle) return demoBundle;
  try {
    const res = await fetch("/OGMOP/demo-repo.json");
    demoBundle = await res.json();
  } catch {
    demoBundle = { files: {}, cve: [], templates: [] };
  }
  return demoBundle;
}

// ---------- In-memory stores ----------
const workflows = new Map<string, any>();
const runs = new Map<string, any>();
const templates = new Map<string, any>();

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Scanners ----------
const SECRET_PATTERNS: { name: string; regex: RegExp; severity: Severity }[] = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
  { name: "GitHub Token", regex: /ghp_[A-Za-z0-9]{36}/g, severity: "critical" },
  { name: "Generic API Key", regex: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([A-Za-z0-9_\-]{16,})["']/gi, severity: "high" },
  { name: "Generic Secret/Token", regex: /(?:secret|token|password|passwd|pwd)\s*[:=]\s*["']([^"'\s]{6,})["']/gi, severity: "high" },
  { name: "Private Key", regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, severity: "critical" },
  { name: "JWT Secret", regex: /jwt[_-]?secret\s*[:=]\s*["']([^"']{8,})["']/gi, severity: "high" },
  { name: "Hardcoded password assignment", regex: /\b(?:dbPassword|password)\s*=\s*"[^"]{4,}"/gi, severity: "medium" },
];

function mask(v: string) {
  if (!v) return v;
  if (v.length <= 8) return "*".repeat(v.length);
  return v.slice(0, 3) + "***" + v.slice(-2);
}

async function scanSecrets(root: string): Promise<Finding[]> {
  const bundle = (await loadBundle())!;
  const findings: Finding[] = [];
  for (const [file, content] of Object.entries(bundle.files)) {
    const lines = (content as string).split(/\r?\n/);
    for (const pat of SECRET_PATTERNS) {
      pat.regex.lastIndex = 0;
      let m;
      while ((m = pat.regex.exec(content as string)) !== null) {
        const idx = m.index;
        let lineNo = 1;
        let acc = 0;
        for (let i = 0; i < lines.length; i++) {
          acc += lines[i].length + 1;
          if (acc > idx) { lineNo = i + 1; break; }
        }
        findings.push({
          id: `secret-${findings.length + 1}`,
          severity: pat.severity,
          title: `${pat.name} detected`,
          file,
          line: lineNo,
          message: `${pat.name} detected`,
          snippet: mask(m[0]),
          scanner: "secrets" as any,
        } as Finding);
      }
      pat.regex.lastIndex = 0;
    }
  }
  return findings;
}

const SAST_RULES = [
  { id: "SAST-001", name: "SQL injection", regex: /(?:SELECT|INSERT|UPDATE|DELETE)[^"]*"\s*\+\s*\w+/i, severity: "critical" as Severity, title: "SQL injection", message: "SQL query built via string concatenation" },
  { id: "SAST-002", name: "Hardcoded credentials", regex: /(?:password|secret|token)\s*=\s*"[^"]{4,}"/i, severity: "high" as Severity, title: "Hardcoded credentials", message: "Hardcoded credential assignment" },
  { id: "SAST-003", name: "CSRF disabled", regex: /csrf\s*\(\s*\)\s*\.\s*disable\s*\(\s*\)/i, severity: "high" as Severity, title: "CSRF disabled", message: "Spring Security CSRF protection disabled" },
  { id: "SAST-004", name: "Permit all", regex: /permitAll\s*\(\s*\)/i, severity: "medium" as Severity, title: "permitAll on endpoints", message: "Endpoints permitted without authentication" },
  { id: "SAST-005", name: "Reflection RCE", regex: /Class\.forName\s*\(/i, severity: "critical" as Severity, title: "Reflection on user input", message: "Potential RCE via reflection" },
];

async function scanSast(): Promise<Finding[]> {
  const bundle = (await loadBundle())!;
  const findings: Finding[] = [];
  for (const [file, content] of Object.entries(bundle.files)) {
    if (!file.endsWith(".kt") && !file.endsWith(".java")) continue;
    const lines = (content as string).split(/\r?\n/);
    for (const rule of SAST_RULES) {
      const re = new RegExp(rule.regex.source, rule.regex.flags);
      let m;
      while ((m = re.exec(content as string)) !== null) {
        const lineNo = (content as string).slice(0, m.index).split(/\r?\n/).length;
        const line = lines[lineNo - 1] || "";
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
        findings.push({
          id: `sast-${findings.length + 1}`,
          severity: rule.severity,
          title: rule.title,
          file,
          line: lineNo,
          message: rule.message,
          snippet: line.trim().slice(0, 200),
          scanner: "sast" as any,
        } as Finding);
      }
    }
  }
  return findings;
}

function cmpVersion(a: string, b: string) {
  const va = String(a).replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);
  const vb = String(b).replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(va.length, vb.length);
  for (let i = 0; i < len; i++) {
    const x = va[i] || 0;
    const y = vb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

function inRange(version: string, range: string) {
  const parts = String(range || "").trim().split(/\s+/);
  for (const part of parts) {
    const m = part.match(/^(>=|<=|>|<|=)?\s*(.+)$/);
    if (!m) continue;
    const op = m[1] || ">=";
    const ver = m[2];
    const c = cmpVersion(version, ver);
    if (op === ">=" && !(c >= 0)) return false;
    if (op === "<=" && !(c <= 0)) return false;
    if (op === ">" && !(c > 0)) return false;
    if (op === "<" && !(c < 0)) return false;
    if ((op === "=" || op === "==") && !(c === 0)) return false;
  }
  return true;
}

async function scanSca(): Promise<Finding[]> {
  const bundle = (await loadBundle())!;
  const findings: Finding[] = [];
  const db = bundle.cve || [];
  // parse build.gradle.kts from bundle
  const gradle = bundle.files["build.gradle.kts"] || "";
  const regex = /(?:implementation|api|compile|runtimeOnly)\s*\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = regex.exec(gradle)) !== null) {
    const coord = m[1];
    const parts = coord.split(":");
    if (parts.length < 3) continue;
    const pkg = `${parts[0]}:${parts[1]}`;
    const version = parts[2];
    for (const cve of db) {
      if (cve.package !== pkg) continue;
      if (inRange(version, cve.affectedVersions)) {
        findings.push({
          id: `sca-${findings.length + 1}`,
          severity: cve.severity,
          title: `${cve.title} (${cve.id})`,
          file: "build.gradle.kts",
          line: null as any,
          message: `${cve.title} (${cve.id}) in ${pkg}:${version}`,
          snippet: `${pkg}:${version}`,
          cve: cve.id,
          scanner: "sca" as any,
        } as Finding);
      }
    }
  }
  return findings;
}

// ---------- Engine ----------
function topologicalSort(nodes: FlowNode[], edges: FlowEdge[]) {
  const nodeIds = (nodes || []).map((n) => n.id);
  const idSet = new Set(nodeIds);
  const adjacency = new Map(nodeIds.map((id) => [id, [] as string[]]));
  const indegree = new Map(nodeIds.map((id) => [id, 0]));
  (edges || []).forEach((e) => {
    if (!idSet.has(e.source) || !idSet.has(e.target)) return;
    adjacency.get(e.source)!.push(e.target);
    indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
  });
  const queue = nodeIds.filter((id) => (indegree.get(id) || 0) === 0);
  const ordered: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    ordered.push(id);
    for (const next of adjacency.get(id) || []) {
      indegree.set(next, indegree.get(next)! - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  for (const id of nodeIds) if (!ordered.includes(id)) ordered.push(id);
  return ordered.map((id) => (nodes || []).find((n) => n.id === id)!);
}

function resolveType(node: FlowNode): string {
  const t = node.type;
  if (t && String(t).includes(".")) return String(t);
  const d: any = node.data || {};
  if (d.kind === "trigger") return `trigger.${d.triggerType || "manual"}`;
  if (d.kind === "logic") return `logic.${d.logicType || "if"}`;
  if (d.kind === "scanner") return `scanner.${d.scannerType || "secrets"}`;
  if (d.kind === "notify") return `notify.${d.channel || "webhook"}`;
  if (d.kind === "ai") return "ai.analyze";
  return String(t || "");
}

function compare(left: any, op: string, right: any) {
  const l = Number(left), r = Number(right);
  const useNum = !isNaN(l) && !isNaN(r) && String(left).trim() !== "" && String(right).trim() !== "";
  switch (op) {
    case "eq": return useNum ? l === r : String(left) === String(right);
    case "ne": return useNum ? l !== r : String(left) !== String(right);
    case "gt": return useNum ? l > r : String(left) > String(right);
    case "lt": return useNum ? l < r : String(left) < String(right);
    case "gte": return useNum ? l >= r : String(left) >= String(right);
    case "lte": return useNum ? l <= r : String(left) <= String(right);
    case "contains": return String(left).includes(String(right));
    case "regex": try { return new RegExp(String(right)).test(String(left)); } catch { return false; }
    default: return false;
  }
}

async function handleNode(node: FlowNode, context: any): Promise<{ status: string; output: any }> {
  const type = resolveType(node);
  const data: any = node.data || {};
  if (type === "trigger.manual" || type === "trigger.schedule") {
    return { status: "success", output: { triggered: true, input: context.input || {} } };
  }
  if (type === "logic.if" || type === "logic.compare") {
    const left = data.left ?? "";
    const right = data.right ?? "";
    const op = data.operator || "eq";
    const result = compare(left, op, right);
    return { status: "success", output: { result: !!result, left, right, operator: op } };
  }
  if (type === "logic.regex") {
    const value = String(data.left ?? data.value ?? "");
    const pattern = data.pattern || data.right || "";
    let result = false;
    try { result = new RegExp(pattern).test(value); } catch {}
    return { status: "success", output: { result, value, pattern } };
  }
  if (type === "scanner.secrets") {
    const findings = await scanSecrets("");
    return { status: "success", output: { scanner: "secrets", findings, count: findings.length } };
  }
  if (type === "scanner.sca") {
    const findings = await scanSca();
    return { status: "success", output: { scanner: "sca", findings, count: findings.length } };
  }
  if (type === "scanner.sast") {
    const findings = await scanSast();
    return { status: "success", output: { scanner: "sast", findings, count: findings.length } };
  }
  if (type === "ai.analyze") {
    const allFindings: any[] = [];
    for (const out of Object.values(context.nodeOutputs || {})) {
      if (out && Array.isArray((out as any).findings)) allFindings.push(...(out as any).findings);
    }
    const report = {
      summary: `Found ${allFindings.length} potential issue(s) across the scanned repository.`,
      findings: allFindings.map((f: any) => ({ id: f.id, explanation: `${f.message} in ${f.file}${f.line ? ":" + f.line : ""}.`, recommendation: "Review and remediate." })),
      recommendations: ["Remove hardcoded secrets.", "Upgrade vulnerable dependencies.", "Fix SQL injection with parameterized queries.", "Restrict endpoints with auth."],
    };
    return { status: "success", output: { aiReport: report, findingsCount: allFindings.length } };
  }
  if (type.startsWith("notify.")) {
    return { status: "success", output: { notified: true, result: { channel: type.split(".")[1], ok: true } } };
  }
  return { status: "success", output: { nodeId: node.id, type, data } };
}

async function executeWorkflow(run: any, workflow: any, onUpdate?: (p: any) => void) {
  const nodes = workflow.nodes || [];
  const edges = workflow.edges || [];
  const ordered = topologicalSort(nodes, edges);
  const nodeStatuses: Record<string, string> = {};
  const nodeResults: Record<string, any> = {};
  const context: any = { input: run.input || {}, nodeOutputs: {}, workflowId: workflow.id, workflowName: workflow.name };
  if (onUpdate) onUpdate({ status: "running", nodeStatuses: { ...nodeStatuses } });
  for (const node of ordered) {
    if (!node) continue;
    nodeStatuses[node.id] = "running";
    if (onUpdate) onUpdate({ nodeStatuses: { ...nodeStatuses }, currentNode: node.id });
    try {
      const result = await handleNode(node, context);
      nodeStatuses[node.id] = result.status;
      nodeResults[node.id] = result.output;
      context.nodeOutputs[node.id] = result.output;
    } catch (err: any) {
      nodeStatuses[node.id] = "failed";
      nodeResults[node.id] = { error: err?.message || String(err) };
      if (onUpdate) onUpdate({ nodeStatuses: { ...nodeStatuses }, nodeResults: { ...nodeResults } });
      return { status: "failed", nodeStatuses, nodeResults, findings: [], aiReport: null, error: err?.message };
    }
    if (onUpdate) onUpdate({ nodeStatuses: { ...nodeStatuses }, nodeResults: { ...nodeResults } });
  }
  const all = Object.values(context.nodeOutputs).flatMap((o: any) => (o && Array.isArray(o.findings)) ? o.findings : []);
  const seen = new Set();
  const findings = all.filter((f: any) => { if (seen.has(f.id)) return false; seen.add(f.id); return true; });
  let aiReport = null;
  for (const o of Object.values(context.nodeOutputs)) { if (o && (o as any).aiReport) { aiReport = (o as any).aiReport; break; } }
  const allSuccess = Object.values(nodeStatuses).every((s) => s === "success");
  return { status: allSuccess ? "success" : "failed", nodeStatuses, nodeResults, findings, aiReport, error: null };
}

// ---------- Mock API router ----------
const MOCK = (import.meta.env.VITE_API_URL || "").trim() === "" || (typeof window !== "undefined" && !window.location.hostname.includes("localhost"));

function ok(data: any) { return { data: { data, error: null } }; }
function err(msg: string, status = 400) { const e: any = new Error(msg); e.response = { status, data: { data: null, error: msg } }; throw e; }

async function handle(method: string, url: string, body?: any): Promise<any> {
  await loadBundle();
  const u = url.replace(/^\/api/, "");
  // health
  if (method === "GET" && u === "/health") return ok({ status: "ok", project: "OGMOP" });
  // workflows list
  if (method === "GET" && u === "/workflows") return ok(Array.from(workflows.values()));
  // create workflow
  if (method === "POST" && u === "/workflows") {
    const wf = { id: newId("wf"), name: body?.name || "Untitled", nodes: body?.nodes || [], edges: body?.edges || [], createdAt: new Date().toISOString() };
    workflows.set(wf.id, wf);
    return ok(wf);
  }
  // generate
  if (method === "POST" && (u === "/workflows/generate" || u === "/generate" || u === "/generate/scenario")) {
    const desc = body?.description || body?.prompt || "";
    // build a default workflow
    const nodes = [
      { id: "n1", type: "trigger.manual", position: { x: 50, y: 100 }, data: { kind: "trigger", triggerType: "manual", label: "Start" } },
      { id: "n2", type: "scanner.secrets", position: { x: 260, y: 100 }, data: { kind: "scanner", scannerType: "secrets", label: "Secrets", config: { scannerType: "secrets" } } },
      { id: "n3", type: "scanner.sca", position: { x: 470, y: 100 }, data: { kind: "scanner", scannerType: "sca", label: "SCA", config: { scannerType: "sca" } } },
      { id: "n4", type: "scanner.sast", position: { x: 680, y: 100 }, data: { kind: "scanner", scannerType: "sast", label: "SAST", config: { scannerType: "sast" } } },
      { id: "n5", type: "ai.analyze", position: { x: 890, y: 100 }, data: { kind: "ai", label: "AI report" } },
      { id: "n6", type: "notify.webhook", position: { x: 1100, y: 100 }, data: { kind: "notify", channel: "webhook", label: "Notify", config: { channel: "webhook" } } },
    ];
    const edges = [{ id: "e1", source: "n1", target: "n2" }, { id: "e2", source: "n2", target: "n3" }, { id: "e3", source: "n3", target: "n4" }, { id: "e4", source: "n4", target: "n5" }, { id: "e5", source: "n5", target: "n6" }];
    const wf = { id: newId("wf"), name: body?.name || "Generated workflow", nodes, edges, createdAt: new Date().toISOString() };
    workflows.set(wf.id, wf);
    return ok({ workflow: wf, runId: null });
  }
  // get workflow
  let m = u.match(/^\/workflows\/([^/]+)$/);
  if (method === "GET" && m) {
    const wf = workflows.get(m[1]);
    if (!wf) err("not found", 404);
    return ok(wf);
  }
  if (method === "PUT" && m) {
    const wf = workflows.get(m[1]);
    if (!wf) err("not found", 404);
    Object.assign(wf, body, { id: wf.id });
    workflows.set(wf.id, wf);
    return ok(wf);
  }
  if (method === "PATCH" && m) {
    const wf = workflows.get(m[1]);
    if (!wf) err("not found", 404);
    Object.assign(wf, body);
    workflows.set(wf.id, wf);
    return ok(wf);
  }
  if (method === "DELETE" && m) {
    workflows.delete(m[1]);
    return ok({ deleted: true });
  }
  // run workflow
  m = u.match(/^\/workflows\/([^/]+)\/run$/);
  if (method === "POST" && m) {
    const wf = workflows.get(m[1]);
    if (!wf) err("not found", 404);
    const run = { id: newId("run"), workflowId: wf.id, status: "queued", nodeStatuses: {}, nodeResults: {}, startedAt: new Date().toISOString(), finishedAt: null, error: null, workflow: wf, input: body?.input || {} };
    runs.set(run.id, run);
    // execute async
    setTimeout(async () => {
      run.status = "running";
      const result = await executeWorkflow(run, wf, (patch: any) => Object.assign(run, patch));
      Object.assign(run, { status: result.status, nodeStatuses: result.nodeStatuses, nodeResults: result.nodeResults, findings: result.findings, aiReport: result.aiReport, error: result.error, finishedAt: new Date().toISOString() });
    }, 50);
    return { data: { data: { runId: run.id }, error: null }, status: 202 };
  }
  // runs list
  if (method === "GET" && u === "/runs") return ok(Array.from(runs.values()).map((r: any) => ({ id: r.id, workflowId: r.workflowId, status: r.status, startedAt: r.startedAt, finishedAt: r.finishedAt })));
  // get run
  m = u.match(/^\/runs\/([^/]+)$/);
  if (method === "GET" && m) {
    const r = runs.get(m[1]);
    if (!r) err("not found", 404);
    return ok({ id: r.id, workflowId: r.workflowId, status: r.status, nodeStatuses: r.nodeStatuses || {}, nodeResults: r.nodeResults || {}, findings: r.findings || [], aiReport: r.aiReport || null, startedAt: r.startedAt, finishedAt: r.finishedAt, error: r.error });
  }
  // templates
  if (method === "GET" && u === "/templates") {
    await loadBundle();
    const bundle = demoBundle!;
    if (templates.size === 0) {
      for (const t of bundle.templates || []) templates.set(t.id, t);
    }
    let list = Array.from(templates.values());
    const q = (body?.q || body?.search || "").toLowerCase();
    // query params come via url? handle below via searchParams not passed; check body
    return ok(list);
  }
  if (method === "GET" && (m = u.match(/^\/templates\/([^/]+)$/))) {
    await loadBundle();
    const bundle = demoBundle!;
    if (templates.size === 0) for (const t of bundle.templates || []) templates.set(t.id, t);
    const t = templates.get(m[1]);
    if (!t) err("not found", 404);
    return ok(t);
  }
  if (method === "POST" && u === "/templates") {
    const t = { id: newId("tpl"), name: body?.name || "Untitled", description: body?.description || "", workflow: body?.workflow, tags: body?.tags || [], author: body?.author || "user", isPublic: body?.isPublic ?? true, usageCount: 0, createdAt: new Date().toISOString() };
    templates.set(t.id, t);
    return ok(t);
  }
  if (method === "POST" && (m = u.match(/^\/templates\/([^/]+)\/copy$/))) {
    await loadBundle();
    const bundle = demoBundle!;
    if (templates.size === 0) for (const t of bundle.templates || []) templates.set(t.id, t);
    const t = templates.get(m[1]);
    if (!t) err("not found", 404);
    const wf = t.workflow ? JSON.parse(JSON.stringify(t.workflow)) : { name: t.name, nodes: [], edges: [] };
    wf.id = newId("wf");
    workflows.set(wf.id, wf);
    t.usageCount = (t.usageCount || 0) + 1;
    return ok({ workflowId: wf.id, copied: true });
  }
  if (method === "DELETE" && (m = u.match(/^\/templates\/([^/]+)$/))) {
    templates.delete(m[1]);
    return ok({ deleted: true });
  }
  if (method === "POST" && u === "/ci/run") {
    return ok({ status: "success", findings: 0, message: "CI run completed (mock)" });
  }
  err("not found", 404);
}

// ---------- Public API ----------
export const isMockMode = () => {
  if (typeof window === "undefined") return false;
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && String(envUrl).trim() !== "") return false;
  // On GitHub Pages (not localhost), use mock
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
};

export async function mockRequest(method: string, url: string, body?: any, params?: any) {
  // handle query params for templates filtering
  let fullUrl = url;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
  }
  // parse query string from url
  let path = fullUrl;
  const query: any = {};
  if (fullUrl.includes("?")) {
    const [p, q] = fullUrl.split("?");
    path = p;
    q.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
  }
  // apply query filters for templates GET
  if (method === "GET" && path.replace(/^\/api/, "") === "/templates" && Object.keys(query).length) {
    await loadBundle();
    const bundle = demoBundle!;
    if (templates.size === 0) for (const t of bundle.templates || []) templates.set(t.id, t);
    let list = Array.from(templates.values());
    const q = (query.q || query.search || "").toLowerCase();
    if (q) list = list.filter((t: any) => (t.name || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q) || (t.tags || []).some((tag: string) => tag.toLowerCase().includes(q)));
    if (query.tag) list = list.filter((t: any) => (t.tags || []).includes(query.tag));
    if (query.category) list = list.filter((t: any) => t.category === query.category);
    if (query.author) list = list.filter((t: any) => t.author === query.author);
    if (query.isPublic !== undefined) list = list.filter((t: any) => String(t.isPublic) === String(query.isPublic));
    const sort = query.sort || "popular";
    list.sort((a: any, b: any) => sort === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : sort === "name" ? (a.name || "").localeCompare(b.name || "") : (b.usageCount || 0) - (a.usageCount || 0));
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "20", 10);
    const total = list.length;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);
    return { data: { data: paged, error: null, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } } };
  }
  const result = await handle(method, path, body);
  // normalize response shape: handle returns either {data:{data,error}} or {data:{data,error},status}
  if (result && result.data) return result;
  return { data: result };
}
