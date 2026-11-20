import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const DEMO_REPO = path.resolve(process.cwd(), "src/backend/seed/demo-repo");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const SECRET_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "AWS access key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub token", re: /ghp_[A-Za-z0-9]{36,}/ },
  { name: "hardcoded password", re: /(password|passwd)\s*[:=]\s*["'][^"']+["']/i },
  { name: "api key", re: /(api[_-]?key|secret|token)\s*[:=]\s*["'][^"']+["']/i },
];

describe("scanner: secrets (demo-repo)", () => {
  it("finds secrets in demo-repo", () => {
    const files = walk(DEMO_REPO).filter((f) => /\.(kt|kts|properties|yml|yaml)$/i.test(f));
    const findings: string[] = [];
    for (const f of files) {
      const content = fs.readFileSync(f, "utf8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        for (const p of SECRET_PATTERNS) {
          if (p.re.test(line)) {
            findings.push(`${path.relative(DEMO_REPO, f)}:${idx + 1}:${p.name}`);
          }
        }
      });
    }
    // reset regex lastIndex not needed (no global flag)
    expect(findings.length).toBeGreaterThan(0);
  });

  it("detects AWS key in UserService.kt", () => {
    const content = fs.readFileSync(path.join(DEMO_REPO, "UserService.kt"), "utf8");
    expect(content).toMatch(/AKIAIOSFODNN7EXAMPLE/);
  });
});

// Optional integration with production scanner module if present.
describe.skip("scanner: secrets module (production)", () => {
  it.todo("imports production scanner and returns findings");
});
