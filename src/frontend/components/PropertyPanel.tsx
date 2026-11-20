import React from "react";
import { useWorkflowStore } from "@frontend/store/workflowStore";
import type { NodeData } from "@shared/types";

export interface PropertyPanelProps {
  className?: string;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="mb-2 text-sm font-semibold text-text">{title}</h3>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex flex-col gap-1 text-xs text-text-muted">
    <span>{label}</span>
    {children}
  </label>
);

const inputCls =
  "rounded-md border border-border bg-white px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ className = "" }) => {
  const { selectedNode, updateNodeData } = useWorkflowStore();

  const data = selectedNode?.data as NodeData | undefined;

  const update = (patch: Partial<NodeData>) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, patch);
  };

  const updateConfig = (patch: Record<string, unknown>) => {
    if (!selectedNode || !data) return;
    const cfg = ((data as { config?: Record<string, unknown> }).config || {}) as Record<string, unknown>;
    updateNodeData(selectedNode.id, { config: { ...cfg, ...patch } } as Partial<NodeData>);
  };

  if (!selectedNode || !data) {
    return (
      <div className={`rounded-lg border border-border bg-white p-4 text-sm text-text-muted ${className}`}>
        Выберите ноду на холсте, чтобы редактировать её свойства.
      </div>
    );
  }

  const kind = (data as { kind?: string }).kind;

  return (
    <div className={`overflow-auto rounded-lg border border-border bg-white p-4 ${className}`}>
      <Section title="Основное">
        <Field label="Название">
          <input
            className={inputCls}
            value={(data as { label?: string }).label || ""}
            onChange={(e) => update({ label: e.target.value } as Partial<NodeData>)}
          />
        </Field>
      </Section>

      {kind === "trigger" && (
        <Section title="Триггер">
          <Field label="Тип">
            <select
              className={inputCls}
              value={(data as { triggerType?: string }).triggerType || "manual"}
              onChange={(e) => update({ triggerType: e.target.value } as Partial<NodeData>)}
            >
              <option value="manual">manual</option>
              <option value="schedule">schedule</option>
            </select>
          </Field>
          {(data as { triggerType?: string }).triggerType === "schedule" && (
            <Field label="Расписание (cron)">
              <input
                className={inputCls}
                value={(data as { schedule?: string }).schedule || ""}
                onChange={(e) => update({ schedule: e.target.value } as Partial<NodeData>)}
              />
            </Field>
          )}
        </Section>
      )}

      {kind === "logic" && (
        <Section title="Логика">
          <Field label="Тип">
            <select
              className={inputCls}
              value={(data as { logicType?: string }).logicType || "if"}
              onChange={(e) => update({ logicType: e.target.value } as Partial<NodeData>)}
            >
              <option value="if">if</option>
              <option value="compare">compare</option>
              <option value="regex">regex</option>
            </select>
          </Field>
          <Field label="Условие">
            <input
              className={inputCls}
              value={(data as { condition?: string }).condition || ""}
              onChange={(e) => update({ condition: e.target.value } as Partial<NodeData>)}
            />
          </Field>
          <Field label="Оператор">
            <select
              className={inputCls}
              value={(data as { operator?: string }).operator || "eq"}
              onChange={(e) => update({ operator: e.target.value } as Partial<NodeData>)}
            >
              {["eq", "ne", "gt", "lt", "gte", "lte", "contains", "regex"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Левый операнд">
            <input
              className={inputCls}
              value={(data as { left?: string }).left || ""}
              onChange={(e) => update({ left: e.target.value } as Partial<NodeData>)}
            />
          </Field>
          <Field label="Правый операнд">
            <input
              className={inputCls}
              value={(data as { right?: string }).right || ""}
              onChange={(e) => update({ right: e.target.value } as Partial<NodeData>)}
            />
          </Field>
          <Field label="Regex pattern">
            <input
              className={inputCls}
              value={(data as { pattern?: string }).pattern || ""}
              onChange={(e) => update({ pattern: e.target.value } as Partial<NodeData>)}
            />
          </Field>
        </Section>
      )}

      {kind === "scanner" && (
        <Section title="Сканер">
          <Field label="Тип сканера">
            <select
              className={inputCls}
              value={(data as { scannerType?: string }).scannerType || "secrets"}
              onChange={(e) => {
                const st = e.target.value;
                update({ scannerType: st as never, config: { scannerType: st } } as Partial<NodeData>);
              }}
            >
              <option value="secrets">secrets</option>
              <option value="sca">sca</option>
              <option value="sast">sast</option>
            </select>
          </Field>
          <Field label="Target path">
            <input
              className={inputCls}
              value={(((data as { config?: { targetPath?: string } }).config?.targetPath) || "") as string}
              onChange={(e) => updateConfig({ targetPath: e.target.value })}
            />
          </Field>
          <Field label="Repo URL">
            <input
              className={inputCls}
              value={(((data as { config?: { repoUrl?: string } }).config?.repoUrl) || "") as string}
              onChange={(e) => updateConfig({ repoUrl: e.target.value })}
            />
          </Field>
          <Field label="Config (JSON)">
            <textarea
              className={inputCls}
              rows={6}
              defaultValue={JSON.stringify((data as { config?: unknown }).config || {}, null, 2)}
              onBlur={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  update({ config: parsed } as Partial<NodeData>);
                } catch {
                  // ignore invalid
                }
              }}
            />
          </Field>
        </Section>
      )}

      {kind === "notify" && (
        <Section title="Уведомление">
          <Field label="Канал">
            <select
              className={inputCls}
              value={(data as { channel?: string }).channel || "webhook"}
              onChange={(e) => {
                const ch = e.target.value;
                update({ channel: ch as never, config: { channel: ch } } as Partial<NodeData>);
              }}
            >
              <option value="telegram">telegram</option>
              <option value="smtp">smtp</option>
              <option value="webhook">webhook</option>
            </select>
          </Field>
          <Field label="Config (JSON)">
            <textarea
              className={inputCls}
              rows={8}
              defaultValue={JSON.stringify((data as { config?: unknown }).config || {}, null, 2)}
              onBlur={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  update({ config: parsed } as Partial<NodeData>);
                } catch {
                  // ignore invalid
                }
              }}
            />
          </Field>
        </Section>
      )}

      {kind === "ai" && (
        <Section title="AI">
          <Field label="Provider">
            <input
              className={inputCls}
              value={(data as { provider?: string }).provider || ""}
              onChange={(e) => update({ provider: e.target.value } as Partial<NodeData>)}
            />
          </Field>
          <Field label="Model">
            <input
              className={inputCls}
              value={(data as { model?: string }).model || ""}
              onChange={(e) => update({ model: e.target.value } as Partial<NodeData>)}
            />
          </Field>
          <Field label="Prompt">
            <textarea
              className={inputCls}
              rows={4}
              value={(data as { prompt?: string }).prompt || ""}
              onChange={(e) => update({ prompt: e.target.value } as Partial<NodeData>)}
            />
          </Field>
          <Field label="Temperature">
            <input
              type="number"
              step="0.1"
              className={inputCls}
              value={(data as { temperature?: number }).temperature ?? 0.7}
              onChange={(e) => update({ temperature: Number(e.target.value) } as Partial<NodeData>)}
            />
          </Field>
          <Field label="Max tokens">
            <input
              type="number"
              className={inputCls}
              value={(data as { maxTokens?: number }).maxTokens ?? 1024}
              onChange={(e) => update({ maxTokens: Number(e.target.value) } as Partial<NodeData>)}
            />
          </Field>
        </Section>
      )}
    </div>
  );
};

export default PropertyPanel;