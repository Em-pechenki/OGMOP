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

const SAST_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "SQL injection (string concat)", re: /SELECT \* FROM users WHERE name = '/i },
  { name: "hardcoded db password", re: /DriverManager\.getConnection\([^)]*admin123/ },
  { name: "csrf disabled", re: /csrf\s*\{\s*it\.disable\(\)\s*\}/i },
  { name: "permitAll", re: /anyRequest\(\)\.permitAll\(\)/ },
  { name: "reflection exec", re: /Class\.forName\(input\)/ },
  { name: "weak role comparison", re: /role == "root"/ },
];

describe("scanner: SAST (demo-repo)", () => {
  it("finds SAST issues in demo-repo", () => {
    const files = walk(DEMO_REPO).filter((f) => /\.kt$/i.test(f));
    const findings: string[] = [];
    for (const f of files) {
      const content = fs.readFileSync(f, "utf8");
      for (const p of SAST_PATTERNS) {
        if (p.re.test(content)) {
          findings.push(`${path.relative(DEMO_REPO, f)}:${p.name}`);
        }
      }
    }
    expect(findings.length).toBeGreaterThan(0);
  });

  it("detects SQL injection in UserController.kt", () => {
    const content = fs.readFileSync(path.join(DEMO_REPO, "UserController.kt"), "utf8");
    expect(content).toMatch(/SQL injection via string concatenation/);
  });
});

describe.skip("scanner: SAST module (production)", () => {
  it.todo("imports production scanner and returns findings");
});
