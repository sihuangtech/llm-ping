import { Panel } from "./ui";

export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Panel>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </Panel>
  );
}
