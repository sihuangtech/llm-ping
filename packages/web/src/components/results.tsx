import { StatusBadge } from "./ui";

export type ResultRow = {
  id: string;
  providerName: string;
  type: string;
  status: string;
  latency: { totalMs: number };
  error?: { message: string };
};

export function ResultTable({ results }: { results: ResultRow[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-line text-left">
          <th className="py-2">Provider</th>
          <th>Type</th>
          <th>Status</th>
          <th>Latency</th>
          <th>Error</th>
        </tr>
      </thead>
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
