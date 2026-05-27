# llm-ping

`llm-ping` is an open-source LLM API health diagnostics platform. It helps teams test connectivity, authentication, model availability, protocol compatibility, latency, usage metadata, streaming capability and operational stability across many LLM providers.

Think of it as `ping` for LLM APIs, with the workflows of Postman, Uptime Kuma and AI infrastructure monitoring in one local-first toolkit.

## Capabilities

- Multi-provider Adapter architecture for OpenAI, OpenAI Compatible gateways, Anthropic Claude, Google Gemini, Azure OpenAI, Vertex AI Gemini, Ollama, LM Studio, LocalAI and custom providers.
- CLI commands for `check`, `providers`, `init`, `monitor`, `export` and `doctor`.
- Local Fastify API service bound to `127.0.0.1`.
- React, TypeScript, Vite and Tailwind Web UI.
- Tauri desktop shell for Windows, macOS and Linux.
- SQLite storage for provider configuration and redacted check history.
- JSON, CSV, Markdown and HTML report export.
- Unified error classification with repair suggestions.
- API key, token and sensitive header redaction.

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
pnpm --filter @llm-ping/cli dev check --config examples/llm-ping.config.yaml --output pretty
pnpm --filter @llm-ping/cli dev monitor --config examples/llm-ping.config.yaml --interval 60
```

Pure JSON output is safe for automation:

```bash
pnpm --filter @llm-ping/cli dev check --config examples/llm-ping.config.yaml --output json
```

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

## Web GUI

```bash
pnpm --filter @llm-ping/server dev
pnpm --filter @llm-ping/web dev
```

Open `http://127.0.0.1:5173`.

The UI includes Dashboard, Provider management, batch checks, Monitor, History, Export and Settings screens.

## Docker

```bash
docker compose up --build
```

The API is exposed only on localhost: `127.0.0.1:4545`.

## Provider Adapter Development

Adapters live in `packages/core/src/adapters`. Each Adapter owns:

- Request construction
- Authentication headers
- Model list checks
- Minimal generation checks
- Usage parsing
- Provider-specific response parsing
- Error hints

Register new adapters in `packages/core/src/adapters/registry.ts`.

## Security

`llm-ping` redacts API keys, access tokens, authorization headers and custom secret headers before storing or exporting results. Debug output must never include full secrets.

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
