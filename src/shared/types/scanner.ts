import type { Finding } from "./finding";

export type ScannerType = "secrets" | "sca" | "sast";

export type ScanType = ScannerType;

export interface BaseScannerConfig {
  targetPath?: string;
  repoUrl?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  options?: Record<string, unknown>;
}

export interface SecretsScannerConfig extends BaseScannerConfig {
  scannerType: "secrets";
  rules?: string[];
  maxFileSizeBytes?: number;
  entropyThreshold?: number;
}

export interface ScaScannerConfig extends BaseScannerConfig {
  scannerType: "sca";
  dependenciesFile?: string;
  cveDatabasePath?: string;
  ecosystem?: "maven" | "gradle" | "npm" | "pip";
}

export interface SastScannerConfig extends BaseScannerConfig {
  scannerType: "sast";
  language?: "kotlin" | "java" | "typescript" | "javascript";
  rules?: string[];
  framework?: "spring-boot" | "express" | "react" | "none";
}

export type ScannerConfig =
  | SecretsScannerConfig
  | ScaScannerConfig
  | SastScannerConfig;

export type ScanConfig = ScannerConfig;

export type SecretsScanConfig = SecretsScannerConfig;
export type ScaScanConfig = ScaScannerConfig;
export type SastScanConfig = SastScannerConfig;
export type SecretScannerConfig = SecretsScannerConfig;

export interface ScanResult {
  id?: string;
  scanner: ScannerType;
  scannerType?: ScannerType;
  status?: "pending" | "running" | "success" | "error" | "cancelled";
  findings: Finding[];
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  summary?: string;
  error?: string;
  targetPath?: string;
  metadata?: Record<string, unknown>;
}

