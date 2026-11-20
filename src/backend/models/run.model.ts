import type { RunResult } from "@shared/types";

export class RunModel {
  private readonly store = new Map<string, RunResult>();

  create(run: RunResult): RunResult {
    this.store.set(run.id, { ...run });
    return this.get(run.id)!;
  }

  get(id: string): RunResult | undefined {
    const r = this.store.get(id);
    return r ? { ...r, nodeResults: [...r.nodeResults], findings: [...r.findings] } : undefined;
  }

  listByWorkflow(workflowId: string): RunResult[] {
    return Array.from(this.store.values())
      .filter((r) => r.workflowId === workflowId)
      .map((r) => ({ ...r, nodeResults: [...r.nodeResults], findings: [...r.findings] }));
  }

  list(): RunResult[] {
    return Array.from(this.store.values()).map((r) => ({
      ...r,
      nodeResults: [...r.nodeResults],
      findings: [...r.findings],
    }));
  }

  update(id: string, patch: Partial<RunResult>): RunResult | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated: RunResult = { ...existing, ...patch, id };
    this.store.set(id, updated);
    return this.get(id);
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}

export const runModel = new RunModel();