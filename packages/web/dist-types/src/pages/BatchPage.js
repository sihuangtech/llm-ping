import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { ResultTable } from "../components/results";
import { Button, Panel } from "../components/ui";
import { api } from "../lib/api";
export function BatchPage() {
    const queryClient = useQueryClient();
    const batch = useMutation({
        mutationFn: api.checkAll,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] }),
    });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u6279\u91CF\u68C0\u6D4B" }), _jsx(Panel, { title: "\u4EFB\u52A1\u63A7\u5236", action: _jsxs(Button, { disabled: batch.isPending, onClick: () => batch.mutate(), children: [_jsx(Play, { size: 16 }), batch.isPending ? "检测中" : "开始"] }), children: batch.isPending ? (_jsx("p", { className: "text-sm text-slate-600", children: "\u6B63\u5728\u68C0\u6D4B\u6240\u6709\u542F\u7528 Provider\uFF0C\u8BF7\u7A0D\u7B49..." })) : batch.error ? (_jsx("p", { className: "text-sm text-red-700", children: batch.error instanceof Error ? batch.error.message : "批量检测请求失败。" })) : batch.data ? (_jsx(ResultTable, { results: batch.data })) : (_jsx("p", { className: "text-sm text-slate-600", children: "\u70B9\u51FB\u5F00\u59CB\u540E\u4F1A\u5E76\u53D1\u68C0\u6D4B\u6240\u6709\u542F\u7528 Provider\u3002" })) })] }));
}
//# sourceMappingURL=BatchPage.js.map