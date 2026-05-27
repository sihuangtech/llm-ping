import type { PropsWithChildren, ReactNode } from "react";
export declare function Button(props: PropsWithChildren<{
    onClick?: () => void;
    type?: "button" | "submit";
    variant?: "primary" | "ghost";
    title?: string;
}>): import("react/jsx-runtime").JSX.Element;
export declare function Panel(props: PropsWithChildren<{
    title?: ReactNode;
    action?: ReactNode;
}>): import("react/jsx-runtime").JSX.Element;
export declare function StatusBadge({ status }: {
    status: string;
}): import("react/jsx-runtime").JSX.Element;
