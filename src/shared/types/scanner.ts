import type { Finding } from "./finding";

export type ScannerType = "secrets" | "sca" | "sast";

export interface ScanConfig {
  scannerType: ScannerType;
  targetPath?: string;
  repoUrl?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  options?: Record<string, unknown>;
}

export interface ScanResult {
  scanner: ScannerType;
  status?: "pending" | "running" | "success" | "error";
  findings: Finding[];
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  summary?: string;
}