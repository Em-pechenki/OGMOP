export type NotifyChannel = "telegram" | "smtp" | "webhook";

export interface NotifyConfig {
  channel: NotifyChannel;
  // telegram
  botToken?: string;
  chatId?: string;
  // smtp
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
  to?: string[];
  subject?: string;
  // webhook
  url?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  bodyTemplate?: string;
}

export interface NotificationPayload {
  channel?: NotifyChannel;
  title?: string;
  message: string;
  summary?: string;
  severity?: import("./finding").Severity;
  findings?: import("./finding").Finding[];
  aiReport?: import("./llm").AiReport;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

// Alias
export type NotifyPayload = NotificationPayload;