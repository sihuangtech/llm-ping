import { StatusBadge } from "./ui";

export type ResultRow = {
  id: string;
  providerName: string;
  type: string;
  status: string;
  latency: { totalMs: number };
  error?: { message: string };
  rawSummary?: unknown;
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
            <td className="text-slate-600">
              {result.error?.message}
              {result.rawSummary !== undefined && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-brand">Raw</summary>
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                    {JSON.stringify(result.rawSummary, null, 2)}
                  </pre>
                </details>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
