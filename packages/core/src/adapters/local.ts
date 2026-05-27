import type { ProviderCapability, ProviderConfig } from "@llm-ping/shared";

import { joinUrl } from "../diagnostics/http.js";
import { HttpProviderAdapter } from "./base.js";
import { OpenAICompatibleAdapter } from "./openai.js";

export class OllamaAdapter extends HttpProviderAdapter {
  readonly capability: ProviderCapability = {
    id: "ollama",
    name: "Ollama",
    status: "stable",
    streaming: true,
    modelsApi: true,
    requiresApiKey: false,
    requiresDeployment: false,
    usage: false,
  };

  protected resolveBaseUrl(config: ProviderConfig): string {
    return config.baseUrl ?? "http://localhost:11434";
  }

  protected authHeaders(config: ProviderConfig): Record<string, string> {
    return config.headers;
  }

  protected modelsUrl(config: ProviderConfig): string {
    return joinUrl(this.resolveBaseUrl(config), "/api/tags");
  }

  protected modelExists(body: unknown, model: string): boolean {
    const models = (body as { models?: Array<{ name?: string }> }).models;
    return Array.isArray(models) && models.some((item) => item.name === model);
  }

  protected buildCompletion(config: ProviderConfig) {
    return {
      url: joinUrl(this.resolveBaseUrl(config), "/api/generate"),
      headers: this.authHeaders(config),
      body: {
        model: config.model ?? "llama3.2",
        prompt: config.customPrompt,
        stream: false,
      },
      parseText: (body: unknown) => (body as { response?: string }).response,
    };
  }
}

export class LMStudioAdapter extends OpenAICompatibleAdapter {
  readonly capability: ProviderCapability = {
    id: "lm-studio",
    name: "LM Studio",
    status: "stable",
    streaming: true,
    modelsApi: true,
    requiresApiKey: false,
    requiresDeployment: false,
    usage: true,
  };

  protected resolveBaseUrl(config: ProviderConfig): string {
    return config.baseUrl ?? "http://localhost:1234";
  }
}

export class LocalAIAdapter extends OpenAICompatibleAdapter {
  readonly capability: ProviderCapability = {
    id: "localai",
    name: "LocalAI",
    status: "stable",
    streaming: true,
    modelsApi: true,
    requiresApiKey: false,
    requiresDeployment: false,
    usage: true,
  };
}
