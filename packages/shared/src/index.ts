import { z } from "zod";

export { maskSecret, redactHeaders, redactObject } from "./security.js";

// Provider 类型在全项目共享，新增 Provider 时先扩展这里，再实现对应 Adapter。
export const providerTypeSchema = z.enum([
  "openai",
  "openai-compatible",
  "anthropic",
  "gemini",
  "azure-openai",
  "vertex-gemini",
  "ollama",
  "lm-studio",
  "localai",
  "custom",
]);

export type ProviderType = z.infer<typeof providerTypeSchema>;

export const checkStatusSchema = z.enum(["success", "failed", "warning", "skipped", "unsupported"]);
export type CheckStatus = z.infer<typeof checkStatusSchema>;

export const providerConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: providerTypeSchema,
  enabled: z.boolean().default(true),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  accessToken: z.string().optional(),
  model: z.string().optional(),
  deployment: z.string().optional(),
  apiVersion: z.string().optional(),
  projectId: z.string().optional(),
  location: z.string().optional(),
  timeoutMs: z.number().int().positive().default(15000),
  retries: z.number().int().min(0).max(5).default(1),
  strictModelCheck: z.boolean().default(false),
  skipModelList: z.boolean().default(false),
  streaming: z.boolean().default(false),
  customPrompt: z.string().default("Reply with exactly: pong"),
  headers: z.record(z.string()).default({}),
});

export type ProviderConfig = z.infer<typeof providerConfigSchema>;

export const appSettingsSchema = z.object({
  timeoutMs: z.number().int().positive().default(15000),
  retries: z.number().int().min(0).max(5).default(1),
  concurrency: z.number().int().positive().max(32).default(4),
  monitorIntervalSec: z.number().int().positive().default(60),
  darkMode: z.boolean().default(false),
  logLevel: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
  dataDir: z.string().default(".llm-ping"),
  localApiEnabled: z.boolean().default(true),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export type LatencyBreakdown = {
  dnsMs?: number;
  tcpMs?: number;
  tlsMs?: number;
  modelListMs?: number;
  completionMs?: number;
  firstTokenMs?: number;
  streamingTotalMs?: number;
  totalMs: number;
};

export type DiagnosticCode =
  | "CONFIG_ERROR"
  | "ENV_MISSING"
  | "DNS_FAILED"
  | "TCP_FAILED"
  | "TLS_ERROR"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "API_KEY_INVALID"
  | "DEPLOYMENT_NOT_FOUND"
  | "MODEL_NOT_FOUND"
  | "USAGE_MISSING"
  | "STREAMING_ERROR"
  | "LOCAL_SERVICE_DOWN"
  | "MODEL_NOT_DOWNLOADED"
  | "REGION_RESTRICTED"
  | "BILLING_DISABLED"
  | "PROTOCOL_INCOMPATIBLE"
  | "UNKNOWN";

export type DiagnosticError = {
  code: DiagnosticCode;
  status: CheckStatus;
  message: string;
  suggestion: string;
  retryable: boolean;
  httpStatus?: number;
};

export type CheckItem = {
  name: string;
  status: CheckStatus;
  message: string;
  latencyMs?: number;
  suggestion?: string;
};

export type UsageInfo = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type CheckResult = {
  id: string;
  providerId: string;
  providerName: string;
  type: ProviderType;
  status: CheckStatus;
  startedAt: string;
  finishedAt: string;
  latency: LatencyBreakdown;
  items: CheckItem[];
  usage?: UsageInfo;
  error?: DiagnosticError;
  rawSummary?: unknown;
};

export type ProviderCapability = {
  id: ProviderType;
  name: string;
  status: "stable" | "beta";
  streaming: boolean;
  modelsApi: boolean;
  requiresApiKey: boolean;
  requiresDeployment: boolean;
  usage: boolean;
};

export type MonitorStats = {
  providerId: string;
  uptime: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  successRate: number;
  failureRate: number;
  consecutiveFailures: number;
  samples: number;
};
