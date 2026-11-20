// Scanner: secrets (regex-based). No external scanners.
import fs from "node:fs";
import path from "node:path";
import { cachedScan } from "./scan-cache.service.js";

const SECRET_PATTERNS = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
  { name: "AWS Secret Key", regex: /(?:aws_secret_access_key|aws_secret)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi, severity: "critical" },
  { name: "Generic API Key", regex: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([A-Za-z0-9_\-]{16,})["']/gi, severity: "high" },
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

export async function scanSecrets({ root, config = {} } = {}) {
  return cachedScan("secrets", root, config, async () => {
    const findings = [];
    const extensions = config.extensions || [".kt", ".kts", ".java", ".properties", ".yml", ".yaml", ".json", ".env", ".gradle"];
    const files = collectFiles(root, extensions);
    for (const file of files) {
      let content;
      try { content = fs.readFileSync(file, "utf8"); } catch { continue; }
      const lines = content.split(/\r?\n/);
      for (const pat of SECRET_PATTERNS) {
        pat.regex.lastIndex = 0;
        let m;
        while ((m = pat.regex.exec(content)) !== null) {
          const idx = m.index;
          let lineNo = 1;
          let acc = 0;
          for (let i = 0; i < lines.length; i++) {
            acc += lines[i].length + 1;
            if (acc > idx) { lineNo = i + 1; break; }
          }
          const matched = m[0];
          findings.push({
            id: `secret-${findings.length + 1}`,
            scanner: "secrets",
            severity: pat.severity,
            file: path.relative(root, file).replace(/\\/g, "/"),
            line: lineNo,
            title: `${pat.name} detected`,
            message: `${pat.name} detected`,
            snippet: mask(matched),
            cve: null,
          });
        }
        pat.regex.lastIndex = 0;
      }
    }
    return findings;
  });
}

export default { scanSecrets };