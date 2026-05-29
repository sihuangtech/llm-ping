import { useQuery } from "@tanstack/react-query";

import { ResultTable } from "../components/results";
import { Panel } from "../components/ui";
import { api } from "../lib/api";

export function HistoryPage() {
  const history = useQuery({ queryKey: ["history"], queryFn: api.history });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">历史记录</h1>
      <Panel>
        <ResultTable results={history.data ?? []} />
      </Panel>
    </div>
  );
}
