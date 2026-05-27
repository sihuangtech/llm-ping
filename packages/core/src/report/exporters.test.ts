import { describe, expect, it } from "vitest";

import type { CheckResult } from "@llm-ping/shared";

import { exportCsv, exportHtml, exportJson, exportMarkdown } from "./exporters.js";

const result: CheckResult = {
  id: "r1",
  providerId: "p1",
  providerName: "OpenAI",
  type: "openai",
  status: "success",
  startedAt: "2026-01-01T00:00:00.000Z",
  finishedAt: "2026-01-01T00:00:01.000Z",
  latency: { totalMs: 123 },
  items: [],
};

describe("report exporters", () => {
  it("导出纯净 JSON", () => {
    expect(JSON.parse(exportJson([result]))[0].id).toBe("r1");
  });

  it("导出 CSV / Markdown / HTML", () => {
    expect(exportCsv([result])).toContain("\"OpenAI\"");
    expect(exportMarkdown([result])).toContain("| OpenAI |");
    expect(exportHtml([result])).toContain("<table>");
  });
});
