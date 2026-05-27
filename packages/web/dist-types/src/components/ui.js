import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from "clsx";
export function Button(props) {
    return (_jsx("button", { type: props.type ?? "button", title: props.title, onClick: props.onClick, className: clsx("inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition", props.variant === "ghost"
            ? "border-line bg-white hover:bg-slate-50"
            : "border-brand bg-brand text-white hover:bg-teal-800"), children: props.children }));
}
export function Panel(props) {
    return (_jsxs("section", { className: "rounded-lg border border-line bg-panel p-4", children: [(props.title || props.action) && (_jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [_jsx("h2", { className: "text-base font-semibold", children: props.title }), props.action] })), props.children] }));
}
export function StatusBadge({ status }) {
    const color = status === "success"
        ? "bg-teal-100 text-teal-800"
        : status === "warning"
            ? "bg-amber-100 text-amber-800"
            : "bg-red-100 text-red-800";
    return _jsx("span", { className: clsx("rounded-md px-2 py-1 text-xs font-semibold", color), children: status });
}
//# sourceMappingURL=ui.js.map