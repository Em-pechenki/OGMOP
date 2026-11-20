export type ScannerType = "secrets" | "sca" | "sast";

export interface ScanConfig {
  scannerType: ScannerType;
  targetPath?: string;
  repoUrl?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  options?: Record<string, unknown>;
}