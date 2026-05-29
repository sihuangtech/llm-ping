import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Dashboard" }), _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsx(Metric, { label: "Provider \u603B\u6570", value: providers.data?.length ?? 0 }), _jsx(Metric, { label: "\u6B63\u5E38\u6570\u91CF", value: ok }), _jsx(Metric, { label: "\u5F02\u5E38\u6570\u91CF", value: latest.length - ok }), _jsx(Metric, { label: "\u5E73\u5747\u5EF6\u8FDF", value: `${avg}ms` })] }), _jsx(Panel, { title: "\u6700\u8FD1\u68C0\u6D4B", children: _jsx(ResultTable, { results: latest.slice(0, 8) }) })] }));
}
//# sourceMappingURL=DashboardPage.js.map