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
  validateProvider,
} from "@llm-ping/core";
import type { CheckResult } from "@llm-ping/shared";
import { redactObject } from "@llm-ping/shared";
import chalk from "chalk";
import { Command } from "commander";
import "dotenv/config";
import YAML from "yaml";

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
  .description("生成配置文件、.env.example 和监控示例")
  .option("-f, --force", "覆盖已有文件")
  .action((options) => {
    writeIfMissing("llm-ping.config.yaml", YAML.stringify(createExampleConfig()), options.force);
    writeIfMissing(".env.example", "OPENAI_API_KEY=sk-your-key\nANTHROPIC_API_KEY=sk-ant-your-key\n", options.force);
    writeIfMissing(
      "examples/monitor.yaml",
      YAML.stringify({ intervalSec: 60, concurrency: 4, providers: ["openai-main", "ollama-local"] }),
      options.force,
    );
    console.log(chalk.green("llm-ping 初始化完成。"));
  });

program
  .command("check")
  .description("执行单 Provider 或配置文件批量检测")
  .option("-c, --config <path>", "配置文件路径")
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
  .action(async (options) => {
    const providers = options.config
      ? loadProjectConfig(options.config).providers.filter((provider) => provider.enabled)
      : [
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
        ];
    const results = await Promise.all(providers.map((provider) => checkProvider(provider)));
    printResults(results, options.output);
  });

program
  .command("monitor")
  .description("持续监控配置文件中的 Provider")
  .requiredOption("-c, --config <path>", "配置文件路径")
  .option("-i, --interval <sec>", "检测周期秒数", "60")
  .action(async (options) => {
    const config = loadProjectConfig(options.config);
    console.log(chalk.cyan("进入 monitor 模式，按 Ctrl+C 退出。"));
    for (;;) {
      const results = await Promise.all(config.providers.filter((p) => p.enabled).map((p) => checkProvider(p)));
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
  .description("检查配置常见问题")
  .requiredOption("-c, --config <path>", "配置文件路径")
  .action((options) => {
    const config = loadProjectConfig(options.config);
    for (const provider of config.providers) {
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

function printResults(results: CheckResult[], format: string): void {
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
