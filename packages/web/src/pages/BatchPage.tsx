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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">批量检测</h1>
      <Panel title="任务控制" action={<Button disabled={batch.isPending} onClick={() => batch.mutate()}><Play size={16} />{batch.isPending ? "检测中" : "开始"}</Button>}>
        {batch.isPending ? (
          <p className="text-sm text-slate-600">正在检测所有启用 Provider，请稍等...</p>
        ) : batch.error ? (
          <p className="text-sm text-red-700">{batch.error instanceof Error ? batch.error.message : "批量检测请求失败。"}</p>
        ) : batch.data ? (
          <ResultTable results={batch.data} />
        ) : (
          <p className="text-sm text-slate-600">点击开始后会并发检测所有启用 Provider。</p>
        )}
      </Panel>
    </div>
  );
}
