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
      <Panel title="任务控制" action={<Button onClick={() => batch.mutate()}><Play size={16} />开始</Button>}>
        {batch.data ? (
          <ResultTable results={batch.data} />
        ) : (
          <p className="text-sm text-slate-600">点击开始后会并发检测所有启用 Provider。</p>
        )}
      </Panel>
    </div>
  );
}
