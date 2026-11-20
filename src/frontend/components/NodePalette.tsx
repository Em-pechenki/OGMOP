import React, { useMemo, useState } from "react";
import { useI18n } from "@frontend/hooks/useI18n";
import type { NodeData, NodeType } from "@shared/types";

export interface PaletteItem {
  nodeType: NodeType;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  data: NodeData;
  group: "trigger" | "logic" | "scanner" | "notify" | "ai";
  subtype?: "secrets" | "sca" | "sast";
}

interface NodePaletteProps {
  items: PaletteItem[];
  onDragStart: (event: React.DragEvent, item: PaletteItem) => void;
  className?: string;
}

const GROUP_ORDER: PaletteItem["group"][] = ["trigger", "logic", "scanner", "notify", "ai"];

const GROUP_KEY: Record<PaletteItem["group"], string> = {
  trigger: "palette.group.triggers",
  logic: "palette.group.logic",
  scanner: "palette.group.scanners",
  notify: "palette.group.notify",
  ai: "palette.group.ai",
};

const SUBTYPE_DOT: Record<string, string> = {
  secrets: "bg-risk-critical",
  sca: "bg-risk-high",
  sast: "bg-risk-medium",
};

const STORAGE_KEY = "ogmop:palette";

function loadCollapsed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    /* ignore */
  }
  return {};
}

export const NodePalette: React.FC<NodePaletteProps> = ({ items, onDragStart, className = "" }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(loadCollapsed);

  const toggleGroup = (g: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [g]: !prev[g] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.nodeType.toLowerCase().includes(q)
    );
  }, [items, query]);

  const groups = useMemo(() => {
    const map = new Map<PaletteItem["group"], PaletteItem[]>();
    GROUP_ORDER.forEach((g) => map.set(g, []));
    filtered.forEach((it) => {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group)!.push(it);
    });
    return GROUP_ORDER.map((g) => ({ group: g, items: map.get(g) || [] })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const empty = filtered.length === 0;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("palette.search")}
          aria-label={t("palette.search")}
          className="w-full rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("common.clear")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text"
          >
            ×
          </button>
        )}
      </div>

      {empty ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-text-subtle" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-xs text-text-subtle">{t("palette.empty")}</span>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-xs text-primary hover:underline"
          >
            {t("palette.reset")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:flex-col sm:flex-row sm:overflow-x-auto lg:overflow-visible snap-x">
          {groups.map(({ group, items: groupItems }) => {
            const isCollapsed = !!collapsed[group];
            return (
              <div key={group} role="group" aria-labelledby={`palette-group-${group}`} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-text"
                  aria-expanded={!isCollapsed}
                >
                  <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  <span id={`palette-group-${group}`}>{t(GROUP_KEY[group])}</span>
                </button>
                {!isCollapsed && (
                  <div className="flex flex-col gap-1.5">
                    {groupItems.map((item) => (
                      <div
                        key={item.nodeType}
                        draggable
                        onDragStart={(e) => onDragStart(e, item)}
                        className="group flex items-center gap-2 h-10 sm:h-11 cursor-grab active:cursor-grabbing rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text transition-colors hover:bg-surface hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 snap-start"
                        style={{ borderLeft: `3px solid ${item.color}` }}
                        role="button"
                        tabIndex={0}
                        aria-label={item.label}
                        title={item.description}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                          }
                        }}
                      >
                        <span className="text-text-subtle opacity-60 group-hover:opacity-100 select-none" aria-hidden="true">
                          ⋮⋮
                        </span>
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                          style={{ color: item.color }}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        {item.subtype && (
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${SUBTYPE_DOT[item.subtype]}`}
                            aria-hidden="true"
                          />
                        )}
                        <span className="truncate font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NodePalette;
