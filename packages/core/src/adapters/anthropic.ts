import type { ProviderCapability, ProviderConfig, UsageInfo } from "@llm-ping/shared";

import { joinUrl } from "../diagnostics/http.js";
import { HttpProviderAdapter } from "./base.js";

export class AnthropicAdapter extends HttpProviderAdapter {
  readonly capability: ProviderCapability = {
    id: "anthropic",
    name: "Anthropic Claude",
    status: "stable",
    streaming: true,
    modelsApi: true,
    requiresApiKey: true,
    requiresDeployment: false,
    usage: true,
  };

  protected resolveBaseUrl(config: ProviderConfig): string {
    return config.baseUrl ?? "https://api.anthropic.com";
  }

  protected authHeaders(config: ProviderConfig): Record<string, string> {
    return {
      ...config.headers,
      "x-api-key": config.apiKey ?? "",
      "anthropic-version": config.apiVersion ?? "2023-06-01",
    };
  }

  protected modelsUrl(config: ProviderConfig): string {
    return joinUrl(this.resolveBaseUrl(config), "/v1/models");
  }

  protected buildCompletion(config: ProviderConfig) {
    return {
      url: joinUrl(this.resolveBaseUrl(config), "/v1/messages"),
      headers: this.authHeaders(config),
      body: {
        model: config.model ?? "claude-3-5-haiku-latest",
        max_tokens: 16,
        messages: [{ role: "user", content: config.customPrompt }],
        stream: false,
      },
      parseText: (body: unknown) =>
        (body as { content?: Array<{ type?: string; text?: string }> }).content?.find((part) => part.type === "text")
          ?.text,
      parseUsage: (body: unknown): UsageInfo | undefined => {
        const usage = (body as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;
        if (!usage) return undefined;
        return {
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
          totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
        };
      },
    };
  }
}
