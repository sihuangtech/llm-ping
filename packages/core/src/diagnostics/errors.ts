import type { DiagnosticError } from "@llm-ping/shared";

// 将底层 HTTP/网络/Provider 错误统一成用户能理解的诊断结果。
export function classifyError(error: unknown, httpStatus?: number, body?: unknown): DiagnosticError {
  const text = `${error instanceof Error ? error.message : String(error)} ${JSON.stringify(body ?? {})}`;
  const lower = text.toLowerCase();

  if (httpStatus === 401 || lower.includes("invalid api key")) {
    return {
      code: "API_KEY_INVALID",
      status: "failed",
      message: "API Key 无效或鉴权头不正确。",
      suggestion: "检查 API Key、Authorization Bearer 格式，以及是否使用了正确的 Provider。",
      retryable: false,
      httpStatus,
    };
  }
  if (httpStatus === 403) {
    return {
      code: lower.includes("region") ? "REGION_RESTRICTED" : "FORBIDDEN",
      status: "failed",
      message: "请求被拒绝，通常是权限、区域或账单状态问题。",
      suggestion: "确认账号权限、模型访问权限、区域可用性和 billing 状态。",
      retryable: false,
      httpStatus,
    };
  }
  if (httpStatus === 404) {
    return {
      code: lower.includes("deployment") ? "DEPLOYMENT_NOT_FOUND" : "MODEL_NOT_FOUND",
      status: "failed",
      message: "模型、deployment 或接口路径不存在。",
      suggestion: "检查 model/deployment 名称、Base URL 路径和 API Version。",
      retryable: false,
      httpStatus,
    };
  }
  if (httpStatus === 429 || lower.includes("rate limit")) {
    return {
      code: "RATE_LIMITED",
      status: "warning",
      message: "请求被限流。",
      suggestion: "降低并发或监控频率，检查服务商配额。",
      retryable: true,
      httpStatus,
    };
  }
  if (httpStatus && httpStatus >= 500) {
    return {
      code: "SERVER_ERROR",
      status: "warning",
      message: "服务商返回 5xx 错误。",
      suggestion: "稍后重试；如果持续出现，检查服务商状态页或本地网关日志。",
      retryable: true,
      httpStatus,
    };
  }
  if (lower.includes("timed out") || lower.includes("timeout")) {
    return {
      code: "TIMEOUT",
      status: "failed",
      message: "请求超时。",
      suggestion: "检查网络、代理、Base URL，或适当增加 timeout。",
      retryable: true,
      httpStatus,
    };
  }
  if (lower.includes("enotfound") || lower.includes("dns")) {
    return {
      code: "DNS_FAILED",
      status: "failed",
      message: "DNS 解析失败。",
      suggestion: "检查域名、网络 DNS 配置或代理。",
      retryable: true,
      httpStatus,
    };
  }
  if (lower.includes("econnrefused") || lower.includes("fetch failed")) {
    return {
      code: "LOCAL_SERVICE_DOWN",
      status: "failed",
      message: "服务不可达，常见于本地模型服务未启动或端口错误。",
      suggestion: "启动 Ollama/LM Studio/LocalAI，确认端口和 Base URL。",
      retryable: true,
      httpStatus,
    };
  }

  return {
    code: "UNKNOWN",
    status: "failed",
    message: "未知错误。",
    suggestion: "查看原始错误摘要，确认 Provider 协议、Base URL 和网络环境。",
    retryable: true,
    httpStatus,
  };
}
