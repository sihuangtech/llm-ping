import { describe, expect, it } from "vitest";

import { getProviderAdapter, listProviderCapabilities } from "./registry.js";

describe("provider registry", () => {
  it("列出内置 Provider 并按类型获取 Adapter", () => {
    expect(listProviderCapabilities().some((capability) => capability.id === "openai")).toBe(true);
    expect(getProviderAdapter("ollama").capability.name).toBe("Ollama");
  });
});
