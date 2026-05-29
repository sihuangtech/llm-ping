import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";

export function Button(props: PropsWithChildren<{ disabled?: boolean; onClick?: () => void; type?: "button" | "submit"; variant?: "primary" | "ghost"; title?: string }>) {
  return (
    <button
      type={props.type ?? "button"}
      title={props.title}
      onClick={props.onClick}
      disabled={props.disabled}
      className={clsx(
        "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        props.variant === "ghost"
          ? "border-line bg-white hover:bg-slate-50"
          : "border-brand bg-brand text-white hover:bg-teal-800",
      )}
    >
      {props.children}
    </button>
  );
}

export function Panel(props: PropsWithChildren<{ title?: ReactNode; action?: ReactNode }>) {
  return (
    <section className="rounded-lg border border-line bg-panel p-4">
      {(props.title || props.action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{props.title}</h2>
          {props.action}
        </div>
      )}
      {props.children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "success"
      ? "bg-teal-100 text-teal-800"
      : status === "warning"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";
  return <span className={clsx("rounded-md px-2 py-1 text-xs font-semibold", color)}>{status}</span>;
}
