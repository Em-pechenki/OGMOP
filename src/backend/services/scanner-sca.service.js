// Scanner: SCA (Gradle Kotlin DSL + CVE database).
import fs from "node:fs";
import path from "node:path";

function readCveDb(cvePath) {
  try {
    const raw = fs.readFileSync(cvePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function parseVersion(v) {
  return String(v || "").replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);
}

function cmpVersion(a, b) {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  const len = Math.max(va.length, vb.length);
  for (let i = 0; i < len; i++) {
    const x = va[i] || 0;
    const y = vb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

// affectedVersions like ">=5.3.0 <5.3.18" or ">=1.0.0 <=1.2.3"
function inRange(version, range) {
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

function parseDependencies(content) {
  const deps = [];
  // implementation("group:artifact:version") or implementation("group:artifact:version") with quotes
  const regex = /(?:implementation|api|compile|runtimeOnly|testImplementation)\s*\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const coord = m[1];
    const parts = coord.split(":");
    if (parts.length >= 3) {
      deps.push({ group: parts[0], artifact: parts[1], version: parts[2], coord });
    }
  }
  // also handle variable versions? skip for MVP
  return deps;
}

export async function scanSca({ root, config = {} } = {}) {
  const findings = [];
  const cvePath = config.cvePath || path.join(root, "..", "..", "seed", "cve-database.json");
  // resolve relative to backend root if not found
  let dbPath = cvePath;
  if (!fs.existsSync(dbPath)) {
    // try common locations
    const candidates = [
      path.join(process.cwd(), "src", "backend", "seed", "cve-database.json"),
      path.join(process.cwd(), "cve-database.json"),
    ];
    dbPath = candidates.find((p) => fs.existsSync(p)) || dbPath;
  }
  const db = readCveDb(dbPath);
  const gradlePath = path.join(root, "build.gradle.kts");
  let content = "";
  try { content = fs.readFileSync(gradlePath, "utf8"); } catch {
    // search for any build.gradle.kts
    // simple: none
  }
  const deps = parseDependencies(content);
  for (const dep of deps) {
    const pkg = `${dep.group}:${dep.artifact}`;
    for (const cve of db) {
      if (cve.package !== pkg) continue;
      if (inRange(dep.version, cve.affectedVersions)) {
        findings.push({
          id: `sca-${findings.length + 1}`,
          scanner: "sca",
          severity: cve.severity,
          file: "build.gradle.kts",
          line: null,
          message: `${cve.title} (${cve.id}) in ${pkg}:${dep.version}`,
          snippet: `${pkg}:${dep.version}`,
          cve: cve.id,
          fixedVersion: cve.fixedVersion,
        });
      }
    }
  }
  return findings;
}

export default { scanSca };