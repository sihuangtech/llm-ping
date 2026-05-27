import type { ProviderCapability, ProviderConfig } from "@llm-ping/shared";

import { joinUrl } from "../diagnostics/http.js";
import type { CompletionSpec } from "./base.js";
import { OpenAIAdapter } from "./openai.js";

export class AzureOpenAIAdapter extends OpenAIAdapter {
  readonly capability: ProviderCapability = {
    id: "azure-openai",
    name: "Azure OpenAI",
    status: "stable",
    streaming: true,
    modelsApi: false,
    requiresApiKey: true,
    requiresDeployment: true,
    usage: true,
  };

  protected authHeaders(config: ProviderConfig): Record<string, string> {
    return { ...config.headers, "api-key": config.apiKey ?? "" };
  }

  protected buildCompletion(config: ProviderConfig): CompletionSpec {
    const apiVersion = config.apiVersion ?? "2024-10-21";
    return {
      ...super.buildCompletion(config),
      url: `${joinUrl(
        this.resolveBaseUrl(config),
        `/openai/deployments/${config.deployment}/chat/completions`,
      )}?api-version=${encodeURIComponent(apiVersion)}`,
      headers: this.authHeaders(config),
      body: {
        messages: [{ role: "user", content: config.customPrompt }],
        temperature: 0,
        stream: false,
      },
    };
  }
}
