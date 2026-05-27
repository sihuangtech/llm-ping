import { describe, expect, it } from "vitest";

import type { CheckResult } from "@llm-ping/shared";

import { computeMonitorStats } from "./stats.js";

function result(status: CheckResult["status"], latency: number): CheckResult {
  return {
    id: crypto.randomUUID(),
    providerId: "p1",
    providerName: "Provider",
    type: "openai",
    status,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    latency: { totalMs: latency },
    items: [],
  };
}

describe("monitor stats", () => {
  it("计算成功率、平均延迟、P95 和连续失败次数", () => {
    const stats = computeMonitorStats("p1", [result("success", 100), result("failed", 200), result("failed", 300)]);
    expect(stats.successRate).toBeCloseTo(1 / 3);
    expect(stats.averageLatencyMs).toBe(200);
    expect(stats.p95LatencyMs).toBe(300);
    expect(stats.consecutiveFailures).toBe(2);
  });
});
