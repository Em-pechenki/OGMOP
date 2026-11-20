import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";
import Button from "@frontend/components/ui/Button";
import Modal from "@frontend/components/ui/Modal";
import Input from "@frontend/components/ui/Input";
import Spinner from "@frontend/components/ui/Spinner";
import { useToast } from "@frontend/components/ui/Toast";
import { api } from "@frontend/services/api";
import { useWorkflowStore } from "@frontend/store/workflowStore";
import type { Template } from "@shared/types";

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", workflowJson: "", isPublic: false });
  const [saving, setSaving] = useState(false);
  const { show } = useToast();
  const navigate = useNavigate();
  const setNodes = useWorkflowStore((s) => s.setNodes);
  const setEdges = useWorkflowStore((s) => s.setEdges);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/templates");
      const data = (res.data as { data?: any })?.data ?? res.data;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      setTemplates([]);
      setError((e as Error).message || "Не удалось загрузить шаблоны");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = templates.filter((t) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const applyTemplate = (t: Template) => {
    try {
      setNodes((t.workflow?.nodes as any) || []);
      setEdges((t.workflow?.edges as any) || []);
      show("Шаблон загружен в редактор", "success");
      navigate("/editor");
    } catch {
      show("Не удалось применить шаблон", "error");
    }
  };

  const copyJson = async (t: Template) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(t.workflow, null, 2));
      show("JSON скопирован", "success");
    } catch {
      show("Не удалось скопировать", "error");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Удалить шаблон?")) return;
    try {
      await api.delete(`/api/templates/${id}`);
      show("Шаблон удалён", "success");
      load();
    } catch (e) {
      show((e as Error).message, "error");
    }
  };

  const togglePublish = async (t: Template) => {
    try {
      await api.patch(`/api/templates/${t.id}`, { isPublic: !t.isPublic });
      show(t.isPublic ? "Снят с публикации" : "Опубликован", "success");
      load();
    } catch (e) {
      show((e as Error).message, "error");
    }
  };

  const submitCreate = async () => {
    setSaving(true);
    try {
      let workflow: any = null;
      if (form.workflowJson.trim()) {
        workflow = JSON.parse(form.workflowJson);
      } else {
        workflow = { name: form.name, nodes: [], edges: [] };
      }
      await api.post("/api/templates", {
        name: form.name || "Новый шаблон",
        description: form.description,
        workflow,
        isPublic: form.isPublic,
      });
      show("Шаблон создан", "success");
      setCreateOpen(false);
      setForm({ name: "", description: "", workflowJson: "", isPublic: false });
      load();
    } catch (e) {
      show((e as Error).message || "Ошибка создания", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <div className="py-6 sm:py-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-text">Шаблоны</h1>
          <Button onClick={() => setCreateOpen(true)}>Создать шаблон</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder="Поиск шаблонов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Поиск шаблонов"
          />
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-12" role="status" aria-live="polite">
            <Spinner size="lg" />
            <span className="text-sm text-text-muted">Загрузка...</span>
          </div>
        )}

        {!loading && error && (
          <Card>
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-error">{error}</p>
              <Button variant="secondary" onClick={load}>
                Повторить
              </Button>
            </div>
          </Card>
        )}

        {!loading && !error && filtered.length === 0 && (
          <Card>
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-text-muted">Шаблоны не найдены.</p>
              <Button variant="secondary" size="sm" onClick={() => setCreateOpen(true)}>
                Создать шаблон
              </Button>
            </div>
          </Card>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <Card key={t.id} hoverable>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-text truncate">{t.name}</h3>
                    {t.isPublic && <span className="text-xs rounded-full bg-primary-light text-primary-darker px-2 py-0.5">Публичный</span>}
                  </div>
                  {t.description && <p className="text-sm text-text-muted line-clamp-2">{t.description}</p>}
                  <div className="flex flex-wrap gap-1">
                    {(t.tags || []).map((tag) => (
                      <span key={tag} className="text-xs rounded-full bg-surface border border-border px-2 py-0.5 text-text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-text-subtle">
                    {t.author ? `Автор: ${t.author} · ` : ""}
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}
                    {typeof t.usageCount === "number" ? ` · Использований: ${t.usageCount}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button size="sm" onClick={() => applyTemplate(t)}>
D:\OGMOP\src\frontend\pages\TemplatesPage.tsx
                      Использовать
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => copyJson(t)}>
                      Копировать JSON
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(t)}>
                      {t.isPublic ? "Снять с публикации" : "Опубликовать"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>
                      Удалить
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Новый шаблон" size="lg">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>Название</span>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>Описание</span>
            <textarea
              className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>Workflow JSON (необязательно)</span>
            <textarea
              className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text font-mono"
              rows={6}
              value={form.workflowJson}
              onChange={(e) => setForm({ ...form, workflowJson: e.target.value })}
              placeholder='{"nodes":[],"edges":[]}'
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
            />
            Публичный
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submitCreate} disabled={saving}>
            {saving ? "Сохранение..." : "Создать"}
          </Button>
        </div>
      </Modal>
    </Container>
  );
};

export default TemplatesPage;
