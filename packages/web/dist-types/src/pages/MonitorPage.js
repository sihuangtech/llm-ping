import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Metric } from "../components/metrics";
import { api } from "../lib/api";
export function MonitorPage() {
    const history = useQuery({ queryKey: ["history"], queryFn: api.history, refetchInterval: 10000 });
    const grouped = useMemo(() => new Map((history.data ?? []).map((item) => [item.providerId, item])), [history.data]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Monitor" }), _jsx("div", { className: "grid grid-cols-3 gap-4", children: [...grouped.values()].map((item) => (_jsx(Metric, { label: item.providerName, value: `${item.status} / ${item.latency.totalMs}ms` }, item.providerId))) })] }));
}
//# sourceMappingURL=MonitorPage.js.map