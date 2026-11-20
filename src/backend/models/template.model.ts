import type { Template } from "@shared/types";

export class TemplateModel {
  private readonly store = new Map<string, Template>();

  create(template: Template): Template {
    this.store.set(template.id, { ...template });
    return this.get(template.id)!;
  }

  get(id: string): Template | undefined {
    const t = this.store.get(id);
    return t ? { ...t, workflow: { ...t.workflow } } : undefined;
  }

  list(): Template[] {
    return Array.from(this.store.values()).map((t) => ({ ...t, workflow: { ...t.workflow } }));
  }

  update(id: string, patch: Partial<Template>): Template | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated: Template = { ...existing, ...patch, id };
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

export const templateModel = new TemplateModel();