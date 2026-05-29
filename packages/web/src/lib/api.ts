import type { CheckResult, ProviderCapability, ProviderConfig } from "@llm-ping/shared";

const API_BASE = import.meta.env.VITE_LLM_PING_API ?? "http://127.0.0.1:4545";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = options?.body ? { "content-type": "application/json", ...options?.headers } : options?.headers;
  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export const api = {
  capabilities: () => request<ProviderCapability[]>("/providers/capabilities"),
  providers: () => request<ProviderConfig[]>("/providers"),
  saveProvider: (provider: ProviderConfig) => request<ProviderConfig>("/providers", { method: "POST", body: JSON.stringify(provider) }),
  deleteProvider: (id: string) => request<{ ok: boolean }>(`/providers/${id}`, { method: "DELETE" }),
  checkProvider: (id: string) => request<CheckResult>(`/checks/${id}`, { method: "POST" }),
  checkAll: () => request<CheckResult[]>("/checks", { method: "POST" }),
  history: () => request<CheckResult[]>("/history"),
  exportUrl: (format: string) => `${API_BASE}/export?format=${encodeURIComponent(format)}`,
};
