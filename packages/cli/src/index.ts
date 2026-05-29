#!/usr/bin/env node
import fs from "node:fs";

import {
  checkProvider,
  createExampleConfig,
  exportCsv,
  exportHtml,
  exportJson,
  exportMarkdown,
  listProviderCapabilities,
  loadProjectConfig,
  Store,
  validateProvider,
} from "@llm-ping/core";
import type { CheckResult } from "@llm-ping/shared";
import { redactObject } from "@llm-ping/shared";
import chalk from "chalk";
import { Command } from "commander";
import "dotenv/config";

const program = new Command();

program.name("llm-ping").description("Ping LLM APIs like pinging servers.").version("0.1.0");

program
  .command("providers")
  .description("列出所有内置 Provider Adapter 能力")
  .action(() => {
    console.table(listProviderCapabilities());
  });

program
  .command("init")
  .description("初始化本地数据库和 .env.example")
  .option("--db <path>", "SQLite 数据库路径，默认 llm-ping.db")
  .option("-f, --force", "覆盖已有文件")
  .action((options) => {
    const store = new Store(resolveDbPath(options.db));
    for (const provider of createExampleConfig().providers) store.upsertProvider(provider);
    writeIfMissing(".env.example", "OPENAI_API_KEY=sk-your-key\nANTHROPIC_API_KEY=sk-ant-your-key\n", options.force);
    console.log(chalk.green("llm-ping 初始化完成，Provider 示例已写入本地 SQLite 数据库。"));
  });

program
  .command("check")
  .description("执行单 Provider、数据库 Provider 或配置文件批量检测")
  .option("--db <path>", "SQLite 数据库路径，默认 llm-ping.db")
  .option("-c, --config <path>", "兼容模式：配置文件路径")
  .option("--type <type>", "Provider 类型")
  .option("--name <name>", "Provider 名称", "adhoc")
  .option("--base-url <url>", "Base URL")
  .option("--api-key <key>", "API Key")
  .option("--model <model>", "模型名称")
  .option("--deployment <deployment>", "Azure deployment")
  .option("--api-version <apiVersion>", "API Version")
  .option("--timeout <ms>", "超时时间", "15000")
  .option("--retries <n>", "重试次数", "1")
  .option("--strict", "严格模型检测")
  .option("--streaming", "开启 streaming 检测")
  .option("--output <format>", "输出格式: pretty/json/csv/markdown/html", "pretty")
  .option("--raw", "pretty 输出中展示脱敏后的原始响应摘要")
  .action(async (options) => {
    const providers = options.config
      ? loadProjectConfig(options.config).providers.filter((provider) => provider.enabled)
      : options.type
        ? [
          validateProvider({
            id: "adhoc",
            name: options.name,
            type: options.type,
            baseUrl: options.baseUrl,
            apiKey: options.apiKey,
            model: options.model,
            deployment: options.deployment,
            apiVersion: options.apiVersion,
            timeoutMs: Number(options.timeout),
            retries: Number(options.retries),
            strictModelCheck: Boolean(options.strict),
            streaming: Boolean(options.streaming),
          }),
        ]
        : new Store(resolveDbPath(options.db)).listProviders().filter((provider) => provider.enabled);
    const results = await Promise.all(providers.map((provider) => checkProvider(provider)));
    printResults(results, options.output, Boolean(options.raw));
  });

program
  .command("monitor")
  .description("持续监控本地数据库或配置文件中的 Provider")
  .option("--db <path>", "SQLite 数据库路径，默认 llm-ping.db")
  .option("-c, --config <path>", "兼容模式：配置文件路径")
  .option("-i, --interval <sec>", "检测周期秒数", "60")
  .action(async (options) => {
    const store = options.config ? undefined : new Store(resolveDbPath(options.db));
    console.log(chalk.cyan("进入 monitor 模式，按 Ctrl+C 退出。"));
    for (;;) {
      const providers = options.config
        ? loadProjectConfig(options.config).providers.filter((p) => p.enabled)
        : store!.listProviders().filter((p) => p.enabled);
      const results = await Promise.all(providers.map((p) => checkProvider(p)));
      printResults(results, "pretty");
      await new Promise((resolve) => setTimeout(resolve, Number(options.interval) * 1000));
    }
  });

program
  .command("export")
  .description("把 JSON 检测结果导出为 CSV/Markdown/HTML")
  .requiredOption("-i, --input <path>", "输入 JSON 文件")
  .requiredOption("-o, --output <path>", "输出文件")
  .option("-f, --format <format>", "json/csv/markdown/html", "html")
  .action((options) => {
    const results = JSON.parse(fs.readFileSync(options.input, "utf8")) as CheckResult[];
    const content = render(results, options.format);
    fs.writeFileSync(options.output, content);
    console.log(chalk.green(`已导出: ${options.output}`));
  });

program
  .command("doctor")
  .description("检查本地数据库或配置文件中的常见问题")
  .option("--db <path>", "SQLite 数据库路径，默认 llm-ping.db")
  .option("-c, --config <path>", "兼容模式：配置文件路径")
  .action((options) => {
    const providers = options.config
      ? loadProjectConfig(options.config).providers
      : new Store(resolveDbPath(options.db)).listProviders();
    for (const provider of providers) {
      const issues = [
        !provider.baseUrl ? "缺少 baseUrl" : undefined,
        listProviderCapabilities().find((cap) => cap.id === provider.type)?.requiresApiKey && !provider.apiKey
          ? "缺少 apiKey"
          : undefined,
        provider.type === "azure-openai" && !provider.deployment ? "Azure OpenAI 缺少 deployment" : undefined,
      ].filter(Boolean);
      console.log(`${provider.name}: ${issues.length ? chalk.yellow(issues.join("; ")) : chalk.green("OK")}`);
    }
  });

program.parseAsync();

function printResults(results: CheckResult[], format: string, showRaw = false): void {
  if (format === "json") {
    process.stdout.write(exportJson(results));
    return;
  }
  if (format !== "pretty") {
    process.stdout.write(render(results, format));
    return;
  }
  for (const result of results) {
    const color = result.status === "success" ? chalk.green : result.status === "warning" ? chalk.yellow : chalk.red;
    console.log(color(`${result.providerName} [${result.type}] ${result.status} ${result.latency.totalMs}ms`));
    for (const item of result.items) console.log(`  - ${item.name}: ${item.status} ${item.message}`);
    if (result.error) console.log(`  ${chalk.gray("建议:")} ${result.error.suggestion}`);
    if (showRaw && result.rawSummary) {
      console.log(`  ${chalk.gray("原始响应摘要:")}`);
      console.log(JSON.stringify(redactObject(result.rawSummary), null, 2));
    }
  }
}

function render(results: CheckResult[], format: string): string {
  if (format === "json") return JSON.stringify(redactObject(results), null, 2);
  if (format === "csv") return exportCsv(results);
  if (format === "markdown") return exportMarkdown(results);
  if (format === "html") return exportHtml(results);
  throw new Error(`Unsupported format: ${format}`);
}

function writeIfMissing(path: string, content: string, force = false): void {
  if (!force && fs.existsSync(path)) return;
  fs.writeFileSync(path, content);
}

function resolveDbPath(path?: string): string {
  return path ?? process.env.LLM_PING_DB ?? "llm-ping.db";
}
