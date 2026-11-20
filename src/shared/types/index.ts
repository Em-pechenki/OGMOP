export * from "./node";
export * from "./edge";
export * from "./workflow";
export * from "./finding";
export * from "./run";
export * from "./template";
export * from "./cicd";
export * from "./ai-generation";
export * from "./notification";
export * from "./scanner";
export * from "./llm";
export * from "./events";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
}