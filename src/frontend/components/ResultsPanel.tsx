import React, { useMemo, useState } from "react";
import { useRunStore } from "@frontend/store/runStore";
import type { Finding, Severity } from "@shared/types";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];

const severityColor: Record<Severity, string> = {
  critical: "bg-risk-critical text-white",
  high: "bg-risk-high text-white",
  medium: "bg-risk-medium text-white",
  low: "bg-risk-low text-white",
  info: "bg-risk-info text-white",
};

export interface ResultsPanelProps {
  className?: string;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ className = "" }) => {
  const findings = useRunStore((s) => s.findings);
  const aiReport = useRunStore((s) => s.aiReport);
  const [sevFilter, setSevFilter] = useState<Severity[]>([]);
  const [scannerFilter, setScannerFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return findings.filter((f: Finding) => {
      if (sevFilter.length && !sevFilter.includes(f.severity)) return false;
      if (scannerFilter && f.scanner !== scannerFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${f.title} ${f.description || ""} ${f.file || ""} ${f.ruleId || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [findings, sevFilter, scannerFilter, search]);

  const toggleSev = (s: Severity) => {
    setSevFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of SEVERITIES) c[s] = findings.filter((f) => f.severity === s).length;
    return c;
  }, [findings]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="rounded-lg border border-border bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-text">Находки ({findings.length})</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSev(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                sevFilter.includes(s) ? severityColor[s] : "bg-surface text-text-muted"
              }`}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
        <div className="mb-3 flex gap-2">
          <input
            className="flex-1 rounded-md border border-border bg-white px-2 py-1.5 text-sm"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-md border border-border bg-white px-2 py-1.5 text-sm"
            value={scannerFilter}
            onChange={(e) => setScannerFilter(e.target.value)}
          >
            <option value="">Все сканеры</option>
            <option value="secrets">secrets</option>
            <option value="sca">sca</option>
            <option value="sast">sast</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="text-sm text-text-muted">Нет находок.</p>
          )}
          {filtered.map((f) => (
            <article
              key={f.id}
              className="rounded-lg border border-border bg-surface p-3"
              aria-labelledby={`finding-${f.id}`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColor[f.severity]}`}>
                  {f.severity}
                </span>
                <span id={`finding-${f.id}`} className="text-sm font-semibold text-text">
                  {f.title}
                </span>
                {f.scanner && <span className="text-xs text-text-subtle">[{f.scanner}]</span>}
              </div>
              {f.file && (
                <div className="text-xs text-text-muted">
                  {f.file}
                  {f.line ? `:${f.line}` : ""}
                </div>
              )}
              {f.description && <p className="mt-1 text-sm text-text-muted">{f.description}</p>}
              {f.snippet && (
                <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs font-mono">
                  <code>{f.snippet}</code>
                </pre>
              )}
              {f.recommendation && (
                <p className="mt-2 text-xs text-primary-dark">Рекомендация: {f.recommendation}</p>
              )}
            </article>
          ))}
        </div>
      </div>

      {aiReport && (
        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-text">AI-отчёт</h3>
          {aiReport.riskLevel && (
            <p className="mb-2 text-xs text-text-muted">Уровень риска: {aiReport.riskLevel}</p>
          )}
          <p className="mb-2 text-sm text-text">{aiReport.summary}</p>
          {aiReport.recommendations?.length ? (
            <ul className="list-disc pl-5 text-sm text-text-muted">
              {aiReport.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;