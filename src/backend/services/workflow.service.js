import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
} from "../store/memory.store.js";

function slugName(desc) {
  const base = String(desc || "").trim().split(/\s+/).slice(0, 6).join(" ");
  return base ? `AI: ${base}`.slice(0, 80) : "AI-generated workflow";
}

export function generateWorkflow(payload) {
  const p = payload || {};
  const description = String(p.description || "").trim();
  const name = p.name || slugName(description);
  const scannersIn = Array.isArray(p.scanners) && p.scanners.length ? p.scanners : ["secrets", "sca", "sast"];
  const notify = p.notify || "telegram";
  const useAi = p.ai !== false;

  const nodes = [];
  const edges = [];
  let x = 80;
  const y = 120;
  const gap = 260;

  function add(type, data) {
    const id = `node_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    nodes.push({ id, type, position: { x, y }, data: { ...data } });
    x += gap;
    return id;
  }

  const triggerId = add("trigger", {
    kind: "trigger",
    triggerType: "manual",
    label: "Триггер: ручной запуск",
  });

  const scannerIds = [];
  for (const s of scannersIn) {
    const st = String(s).toLowerCase();
    if (st === "secrets") {
      scannerIds.push(add("scanner", { kind: "scanner", scannerType: "secrets", label: "Сканер: Secrets", config: { scannerType: "secrets" } }));
    } else if (st === "sca") {
      scannerIds.push(add("scanner", { kind: "scanner", scannerType: "sca", label: "Сканер: SCA", config: { scannerType: "sca" } }));
    } else if (st === "sast") {
      scannerIds.push(add("scanner", { kind: "scanner", scannerType: "sast", label: "Сканер: SAST", config: { scannerType: "sast" } }));
    }
  }
  if (scannerIds.length === 0) {
    scannerIds.push(add("scanner", { kind: "scanner", scannerType: "secrets", label: "Сканер: Secrets", config: { scannerType: "secrets" } }));
  }

  let prev = triggerId;
  for (const sid of scannerIds) {
    edges.push({ id: `e_${prev}_${sid}`, source: prev, target: sid });
    prev = sid;
  }

  let aiId = null;
  if (useAi) {
    aiId = add("ai", { kind: "ai", label: "AI-анализ", provider: "", model: "gpt-4o", prompt: description, temperature: 0.2, maxTokens: 1024 });
    edges.push({ id: `e_${prev}_${aiId}`, source: prev, target: aiId });
    prev = aiId;
  }

  const channel = notify === "email" ? "smtp" : notify === "webhook" ? "webhook" : "telegram";
  const notifyId = add("notify", { kind: "notify", channel, label: `Уведомление: ${channel}`, config: { channel } });
  edges.push({ id: `e_${prev}_${notifyId}`, source: prev, target: notifyId });

  // optional logic node for PR/branch keywords
  if (/pr|pull request|ветк|branch/i.test(description)) {
    const logicId = add("logic", { kind: "logic", logicType: "if", label: "Логика: if/else", condition: "pr.opened == true" });
    // insert before scanners: rebuild edges roughly by appending extra edge trigger->logic? keep simple chain already built; add logic as parallel not necessary.
    // Remove logic node to avoid dangling? Instead keep it appended at end before notify? We'll leave as extra terminal node.
    edges.push({ id: `e_${triggerId}_${logicId}`, source: triggerId, target: logicId });
  }

  return {
    name,
    description,
    nodes,
    edges,
  };
}

export const workflowService = {
  create(payload) {
    return createWorkflow(payload || {});
  },
  getById(id) {
    return getWorkflow(id);
  },
  list() {
    return listWorkflows();
  },
  update(id, patch) {
    return updateWorkflow(id, patch || {});
  },
  remove(id) {
    return deleteWorkflow(id);
  },
  generate(payload) {
    return generateWorkflow(payload || {});
  },
};

export default workflowService;