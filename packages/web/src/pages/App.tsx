import { Activity, Download, History, LayoutDashboard, Play, Plus, Settings } from "lucide-react";
import { useState } from "react";

import { BatchPage } from "./BatchPage";
import { DashboardPage } from "./DashboardPage";
import { ExportPage } from "./ExportPage";
import { HistoryPage } from "./HistoryPage";
import { MonitorPage } from "./MonitorPage";
import { ProvidersPage } from "./ProvidersPage";
import { SettingsPage } from "./SettingsPage";

type Page = "dashboard" | "providers" | "batch" | "monitor" | "history" | "export" | "settings";

const nav = [
  ["dashboard", LayoutDashboard, "Dashboard"],
  ["providers", Plus, "Providers"],
  ["batch", Play, "Batch"],
  ["monitor", Activity, "Monitor"],
  ["history", History, "History"],
  ["export", Download, "Export"],
  ["settings", Settings, "Settings"],
] as const;

export function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr]">
      <aside className="border-r border-line bg-white p-4">
        <div className="mb-6 text-xl font-bold">llm-ping</div>
        <nav className="space-y-1">
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm ${
                page === id ? "bg-teal-50 text-teal-800" : "hover:bg-slate-50"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="p-6">
        {page === "dashboard" && <DashboardPage />}
        {page === "providers" && <ProvidersPage />}
        {page === "batch" && <BatchPage />}
        {page === "monitor" && <MonitorPage />}
        {page === "history" && <HistoryPage />}
        {page === "export" && <ExportPage />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}
