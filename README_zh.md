# llm-ping

`llm-ping` 是一个开源的 LLM API 健康诊断平台。它帮助团队测试多个大模型服务商的连通性、鉴权、模型可用性、协议兼容性、延迟、usage 元数据、流式能力以及整体运行稳定性。

你可以把它理解成面向 LLM API 的 `ping`，并把 Postman、Uptime Kuma 和 AI 基础设施监控的工作流放进了一个本地优先的工具里。

## 功能

- 面向 OpenAI、OpenAI Compatible 网关、Anthropic Claude、Google Gemini、Azure OpenAI、Vertex AI Gemini、Ollama、LM Studio、LocalAI 和自定义 Provider 的多 Provider Adapter 架构。
- 提供 `check`、`providers`、`init`、`monitor`、`export` 和 `doctor` 等 CLI 命令。
- 绑定到 `127.0.0.1` 的本地 Fastify API 服务。
- 基于 React、TypeScript、Vite 和 Tailwind 的 Web UI。
- 面向 Windows、macOS 和 Linux 的 Tauri 桌面壳。
- 使用 SQLite 保存 Provider 配置和脱敏后的检测历史。
- 支持导出 JSON、CSV、Markdown 和 HTML 报告。
- 统一的错误分类和修复建议。
- 对 API key、token 和敏感 header 做脱敏处理。

## 安装

```bash
corepack enable
pnpm install
pnpm build
```

## CLI

```bash
pnpm --filter @llm-ping/cli dev init
pnpm --filter @llm-ping/cli dev providers
pnpm --filter @llm-ping/cli dev check --output pretty
pnpm --filter @llm-ping/cli dev monitor --interval 60
```

纯 JSON 输出适合自动化场景：

```bash
pnpm --filter @llm-ping/cli dev check --output json
```

默认情况下，CLI 会从本地 SQLite 数据库 `llm-ping.db` 读取 Provider。可以通过 `--db <path>` 或 `LLM_PING_DB` 修改数据库路径。

## 本地 API 服务

```bash
pnpm --filter @llm-ping/server dev
```

可用端点包括：

- `GET /health`
- `GET /providers`
- `POST /providers`
- `DELETE /providers/:id`
- `POST /checks/:id`
- `POST /checks`
- `GET /history`
- `GET /export?format=json|csv|markdown|html`

## Web 界面

```bash
pnpm --filter @llm-ping/server dev
pnpm --filter @llm-ping/web dev
```

打开 `http://127.0.0.1:5173`。

界面包含 Dashboard、Provider 管理、批量检测、Monitor、History、Export 和 Settings 页面。

典型使用流程：

- 打开 `Providers`。
- 填写 Provider 类型、Base URL、API key 或 access token、模型名称、timeout、retries、headers 和 streaming 选项。
- 在 Provider 列表里点击测试按钮，执行单个 Provider 检测。
- 打开 `Batch`，批量检测所有启用的 Provider。
- 打开 `History`，查看历史检测结果。
- 打开 `Export`，导出 JSON、CSV、Markdown 或 HTML 报告。

Provider 配置和检测历史默认保存在 `llm-ping.db`。Web UI、本地 API 服务和 CLI 共用同一个数据库。

## Docker

```bash
docker compose up --build
```

API 只暴露在本机地址：`127.0.0.1:4545`。

## Provider Adapter 开发

Adapter 位于 `packages/core/src/adapters`。每个 Adapter 负责：

- 请求构造
- 鉴权 header
- 模型列表检测
- 最小生成测试
- usage 解析
- Provider 特定响应解析
- 错误提示

新增 Adapter 时，把它注册到 `packages/core/src/adapters/registry.ts`。

## 安全

`llm-ping` 在保存或导出结果前会对 API key、access token、authorization header 和自定义敏感 header 做脱敏处理。调试输出绝不能包含完整密钥。

## 开发

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

测试使用 mock，不应依赖真实 API key。

## 许可证

MIT
