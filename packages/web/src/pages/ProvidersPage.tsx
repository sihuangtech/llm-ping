import type { CheckResult } from "@llm-ping/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";

import { ProviderForm } from "../components/provider-form";
import { Button, Panel } from "../components/ui";
import { api } from "../lib/api";
import { emptyProviderForm, formForProvider, providerDefaults, providerFromForm, type ProviderFormState } from "./providerConfig";

export function ProvidersPage() {
  const queryClient = useQueryClient();
  const providers = useQuery({ queryKey: ["providers"], queryFn: api.providers });
  const capabilities = useQuery({ queryKey: ["capabilities"], queryFn: api.capabilities });
  const save = useMutation({ mutationFn: api.saveProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }) });
  const remove = useMutation({
    mutationFn: api.deleteProvider,
    onSuccess: () => {
      setProviderMessage("Provider 已删除。");
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
  const check = useMutation({
    mutationFn: api.checkProvider,
    onSuccess: (result) => {
      setLatestResult(result);
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
  const [form, setForm] = useState<ProviderFormState>(emptyProviderForm);
  const [formError, setFormError] = useState("");
  const [checkingId, setCheckingId] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [providerMessage, setProviderMessage] = useState("");
  const [latestResult, setLatestResult] = useState<CheckResult>();

  function submit() {
    try {
      setFormError("");
      save.mutate(providerFromForm(form), { onSuccess: () => setForm(emptyProviderForm) });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Provider 配置不合法。");
    }
  }

  function updateType(type: string) {
    const defaults = providerDefaults[type] ?? { baseUrl: "", model: "" };
    setForm({ ...form, type, baseUrl: defaults.baseUrl, model: defaults.model });
  }

  function runCheck(id: string) {
    setCheckingId(id);
    setProviderMessage("");
    setLatestResult(undefined);
    check.mutate(id, { onSettled: () => setCheckingId("") });
  }

  function deleteProvider(id: string) {
    setRemovingId(id);
    setProviderMessage("");
    remove.mutate(id, { onSettled: () => setRemovingId("") });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Provider 管理</h1>
      <Panel title="新增 / 编辑 Provider">
        <ProviderForm
          capabilities={capabilities.data}
          form={form}
          formError={formError}
          onChange={setForm}
          onClear={() => setForm(emptyProviderForm)}
          onSubmit={submit}
          onTypeChange={updateType}
        />
      </Panel>
      <Panel title="Provider 列表">
        {providerMessage && <p className="mb-3 text-sm text-teal-800">{providerMessage}</p>}
        {remove.error && <p className="mb-3 text-sm text-red-700">{remove.error instanceof Error ? remove.error.message : "删除 Provider 失败。"}</p>}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left"><th className="py-2">名称</th><th>类型</th><th>模型</th><th>Base URL</th><th>状态</th><th /></tr>
          </thead>
          <tbody>
            {providers.data?.map((provider) => (
              <tr key={provider.id} className="border-b border-line">
                <td className="py-3 font-medium">{provider.name}</td>
                <td>{provider.type}</td>
                <td>{provider.model}</td>
                <td className="max-w-80 truncate text-slate-600">{provider.baseUrl}</td>
                <td>{provider.enabled ? "启用" : "禁用"}</td>
                <td className="text-right">
                  <Button variant="ghost" title="编辑" onClick={() => setForm(formForProvider(provider))}><Pencil size={16} /></Button>
                  <Button disabled={checkingId === provider.id} variant="ghost" title="一键测试" onClick={() => runCheck(provider.id)}><Play size={16} /></Button>
                  <Button disabled={removingId === provider.id} variant="ghost" title="删除" onClick={() => deleteProvider(provider.id)}><Trash2 size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      {(check.isPending || check.error || latestResult) && (
        <Panel title="最近检测结果">
          {check.isPending && <p className="text-sm text-slate-600">正在检测 Provider，请稍等...</p>}
          {check.error && <p className="text-sm text-red-700">{check.error instanceof Error ? check.error.message : "检测请求失败。"}</p>}
          {latestResult && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <strong>{latestResult.providerName}</strong>
                <span>{latestResult.status}</span>
                <span>{latestResult.latency.totalMs}ms</span>
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {latestResult.items.map((item) => (
                    <tr key={item.name} className="border-b border-line">
                      <td className="py-2 font-medium">{item.name}</td>
                      <td>{item.status}</td>
                      <td className="text-slate-600">{item.message}</td>
                      <td className="text-slate-500">{item.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {latestResult.error && <p className="text-red-700">建议：{latestResult.error.suggestion}</p>}
              {latestResult.rawSummary !== undefined && (
                <details className="rounded-md border border-line bg-slate-50 p-3">
                  <summary className="cursor-pointer font-medium">原始响应摘要</summary>
                  <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs">
                    {JSON.stringify(latestResult.rawSummary, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
