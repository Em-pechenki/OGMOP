import {
  createTemplate,
  getTemplate,
  listTemplates as listTemplatesStore,
  updateTemplate,
  deleteTemplate,
} from "../store/memory.store.js";
import { createWorkflow } from "../store/memory.store.js";

function toBool(v) {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase().trim();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return undefined;
}

function toArray(v) {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v))
    return v
      .flatMap((x) => String(x).split(","))
      .map((s) => s.trim())
      .filter(Boolean);
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function clamp(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export const templateService = {
  create(payload) {
    const p = payload || {};
    const t = createTemplate({
      name: p.name,
      description: p.description,
      workflow: p.workflow,
      author: p.author,
      tags: Array.isArray(p.tags) ? p.tags : p.tags ? [String(p.tags)] : [],
      isPublic: p.isPublic,
      category: p.category,
      version: p.version,
    });
    return t;
  },
  getById(id) {
    return getTemplate(id);
  },
  list(params = {}) {
    const p = params || {};
    let items = listTemplatesStore().slice();

    // search / filter
    const q = p.q || p.search || p.query || p.name || p.text;
    if (q) {
      const needle = String(q).toLowerCase().trim();
      items = items.filter((t) => {
        const hay = [t.name, t.description, t.author, t.category, ...(t.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
    }

    const tags = toArray(p.tag || p.tags);
    if (tags.length) {
      const lower = tags.map((t) => t.toLowerCase());
      items = items.filter((t) =>
        (t.tags || []).some((tag) => lower.includes(String(tag).toLowerCase()))
      );
    }

    if (p.category) {
      const c = String(p.category).toLowerCase();
      items = items.filter((t) => String(t.category || "").toLowerCase() === c);
    }
    if (p.author) {
      const a = String(p.author).toLowerCase();
      items = items.filter((t) =>
        String(t.author || "")
          .toLowerCase()
          .includes(a)
      );
    }
    const pub = toBool(p.isPublic !== undefined ? p.isPublic : p.public);
    if (pub !== undefined) {
      items = items.filter((t) => Boolean(t.isPublic) === pub);
    }

    // sort
    let sortBy = String(p.sort || p.sortBy || p.orderBy || "").toLowerCase();
    let order = String(p.order || p.sortOrder || p.direction || "").toLowerCase();
    // friendly sort aliases per docs
    if (sortBy === "popular" || sortBy === "popularity" || sortBy === "usage") {
      sortBy = "usageCount";
      if (!order) order = "desc";
    } else if (sortBy === "new" || sortBy === "newest" || sortBy === "recent") {
      sortBy = "createdAt";
      if (!order) order = "desc";
    } else if (sortBy === "name" || sortBy === "alpha" || sortBy === "alphabetical") {
      sortBy = "name";
      if (!order) order = "asc";
    } else if (!sortBy) {
      sortBy = "usageCount";
      if (!order) order = "desc";
    }
    if (!order) order = "desc";
    const dir = order === "asc" ? 1 : -1;
    items.sort((a, b) => {
      const av = a && a[sortBy];
      const bv = b && b[sortBy];
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    // pagination
    const page = clamp(Number(p.page || p.pageNum || p.pageNumber || 1), 1, 100000);
    const limitRaw = p.limit || p.pageSize || p.perPage || p.size || p.count;
    const limit = limitRaw ? clamp(Number(limitRaw), 1, 100) : Math.max(items.length, 1);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const paged = items.slice(offset, offset + limit);

    return {
      items: paged,
      templates: paged,
      results: paged,
      data: paged,
      total,
      count: paged.length,
      page: safePage,
      limit,
      pageSize: limit,
      offset,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
      pagination: {
        total,
        page: safePage,
        limit,
        pageSize: limit,
        offset,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  },
  update(id, patch) {
    return updateTemplate(id, patch || {});
  },
  remove(id) {
    return deleteTemplate(id);
  },
  copy(id, payload = {}) {
    const t = getTemplate(id);
    if (!t) return null;
    const wf = t.workflow && typeof t.workflow === "object" ? t.workflow : {};
    const p = payload || {};
    const created = createWorkflow({
      name: p.name || wf.name || t.name || "Copied template",
      description: p.description || wf.description || t.description || "",
      nodes: Array.isArray(wf.nodes) ? wf.nodes : [],
      edges: Array.isArray(wf.edges) ? wf.edges : [],
      templateId: t.id,
    });
    if (created && typeof created === "object") {
      created.workflowId = created.id;
      created.copied = true;
    }
    // increment usage count
    try {
      const updated = updateTemplate(id, {
        usageCount: (t.usageCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
      if (updated) Object.assign(t, updated);
    } catch {
      /* ignore */
    }
    return {
      workflow: created,
      template: t,
      workflowId: created.id,
      templateId: t.id,
      copied: true,
    };
  },
};

export default templateService;
