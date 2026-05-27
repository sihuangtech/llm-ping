import type { ProviderCapability, ProviderConfig } from "@llm-ping/shared";

import { GeminiAdapter } from "./gemini.js";

export class VertexGeminiAdapter extends GeminiAdapter {
  readonly capability: ProviderCapability = {
    id: "vertex-gemini",
    name: "Google Vertex AI Gemini",
    status: "beta",
    streaming: true,
    modelsApi: false,
    requiresApiKey: true,
    requiresDeployment: false,
    usage: true,
  };

  protected validateConfig(config: ProviderConfig): void {
    if (!config.projectId) throw new Error("Project ID is required");
    if (!config.location) throw new Error("Location is required");
    if (!config.accessToken && !config.apiKey) throw new Error("Access token is required");
  }

  protected resolveBaseUrl(config: ProviderConfig): string {
    const location = config.location ?? "us-central1";
    return config.baseUrl ?? `https://${location}-aiplatform.googleapis.com`;
  }

  protected authHeaders(config: ProviderConfig): Record<string, string> {
    return { ...config.headers, authorization: `Bearer ${config.accessToken ?? config.apiKey ?? ""}` };
  }
}
