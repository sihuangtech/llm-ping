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
  const remove = useMutation({ mutationFn: api.deleteProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }) });
  const check = useMutation({ mutationFn: api.checkProvider, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] }) });
  const [form, setForm] = useState<ProviderFormState>(emptyProviderForm);
  const [formError, setFormError] = useState("");

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
