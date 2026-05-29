import { providerConfigSchema, type ProviderConfig, type ProviderCapability } from "@llm-ping/shared";
import { z } from "zod";

export type ProviderFormState = {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  accessToken: string;
  model: string;
  deployment: string;
  apiVersion: string;
  projectId: string;
  location: string;
  timeoutMs: number;
  retries: number;
  strictModelCheck: boolean;
  skipModelList: boolean;
  streaming: boolean;
  customPrompt: string;
  headersText: string;
};

export const providerDefaults: Record<string, Pick<ProviderFormState, "baseUrl" | "model">> = {
  openai: { baseUrl: "https://api.openai.com", model: "gpt-4o-mini" },
  "openai-compatible": { baseUrl: "https://api.openai.com", model: "" },
  anthropic: { baseUrl: "https://api.anthropic.com", model: "claude-3-5-haiku-latest" },
  gemini: { baseUrl: "https://generativelanguage.googleapis.com", model: "gemini-1.5-flash" },
  "azure-openai": { baseUrl: "", model: "" },
  "vertex-gemini": { baseUrl: "https://aiplatform.googleapis.com", model: "gemini-1.5-flash" },
  ollama: { baseUrl: "http://localhost:11434", model: "llama3.2" },
  "lm-studio": { baseUrl: "http://localhost:1234", model: "" },
  localai: { baseUrl: "http://localhost:8080", model: "" },
  custom: { baseUrl: "", model: "" },
};

export const emptyProviderForm: ProviderFormState = {
  id: "",
  name: "",
  type: "openai-compatible",
  enabled: true,
  baseUrl: providerDefaults["openai-compatible"].baseUrl,
  apiKey: "",
  accessToken: "",
  model: "",
  deployment: "",
  apiVersion: "",
  projectId: "",
  location: "",
  timeoutMs: 15000,
  retries: 1,
  strictModelCheck: false,
  skipModelList: false,
  streaming: false,
  customPrompt: "Reply with exactly: pong",
  headersText: "",
};

const providerFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  enabled: z.boolean(),
  baseUrl: z.string(),
  apiKey: z.string(),
  accessToken: z.string(),
  model: z.string(),
  deployment: z.string(),
  apiVersion: z.string(),
  projectId: z.string(),
  location: z.string(),
  timeoutMs: z.coerce.number().int().positive(),
  retries: z.coerce.number().int().min(0).max(5),
  strictModelCheck: z.boolean(),
  skipModelList: z.boolean(),
  streaming: z.boolean(),
  customPrompt: z.string().min(1),
  headersText: z.string(),
});

export function formForProvider(provider: ProviderConfig): ProviderFormState {
  return {
    id: provider.id,
    name: provider.name,
    type: provider.type,
    enabled: provider.enabled,
    baseUrl: provider.baseUrl ?? "",
    apiKey: provider.apiKey ?? "",
    accessToken: provider.accessToken ?? "",
    model: provider.model ?? "",
    deployment: provider.deployment ?? "",
    apiVersion: provider.apiVersion ?? "",
    projectId: provider.projectId ?? "",
    location: provider.location ?? "",
    timeoutMs: provider.timeoutMs,
    retries: provider.retries,
    strictModelCheck: provider.strictModelCheck,
    skipModelList: provider.skipModelList,
    streaming: provider.streaming,
    customPrompt: provider.customPrompt,
    headersText: Object.entries(provider.headers ?? {}).map(([key, value]) => `${key}: ${value}`).join("\n"),
  };
}

export function providerFromForm(form: ProviderFormState): ProviderConfig {
  const parsed = providerFormSchema.parse(form);
  const { headersText, ...provider } = parsed;
  return providerConfigSchema.parse({
    ...compact(provider),
    type: provider.type as ProviderCapability["id"],
    headers: parseHeaders(headersText),
  });
}

function compact(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== "" && value !== undefined));
}

function parseHeaders(text: string): Record<string, string> {
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{")) return z.record(z.string(), z.string()).parse(JSON.parse(trimmed));
  return Object.fromEntries(
    trimmed.split(/\r?\n/).map((line) => {
      const index = line.indexOf(":");
      if (index < 1) throw new Error(`Header 格式错误: ${line}`);
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
  );
}
