// Scanner: SAST (basic rules for Kotlin/Spring Boot).
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { cachedScan } from "./scan-cache.service.js";

const RULES = [
  {
    name: "SQL injection via string concatenation",
    regex: /"SELECT[^"]*"\s*\+\s*\w+|"INSERT[^"]*"\s*\+\s*\w+|"UPDATE[^"]*"\s*\+\s*\w+|"DELETE[^"]*"\s*\+\s*\w+/gi,
    severity: "critical",
    message: "SQL query built by string concatenation with user input — potential SQL injection.",
  },
  {
    name: "Hardcoded credentials",
    regex: /(?:password|passwd|pwd|secret|apiKey|api_key)\s*=\s*"[^"]{4,}"/gi,
    severity: "high",
    message: "Hardcoded credential in source code.",
  },
  {
    name: "Insecure HTTP URL",
    regex: /http:\/\/[^\s"']+/g,
    severity: "medium",
    message: "Plain HTTP URL used; prefer HTTPS.",
  },
  {
    name: "Disabled CSRF",
    regex: /csrf\s*\{\s*it\.disable\(\)\s*\}/gi,
    severity: "medium",
    message: "CSRF protection disabled.",
  },
  {
    name: "Permit all requests",
    regex: /anyRequest\(\)\.permitAll\(\)/g,
    severity: "high",
    message: "All requests permitted without authentication.",
  },
  {
    name: "Reflection / arbitrary code execution",
    regex: /Class\.forName\s*\(/g,
    severity: "critical",
    message: "Reflection on user-controlled input — potential RCE.",
  },
  {
    name: "Weak role comparison",
    regex: /role\s*==\s*"root"/g,
    severity: "low",
    message: "Weak role comparison allows privileged role string.",
  },
  {
    name: "Direct DriverManager usage",
    regex: /DriverManager\.getConnection/g,
    severity: "medium",
    message: "Direct DriverManager.getConnection; prefer DataSource.",
  },
  {
    name: "Debug/actuator endpoints exposed",
    regex: /@GetMapping\("\/actuator"/g,
    severity: "low",
    message: "Actuator endpoint potentially exposed.",
  },
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
  for (const rule of RULES) {
    const re = new RegExp(rule.regex.source, rule.regex.flags);
    let m;
    while ((m = re.exec(content)) !== null) {
      out.push({
        scanner: "sast",
        severity: rule.severity,
        file: rel,
        line: lineNumberOf(lines, m.index),
        title: rule.name,
        message: rule.message + ` (${rule.name})`,
        snippet: m[0].slice(0, 120),
        cve: null,
      });
    }
  }
  return out;
}

export async function scanSast({ root, config = {} } = {}) {
  return cachedScan("sast", root, config, async () => {
    const extensions = config.extensions || [".kt", ".java"];
    const files = collectFiles(root, extensions);
    const perFile = await Promise.all(files.map((file) => scanOneFile(root, file)));
    const findings = [];
    for (const arr of perFile) {
      for (const f of arr) {
        findings.push({ id: `sast-${findings.length + 1}`, ...f });
      }
    }
    return findings;
  });
}

export default { scanSast };
