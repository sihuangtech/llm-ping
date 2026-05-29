import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { Metric } from "../components/metrics";
import { api } from "../lib/api";

export function MonitorPage() {
  const history = useQuery({ queryKey: ["history"], queryFn: api.history, refetchInterval: 10000 });
  const grouped = useMemo(() => new Map((history.data ?? []).map((item) => [item.providerId, item])), [history.data]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Monitor</h1>
      <div className="grid grid-cols-3 gap-4">
        {[...grouped.values()].map((item) => (
          <Metric key={item.providerId} label={item.providerName} value={`${item.status} / ${item.latency.totalMs}ms`} />
        ))}
      </div>
    </div>
  );
}
