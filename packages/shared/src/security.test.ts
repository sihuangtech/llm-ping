import { describe, expect, it } from "vitest";

import { maskSecret, redactObject } from "./security.js";

describe("security redaction", () => {
  it("脱敏 API Key 时保留可识别的首尾片段", () => {
    expect(maskSecret("sk-1234567890abcdef")).toBe("sk-1...cdef");
  });

  it("递归脱敏对象中的敏感字段", () => {
    const redacted = redactObject({ apiKey: "sk-1234567890abcdef", nested: { authorization: "Bearer abcdef" } });
    expect(redacted.apiKey).toBe("sk-1...cdef");
    expect(redacted.nested.authorization).not.toContain("abcdef");
  });
});
