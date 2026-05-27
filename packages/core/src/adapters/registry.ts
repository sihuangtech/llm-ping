import type { ProviderCapability, ProviderConfig, ProviderType } from "@llm-ping/shared";

import { AnthropicAdapter } from "./anthropic.js";
import { AzureOpenAIAdapter } from "./azure.js";
import { GeminiAdapter } from "./gemini.js";
import { LMStudioAdapter, LocalAIAdapter, OllamaAdapter } from "./local.js";
import { OpenAIAdapter, OpenAICompatibleAdapter } from "./openai.js";
import type { ProviderAdapter } from "./types.js";
import { VertexGeminiAdapter } from "./vertex.js";

class CustomProviderAdapter extends OpenAICompatibleAdapter {
  readonly capability = {
    id: "custom" as const,
    name: "Custom Provider",
    status: "beta" as const,
    streaming: true,
    modelsApi: true,
    requiresApiKey: false,
    requiresDeployment: false,
    usage: true,
  };
}

const adapters = new Map<ProviderType, ProviderAdapter>(
  [
    new OpenAIAdapter(),
    new OpenAICompatibleAdapter(),
    new AnthropicAdapter(),
    new GeminiAdapter(),
    new AzureOpenAIAdapter(),
    new VertexGeminiAdapter(),
    new OllamaAdapter(),
    new LMStudioAdapter(),
    new LocalAIAdapter(),
    new CustomProviderAdapter(),
  ].map((adapter) => [adapter.capability.id, adapter]),
);

export function listProviderCapabilities(): ProviderCapability[] {
  return [...adapters.values()].map((adapter) => adapter.capability);
}

export function getProviderAdapter(type: ProviderType): ProviderAdapter {
  const adapter = adapters.get(type);
  if (!adapter) throw new Error(`Unsupported provider type: ${type}`);
  return adapter;
}

export async function checkProvider(config: ProviderConfig) {
  return getProviderAdapter(config.type).check(config);
}
