import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";
import Button from "@frontend/components/ui/Button";
import Modal from "@frontend/components/ui/Modal";
import Input from "@frontend/components/ui/Input";
import Spinner from "@frontend/components/ui/Spinner";
import Badge from "@frontend/components/ui/Badge";
import TemplateCard from "@frontend/components/TemplateCard";
import { useToast } from "@frontend/components/ui/Toast";
import { api } from "@frontend/services/api";
import { useWorkflowStore } from "@frontend/store/workflowStore";
import { useI18n } from "@frontend/hooks/useI18n";
import type { Template } from "@shared/types";

const TAGS = ["secrets", "sca", "sast", "notify", "ai", "trigger", "logic"];

export const TemplatesPage: React.FC = () => {
  const { t } = useI18n();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState("popular");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [previewTpl, setPreviewTpl] = useState<Template | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", tags: "", workflowJson: "", isPublic: false });
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
      setError((e as Error).message || t("templates.loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = templates.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
      const matchTags = activeTags.length === 0 || activeTags.includes("all") ||
        (t.tags || []).some((tag) => activeTags.includes(tag));
      return matchSearch && matchTags;
    });
    list = [...list].sort((a, b) => {
      if (sort === "new") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      return (b.usageCount || 0) - (a.usageCount || 0);
    });
    return list;
  }, [templates, search, activeTags, sort]);

  const resetFilters = () => { setSearch(""); setActiveTags([]); setSort("popular"); };

  const applyTemplate = (tpl: Template) => {
    try {
      setNodes((tpl.workflow?.nodes as any) || []);
      setEdges((tpl.workflow?.edges as any) || []);
      show(t("templates.toast.loaded"), "success");
      navigate("/editor");
    } catch {
      show(t("templates.toast.applyError"), "error");
    }
  };

  const copyJson = async (tpl: Template) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(tpl.workflow, null, 2));
      show(t("templates.toast.jsonCopied"), "success");
    } catch {
      show(t("templates.toast.copyError"), "error");
    }
  };

  const remove = async (tpl: Template) => {
    if (!window.confirm(t("templates.confirm.delete"))) return;
    try {
      await api.delete(`/api/templates/${tpl.id}`);
      show(t("templates.toast.deleted"), "success");
      load();
    } catch (e) {
      show((e as Error).message, "error");
    }
  };

  const togglePublish = async (tpl: Template) => {
    try {
      await api.patch(`/api/templates/${tpl.id}`, { isPublic: !tpl.isPublic });
      show(tpl.isPublic ? t("templates.toast.unpublished") : t("templates.toast.published"), "success");
      load();
    } catch (e) {
      show((e as Error).message, "error");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", tags: "", workflowJson: "", isPublic: false });
    setCreateOpen(true);
  };

  const openEdit = (tpl: Template) => {
    setEditing(tpl);
    setForm({
      name: tpl.name,
      description: tpl.description || "",
      tags: (tpl.tags || []).join(", "),
      workflowJson: tpl.workflow ? JSON.stringify(tpl.workflow) : "",
      isPublic: !!tpl.isPublic,
    });
    setCreateOpen(true);
  };

  const openPublish = () => {
    setPublishOpen(true);
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
      const tags = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
      const payload = { name: form.name || t("templates.modal.createTitle"), description: form.description, workflow, tags, isPublic: form.isPublic };
      if (editing) {
        await api.patch(`/api/templates/${editing.id}`, payload);
        show(t("templates.toast.updated"), "success");
      } else {
        await api.post("/api/templates", payload);
        show(t("templates.toast.created"), "success");
      }
      setCreateOpen(false);
      setEditing(null);
      setForm({ name: "", description: "", tags: "", workflowJson: "", isPublic: false });
      load();
    } catch (e) {
      show((e as Error).message || t("templates.toast.createError"), "error");
    } finally {
      setSaving(false);
    }
  };

  const submitPublish = async () => {
    setSaving(true);
    try {
      await api.post("/api/templates", {
        name: form.name || t("templates.modal.createTitle"),
        description: form.description,
        workflow: form.workflowJson.trim() ? JSON.parse(form.workflowJson) : { nodes: [], edges: [] },
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        isPublic: true,
      });
      show(t("templates.toast.publishedFull"), "success");
      setPublishOpen(false);
      setForm({ name: "", description: "", tags: "", workflowJson: "", isPublic: false });
      load();
    } catch (e) {
      show((e as Error).message || t("templates.toast.publishError"), "error");
    } finally {
      setSaving(false);
    }
  };

  const hasActiveFilters = search.trim() !== "" || activeTags.length > 0 || sort !== "popular";

  const toggleTag = (tag: string) => {
    if (tag === "all") { setActiveTags([]); return; }
    setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  return (
    <Container>
      <div className="py-6 sm:py-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-text">{t("templates.title")}</h1>
            <Badge variant="default">{filtered.length}</Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={openCreate}>{t("templates.create")}</Button>
            <Button variant="secondary" onClick={openPublish}>{t("templates.publish")}</Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3" role="search">
          <div className="flex-1">
            <Input
              type="search"
              placeholder={t("templates.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("templates.searchAria")}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text"
            aria-label={t("templates.sort")}
          >
            <option value="popular">{t("templates.sort.popular")}</option>
            <option value="new">{t("templates.sort.new")}</option>
            <option value="name-asc">{t("templates.sort.nameAsc")}</option>
            <option value="name-desc">{t("templates.sort.nameDesc")}</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("templates.filterTags")}>
          <button
            type="button"
            onClick={() => toggleTag("all")}
            aria-pressed={activeTags.length === 0}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${activeTags.length === 0 ? "bg-primary text-white border-primary" : "bg-surface text-text-muted border-border"}`}
          >
            {t("templates.all")}
          </button>
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={activeTags.includes(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${activeTags.includes(tag) ? "bg-primary text-white border-primary" : "bg-surface text-text-muted border-border"}`}
            >
              {tag}
            </button>
          ))}
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={resetFilters}>{t("templates.reset")}</Button>
          )}
        </div>

        <div aria-live="polite" className="text-xs text-text-muted">{t("templates.found", { count: filtered.length })}</div>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-12" role="status" aria-live="polite" aria-busy="true">
            <Spinner size="lg" />
            <span className="text-sm text-text-muted">{t("templates.loading")}</span>
          </div>
        )}

        {!loading && error && (
          <Card>
            <div className="flex flex-col items-center gap-3 py-6 text-center" role="alert">
              <p className="text-lg font-semibold text-error">{t("templates.loadError")}</p>
              <p className="text-sm text-text-muted">{error}</p>
              <div className="flex gap-2">
                <Button onClick={load}>{t("common.retry")}</Button>
                <Button variant="ghost" onClick={() => navigate("/")}>{t("common.goHome")}</Button>
              </div>
            </div>
          </Card>
        )}

        {!loading && !error && templates.length === 0 && (
          <Card>
            <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
              <img src="/OGMOP/icons/logic.svg" alt="" className="w-16 h-16 opacity-40" />
              <h2 className="text-xl font-semibold text-text">{t("templates.empty")}</h2>
              <p className="text-sm text-text-muted max-w-xs">{t("templates.emptyDesc")}</p>
              <div className="flex gap-2">
                <Button onClick={openCreate}>{t("templates.emptyCreate")}</Button>
                <Button variant="secondary" onClick={() => navigate("/editor")}>{t("templates.emptyManual")}</Button>
              </div>
            </div>
          </Card>
        )}

        {!loading && !error && templates.length > 0 && filtered.length === 0 && (
          <Card>
            <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
              <img src="/OGMOP/icons/logic.svg" alt="" className="w-12 h-12 opacity-40" />
              <h2 className="text-lg font-semibold text-text">{t("templates.notFound")}</h2>
              <p className="text-sm text-text-muted">{t("templates.notFoundDesc")}</p>
              <Button variant="ghost" onClick={resetFilters}>{t("templates.resetFilters")}</Button>
            </div>
          </Card>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list" aria-busy={loading}>
            {filtered.map((t) => (
              <div key={t.id} role="listitem">
                <TemplateCard
                  template={t}
                  onUse={applyTemplate}
                  onCopy={copyJson}
                  onEdit={openEdit}
                  onPublish={togglePublish}
                  onDelete={remove}
                  onPreview={setPreviewTpl}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setEditing(null); }} title={editing ? t("templates.modal.editTitle") : t("templates.modal.createTitle")} size="lg">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>{t("templates.field.name")}</span>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>{t("templates.field.desc")}</span>
            <textarea className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>{t("templates.field.tags")}</span>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>{t("templates.field.workflowJson")}</span>
            <textarea className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text font-mono" rows={6} value={form.workflowJson} onChange={(e) => setForm({ ...form, workflowJson: e.target.value })} placeholder='{"nodes":[],"edges":[]}' />
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            {t("templates.field.public")}
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setCreateOpen(false); setEditing(null); }}>{t("common.cancel")}</Button>
          <Button onClick={submitCreate} disabled={saving}>{saving ? t("common.saving") : t("templates.create")}</Button>
          <Button onClick={submitCreate} disabled={saving}>{saving ? t("common.saving") : t("templates.publish")}</Button>
        </div>
      </Modal>

      <Modal open={publishOpen} onClose={() => setPublishOpen(false)} title="Публикация шаблона" size="md">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>{t("templates.field.name")}</span>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>{t("templates.field.desc")}</span>
            <textarea className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>{t("templates.field.tagsShort")}</span>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            <span>{t("templates.field.workflowJsonShort")}</span>
            <textarea className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text font-mono" rows={4} value={form.workflowJson} onChange={(e) => setForm({ ...form, workflowJson: e.target.value })} placeholder='{"nodes":[],"edges":[]}' />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPublishOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={submitPublish} disabled={saving}>{saving ? "Сохранение..." : "Опубликовать"}</Button>
        </div>
      </Modal>

      <Modal open={!!previewTpl} onClose={() => setPreviewTpl(null)} title={previewTpl?.name || "Предпросмотр"} size="lg">
        {previewTpl && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1">
              {(previewTpl.tags || []).map((tag) => (<Badge key={tag} variant="default">{tag}</Badge>))}
              {previewTpl.isPublic && <Badge variant="info">{t("templates.field.public")}</Badge>}
            </div>
            <p className="text-sm text-text-muted">{previewTpl.description}</p>
            <div className="bg-surface rounded-lg p-4 min-h-[160px] flex items-center justify-center">
              <span className="text-xs text-text-muted">Узлы: {(previewTpl.workflow?.nodes || []).length}</span>
            </div>
            <p className="text-xs text-text-subtle">
              {previewTpl.author ? "Автор: " + previewTpl.author + " · " : ""}
              {previewTpl.createdAt ? new Date(previewTpl.createdAt).toLocaleDateString() : ""}
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => { applyTemplate(previewTpl); setPreviewTpl(null); }}>Использовать</Button>
              <Button variant="secondary" onClick={() => copyJson(previewTpl)}>Копировать JSON</Button>
              <Button variant="ghost" onClick={() => setPreviewTpl(null)}>{t("common.close")}</Button>
            </div>
          </div>
        )}
      </Modal>
    </Container>
  );
};

export default TemplatesPage;