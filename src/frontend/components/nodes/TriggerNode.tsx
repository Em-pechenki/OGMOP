import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useRunStore } from "@frontend/store/runStore";

const ICON = "trigger.svg";

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

export const TriggerNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const status = useRunStore((s) => s.nodeStatuses[id] ?? "idle");
  const title = (data as { label?: string }).label || "Trigger";
  const base = import.meta.env.BASE_URL || "/";
  return (
    <div
      className={`min-w-[180px] max-w-[260px] rounded-lg border-2 p-3 shadow-card transition-all ${
        statusBorder[status] ?? "border-border"
      } ${statusBg[status] ?? "bg-white"} ${selected ? "ring-2 ring-primary" : ""} ${
        status === "running" ? "animate-pulse-running" : ""
      } ${status === "skipped" ? "opacity-50" : ""}`}
      role="group"
      aria-label={`trigger: ${title}`}
    >
      <div className="flex items-center gap-2">
        <img src={`${base}icons/${ICON}`} alt="" className="h-5 w-5" />
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
      <div className="mt-1 text-xs text-text-muted">
        {(data as { triggerType?: string }).triggerType === "schedule"
          ? (data as { schedule?: string }).schedule || "schedule"
          : "manual"}
      </div>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-node-trigger" />
    </div>
  );
};

export default TriggerNode;
