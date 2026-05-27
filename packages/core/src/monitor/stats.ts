import type { CheckResult, MonitorStats } from "@llm-ping/shared";

// 监控统计保持纯函数，方便单元测试和 API/CLI/Web 复用。
export function computeMonitorStats(providerId: string, results: CheckResult[]): MonitorStats {
  const scoped = results.filter((result) => result.providerId === providerId);
  const samples = scoped.length;
  const successes = scoped.filter((result) => result.status === "success");
  const latencies = scoped.map((result) => result.latency.totalMs).sort((a, b) => a - b);
  const averageLatencyMs = latencies.length
    ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
    : 0;
  const p95Index = latencies.length ? Math.ceil(latencies.length * 0.95) - 1 : 0;
  const p95LatencyMs = latencies[p95Index] ?? 0;
  const successRate = samples ? successes.length / samples : 0;
  const consecutiveFailures = countConsecutiveFailures(scoped);

  return {
    providerId,
    uptime: successRate,
    averageLatencyMs,
    p95LatencyMs,
    successRate,
    failureRate: samples ? 1 - successRate : 0,
    consecutiveFailures,
    samples,
  };
}

function countConsecutiveFailures(results: CheckResult[]): number {
  let count = 0;
  for (const result of [...results].reverse()) {
    if (result.status === "success") break;
    count += 1;
  }
  return count;
}
