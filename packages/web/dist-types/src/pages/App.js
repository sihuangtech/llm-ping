import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity, Download, History, LayoutDashboard, Play, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { BatchPage } from "./BatchPage";
import { DashboardPage } from "./DashboardPage";
import { ExportPage } from "./ExportPage";
import { HistoryPage } from "./HistoryPage";
import { MonitorPage } from "./MonitorPage";
import { ProvidersPage } from "./ProvidersPage";
import { SettingsPage } from "./SettingsPage";
const nav = [
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["providers", Plus, "Providers"],
    ["batch", Play, "Batch"],
    ["monitor", Activity, "Monitor"],
    ["history", History, "History"],
    ["export", Download, "Export"],
    ["settings", Settings, "Settings"],
];
export function App() {
    const [page, setPage] = useState("dashboard");
    return (_jsxs("div", { className: "grid min-h-screen grid-cols-[220px_1fr]", children: [_jsxs("aside", { className: "border-r border-line bg-white p-4", children: [_jsx("div", { className: "mb-6 text-xl font-bold", children: "llm-ping" }), _jsx("nav", { className: "space-y-1", children: nav.map(([id, Icon, label]) => (_jsxs("button", { onClick: () => setPage(id), className: `flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm ${page === id ? "bg-teal-50 text-teal-800" : "hover:bg-slate-50"}`, children: [_jsx(Icon, { size: 17 }), label] }, id))) })] }), _jsxs("main", { className: "p-6", children: [page === "dashboard" && _jsx(DashboardPage, {}), page === "providers" && _jsx(ProvidersPage, {}), page === "batch" && _jsx(BatchPage, {}), page === "monitor" && _jsx(MonitorPage, {}), page === "history" && _jsx(HistoryPage, {}), page === "export" && _jsx(ExportPage, {}), page === "settings" && _jsx(SettingsPage, {})] })] }));
}
//# sourceMappingURL=App.js.map