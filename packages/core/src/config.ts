import fs from "node:fs";

import { providerConfigSchema, type ProviderConfig } from "@llm-ping/shared";
import YAML from "yaml";
import { z } from "zod";

export const projectConfigSchema = z.object({
  providers: z.array(providerConfigSchema).default([]),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

// 读取 YAML/JSON 配置并做严格校验，CLI、Server、Desktop 共用。
export function loadProjectConfig(path: string): ProjectConfig {
  const content = fs.readFileSync(path, "utf8");
  const raw = path.endsWith(".json") ? JSON.parse(content) : YAML.parse(content);
  return projectConfigSchema.parse(raw);
}

export function validateProvider(config: unknown): ProviderConfig {
  return providerConfigSchema.parse(config);
}

export function createExampleConfig(): ProjectConfig {
  return {
    providers: [
      {
        id: "openai-main",
        name: "OpenAI Main",
        type: "openai",
        enabled: true,
        baseUrl: "https://api.openai.com",
        apiKey: "${OPENAI_API_KEY}",
        model: "gpt-4o-mini",
        timeoutMs: 15000,
        retries: 1,
        strictModelCheck: true,
        skipModelList: false,
        streaming: false,
        customPrompt: "Reply with exactly: pong",
        headers: {},
      },
      {
        id: "ollama-local",
        name: "Local Ollama",
        type: "ollama",
        enabled: true,
        baseUrl: "http://localhost:11434",
        model: "llama3.2",
        timeoutMs: 15000,
        retries: 0,
        strictModelCheck: false,
        skipModelList: false,
        streaming: false,
        customPrompt: "Reply with exactly: pong",
        headers: {},
      },
    ],
  };
}
