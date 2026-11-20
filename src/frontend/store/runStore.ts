import { create } from "zustand";
import type { RunStatus, NodeRunStatus, Finding, AiReport, NodeResult } from "@shared/types";

export interface RunState {
  runId: string | null;
  workflowId: string | null;
  status: RunStatus | null;
  nodeStatuses: Record<string, NodeRunStatus>;
  nodeResults: Record<string, NodeResult>;
  findings: Finding[];
  aiReport: AiReport | null;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  setRun: (patch: Partial<RunState>) => void;
  reset: () => void;
}

const initial = {
  runId: null,
  workflowId: null,
  status: null,
  nodeStatuses: {} as Record<string, NodeRunStatus>,
  nodeResults: {} as Record<string, NodeResult>,
  findings: [] as Finding[],
  aiReport: null as AiReport | null,
  error: null as string | null,
  startedAt: null as string | null,
  finishedAt: null as string | null,
};

export const useRunStore = create<RunState>((set) => ({
  ...initial,
  setRun: (patch) => set((state) => ({ ...state, ...patch })),
  reset: () => set({ ...initial }),
}));