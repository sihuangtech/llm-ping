import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProviderConfig } from "@llm-ping/shared";
import { Activity, Download, History, LayoutDashboard, Play, Plus, Settings, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Button, Panel, StatusBadge } from "../components/ui";
import { api } from "../lib/api";

type Page = "dashboard" | "providers" | "batch" | "monitor" | "history" | "export" | "settings";

const providerFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const nav = [
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["providers", Plus, "Providers"],
    ["batch", Play, "Batch"],
    ["monitor", Activity, "Monitor"],
    ["history", History, "History"],
    ["export", Download, "Export"],
    ["settings", Settings, "Settings"],
  ] as const;

  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr]">
      <aside className="border-r border-line bg-white p-4">
        <div className="mb-6 text-xl font-bold">llm-ping</div>
        <nav className="space-y-1">
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm ${page === id ? "bg-teal-50 text-teal-800" : "hover:bg-slate-50"}`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="p-6">
        {page === "dashboard" && <Dashboard />}
        {page === "providers" && <Providers />}
        {page === "batch" && <Batch />}
        {page === "monitor" && <Monitor />}
        {page === "history" && <HistoryPage />}
        {page === "export" && <ExportPage />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

function Dashboard() {
  const providers = useQuery({ queryKey: ["providers"], queryFn: api.providers });
  const history = useQuery({ queryKey: ["history"], queryFn: api.history });
  const latest = history.data ?? [];
  const ok = latest.filter((item) => item.status === "success").length;
  const avg = latest.length ? Math.round(latest.reduce((sum, item) => sum + item.latency.totalMs, 0) / latest.length) : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <Metric label="Provider 总数" value={providers.data?.length ?? 0} />
        <Metric label="正常数量" value={ok} />
        <Metric label="异常数量" value={latest.length - ok} />
        <Metric label="平均延迟" value={`${avg}ms`} />
      </div>
      <Panel title="最近检测">
        <ResultTable results={latest.slice(0, 8)} />
      </Panel>
    </div>
  );
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
      type: parsed.type as ProviderConfig["type"],
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Provider 管理</h1>
      <Panel title="新增 / 编辑 Provider">
        <div className="grid grid-cols-6 gap-3">
          {["id", "name", "baseUrl", "apiKey", "model"].map((field) => (
            <input key={field} className="h-9 rounded-md border border-line px-3 text-sm" placeholder={field} value={(form as any)[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
          ))}
          <select className="h-9 rounded-md border border-line px-3 text-sm" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {capabilities.data?.map((capability) => <option key={capability.id} value={capability.id}>{capability.name}</option>)}
          </select>
        </div>
        <div className="mt-3"><Button onClick={submit}>保存</Button></div>
      </Panel>
      <Panel title="Provider 列表">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {providers.data?.map((provider) => (
              <tr key={provider.id} className="border-b border-line">
                <td className="py-3 font-medium">{provider.name}</td>
                <td>{provider.type}</td>
                <td>{provider.model}</td>
                <td className="text-right">
                  <Button variant="ghost" title="一键测试" onClick={() => check.mutate(provider.id)}><Play size={16} /></Button>
                  <Button variant="ghost" title="删除" onClick={() => remove.mutate(provider.id)}><Trash2 size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Batch() {
  const queryClient = useQueryClient();
  const batch = useMutation({ mutationFn: api.checkAll, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] }) });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">批量检测</h1>
      <Panel title="任务控制" action={<Button onClick={() => batch.mutate()}><Play size={16} />开始</Button>}>
        {batch.data ? <ResultTable results={batch.data} /> : <p className="text-sm text-slate-600">点击开始后会并发检测所有启用 Provider。</p>}
      </Panel>
    </div>
  );
}

function Monitor() {
  const history = useQuery({ queryKey: ["history"], queryFn: api.history, refetchInterval: 10000 });
  const grouped = useMemo(() => new Map((history.data ?? []).map((item) => [item.providerId, item])), [history.data]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Monitor</h1>
      <div className="grid grid-cols-3 gap-4">
        {[...grouped.values()].map((item) => <Metric key={item.providerId} label={item.providerName} value={`${item.status} / ${item.latency.totalMs}ms`} />)}
      </div>
    </div>
  );
}

function HistoryPage() {
  const history = useQuery({ queryKey: ["history"], queryFn: api.history });
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">历史记录</h1><Panel><ResultTable results={history.data ?? []} /></Panel></div>;
}

function ExportPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">报告导出</h1>
      <Panel>
        <div className="flex gap-2">
          {["json", "csv", "markdown", "html"].map((format) => <a key={format} href={api.exportUrl(format)}><Button variant="ghost"><Download size={16} />{format}</Button></a>)}
        </div>
      </Panel>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">设置</h1>
      <Panel title="默认运行参数">
        <div className="grid grid-cols-4 gap-3">
          {["timeoutMs", "retries", "concurrency", "monitorIntervalSec"].map((label) => <input key={label} className="h-9 rounded-md border border-line px-3 text-sm" placeholder={label} />)}
        </div>
      </Panel>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Panel><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></Panel>;
}

function ResultTable({ results }: { results: Array<{ id: string; providerName: string; type: string; status: string; latency: { totalMs: number }; error?: { message: string } }> }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead><tr className="border-b border-line text-left"><th className="py-2">Provider</th><th>Type</th><th>Status</th><th>Latency</th><th>Error</th></tr></thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.id} className="border-b border-line">
            <td className="py-2 font-medium">{result.providerName}</td>
            <td>{result.type}</td>
            <td><StatusBadge status={result.status} /></td>
            <td>{result.latency.totalMs}ms</td>
            <td className="text-slate-600">{result.error?.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
