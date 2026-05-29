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

## Run The CLI

List supported providers:

```bash
pnpm --filter @llm-ping/cli dev providers
```

Run a check with the sample configuration:

```bash
pnpm --filter @llm-ping/cli dev check --config llm-ping.config.sample.yaml --output pretty
```

Run monitor mode:

```bash
pnpm --filter @llm-ping/cli dev monitor --config llm-ping.config.sample.yaml --interval 60
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
apps/desktop-tauri/src-tauri/target/release/bundle
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
- Provider configuration can be created from the GUI. `llm-ping.config.sample.yaml` is only a CLI/developer sample.
