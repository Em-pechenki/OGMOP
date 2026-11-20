import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const DEMO_REPO = path.resolve(process.cwd(), "src/backend/seed/demo-repo");
const CVE_DB = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "src/backend/seed/cve-database.json"), "utf8")
) as Array<{ package: string; affectedVersions: string; id: string }>;

function parseDeps(gradle: string): Array<{ groupArtifact: string; version: string }> {
  const deps: Array<{ groupArtifact: string; version: string }> = [];
  const re = /implementation\("([^"]+):([^"]+):([^"]+)"\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(gradle))) {
    deps.push({ groupArtifact: `${m[1]}:${m[2]}`, version: m[3] });
  }
  return deps;
}

describe("scanner: SCA (demo-repo)", () => {
  it("finds vulnerable dependencies", () => {
    const gradle = fs.readFileSync(path.join(DEMO_REPO, "build.gradle.kts"), "utf8");
    const deps = parseDeps(gradle);
    expect(deps.length).toBeGreaterThan(0);
    const cvePackages = new Set(CVE_DB.map((c) => c.package));
    const matched = deps.filter((d) => cvePackages.has(d.groupArtifact));
    expect(matched.length).toBeGreaterThan(0);
  });

  it("matches known CVE for spring-beans", () => {
    const entry = CVE_DB.find((c) => c.package === "org.springframework:spring-beans");
    expect(entry).toBeTruthy();
    expect(entry?.id).toBe("CVE-2022-22965");
  });
});

describe.skip("scanner: SCA module (production)", () => {
  it.todo("imports production scanner and returns findings");
});
