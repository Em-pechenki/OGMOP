// AI service: LLM adapter (OpenAI / Anthropic / mock fallback).
const PROVIDER = (process.env.LLM_PROVIDER || (process.env.LLM_API_KEY ? "openai" : "mock")).toLowerCase();
const API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.LLM_MODEL || (PROVIDER === "anthropic" ? "claude-3-5-sonnet-20241022" : "gpt-4o-mini");
const BASE_URL = process.env.LLM_BASE_URL || (PROVIDER === "anthropic" ? "https://api.anthropic.com" : "https://api.openai.com");

function buildPrompt(findings) {
  const list = (findings || []).map((f, i) => `${i + 1}. [${f.severity}] ${f.scanner} in ${f.file}${f.line ? ":" + f.line : ""} — ${f.message}`).join("\n");
  return `You are a security assistant. Given the following findings from an automated scan, produce a JSON object with keys:
- "summary": short overall summary (string).
- "findings": array of objects with keys "id" (finding id), "explanation" (plain language, 1-2 sentences), "recommendation" (concrete fix steps).
- "recommendations": array of top-level actionable recommendations (strings).

Only reference finding ids that exist in the input. Do not invent CVEs. Respond with valid JSON only.

Findings:
${list || "(none)"}`;
}

function mockReport(findings) {
  const out = {
    summary: `Found ${findings.length} potential issue(s) across the scanned repository.`,
    findings: (findings || []).map((f) => ({
      id: f.id,
      explanation: `${f.message} Located in ${f.file}${f.line ? " at line " + f.line : ""}.`,
      recommendation: `Review and remediate the ${f.scanner} finding. Remove secrets from source, upgrade vulnerable dependencies, or fix the insecure code pattern.`,
    })),
    recommendations: [
      "Remove all hardcoded secrets and use environment variables or a secret manager.",
      "Upgrade vulnerable dependencies to fixed versions.",
      "Fix SQL injection by using parameterized queries.",
      "Restrict endpoints with proper authentication/authorization.",
    ],
  };
  return out;
}

async function callOpenAI(prompt) {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(text);
}

async function callAnthropic(prompt) {
  const res = await fetch(`${BASE_URL}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.content?.[0]?.text || "{}";
  // strip code fences if present
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

function validateReport(report, findings) {
  const ids = new Set((findings || []).map((f) => f.id));
  const safe = {
    summary: typeof report?.summary === "string" ? report.summary : "Analysis complete.",
    findings: Array.isArray(report?.findings)
      ? report.findings
          .filter((f) => f && ids.has(f.id))
          .map((f) => ({
            id: f.id,
            explanation: String(f.explanation || ""),
            recommendation: String(f.recommendation || ""),
          }))
      : [],
    recommendations: Array.isArray(report?.recommendations) ? report.recommendations.map(String) : [],
  };
  // ensure every finding has an entry
  for (const f of findings || []) {
    if (!safe.findings.some((x) => x.id === f.id)) {
      safe.findings.push({ id: f.id, explanation: f.message, recommendation: "Review and remediate." });
    }
  }
  return safe;
}

export async function analyze(findings) {
  const prompt = buildPrompt(findings);
  let raw;
  try {
    if (PROVIDER === "mock" || !API_KEY) {
      raw = mockReport(findings);
    } else if (PROVIDER === "anthropic") {
      raw = await callAnthropic(prompt);
    } else {
      raw = await callOpenAI(prompt);
    }
  } catch (err) {
    console.error("LLM call failed, falling back to mock:", err && err.message);
    raw = mockReport(findings);
  }
  return validateReport(raw, findings);
}

export default { analyze };