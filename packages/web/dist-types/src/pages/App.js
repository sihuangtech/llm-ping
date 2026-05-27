import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Download, History, LayoutDashboard, Play, Plus, Settings, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button, Panel, StatusBadge } from "../components/ui";
import { api } from "../lib/api";
const providerFormSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    baseUrl: z.string().url(),
    apiKey: z.string().optional(),
    model: z.string().optional(),
});
export function App() {
    const [page, setPage] = useState("dashboard");
    const nav = [
        ["dashboard", LayoutDashboard, "Dashboard"],
        ["providers", Plus, "Providers"],
        ["batch", Play, "Batch"],
        ["monitor", Activity, "Monitor"],
        ["history", History, "History"],
        ["export", Download, "Export"],
        ["settings", Settings, "Settings"],
    ];
    return (_jsxs("div", { className: "grid min-h-screen grid-cols-[220px_1fr]", children: [_jsxs("aside", { className: "border-r border-line bg-white p-4", children: [_jsx("div", { className: "mb-6 text-xl font-bold", children: "llm-ping" }), _jsx("nav", { className: "space-y-1", children: nav.map(([id, Icon, label]) => (_jsxs("button", { onClick: () => setPage(id), className: `flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm ${page === id ? "bg-teal-50 text-teal-800" : "hover:bg-slate-50"}`, children: [_jsx(Icon, { size: 17 }), label] }, id))) })] }), _jsxs("main", { className: "p-6", children: [page === "dashboard" && _jsx(Dashboard, {}), page === "providers" && _jsx(Providers, {}), page === "batch" && _jsx(Batch, {}), page === "monitor" && _jsx(Monitor, {}), page === "history" && _jsx(HistoryPage, {}), page === "export" && _jsx(ExportPage, {}), page === "settings" && _jsx(SettingsPage, {})] })] }));
}
function Dashboard() {
    const providers = useQuery({ queryKey: ["providers"], queryFn: api.providers });
    const history = useQuery({ queryKey: ["history"], queryFn: api.history });
    const latest = history.data ?? [];
    const ok = latest.filter((item) => item.status === "success").length;
    const avg = latest.length ? Math.round(latest.reduce((sum, item) => sum + item.latency.totalMs, 0) / latest.length) : 0;
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Dashboard" }), _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsx(Metric, { label: "Provider \u603B\u6570", value: providers.data?.length ?? 0 }), _jsx(Metric, { label: "\u6B63\u5E38\u6570\u91CF", value: ok }), _jsx(Metric, { label: "\u5F02\u5E38\u6570\u91CF", value: latest.length - ok }), _jsx(Metric, { label: "\u5E73\u5747\u5EF6\u8FDF", value: `${avg}ms` })] }), _jsx(Panel, { title: "\u6700\u8FD1\u68C0\u6D4B", children: _jsx(ResultTable, { results: latest.slice(0, 8) }) })] }));
}
function Providers() {
    const queryClient = useQueryClient();
    const providers = useQuery({ queryKey: ["providers"], queryFn: api.providers });
    const capabilities = useQuery({ queryKey: ["capabilities"], queryFn: api.capabilities });
    const save = useMutation({ mutationFn: api.saveProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }) });
    const remove = useMutation({ mutationFn: api.deleteProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }) });
    const check = useMutation({ mutationFn: api.checkProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] }) });
    const [form, setForm] = useState({ id: "", name: "", type: "openai-compatible", baseUrl: "http://localhost:11434", apiKey: "", model: "" });
    function submit() {
        const parsed = providerFormSchema.parse(form);
        save.mutate({
            ...parsed,
            type: parsed.type,
            enabled: true,
            timeoutMs: 15000,
            retries: 1,
            strictModelCheck: false,
            skipModelList: false,
            streaming: false,
            customPrompt: "Reply with exactly: pong",
            headers: {},
        });
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Provider \u7BA1\u7406" }), _jsxs(Panel, { title: "\u65B0\u589E / \u7F16\u8F91 Provider", children: [_jsxs("div", { className: "grid grid-cols-6 gap-3", children: [["id", "name", "baseUrl", "apiKey", "model"].map((field) => (_jsx("input", { className: "h-9 rounded-md border border-line px-3 text-sm", placeholder: field, value: form[field], onChange: (event) => setForm({ ...form, [field]: event.target.value }) }, field))), _jsx("select", { className: "h-9 rounded-md border border-line px-3 text-sm", value: form.type, onChange: (event) => setForm({ ...form, type: event.target.value }), children: capabilities.data?.map((capability) => _jsx("option", { value: capability.id, children: capability.name }, capability.id)) })] }), _jsx("div", { className: "mt-3", children: _jsx(Button, { onClick: submit, children: "\u4FDD\u5B58" }) })] }), _jsx(Panel, { title: "Provider \u5217\u8868", children: _jsx("table", { className: "w-full border-collapse text-sm", children: _jsx("tbody", { children: providers.data?.map((provider) => (_jsxs("tr", { className: "border-b border-line", children: [_jsx("td", { className: "py-3 font-medium", children: provider.name }), _jsx("td", { children: provider.type }), _jsx("td", { children: provider.model }), _jsxs("td", { className: "text-right", children: [_jsx(Button, { variant: "ghost", title: "\u4E00\u952E\u6D4B\u8BD5", onClick: () => check.mutate(provider.id), children: _jsx(Play, { size: 16 }) }), _jsx(Button, { variant: "ghost", title: "\u5220\u9664", onClick: () => remove.mutate(provider.id), children: _jsx(Trash2, { size: 16 }) })] })] }, provider.id))) }) }) })] }));
}
function Batch() {
    const queryClient = useQueryClient();
    const batch = useMutation({ mutationFn: api.checkAll, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] }) });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u6279\u91CF\u68C0\u6D4B" }), _jsx(Panel, { title: "\u4EFB\u52A1\u63A7\u5236", action: _jsxs(Button, { onClick: () => batch.mutate(), children: [_jsx(Play, { size: 16 }), "\u5F00\u59CB"] }), children: batch.data ? _jsx(ResultTable, { results: batch.data }) : _jsx("p", { className: "text-sm text-slate-600", children: "\u70B9\u51FB\u5F00\u59CB\u540E\u4F1A\u5E76\u53D1\u68C0\u6D4B\u6240\u6709\u542F\u7528 Provider\u3002" }) })] }));
}
function Monitor() {
    const history = useQuery({ queryKey: ["history"], queryFn: api.history, refetchInterval: 10000 });
    const grouped = useMemo(() => new Map((history.data ?? []).map((item) => [item.providerId, item])), [history.data]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Monitor" }), _jsx("div", { className: "grid grid-cols-3 gap-4", children: [...grouped.values()].map((item) => _jsx(Metric, { label: item.providerName, value: `${item.status} / ${item.latency.totalMs}ms` }, item.providerId)) })] }));
}
function HistoryPage() {
    const history = useQuery({ queryKey: ["history"], queryFn: api.history });
    return _jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u5386\u53F2\u8BB0\u5F55" }), _jsx(Panel, { children: _jsx(ResultTable, { results: history.data ?? [] }) })] });
}
function ExportPage() {
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u62A5\u544A\u5BFC\u51FA" }), _jsx(Panel, { children: _jsx("div", { className: "flex gap-2", children: ["json", "csv", "markdown", "html"].map((format) => _jsx("a", { href: api.exportUrl(format), children: _jsxs(Button, { variant: "ghost", children: [_jsx(Download, { size: 16 }), format] }) }, format)) }) })] }));
}
function SettingsPage() {
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u8BBE\u7F6E" }), _jsx(Panel, { title: "\u9ED8\u8BA4\u8FD0\u884C\u53C2\u6570", children: _jsx("div", { className: "grid grid-cols-4 gap-3", children: ["timeoutMs", "retries", "concurrency", "monitorIntervalSec"].map((label) => _jsx("input", { className: "h-9 rounded-md border border-line px-3 text-sm", placeholder: label }, label)) }) })] }));
}
function Metric({ label, value }) {
    return _jsxs(Panel, { children: [_jsx("div", { className: "text-sm text-slate-500", children: label }), _jsx("div", { className: "mt-2 text-2xl font-semibold", children: value })] });
}
function ResultTable({ results }) {
    return (_jsxs("table", { className: "w-full border-collapse text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-line text-left", children: [_jsx("th", { className: "py-2", children: "Provider" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Latency" }), _jsx("th", { children: "Error" })] }) }), _jsx("tbody", { children: results.map((result) => (_jsxs("tr", { className: "border-b border-line", children: [_jsx("td", { className: "py-2 font-medium", children: result.providerName }), _jsx("td", { children: result.type }), _jsx("td", { children: _jsx(StatusBadge, { status: result.status }) }), _jsxs("td", { children: [result.latency.totalMs, "ms"] }), _jsx("td", { className: "text-slate-600", children: result.error?.message })] }, result.id))) })] }));
}
//# sourceMappingURL=App.js.map