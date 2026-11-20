// Scanner: secrets (regex-based). No external scanners.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { cachedScan } from "./scan-cache.service.js";

const SECRET_PATTERNS = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
  { name: "AWS Secret Key", regex: /(?:aws_secret_access_key|aws_secret)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi, severity: "critical" },
  { name: "Generic API Key", regex: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([A-Za-z0-9_-]{16,})["']/gi, severity: "high" },
  { name: "Generic Secret/Token", regex: /(?:secret|token|password|passwd|pwd)\s*[:=]\s*["']([^"'\s]{6,})["']/gi, severity: "high" },
  { name: "GitHub Token", regex: /ghp_[A-Za-z0-9]{36}/g, severity: "critical" },
  { name: "Slack Token", regex: /xox[baprs]-[A-Za-z0-9-]{10,}/g, severity: "high" },
  { name: "Private Key", regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, severity: "critical" },
  { name: "JWT Secret", regex: /jwt[_-]?secret\s*[:=]\s*["']([^"']{8,})["']/gi, severity: "high" },
  { name: "DB Connection String with password", regex: /jdbc:[^\s"']*password=[^\s"']+/gi, severity: "high" },
  { name: "Hardcoded password assignment", regex: /\b(?:dbPassword|password)\s*=\s*"[^"]{4,}"/gi, severity: "medium" },
];

function collectFiles(root, extensions) {
  const out = [];
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".git" || e.name === "build" || e.name === "target") continue;
        walk(full);
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (!extensions || extensions.includes(ext)) out.push(full);
      }
    }
  }
  walk(root);
  return out;
}

function mask(value) {
  if (!value) return value;
  if (value.length <= 8) return "*".repeat(value.length);
  return value.slice(0, 3) + "***" + value.slice(-2);
}

function lineNumberOf(lines, idx) {
  let acc = 0;
  for (let i = 0; i < lines.length; i++) {
    acc += lines[i].length + 1;
    if (acc > idx) return i + 1;
  }
  return lines.length || 1;
}

async function scanOneFile(root, file) {
  let content;
  try { content = await fsp.readFile(file, "utf8"); } catch { return []; }
  const lines = content.split(/\r?\n/);
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const out = [];
  for (const pat of SECRET_PATTERNS) {
    const re = new RegExp(pat.regex.source, pat.regex.flags);
    let m;
    while ((m = re.exec(content)) !== null) {
      out.push({
        scanner: "secrets",
        severity: pat.severity,
        file: rel,
        line: lineNumberOf(lines, m.index),
        title: `${pat.name} detected`,
        message: `${pat.name} detected`,
        snippet: mask(m[0]),
        cve: null,
      });
    }
  }
  return out;
}

export async function scanSecrets({ root, config = {} } = {}) {
  return cachedScan("secrets", root, config, async () => {
    const extensions = config.extensions || [".kt", ".kts", ".java", ".properties", ".yml", ".yaml", ".json", ".env", ".gradle"];
    const files = collectFiles(root, extensions);
    const perFile = await Promise.all(files.map((file) => scanOneFile(root, file)));
    const findings = [];
    for (const arr of perFile) {
      for (const f of arr) {
        findings.push({ id: `secret-${findings.length + 1}`, ...f });
      }
    }
    return findings;
  });
}

export default { scanSecrets };
