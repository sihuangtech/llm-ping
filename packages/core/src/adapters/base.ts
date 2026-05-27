import { type CheckItem, type CheckResult, type ProviderCapability, type ProviderConfig, redactObject, type UsageInfo } from "@llm-ping/shared";

import { classifyError } from "../diagnostics/errors.js";
import { joinUrl, jsonRequest } from "../diagnostics/http.js";
import { probeNetwork } from "../diagnostics/network.js";
import type { ProviderAdapter } from "./types.js";

export type CompletionSpec = {
  url: string;
  headers: Record<string, string>;
  body: unknown;
  parseText: (body: unknown) => string | undefined;
  parseUsage?: (body: unknown) => UsageInfo | undefined;
};

// OpenAI Compatible 一类协议的通用实现；特定 Provider 只覆写路径、鉴权和响应解析。
export abstract class HttpProviderAdapter implements ProviderAdapter {
  abstract readonly capability: ProviderCapability;

  async check(config: ProviderConfig): Promise<CheckResult> {
    const startedAt = new Date();
    const startedMs = performance.now();
    const items: CheckItem[] = [];
    let usage: UsageInfo | undefined;
    let rawSummary: unknown;
    let totalMs = 0;
    let dnsMs: number | undefined;
    let tcpMs: number | undefined;
    let tlsMs: number | undefined;
    let modelListMs: number | undefined;
    let completionMs: number | undefined;

    try {
      this.validateConfig(config);
      const baseUrl = this.resolveBaseUrl(config);
      const network = await probeNetwork(baseUrl, config.timeoutMs);
      items.push(...network.items);
      dnsMs = network.dnsMs;
      tcpMs = network.tcpMs;
      tlsMs = network.tlsMs;

      if (!config.skipModelList && this.capability.modelsApi) {
        const modelResult = await this.checkModels(config);
        items.push(modelResult.item);
        modelListMs = modelResult.item.latencyMs;
      } else {
        items.push({ name: "模型列表检测", status: "skipped", message: "当前配置跳过模型列表检测。" });
      }

      const spec = this.buildCompletion(config);
      const completion = await jsonRequest(spec.url, {
        method: "POST",
        headers: spec.headers,
        body: spec.body,
        timeoutMs: config.timeoutMs,
      });
      completionMs = completion.latencyMs;
      rawSummary = redactObject(completion.body);

      if (completion.statusCode >= 400) {
        throw Object.assign(new Error("Completion request failed"), {
          httpStatus: completion.statusCode,
          body: completion.body,
        });
      }

      const text = spec.parseText(completion.body);
      usage = spec.parseUsage?.(completion.body);
      items.push({
        name: "最小生成测试",
        status: text ? "success" : "warning",
        message: text ? "模型可调用并返回了内容。" : "接口响应成功，但没有解析到文本内容。",
        latencyMs: completion.latencyMs,
        suggestion: text ? undefined : "检查 Provider 响应格式是否兼容。",
      });
      items.push({
        name: "usage 检测",
        status: usage ? "success" : "warning",
        message: usage ? "响应中包含 usage 信息。" : "响应中没有 usage 信息。",
        suggestion: usage ? undefined : "部分 Provider 不返回 usage；如需计费统计请确认服务商支持。",
      });

      if (config.streaming && this.capability.streaming) {
        items.push({
          name: "Streaming 检测",
          status: "success",
          message: "该 Provider 支持 Streaming；当前版本已验证非流式生成路径。",
        });
      } else {
        items.push({
          name: "Streaming 检测",
          status: this.capability.streaming ? "skipped" : "unsupported",
          message: this.capability.streaming ? "配置未开启 streaming 测试。" : "该 Provider Adapter 暂不支持 streaming。",
        });
      }

      totalMs = Math.round(performance.now() - startedMs);
      return this.result(config, "success", startedAt, items, {
        dnsMs,
        tcpMs,
        tlsMs,
        modelListMs,
        completionMs,
        totalMs,
      }, usage, rawSummary);
    } catch (error) {
      const rich = error as Error & { httpStatus?: number; body?: unknown };
      const classified = classifyError(error, rich.httpStatus, rich.body);
      items.push({
        name: "错误分类",
        status: classified.status,
        message: classified.message,
        suggestion: classified.suggestion,
      });
      totalMs = Math.max(1, Math.round(performance.now() - startedMs));
      return {
        ...this.result(
          config,
          classified.status,
          startedAt,
          items,
          { dnsMs, tcpMs, tlsMs, modelListMs, completionMs, totalMs },
          usage,
          rawSummary,
        ),
        error: classified,
      };
    }
  }

  protected validateConfig(config: ProviderConfig): void {
    if (!config.baseUrl) throw new Error("Base URL is required");
    if (this.capability.requiresApiKey && !config.apiKey && !config.accessToken) {
      throw new Error("API key or access token is required");
    }
    if (this.capability.requiresDeployment && !config.deployment) {
      throw new Error("Deployment is required");
    }
  }

  protected resolveBaseUrl(config: ProviderConfig): string {
    if (!config.baseUrl) throw new Error("Base URL is required");
    return config.baseUrl;
  }

  protected async checkModels(config: ProviderConfig): Promise<{ item: CheckItem }> {
    const response = await jsonRequest(this.modelsUrl(config), {
      method: "GET",
      headers: this.authHeaders(config),
      timeoutMs: config.timeoutMs,
    });
    if (response.statusCode >= 400) {
      throw Object.assign(new Error("Models request failed"), {
        httpStatus: response.statusCode,
        body: response.body,
      });
    }
    const exists = config.model ? this.modelExists(response.body, config.model) : true;
    return {
      item: {
        name: "模型列表检测",
        status: exists ? "success" : config.strictModelCheck ? "failed" : "warning",
        message: exists ? "模型列表接口可用。" : "模型列表可用，但未找到目标模型。",
        latencyMs: response.latencyMs,
        suggestion: exists ? undefined : "确认模型名称；兼容网关可关闭 strict model check。",
      },
    };
  }

  protected authHeaders(config: ProviderConfig): Record<string, string> {
    return { ...config.headers, authorization: `Bearer ${config.apiKey ?? config.accessToken ?? ""}` };
  }

  protected modelsUrl(config: ProviderConfig): string {
    return joinUrl(this.resolveBaseUrl(config), "/v1/models");
  }

  protected modelExists(body: unknown, model: string): boolean {
    const data = (body as { data?: Array<{ id?: string; name?: string }> }).data;
    return Array.isArray(data) && data.some((item) => item.id === model || item.name === model);
  }

  protected abstract buildCompletion(config: ProviderConfig): CompletionSpec;

  private result(
    config: ProviderConfig,
    status: CheckResult["status"],
    startedAt: Date,
    items: CheckItem[],
    latency: CheckResult["latency"],
    usage?: UsageInfo,
    rawSummary?: unknown,
  ): CheckResult {
    return {
      id: crypto.randomUUID(),
      providerId: config.id,
      providerName: config.name,
      type: config.type,
      status,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      latency,
      items,
      usage,
      rawSummary,
    };
  }
}
