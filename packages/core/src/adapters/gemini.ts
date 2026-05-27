import type { ProviderCapability, ProviderConfig, UsageInfo } from "@llm-ping/shared";

import { joinUrl } from "../diagnostics/http.js";
import { HttpProviderAdapter } from "./base.js";

export class GeminiAdapter extends HttpProviderAdapter {
  readonly capability: ProviderCapability = {
    id: "gemini",
    name: "Google Gemini",
    status: "stable",
    streaming: true,
    modelsApi: true,
    requiresApiKey: true,
    requiresDeployment: false,
    usage: true,
  };

  protected resolveBaseUrl(config: ProviderConfig): string {
    return config.baseUrl ?? "https://generativelanguage.googleapis.com";
  }

  protected authHeaders(config: ProviderConfig): Record<string, string> {
    return { ...config.headers, "x-goog-api-key": config.apiKey ?? "" };
  }

  protected modelsUrl(config: ProviderConfig): string {
    return joinUrl(this.resolveBaseUrl(config), "/v1beta/models");
  }

  protected modelExists(body: unknown, model: string): boolean {
    const models = (body as { models?: Array<{ name?: string }> }).models;
    return Array.isArray(models) && models.some((item) => item.name?.endsWith(model) || item.name === model);
  }

  protected buildCompletion(config: ProviderConfig) {
    const model = config.model ?? "gemini-1.5-flash";
    return {
      url: joinUrl(this.resolveBaseUrl(config), `/v1beta/models/${model}:generateContent`),
      headers: this.authHeaders(config),
      body: { contents: [{ parts: [{ text: config.customPrompt }] }] },
      parseText: (body: unknown) =>
        (body as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates?.[0]?.content
          ?.parts?.[0]?.text,
      parseUsage: (body: unknown): UsageInfo | undefined => {
        const usage = (body as {
          usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
        }).usageMetadata;
        if (!usage) return undefined;
        return {
          inputTokens: usage.promptTokenCount,
          outputTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        };
      },
    };
  }
}
