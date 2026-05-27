import { type CheckResult, redactObject } from "@llm-ping/shared";

export function exportJson(results: CheckResult[]): string {
  return JSON.stringify(redactObject(results), null, 2);
}

export function exportCsv(results: CheckResult[]): string {
  const rows = [
    ["id", "providerId", "providerName", "type", "status", "startedAt", "finishedAt", "totalMs", "errorCode"],
    ...results.map((result) => [
      result.id,
      result.providerId,
      result.providerName,
      result.type,
      result.status,
      result.startedAt,
      result.finishedAt,
      String(result.latency.totalMs),
      result.error?.code ?? "",
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function exportMarkdown(results: CheckResult[]): string {
  const lines = [
    "# llm-ping Report",
    "",
    "| Provider | Type | Status | Latency | Error |",
    "| --- | --- | --- | ---: | --- |",
    ...results.map(
      (result) =>
        `| ${result.providerName} | ${result.type} | ${result.status} | ${result.latency.totalMs}ms | ${
          result.error?.message ?? ""
        } |`,
    ),
  ];
  return lines.join("\n");
}

export function exportHtml(results: CheckResult[]): string {
  const rows = results
    .map(
      (result) => `<tr>
<td>${escapeHtml(result.providerName)}</td>
<td>${escapeHtml(result.type)}</td>
<td><span class="badge ${result.status}">${result.status}</span></td>
<td>${result.latency.totalMs}ms</td>
<td>${escapeHtml(result.error?.message ?? "")}</td>
</tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>llm-ping Report</title>
  <style>
    body { font-family: Inter, ui-sans-serif, system-ui; margin: 32px; color: #17202a; background: #f7f9fb; }
    main { max-width: 1080px; margin: 0 auto; }
    h1 { font-size: 28px; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #d9e2ec; }
    th, td { padding: 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
    .badge { padding: 4px 8px; border-radius: 6px; font-weight: 600; }
    .success { color: #0f766e; background: #ccfbf1; }
    .failed { color: #b91c1c; background: #fee2e2; }
    .warning { color: #92400e; background: #fef3c7; }
  </style>
</head>
<body>
  <main>
    <h1>llm-ping Health Report</h1>
    <p>Generated at ${new Date().toISOString()}</p>
    <table>
      <thead><tr><th>Provider</th><th>Type</th><th>Status</th><th>Latency</th><th>Error</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </main>
</body>
</html>`;
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
