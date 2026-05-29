import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Panel } from "../components/ui";
export function SettingsPage() {
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u8BBE\u7F6E" }), _jsx(Panel, { title: "\u9ED8\u8BA4\u8FD0\u884C\u53C2\u6570", children: _jsx("div", { className: "grid grid-cols-4 gap-3", children: ["timeoutMs", "retries", "concurrency", "monitorIntervalSec"].map((label) => (_jsx("input", { className: "h-9 rounded-md border border-line px-3 text-sm", placeholder: label }, label))) }) })] }));
}
//# sourceMappingURL=SettingsPage.js.map