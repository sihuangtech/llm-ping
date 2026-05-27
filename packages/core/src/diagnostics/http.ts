import { request } from "undici";

export type JsonRequestOptions = {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs: number;
};

export type JsonResponse = {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  latencyMs: number;
};

// 所有 Adapter 通过这个函数发请求，便于统一 timeout、JSON 解析和延迟统计。
export async function jsonRequest(url: string, options: JsonRequestOptions): Promise<JsonResponse> {
  const started = performance.now();
  const response = await request(url, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    bodyTimeout: options.timeoutMs,
    headersTimeout: options.timeoutMs,
  });

  const text = await response.body.text();
  const latencyMs = Math.round(performance.now() - started);
  const parsed = parseJsonSafely(text);
  return {
    statusCode: response.statusCode,
    headers: response.headers,
    body: parsed,
    latencyMs,
  };
}

export function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function parseJsonSafely(text: string): unknown {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}
