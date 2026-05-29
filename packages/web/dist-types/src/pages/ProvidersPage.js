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
    const check = useMutation({ mutationFn: api.checkProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] }) });
    const [form, setForm] = useState(emptyProviderForm);
    const [formError, setFormError] = useState("");
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
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Provider \u7BA1\u7406" }), _jsx(Panel, { title: "\u65B0\u589E / \u7F16\u8F91 Provider", children: _jsx(ProviderForm, { capabilities: capabilities.data, form: form, formError: formError, onChange: setForm, onClear: () => setForm(emptyProviderForm), onSubmit: submit, onTypeChange: updateType }) }), _jsx(Panel, { title: "Provider \u5217\u8868", children: _jsxs("table", { className: "w-full border-collapse text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-line text-left", children: [_jsx("th", { className: "py-2", children: "\u540D\u79F0" }), _jsx("th", { children: "\u7C7B\u578B" }), _jsx("th", { children: "\u6A21\u578B" }), _jsx("th", { children: "Base URL" }), _jsx("th", { children: "\u72B6\u6001" }), _jsx("th", {})] }) }), _jsx("tbody", { children: providers.data?.map((provider) => (_jsxs("tr", { className: "border-b border-line", children: [_jsx("td", { className: "py-3 font-medium", children: provider.name }), _jsx("td", { children: provider.type }), _jsx("td", { children: provider.model }), _jsx("td", { className: "max-w-80 truncate text-slate-600", children: provider.baseUrl }), _jsx("td", { children: provider.enabled ? "启用" : "禁用" }), _jsxs("td", { className: "text-right", children: [_jsx(Button, { variant: "ghost", title: "\u7F16\u8F91", onClick: () => setForm(formForProvider(provider)), children: _jsx(Pencil, { size: 16 }) }), _jsx(Button, { variant: "ghost", title: "\u4E00\u952E\u6D4B\u8BD5", onClick: () => check.mutate(provider.id), children: _jsx(Play, { size: 16 }) }), _jsx(Button, { variant: "ghost", title: "\u5220\u9664", onClick: () => remove.mutate(provider.id), children: _jsx(Trash2, { size: 16 }) })] })] }, provider.id))) })] }) })] }));
}
//# sourceMappingURL=ProvidersPage.js.map