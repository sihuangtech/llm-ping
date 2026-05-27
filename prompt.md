我要开发一个完整的开源项目，项目名叫 `llm-ping`。

这是一个用于测试大模型 API 连通性、可用性、鉴权状态、模型可调用性、延迟、稳定性和健康状态的专业级平台。

项目核心理念：

像 ping 服务器一样 ping 大模型 API。

它不是一个简单脚本，也不是单纯 CLI 工具，而是一个完整的：

* CLI 工具
* Web 图形界面
* Tauri 桌面应用
* 本地 API 服务
* LLM API 健康诊断平台
* LLM API 状态监控平台

最终目标：

把 `llm-ping` 做成：

* Postman for LLM APIs
* Uptime Kuma for LLM APIs
* Pingdom for LLM APIs
* AI Infra 运维工具
* 多协议 LLM API 健康检测平台

请直接在当前仓库中实现完整项目。

不要只写 README。
不要只写示例代码。
不要只写伪代码。
不要只做 demo。
不要留下大量 TODO。
我要的是一个真正可以安装、运行、测试、打包、发布的完整生产级项目。

---

# 一、项目定位

`llm-ping` 是一个支持多 Provider、多协议、多模型服务商的大模型 API 健康诊断平台。

它需要同时支持：

* OpenAI 原生 API
* OpenAI Compatible API
* Anthropic Claude 原生 API
* Google Gemini 原生 API
* Azure OpenAI
* Google Vertex AI Gemini
* Ollama
* LM Studio
* LocalAI
* OpenRouter
* One API
* New API
* Sub2API
* vLLM
* 企业内部 AI 网关
* 自定义 Provider

项目目标用户包括：

* AI 开发者
* AI 应用开发团队
* AI 中转站运营者
* API 服务运维人员
* AI 培训用户
* 本地模型用户
* 多模型服务管理者

它需要解决：

* API 是否在线
* API Key 是否有效
* Base URL 是否正确
* 模型是否存在
* 模型是否真正可调用
* Deployment 是否有效
* Provider 协议是否兼容
* 响应格式是否正常
* Streaming 是否正常
* usage 是否正常
* 延迟是否过高
* 是否被限流
* 是否网络异常
* 是否服务商异常
* 是否配置错误
* 如果失败应该如何修复

最终效果应该像专业 AI Infra 工具，而不是玩具项目。

---

# 二、项目核心能力

项目需要具备以下核心能力：

* 单 Provider 检测
* 多 Provider 批量检测
* 持续监控
* 图形化管理
* Provider 管理
* 历史记录
* 报告导出
* 延迟统计
* Streaming 测试
* Provider 协议适配
* 错误分类
* 修复建议
* CLI 支持
* Web GUI
* Tauri 桌面端
* 本地 API 服务
* Docker 支持
* CI/CD 集成
* Provider 扩展能力
* 安全脱敏
* 监控面板
* 实时状态面板
* 本地模型服务检测
* 云端模型服务检测

---

# 三、Provider 支持要求

项目必须采用多 Provider Adapter 架构。

不同 Provider 的协议不能混在一起。

核心逻辑负责调度。

每个 Provider Adapter 负责：

* 请求构造
* 鉴权方式
* 模型列表检测
* 生成测试
* Streaming 测试
* 响应解析
* usage 解析
* 错误解析
* Provider 特有逻辑
* Provider 特有建议

架构必须支持后续快速新增 Provider。

---

# 四、必须支持的 Provider

## 1. OpenAI

支持：

* Models API
* Chat Completions
* Responses API
* Streaming
* usage
* model 检测
* latency 统计

---

## 2. OpenAI Compatible

支持：

* One API
* New API
* Sub2API
* OpenRouter
* vLLM
* LocalAI
* LM Studio
* 企业内部兼容网关
* 自定义 OpenAI Compatible 服务

要求：

* 支持不同路径风格
* 支持 skip model list
* 支持 strict / loose model check
* 支持部分接口缺失
* 支持自定义 headers
* 支持不同响应风格兼容

---

## 3. Anthropic Claude 原生 API

支持：

* Models API
* Messages API
* Streaming
* usage
* Anthropic Version
* stop reason
* content block 解析

---

## 4. Google Gemini 原生 API

支持：

* Models API
* generateContent
* Streaming
* usageMetadata
* candidates
* parts
* safety block 检测
* 地区限制检测

支持：

* header API Key
* query API Key

---

## 5. Azure OpenAI

支持：

* deployment 模式
* apiVersion
* Azure Endpoint
* Chat Completions
* Responses API
* Streaming
* Azure 特有错误解析

---

## 6. Google Vertex AI Gemini

支持：

* Project ID
* Location
* Access Token
* Gemini model
* Vertex Endpoint
* IAM 权限错误解析

---

## 7. Ollama

支持：

* 本地 Ollama 服务
* model list
* generate
* chat
* Streaming
* 本地模型检测

需要识别：

* 服务未启动
* 模型未下载
* 端口异常

---

## 8. LM Studio

支持：

* 本地服务检测
* OpenAI Compatible 接口
* 模型调用检测

---

## 9. LocalAI

支持：

* 本地服务检测
* 模型检测
* OpenAI Compatible 检测

---

## 10. 自定义 Provider

允许用户定义：

* Provider 类型
* Base URL
* API Key
* headers
* model
* deployment
* apiVersion
* timeout
* retries
* custom prompt
* strict mode
* streaming mode

---

# 五、检测能力要求

每次检测尽可能包含：

* Base URL 校验
* DNS 检测
* TCP 检测
* TLS / HTTPS 检测
* 鉴权检测
* 模型列表检测
* 模型存在性检测
* 最小生成测试
* Streaming 测试
* 首 Token 延迟
* 总耗时
* usage 检测
* 限流检测
* Provider 协议校验
* 响应结构校验
* 空响应检测
* 错误分类
* 修复建议

不同 Provider 能力不同。

检测项需要支持：

* success
* failed
* warning
* skipped
* unsupported

不能因为某个 Provider 不支持某个能力就直接失败。

---

# 六、CLI 功能要求

CLI 必须完整专业。

至少支持：

## check

用于：

* 单 Provider 检测
* 配置文件批量检测

支持：

* provider type
* baseUrl
* apiKey
* model
* deployment
* apiVersion
* timeout
* retries
* concurrency
* custom headers
* strict mode
* streaming test
* output format

---

## providers

列出所有内置 Provider。

显示：

* Provider ID
* 名称
* 支持状态
* 是否支持 Streaming
* 是否支持 Models API
* 是否需要 API Key
* 是否需要 deployment
* 是否支持 usage

---

## init

生成：

* 配置文件
* .env.example
* Provider 示例
* monitor 示例

---

## monitor

持续监控模式。

支持：

* 周期检测
* uptime
* 平均延迟
* P95 延迟
* 成功率
* 失败率
* 连续失败统计
* 实时刷新
* 多 Provider 同时监控

---

## export

支持导出：

* JSON
* CSV
* Markdown
* HTML

---

## doctor

检查：

* 配置错误
* 环境变量缺失
* Base URL 错误
* Provider 类型错误
* API Key 缺失
* deployment 缺失
* apiVersion 缺失
* 本地服务未启动

---

# 七、图形界面要求

项目必须包含完整 GUI。

不是可选功能。

---

# 八、GUI 技术栈

使用：

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* TanStack Query
* TanStack Table
* React Hook Form
* Zod
* Recharts
* lucide-react

桌面端使用：

* Tauri
* Rust

---

# 九、GUI 页面要求

至少实现：

## Dashboard

显示：

* Provider 总数
* 正常数量
* 异常数量
* 平均延迟
* uptime
* 成功率
* 最近错误
* 最近检测时间
* 延迟趋势图
* 状态卡片

---

## Provider 管理页面

支持：

* 新增 Provider
* 编辑 Provider
* 删除 Provider
* 启用 / 禁用
* 搜索
* 筛选
* 批量检测
* 一键测试

---

## Provider 配置页面

根据不同 Provider 动态显示字段。

需要：

* 表单校验
* API Key 脱敏
* 环境变量支持
* 自定义 headers
* timeout
* retries
* strict mode
* streaming mode

---

## 检测详情页面

显示：

* 检测状态
* 各检测项
* latency breakdown
* usage
* 错误详情
* 修复建议
* 原始响应摘要

---

## 批量检测页面

支持：

* 多 Provider 同时检测
* 并发设置
* timeout 设置
* 实时进度
* 结果表格
* 导出结果

---

## Monitor 页面

显示：

* uptime
* 平均延迟
* P95
* 成功率
* 失败率
* 延迟趋势
* 错误趋势
* 连续失败统计

---

## 历史记录页面

支持：

* 时间筛选
* Provider 筛选
* 状态筛选
* 历史详情
* 导出
* 延迟趋势

---

## 报告导出页面

支持：

* JSON
* CSV
* Markdown
* HTML

HTML 报告需要可视化、美观。

---

## 设置页面

支持：

* 默认 timeout
* retries
* concurrency
* monitor interval
* dark mode
* 数据存储路径
* 日志等级
* 本地 API 服务开关

---

# 十、本地 API 服务

需要实现本地 API 服务。

推荐：

* Fastify
* Zod validation

API 服务负责：

* Provider CRUD
* 检测任务
* monitor
* 历史记录
* 导出
* 设置管理

只监听 localhost。

---

# 十一、Tauri 桌面端要求

需要支持：

* Windows
* macOS
* Linux

功能包括：

* 系统托盘
* 后台运行
* 开机启动
* 系统通知
* 本地服务生命周期管理
* 本地文件系统访问

---

# 十二、本地数据存储

需要保存：

* Provider 配置
* 检测历史
* monitor 数据
* 用户设置

推荐：

* SQLite
* better-sqlite3
* drizzle ORM

敏感信息必须脱敏。

---

# 十三、输出要求

支持：

* 彩色终端输出
* 表格输出
* JSON 输出
* CSV 输出
* Markdown 输出
* HTML 报告

JSON 输出必须纯净。

不能混入动画和终端颜色。

---

# 十四、错误分类要求

需要统一错误系统。

至少识别：

* 配置错误
* 环境变量缺失
* DNS 失败
* TCP 失败
* TLS 错误
* timeout
* 401
* 403
* 404
* 429
* 5xx
* API Key 无效
* deployment 不存在
* model 不存在
* usage 缺失
* streaming 错误
* 本地服务未启动
* 模型未下载
* 地区限制
* billing 未开启
* 限流
* Provider 协议不兼容

每个错误需要：

* 用户友好解释
* 修复建议
* 是否可重试

---

# 十五、延迟统计要求

统计：

* DNS latency
* TCP latency
* TLS latency
* model list latency
* completion latency
* first token latency
* streaming total latency
* total latency
* average latency
* P95 latency
* success rate
* uptime

---

# 十六、安全要求

必须：

* API Key 脱敏
* Access Token 脱敏
* 自定义 headers 脱敏
* 日志脱敏
* JSON 输出脱敏
* debug 模式也不能泄露完整密钥

---

# 十七、技术栈要求

## Monorepo

使用：

* pnpm workspace

推荐结构：

* packages/core
* packages/cli
* packages/server
* packages/web
* apps/desktop-tauri
* packages/shared

---

## 核心技术

使用：

* TypeScript
* Node.js
* React
* Tauri
* Rust
* Fastify
* SQLite
* drizzle ORM

---

## CLI

使用：

* commander

---

## HTTP

使用：

* undici

---

## 配置与校验

使用：

* zod
* yaml
* dotenv

---

## UI

使用：

* Tailwind CSS
* shadcn/ui
* TanStack Query
* TanStack Table
* Recharts
* lucide-react

---

## 日志

使用：

* pino

---

## 测试

使用：

* vitest
* HTTP mock

---

## 工程化

必须包含：

* ESLint
* Prettier
* strict mode
* GitHub Actions CI
* Dockerfile
* docker-compose
* changelog
* semantic release
* npm publish support

---

# 十八、测试要求

必须覆盖：

* 配置校验
* Provider Registry
* 各 Provider 响应解析
* API Key 脱敏
* 错误分类
* JSON 输出
* CSV 导出
* HTML 报告
* monitor 统计
* GUI 状态管理
* Tauri 生命周期
* 本地 API 服务
* Provider Adapter

测试不能依赖真实 API Key。

---

# 十九、README 要求

生成专业英文 README。

README 需要包含：

* 项目介绍
* 核心能力
* 支持的 Provider
* 安装方式
* CLI 使用
* GUI 使用
* monitor 使用
* Docker 使用
* CI/CD 使用
* Provider Adapter 扩展方式
* 错误排查
* 安全说明
* 开发指南
* 贡献指南

README 风格必须像成熟 AI Infra 开源项目。

---

# 二十、最终质量要求

必须：

* 不写伪代码
* 不做 demo
* 不把逻辑塞进单文件
* 不留下空实现
* 不忽略 Provider 协议差异
* 不暴露敏感信息
* 不依赖真实 API Key 测试
* 所有核心功能必须真实可运行
* 所有主要模块必须有类型
* 所有配置必须严格校验
* 所有错误必须友好
* 所有输出必须规范

最终目标：

把 `llm-ping` 做成真正专业、完整、现代化的多协议 LLM API 健康检测与监控平台。
