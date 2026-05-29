export type ResultRow = {
    id: string;
    providerName: string;
    type: string;
    status: string;
    latency: {
        totalMs: number;
    };
    error?: {
        message: string;
    };
};
export declare function ResultTable({ results }: {
    results: ResultRow[];
}): import("react/jsx-runtime").JSX.Element;
