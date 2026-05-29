# llm-ping

`llm-ping` is an open-source LLM API health diagnostics platform. It helps teams verify connectivity, authentication, model availability, protocol compatibility, latency, usage metadata, streaming capability, and operational stability across many LLM providers.

Think of it as `ping` for LLM APIs, with the workflows of Postman, Uptime Kuma, and AI infrastructure monitoring in one local-first toolkit.

## Capabilities

- Multi-provider adapter architecture for OpenAI, OpenAI Compatible gateways, Anthropic Claude, Google Gemini, Azure OpenAI, Vertex AI Gemini, Ollama, LM Studio, LocalAI, and custom providers.
- CLI commands for `check`, `providers`, `init`, `monitor`, `export`, and `doctor`.
- A local Fastify API service bound to `127.0.0.1`.
- A Web UI built with React, TypeScript, Vite, and Tailwind.
- A Tauri desktop shell for Windows, macOS, and Linux.
- SQLite storage for provider configuration and redacted check history.
- Export support for JSON, CSV, Markdown, and HTML reports.
- Unified error classification with repair suggestions.
- Redaction for API keys, tokens, authorization headers, and other sensitive headers.

## Install

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

Pure JSON output is safe for automation:

```bash
pnpm --filter @llm-ping/cli dev check --output json
```

By default, CLI commands read providers from the local SQLite database `llm-ping.db`. You can change the database path with `--db <path>` or `LLM_PING_DB`.

## Local API Server

```bash
pnpm --filter @llm-ping/server dev
```

Endpoints include:

- `GET /health`
- `GET /providers`
- `POST /providers`
- `DELETE /providers/:id`
- `POST /checks/:id`
- `POST /checks`
- `GET /history`
- `GET /export?format=json|csv|markdown|html`

## Web UI

```bash
pnpm --filter @llm-ping/server dev
pnpm --filter @llm-ping/web dev
```

Open `http://127.0.0.1:5173`.

The UI includes Dashboard, Provider management, batch checks, Monitor, History, Export, and Settings screens.

Typical workflow:

- Open `Providers`.
- Add a Provider with type, Base URL, API key or access token, model name, timeout, retry count, headers, and streaming options.
- Click the test button in the Provider list to run a single check.
- Open `Batch` to check all enabled Providers.
- Open `History` to inspect previous results.
- Open `Export` to download JSON, CSV, Markdown, or HTML reports.

Provider configuration and check history are stored in `llm-ping.db` by default. The Web UI, local API server, and CLI share the same database.

## Docker

```bash
docker compose up --build
```

The API is exposed only on localhost: `127.0.0.1:4545`.

## Provider Adapter Development

Adapters live in `packages/core/src/adapters`. Each adapter owns:

- Request construction
- Authentication headers
- Model list checks
- Minimal generation checks
- Usage parsing
- Provider-specific response parsing
- Error hints

Register new adapters in `packages/core/src/adapters/registry.ts`.

## Security

`llm-ping` redacts API keys, access tokens, authorization headers, and custom secret headers before storing or exporting results. Debug output must never include full secrets.

## Development

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Tests use mocks and must not require real API keys.

## License

MIT
