import type { Workflow } from "./workflow";

export interface Template {
  id: string;
  name: string;
  description?: string;
  workflow: Workflow;
  author?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  isPublic?: boolean;
}