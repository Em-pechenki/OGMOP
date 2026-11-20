import type { ScannerType } from "./scanner";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description?: string;
  file?: string;
  line?: number;
  column?: number;
  ruleId?: string;
  scanner?: ScannerType;
  cve?: string;
  packageName?: string;
  package?: string;
  version?: string;
  fixedVersion?: string;
  recommendation?: string;
  snippet?: string;
}