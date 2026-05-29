# Running, Building, and Packaging

This guide explains how to run `llm-ping` locally, build the workspace, and package the Tauri desktop application.

## Prerequisites

- Node.js 22 or later is recommended.
- pnpm is managed through Corepack.
- Rust and the Tauri platform prerequisites are required for desktop packaging.
- On Windows, install the Microsoft C++ Build Tools and WebView2 runtime if they are not already available.

Install dependencies from the repository root:

```bash
corepack enable
pnpm install
```

## Run The Local API Server

The Web UI and Tauri desktop app call the local Fastify API. Start it first:

```bash
pnpm --filter @llm-ping/server dev
```

The API listens on:

```text
http://127.0.0.1:4545
```

Provider configuration and check history are stored in `llm-ping.db` by default. Set `LLM_PING_DB` to use a different database file:

```bash
LLM_PING_DB=./data/llm-ping.db pnpm --filter @llm-ping/server dev
```

## Run The Web App

In a second terminal, start the Web UI:

```bash
pnpm --filter @llm-ping/web dev
```

Open:

```text
http://127.0.0.1:5173
```

The Web UI uses the same React code that is packaged into the Tauri desktop app.

## Use The Web App

1. Open `Providers`.
2. Fill in the Provider configuration:
   `type`, `baseUrl`, `apiKey` or `accessToken`, `model`, `deployment`, `apiVersion`, `timeoutMs`, `retries`, `headers`, and optional streaming settings.
3. Click `保存配置` / `Save` to write the Provider into the local SQLite database.
4. Click the play button in the Provider list to test one Provider.
5. Open `Batch` to test all enabled Providers.
6. Open `History` to inspect previous checks.
7. Open `Export` to download reports.

The sample YAML file has been removed. The normal product path is database-backed configuration through the GUI or CLI.

## Run The CLI

List supported providers:

```bash
pnpm --filter @llm-ping/cli dev providers
```

Initialize the local SQLite database with sample providers:

```bash
pnpm --filter @llm-ping/cli dev init
```

Run checks for enabled providers stored in the database:

```bash
pnpm --filter @llm-ping/cli dev check --output pretty
```

Run an ad-hoc check without saving a Provider:

```bash
pnpm --filter @llm-ping/cli dev check --type openai --base-url https://api.openai.com --api-key $OPENAI_API_KEY --model gpt-4o-mini
```

Run monitor mode:

```bash
pnpm --filter @llm-ping/cli dev monitor --interval 60
```

## Run The Tauri Desktop App

Start the local API server first:

```bash
pnpm --filter @llm-ping/server dev
```

Then, in another terminal, start Tauri:

```bash
pnpm --filter @llm-ping/desktop-tauri dev
```

Tauri will start the Web UI through its `beforeDevCommand` and load it from:

```text
http://127.0.0.1:5173
```

## Build Everything

Build all workspace packages:

```bash
pnpm build
```

You can also build individual packages:

```bash
pnpm --filter @llm-ping/shared build
pnpm --filter @llm-ping/core build
pnpm --filter @llm-ping/server build
pnpm --filter @llm-ping/cli build
pnpm --filter @llm-ping/web build
```

## Package The Desktop App

Build the Tauri desktop application:

```bash
pnpm --filter @llm-ping/desktop-tauri build
```

The Tauri config runs the Web build first:

```text
pnpm --filter @llm-ping/web build
```

Generated installers and bundles are written under:

```text
apps/src-tauri/target/release/bundle
```

The exact output files depend on the operating system and installed Tauri toolchain.

## Validate Before Release

Run these checks before packaging or publishing:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

## Notes

- The current desktop app reuses the Web UI, but it does not yet manage the local API server lifecycle by itself.
- For now, start `@llm-ping/server` manually before using the Web UI or desktop app.
- Provider configuration is stored in the local SQLite database, `llm-ping.db` by default.
- The GUI and CLI use the same database-backed Provider list.
