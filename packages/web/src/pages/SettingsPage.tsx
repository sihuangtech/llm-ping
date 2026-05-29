import { Panel } from "../components/ui";

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">设置</h1>
      <Panel title="默认运行参数">
        <div className="grid grid-cols-4 gap-3">
          {["timeoutMs", "retries", "concurrency", "monitorIntervalSec"].map((label) => (
            <input key={label} className="h-9 rounded-md border border-line px-3 text-sm" placeholder={label} />
          ))}
        </div>
      </Panel>
    </div>
  );
}
