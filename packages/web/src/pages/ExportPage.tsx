import { Download } from "lucide-react";

import { Button, Panel } from "../components/ui";
import { api } from "../lib/api";

export function ExportPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">报告导出</h1>
      <Panel>
        <div className="flex gap-2">
          {["json", "csv", "markdown", "html"].map((format) => (
            <a key={format} href={api.exportUrl(format)}>
              <Button variant="ghost"><Download size={16} />{format}</Button>
            </a>
          ))}
        </div>
      </Panel>
    </div>
  );
}
