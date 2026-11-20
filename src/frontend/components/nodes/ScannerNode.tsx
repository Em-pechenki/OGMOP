import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useRunStore } from "@frontend/store/runStore";

const ICON = "scanner.svg";

const statusBorder: Record<string, string> = {
  idle: "border-border",
  running: "border-primary",
  success: "border-success",
  error: "border-error",
  skipped: "border-border",
};

const statusBg: Record<string, string> = {
  idle: "bg-white",
  running: "bg-primary-light",
  success: "bg-success-bg",
  error: "bg-error-bg",
  skipped: "bg-surface",
};

export const ScannerNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const status = useRunStore((s) => s.nodeStatuses[id] ?? "idle");
  const result = useRunStore((s) => s.nodeResults[id]);
  const title = (data as { label?: string }).label || "Scanner";
  const base = import.meta.env.BASE_URL || "/";
  const scannerType = (data as { scannerType?: string }).scannerType || "secrets";
  const findingsCount = Array.isArray((result as { findings?: unknown[] } | undefined)?.findings)
    ? ((result as { findings: unknown[] }).findings.length)
    : 0;
  return (
    <div
      className={`min-w-[180px] max-w-[260px] rounded-lg border-2 p-3 shadow-card transition-all ${
        statusBorder[status] ?? "border-border"
      } ${statusBg[status] ?? "bg-white"} ${selected ? "ring-2 ring-primary" : ""} ${
        status === "running" ? "animate-pulse-running" : ""
      } ${status === "skipped" ? "opacity-50" : ""}`}
      role="group"
      aria-label={`scanner: ${title}`}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-node-scanner" />
      <div className="flex items-center gap-2">
        <img src={`${base}icons/${ICON}`} alt="" width={20} height={20} loading="lazy" decoding="async" className="h-5 w-5" />
        <span className="truncate text-sm font-semibold text-text">{title}</span>
        <span
          className={`ml-auto h-2.5 w-2.5 rounded-full ${
            status === "running"
              ? "bg-primary"
              : status === "success"
              ? "bg-success"
              : status === "error"
              ? "bg-error"
              : "bg-border-strong"
          }`}
          aria-hidden
        />
      </div>
      <div className="mt-1 text-xs text-text-muted">{scannerType}</div>
      {status !== "idle" && (
        <div className="mt-1 text-xs text-text-subtle">findings: {findingsCount}</div>
      )}
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-node-scanner" />
    </div>
  );
};

export default ScannerNode;
