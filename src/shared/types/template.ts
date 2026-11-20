import type { Workflow } from "./workflow";

export interface Template {
  id: string;
  name: string;
  description?: string;
  workflow: Workflow;
  author?: string;
  tags?: string[];
  category?: string;
  downloads?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  isPublic?: boolean;
  usageCount?: number;
  previewSvg?: string;
  version?: string;
}