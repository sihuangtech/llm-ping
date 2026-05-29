import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProviderForm } from "../components/provider-form";
import { Button, Panel } from "../components/ui";
import { api } from "../lib/api";
import { emptyProviderForm, formForProvider, providerDefaults, providerFromForm } from "./providerConfig";
export function ProvidersPage() {
    const queryClient = useQueryClient();
    const providers = useQuery({ queryKey: ["providers"], queryFn: api.providers });
    const capabilities = useQuery({ queryKey: ["capabilities"], queryFn: api.capabilities });
    const save = useMutation({ mutationFn: api.saveProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }) });
    const remove = useMutation({ mutationFn: api.deleteProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }) });
    const check = useMutation({
        mutationFn: api.checkProvider,
        onSuccess: (result) => {
            setLatestResult(result);
            queryClient.invalidateQueries({ queryKey: ["history"] });
        },
    });
    const [form, setForm] = useState(emptyProviderForm);
    const [formError, setFormError] = useState("");
    const [checkingId, setCheckingId] = useState("");
    const [latestResult, setLatestResult] = useState();
    function submit() {
        try {
            setFormError("");
            save.mutate(providerFromForm(form), { onSuccess: () => setForm(emptyProviderForm) });
        }
        catch (error) {
            setFormError(error instanceof Error ? error.message : "Provider 配置不合法。");
        }
    }
    function updateType(type) {
        const defaults = providerDefaults[type] ?? { baseUrl: "", model: "" };
        setForm({ ...form, type, baseUrl: defaults.baseUrl, model: defaults.model });
    }
    function runCheck(id) {
        setCheckingId(id);
        setLatestResult(undefined);
        check.mutate(id, { onSettled: () => setCheckingId("") });
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Provider \u7BA1\u7406" }), _jsx(Panel, { title: "\u65B0\u589E / \u7F16\u8F91 Provider", children: _jsx(ProviderForm, { capabilities: capabilities.data, form: form, formError: formError, onChange: setForm, onClear: () => setForm(emptyProviderForm), onSubmit: submit, onTypeChange: updateType }) }), _jsx(Panel, { title: "Provider \u5217\u8868", children: _jsxs("table", { className: "w-full border-collapse text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-line text-left", children: [_jsx("th", { className: "py-2", children: "\u540D\u79F0" }), _jsx("th", { children: "\u7C7B\u578B" }), _jsx("th", { children: "\u6A21\u578B" }), _jsx("th", { children: "Base URL" }), _jsx("th", { children: "\u72B6\u6001" }), _jsx("th", {})] }) }), _jsx("tbody", { children: providers.data?.map((provider) => (_jsxs("tr", { className: "border-b border-line", children: [_jsx("td", { className: "py-3 font-medium", children: provider.name }), _jsx("td", { children: provider.type }), _jsx("td", { children: provider.model }), _jsx("td", { className: "max-w-80 truncate text-slate-600", children: provider.baseUrl }), _jsx("td", { children: provider.enabled ? "启用" : "禁用" }), _jsxs("td", { className: "text-right", children: [_jsx(Button, { variant: "ghost", title: "\u7F16\u8F91", onClick: () => setForm(formForProvider(provider)), children: _jsx(Pencil, { size: 16 }) }), _jsx(Button, { disabled: checkingId === provider.id, variant: "ghost", title: "\u4E00\u952E\u6D4B\u8BD5", onClick: () => runCheck(provider.id), children: _jsx(Play, { size: 16 }) }), _jsx(Button, { variant: "ghost", title: "\u5220\u9664", onClick: () => remove.mutate(provider.id), children: _jsx(Trash2, { size: 16 }) })] })] }, provider.id))) })] }) }), (check.isPending || check.error || latestResult) && (_jsxs(Panel, { title: "\u6700\u8FD1\u68C0\u6D4B\u7ED3\u679C", children: [check.isPending && _jsx("p", { className: "text-sm text-slate-600", children: "\u6B63\u5728\u68C0\u6D4B Provider\uFF0C\u8BF7\u7A0D\u7B49..." }), check.error && _jsx("p", { className: "text-sm text-red-700", children: check.error instanceof Error ? check.error.message : "检测请求失败。" }), latestResult && (_jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("strong", { children: latestResult.providerName }), _jsx("span", { children: latestResult.status }), _jsxs("span", { children: [latestResult.latency.totalMs, "ms"] })] }), _jsx("table", { className: "w-full border-collapse", children: _jsx("tbody", { children: latestResult.items.map((item) => (_jsxs("tr", { className: "border-b border-line", children: [_jsx("td", { className: "py-2 font-medium", children: item.name }), _jsx("td", { children: item.status }), _jsx("td", { className: "text-slate-600", children: item.message }), _jsx("td", { className: "text-slate-500", children: item.suggestion })] }, item.name))) }) }), latestResult.error && _jsxs("p", { className: "text-red-700", children: ["\u5EFA\u8BAE\uFF1A", latestResult.error.suggestion] })] }))] }))] }));
}
//# sourceMappingURL=ProvidersPage.js.map