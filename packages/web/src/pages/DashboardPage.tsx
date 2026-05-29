import { useQuery } from "@tanstack/react-query";

import { Metric } from "../components/metrics";
import { ResultTable } from "../components/results";
import { Panel } from "../components/ui";
import { api } from "../lib/api";

export function DashboardPage() {
  const providers = useQuery({ queryKey: ["providers"], queryFn: api.providers });
  const history = useQuery({ queryKey: ["history"], queryFn: api.history });
  const latest = history.data ?? [];
  const ok = latest.filter((item) => item.status === "success").length;
  const avg = latest.length ? Math.round(latest.reduce((sum, item) => sum + item.latency.totalMs, 0) / latest.length) : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <Metric label="Provider 总数" value={providers.data?.length ?? 0} />
        <Metric label="正常数量" value={ok} />
        <Metric label="异常数量" value={latest.length - ok} />
        <Metric label="平均延迟" value={`${avg}ms`} />
      </div>
      <Panel title="最近检测">
        <ResultTable results={latest.slice(0, 8)} />
      </Panel>
    </div>
  );
}
