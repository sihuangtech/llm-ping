import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { ResultTable } from "../components/results";
import { Panel } from "../components/ui";
import { api } from "../lib/api";
export function HistoryPage() {
    const history = useQuery({ queryKey: ["history"], queryFn: api.history });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u5386\u53F2\u8BB0\u5F55" }), _jsx(Panel, { children: _jsx(ResultTable, { results: history.data ?? [] }) })] }));
}
//# sourceMappingURL=HistoryPage.js.map