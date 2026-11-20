import type { Workflow } from "@shared/types";

export class WorkflowModel {
  private readonly store = new Map<string, Workflow>();

  create(workflow: Workflow): Workflow {
    this.store.set(workflow.id, { ...workflow });
    return this.get(workflow.id)!;
  }

  get(id: string): Workflow | undefined {
    const w = this.store.get(id);
    return w ? { ...w } : undefined;
  }

  list(): Workflow[] {
    return Array.from(this.store.values()).map((w) => ({ ...w }));
  }

  update(id: string, patch: Partial<Workflow>): Workflow | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated: Workflow = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
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

export const workflowModel = new WorkflowModel();