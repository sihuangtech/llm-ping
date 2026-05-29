import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Download } from "lucide-react";
import { Button, Panel } from "../components/ui";
import { api } from "../lib/api";
export function ExportPage() {
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u62A5\u544A\u5BFC\u51FA" }), _jsx(Panel, { children: _jsx("div", { className: "flex gap-2", children: ["json", "csv", "markdown", "html"].map((format) => (_jsx("a", { href: api.exportUrl(format), children: _jsxs(Button, { variant: "ghost", children: [_jsx(Download, { size: 16 }), format] }) }, format))) }) })] }));
}
//# sourceMappingURL=ExportPage.js.map