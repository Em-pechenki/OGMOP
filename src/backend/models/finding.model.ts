import type { Finding } from "@shared/types";

export class FindingModel {
  private readonly store = new Map<string, Finding>();

  create(finding: Finding): Finding {
    this.store.set(finding.id, { ...finding });
    return this.get(finding.id)!;
  }

  get(id: string): Finding | undefined {
    const f = this.store.get(id);
    return f ? { ...f } : undefined;
  }

  list(): Finding[] {
    return Array.from(this.store.values()).map((f) => ({ ...f }));
  }

  listBySeverity(severity: Finding["severity"]): Finding[] {
    return this.list().filter((f) => f.severity === severity);
  }

  update(id: string, patch: Partial<Finding>): Finding | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated: Finding = { ...existing, ...patch, id };
    this.store.set(id, updated);
    return { ...updated };
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}

export const findingModel = new FindingModel();