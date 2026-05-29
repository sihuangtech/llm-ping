# 运行、构建与打包

这份文档说明如何在本地运行 `llm-ping`、构建工作区，以及打包 Tauri 桌面应用。

## 环境准备

- 推荐使用 Node.js 22 或更高版本。
- pnpm 通过 Corepack 管理。
- 如果要打包桌面端，需要安装 Rust 和 Tauri 对应平台的依赖。
- Windows 环境下，如果系统没有 Microsoft C++ Build Tools 和 WebView2 runtime，需要先安装。

在仓库根目录安装依赖：

```bash
corepack enable
pnpm install
```

## 运行本地 API 服务

Web 界面和 Tauri 桌面端都会调用本地 Fastify API，所以要先启动服务：

```bash
pnpm --filter @llm-ping/server dev
```

API 监听地址：

```text
http://127.0.0.1:4545
```

## 运行 Web 应用

打开第二个终端，启动 Web UI：

```bash
pnpm --filter @llm-ping/web dev
```

浏览器打开：

```text
http://127.0.0.1:5173
```

Web UI 和 Tauri 桌面端复用同一套 React 前端代码。

## 运行 CLI

查看支持的 Provider：

```bash
pnpm --filter @llm-ping/cli dev providers
```

使用示例配置执行检测：

```bash
pnpm --filter @llm-ping/cli dev check --config llm-ping.config.sample.yaml --output pretty
```

运行持续监控模式：

```bash
pnpm --filter @llm-ping/cli dev monitor --config llm-ping.config.sample.yaml --interval 60
```

## 运行 Tauri 桌面端

先启动本地 API 服务：

```bash
pnpm --filter @llm-ping/server dev
```

然后打开另一个终端，启动 Tauri：

```bash
pnpm --filter @llm-ping/desktop-tauri dev
```

Tauri 会通过 `beforeDevCommand` 自动启动 Web UI，并从下面的地址加载页面：

```text
http://127.0.0.1:5173
```

## 构建全部项目

构建整个 workspace：

```bash
pnpm build
```

也可以单独构建某个包：

```bash
pnpm --filter @llm-ping/shared build
pnpm --filter @llm-ping/core build
pnpm --filter @llm-ping/server build
pnpm --filter @llm-ping/cli build
pnpm --filter @llm-ping/web build
```

## 打包桌面应用

构建 Tauri 桌面应用：

```bash
pnpm --filter @llm-ping/desktop-tauri build
```

Tauri 配置会先执行 Web 构建：

```text
pnpm --filter @llm-ping/web build
```

生成的安装包和 bundle 通常位于：

```text
apps/desktop-tauri/src-tauri/target/release/bundle
```

具体输出文件会根据操作系统和本机 Tauri 工具链有所不同。

## 发布前检查

打包或发布前建议运行：

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

## 注意事项

- 当前桌面端复用 Web UI，但还没有自动管理本地 API 服务生命周期。
- 现阶段使用 Web UI 或桌面端前，需要手动启动 `@llm-ping/server`。
- 用户可以在图形界面里新增 Provider 和模型配置，`llm-ping.config.sample.yaml` 只是 CLI/开发者示例。
