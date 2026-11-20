import { describe, it, expect } from "vitest";
import path from "node:path";

const DEMO_REPO = path.resolve(process.cwd(), "src/backend/seed/demo-repo");
const CVE_DB = path.resolve(process.cwd(), "src/backend/seed/cve-database.json");

type ScannerFn = (a: { root: string; config?: Record<string, unknown> }) => Promise<Array<Record<string, unknown>>>;

describe("Regression: production scanners are stable across repeated calls", () => {
  it("scanSecrets returns same count on repeated invocation", async () => {
    const mod = (await import("../../src/backend/services/scanner-secrets.service.js")) as { scanSecrets: ScannerFn };
    const scanSecrets = mod.scanSecrets;
    const first = await scanSecrets({ root: DEMO_REPO });
    const second = await scanSecrets({ root: DEMO_REPO });
    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBe(first.length);
  });

  it("scanSca returns findings on demo repo", async () => {
    const mod = (await import("../../src/backend/services/scanner-sca.service.js")) as { scanSca: ScannerFn };
    const scanSca = mod.scanSca;
    const findings = await scanSca({ root: DEMO_REPO, config: { cvePath: CVE_DB } });
    expect(Array.isArray(findings)).toBe(true);
    expect(findings.length).toBeGreaterThan(0);
  });

  it("scanSca is stable across repeated calls", async () => {
    const mod = (await import("../../src/backend/services/scanner-sca.service.js")) as { scanSca: ScannerFn };
    const scanSca = mod.scanSca;
    const first = await scanSca({ root: DEMO_REPO, config: { cvePath: CVE_DB } });
    const second = await scanSca({ root: DEMO_REPO, config: { cvePath: CVE_DB } });
    expect(second.length).toBe(first.length);
  });

  it("scanSast returns findings on demo repo", async () => {
    const mod = (await import("../../src/backend/services/scanner-sast.service.js")) as { scanSast: ScannerFn };
    const scanSast = mod.scanSast;
    const findings = await scanSast({ root: DEMO_REPO });
    expect(Array.isArray(findings)).toBe(true);
    expect(findings.length).toBeGreaterThan(0);
  });

  it("scanSast is stable across repeated calls", async () => {
    const mod = (await import("../../src/backend/services/scanner-sast.service.js")) as { scanSast: ScannerFn };
    const scanSast = mod.scanSast;
    const first = await scanSast({ root: DEMO_REPO });
    const second = await scanSast({ root: DEMO_REPO });
    expect(second.length).toBe(first.length);
  });

  it("all findings have required fields", async () => {
    const m1 = (await import("../../src/backend/services/scanner-secrets.service.js")) as { scanSecrets: ScannerFn };
    const m2 = (await import("../../src/backend/services/scanner-sca.service.js")) as { scanSca: ScannerFn };
    const m3 = (await import("../../src/backend/services/scanner-sast.service.js")) as { scanSast: ScannerFn };
    const all = [
      ...(await m1.scanSecrets({ root: DEMO_REPO })),
      ...(await m2.scanSca({ root: DEMO_REPO, config: { cvePath: CVE_DB } })),
      ...(await m3.scanSast({ root: DEMO_REPO })),
    ];
    for (const f of all) {
      expect(f.id).toBeTruthy();
      expect(f.scanner).toBeTruthy();
      expect(f.severity).toBeTruthy();
      expect(f.file).toBeTruthy();
      expect(typeof f.message).toBe("string");
    }
  });
});