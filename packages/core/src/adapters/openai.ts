import type { ProviderCapability, ProviderConfig, UsageInfo } from "@llm-ping/shared";

import { joinUrl } from "../diagnostics/http.js";
import { type CompletionSpec, HttpProviderAdapter } from "./base.js";

export class OpenAIAdapter extends HttpProviderAdapter {
  readonly capability: ProviderCapability = {
    id: "openai",
    name: "OpenAI",
    status: "stable",
    streaming: true,
    modelsApi: true,
    requiresApiKey: true,
    requiresDeployment: false,
    usage: true,
  };

  protected resolveBaseUrl(config: ProviderConfig): string {
    return config.baseUrl ?? "https://api.openai.com";
  }

  protected buildCompletion(config: ProviderConfig): CompletionSpec {
    return {
      url: joinUrl(this.resolveBaseUrl(config), "/v1/chat/completions"),
      headers: this.authHeaders(config),
      body: {
        model: config.model ?? "gpt-4o-mini",
        messages: [{ role: "user", content: config.customPrompt }],
        temperature: 0,
        stream: false,
      },
      parseText: (body: unknown) =>
        (body as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content,
      parseUsage: parseOpenAIUsage,
    };
  }
}

export class OpenAICompatibleAdapter extends OpenAIAdapter {
  readonly capability: ProviderCapability = {
    id: "openai-compatible",
    name: "OpenAI Compatible",
    status: "stable",
    streaming: true,
    modelsApi: true,
    requiresApiKey: false,
    requiresDeployment: false,
    usage: true,
  };
}

function parseOpenAIUsage(body: unknown): UsageInfo | undefined {
  const usage = (body as { usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }).usage;
  if (!usage) return undefined;
  return {
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  };
}
