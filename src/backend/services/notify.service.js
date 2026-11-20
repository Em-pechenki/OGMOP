// Notification service: Telegram / SMTP / HTTP webhook.
function maskSecrets(obj) {
  try {
    return JSON.parse(JSON.stringify(obj, (k, v) => {
      if (typeof v === "string" && /token|password|secret|key/i.test(k)) {
        return v.length <= 6 ? "***" : v.slice(0, 2) + "***" + v.slice(-2);
      }
      return v;
    }));
  } catch {
    return obj;
  }
}

async function sendTelegram(config, payload) {
  const token = config.token || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = config.chatId || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram token/chatId missing");
  const text = formatMessage(payload);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!res.ok) throw new Error(`Telegram HTTP ${res.status}`);
  return { channel: "telegram", ok: true };
}

function isSafeUrl(raw) {
  try {
    const u = new URL(String(raw));
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (!host) return false;
    const allowLocal = process.env.NODE_ENV !== "production";
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".localhost")) {
      return allowLocal;
    }
    if (host === "0.0.0.0" || host === "169.254.169.254" || host === "metadata.google.internal") return false;
    if (/^(10\\.|192\\.168\\.|172\\.(1[6-9]|2[0-9]|3[0-1])\\.|169\\.254\\.)/.test(host)) {
      return allowLocal;
    }
    return true;
  } catch {
    return false;
  }
}

async function sendWebhook(config, payload) {
  const url = config.url || config.webhookUrl;
  if (!url) throw new Error("Webhook URL missing");
  if (!isSafeUrl(url)) throw new Error("Unsafe webhook URL");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(config.headers || {}) },
    body: JSON.stringify(payload),
  });
  // don't throw on non-2xx? still report
  return { channel: "webhook", ok: res.ok, status: res.status };
}

async function sendSmtp(config, payload) {
  // nodemailer not bundled; attempt dynamic import
  // nodemailer is an optional dependency; load lazily to avoid bundler resolution.
  let nodemailer = null;
  try {
    const modName = "nodemailer";
    nodemailer = await import(modName);
  } catch {
    nodemailer = null;
  }
  if (!nodemailer) {
    console.warn("SMTP unavailable: nodemailer not installed");
    return { channel: "smtp", ok: false, error: "nodemailer not installed" };
  }
  try {
    const transporter = nodemailer.createTransport ? nodemailer.createTransport : nodemailer.default.createTransport;
    const t = transporter({
      host: config.host || process.env.SMTP_HOST,
      port: config.port || process.env.SMTP_PORT || 587,
      secure: !!config.secure,
      auth: { user: config.user || process.env.SMTP_USER, pass: config.password || process.env.SMTP_PASS },
    });
    await t.sendMail({
      from: config.from || process.env.SMTP_FROM,
      to: config.to || process.env.SMTP_TO,
      subject: config.subject || "OGMOP Security Report",
      text: formatMessage(payload),
    });
    return { channel: "smtp", ok: true };
  } catch (err) {
    console.warn("SMTP unavailable:", err && err.message);
    return { channel: "smtp", ok: false, error: err && err.message };
  }
}

function formatMessage(payload) {
  const findings = payload?.findings || [];
  const lines = [];
  lines.push(`<b>OGMOP Security Report</b>`);
  lines.push(`Workflow: ${payload?.workflowName || payload?.workflowId || "-"}`);
  lines.push(`Status: ${payload?.status || "-"}`);
  lines.push(`Findings: ${findings.length}`);
  for (const f of findings.slice(0, 20)) {
    lines.push(`- [${f.severity}] ${f.scanner}: ${f.file}${f.line ? ":" + f.line : ""} — ${f.message}`);
  }
  if (payload?.aiReport?.summary) lines.push(`\nAI: ${payload.aiReport.summary}`);
  return lines.join("\n");
}

export async function notify(config, payload) {
  const safePayload = maskSecrets(payload || {});
  const channel = (config?.channel || config?.type || "webhook").toLowerCase();
  try {
    if (channel === "telegram") return await sendTelegram(config, safePayload);
    if (channel === "smtp") return await sendSmtp(config, safePayload);
    return await sendWebhook(config, safePayload);
  } catch (err) {
    console.error("Notify failed:", err && err.message);
    return { channel, ok: false, error: err && err.message };
  }
}

export default { notify, formatMessage };