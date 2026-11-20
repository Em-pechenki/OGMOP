function safeTargetPath(p) {
  if (typeof p !== "string" || !p.trim()) return ".";
  const value = p.trim();
  if (value.includes("\0") || value.length > 4096) return ".";
  const normalized = value.replace(/\\/g, "/");
  if (normalized.split("/").includes("..")) return ".";
  return value;
}

function safeWebhookUrl(u) {
  if (typeof u !== "string" || !u.trim()) return "";
  const value = u.trim();
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (url.username || url.password) return "";
    if (value.length > 2048) return "";
    return value;
  } catch {
    return "";
  }
}
export function generateScenario(payload = {}) {
  const prompt = String(payload.prompt || "").trim();
  const name = payload.name ? String(payload.name).trim() : (prompt ? prompt.slice(0, 40) : "Generated workflow");
  const stack = payload.stack || "kotlin-spring";
  const scanners = Array.isArray(payload.scanners) && payload.scanners.length
    ? payload.scanners
    : ["secrets", "sca", "sast"];
  const notify = payload.notify || payload.notification || "none";
  const aiReport = payload.aiReport !== false;

  const nodes = [];
  const edges = [];
  let x = 0;
  const step = 120;

  const triggerId = "n_trigger";
  nodes.push({ id: triggerId, type: "trigger.manual", position: { x, y: 0 }, data: { kind: "trigger", triggerType: "manual", label: "Start" } });
  x += step;

  let prev = triggerId;
  const scannerIds = [];
  scanners.forEach((s, i) => {
    const id = `n_scanner_${i}`;
    scannerIds.push(id);
    const st = String(s).toLowerCase();
    nodes.push({ id, type: `scanner.${st}`, position: { x, y: 0 }, data: { kind: "scanner", scannerType: st, label: st.toUpperCase(), config: { scannerType: st, targetPath: safeTargetPath(payload.targetPath) || "." } } });
    edges.push({ source: prev, target: id });
    prev = id;
    x += step;
  });

  if (aiReport) {
    const id = "n_ai";
    nodes.push({ id, type: "ai.analyze", position: { x, y: 0 }, data: { kind: "ai", label: "AI", prompt } });
    edges.push({ source: prev, target: id });
    prev = id;
    x += step;
  }

  if (notify && notify !== "none") {
    const channel = String(notify).toLowerCase() === "telegram" ? "telegram" : String(notify).toLowerCase() === "email" ? "smtp" : "webhook";
    const id = "n_notify";
    nodes.push({ id, type: "notify.webhook", position: { x, y: 0 }, data: { kind: "notify", channel, label: "Notify", config: { channel, url: safeWebhookUrl(payload.webhookUrl) } } });
    edges.push({ source: prev, target: id });
  }

  // warnings for unknown node types? none here
  const warnings = [];
  if (nodes.length > 50) warnings.push("Too many nodes");
  if (edges.length > 100) warnings.push("Too many edges");

  return { name, stack, nodes, edges, warnings };
}

export default { generateScenario };