# template-base Employee Template / 员工母体模板

This repository is a single persistent employee template.

本仓库是一个“单个持久化员工”的母体模板。

It is designed for a workspace where a Codex PM clones multiple employee
repositories and communicates with each employee through project-local JSON
files. This repository does not implement the PM scheduler.

它面向这样的工作模式：Codex PM 在一个 PM 工作区中 clone 多个员工 repo，
并通过每个员工 repo 内的项目级 JSON 文件与员工通信。本仓库不实现 PM 调度器。

## 1. What This Repo Provides / 本仓库提供什么

This repo provides the employee-side foundation:

本仓库提供员工端基础能力：

- Claude Code first project structure.
- Claude Code 优先的项目结构。
- Codex-compatible entry files.
- Codex 兼容入口文件。
- DeepSeek and MiniMax model profiles.
- DeepSeek 和 MiniMax 模型 profile。
- PM-facing JSON bridge: `agent.json`, `inbox/`, `outbox/`, `state/`, `logs/`.
- 面向 PM 的 JSON bridge：`agent.json`、`inbox/`、`outbox/`、`state/`、`logs/`。
- Project-local skills, command templates, MCP declarations, and permissions.
- 项目内 skills、命令模板、MCP 声明和权限配置。
- Cross-platform Node scripts for setup, validation, sync, and Claude launch.
- 跨平台 Node 脚本，用于部署、校验、同步和启动 Claude。

This repo intentionally does not include:

本仓库刻意不包含：

- PM workspace.
- PM 工作区。
- Multi-employee scheduling.
- 多员工调度器。
- Background watcher or daemon.
- 后台 watcher 或 daemon。
- Direct provider API calls.
- 直接调用模型 provider API 的逻辑。

## 2. Prerequisites / 环境要求

Install these on the machine that runs the employee:

在运行员工的机器上安装：

- Git.
- Git。
- Node.js 18 or newer.
- Node.js 18 或更高版本。
- Claude Code CLI.
- Claude Code CLI。
- At least one provider API key, such as DeepSeek or MiniMax.
- 至少一个模型供应商 API key，例如 DeepSeek 或 MiniMax。
- Optional Firecrawl API key for model-independent web search.
- 可选 Firecrawl API key，用于模型无关的网页搜索能力。

Check the local tools:

检查本地工具：

```bash
git --version
node --version
claude --version
```

## 3. Deployment / 部署步骤

Clone the repository:

克隆仓库：

```bash
git clone https://github.com/AllenChang0124/cyber_employee.git
cd cyber_employee
```

Create the local environment file:

创建本地环境文件：

```bash
cp .env.example .env
```

Fill only the keys you need:

只填写你需要使用的 key：

```text
DEEPSEEK_API_KEY=
MINIMAX_API_KEY=
OPENAI_API_KEY=
FIRECRAWL_API_KEY=
```

Do not commit `.env`.

不要提交 `.env`。

Initialize generated adapters and runtime files:

初始化生成文件和运行时文件：

```bash
npm run sync
```

This refreshes project adapters and creates `state/status.json` if it is
missing. `state/status.json` is runtime state and is not committed. The committed
template is `state/status.example.json`.

该命令会刷新项目适配文件，并在缺失时创建 `state/status.json`。
`state/status.json` 是运行时状态文件，不提交。被提交的模板是
`state/status.example.json`。

The generated `.mcp.json` declares project-local MCP servers. Firecrawl uses
`FIRECRAWL_API_KEY` from `.env` or the process environment and does not write to
global Claude or Codex configuration.

生成的 `.mcp.json` 声明项目级 MCP server。Firecrawl 从 `.env` 或进程环境读取
`FIRECRAWL_API_KEY`，不会写入全局 Claude 或 Codex 配置。

`npm run claude` loads the configured project MCP servers by default. This is
the standard employee startup path used by both interactive sessions and PM
auto-run dispatch.

`npm run claude` 默认加载项目 MCP server。这是交互会话和 PM `auto-run` 派发共同使用
的标准员工启动路径。

Run health checks:

运行健康检查：

```bash
npm run doctor
npm run validate
```

Expected result:

预期结果：

- `doctor` passes. Missing unused API keys should only produce warnings.
- `doctor` 通过。未使用的 API key 缺失只应产生 warning。
- `validate` passes.
- `validate` 通过。

## 4. Model Launch / 模型启动

Model profiles are defined in `config/models.yaml`.

模型 profile 定义在 `config/models.yaml`。

Dry-run a profile before launching Claude Code:

真正启动 Claude Code 前，先用 dry-run 检查 profile：

```bash
npm run claude -- --profile junior-deepseek --dry-run
npm run claude -- --profile senior-deepseek --dry-run
npm run claude -- --profile junior-minimax-cn --dry-run
```

Expected dry-run output includes:

dry-run 预期输出应包含：

```text
Provider base URL: ...
Claude Code model: ...
Command: claude "--model" "..."
```

By default, the dry-run command should not include an empty strict MCP config.
Project MCP servers are loaded through this repository's `.mcp.json`.

默认情况下，dry-run 输出的命令不应包含空的 strict MCP 配置。项目 MCP server 通过本
repo 的 `.mcp.json` 加载。

```text
MCP startup: project MCP loading enabled by default.
```

Launch Claude Code:

启动 Claude Code：

```bash
npm run claude -- --profile junior-deepseek
```

Launch Claude Code for a specific task:

为指定任务启动 Claude Code：

```bash
npm run claude -- --profile junior-deepseek --task task-0001
```

Run a trusted employee task non-interactively and exit when finished:

以可信员工模式非交互执行单个任务，完成后自动退出：

```bash
npm run claude -- --profile junior-deepseek --task task-0001 --auto-run
```

`--auto-run` uses Claude Code `--print` with `--permission-mode bypassPermissions`.
Use it only for employee repositories you intentionally deployed and trust.

`--auto-run` 使用 Claude Code `--print` 和 `--permission-mode bypassPermissions`。
只应在你主动部署并信任的员工 repo 中使用。

Do not use `--resume` or `--continue` when validating profile switching.
Resumed sessions may keep the model recorded in the old transcript.

验收 profile 切换时不要使用 `--resume` 或 `--continue`。
恢复会话可能沿用旧 transcript 中记录的模型。

## 5. Permission Mode / 权限模式

The default project settings live in `.claude/settings.json`.

默认项目权限配置在 `.claude/settings.json`。

The template allows common project-local reads, writes to runtime/output
directories, and safe inspection commands. This should reduce repeated Claude
Code permission prompts while keeping a project-level safety boundary.

模板允许常见的项目内读取、运行时/输出目录写入，以及安全的检查命令。
这可以减少 Claude Code 反复请求权限，同时保留项目级安全边界。

For trusted disposable sandboxes only, you can explicitly bypass permission
checks:

仅在可信的一次性 sandbox 中，可以显式跳过权限检查：

```bash
npm run claude -- --profile junior-deepseek --skip-permissions
```

This passes `--dangerously-skip-permissions`. Do not use it when the employee
repository has broad filesystem or network access.

该选项会传入 `--dangerously-skip-permissions`。当员工 repo 拥有较宽的文件系统
或网络访问权限时，不建议使用。

In PM auto-dispatch, prefer `--auto-run` over interactive sessions. It avoids
repeated permission prompts and does not require manually closing Claude Code.

在 PM 自动调度中，优先使用 `--auto-run`，而不是交互式会话。它可以避免反复权限确认，
也不需要手动关闭 Claude Code。

## 6. Web Search Toolbox / 网页搜索工具箱

The template includes a model-independent Firecrawl MCP server for web search
and page extraction. Use it when a task requires current or external web
information, regardless of whether the active model is DeepSeek, MiniMax,
OpenAI, or another Claude Code compatible model.

模板内置模型无关的 Firecrawl MCP server，用于网页搜索和页面提取。当任务需要实时或
外部网页信息时，应使用它；这不依赖当前模型是 DeepSeek、MiniMax、OpenAI，还是其他
Claude Code 兼容模型。

Setup:

配置：

```bash
cp .env.example .env
# Fill FIRECRAWL_API_KEY in .env
npm run sync
npm run doctor
npm run validate
```

Claude Code should show a project-level `firecrawl` MCP server in `/mcp`.
The config location should point at this repository's `.mcp.json`, not at user
home configuration.

Claude Code 的 `/mcp` 应显示项目级 `firecrawl` MCP server。配置位置应指向本 repo
内的 `.mcp.json`，而不是用户 home 下的全局配置。

When using web search, record source URLs in the result JSON `notes` or
`artifacts`, and in the Markdown report.

使用网页搜索时，必须在结果 JSON 的 `notes` 或 `artifacts` 中记录来源 URL，并在
Markdown 报告中写明来源。

## 7. JSON Bridge / JSON 通信桥

Codex PM should treat this repository as one employee.

Codex PM 应将本仓库视为一个员工。

Machine-readable files:

机器可读文件：

- `agent.json`: employee identity, capabilities, paths, and default model profile.
- `agent.json`：员工身份、能力、路径和默认模型 profile。
- `inbox/tasks/*.json`: PM-assigned task packages.
- `inbox/tasks/*.json`：PM 派发的任务包。
- `outbox/results/*.json`: employee result packages.
- `outbox/results/*.json`：员工结果包。
- `state/status.json`: current runtime employee state.
- `state/status.json`：当前运行时员工状态。
- `state/status.example.json`: committed status template.
- `state/status.example.json`：已提交的状态模板。
- `logs/events.jsonl`: append-only runtime event log, written through `npm run event`.
- `logs/events.jsonl`：追加式运行事件日志，必须通过 `npm run event` 写入。

Markdown companions are human-readable reports or task notes. JSON remains the
authoritative machine protocol.

Markdown companion 是给人阅读的报告或任务说明。JSON 始终是权威机器协议。

Protocol schemas live in the sibling `cyber_protocol` package. `npm run validate` fails if the shared protocol package is missing; set `CYBER_PROTOCOL_DIR` only when the package is not available as a sibling or ancestor repo.

协议 schema 位于 sibling `cyber_protocol` 包。若共享协议包缺失，`npm run validate` 会失败；只有当协议包不在 sibling 或上级目录时，才需要设置 `CYBER_PROTOCOL_DIR`。

## 8. Task Test / 任务测试

Create a local test task from the committed example:

从已提交示例创建本地测试任务：

```bash
cp inbox/tasks/task-0001.example.json inbox/tasks/task-0001.json
npm run validate
```

Launch the employee:

启动员工：

```bash
npm run claude -- --profile junior-deepseek --task task-0001
```

Inside Claude Code, run:

在 Claude Code 内执行：

```text
/execute-task task-0001
```

Append task events through the helper:

通过脚本追加任务事件：

```bash
npm run event -- --type started --task-id task-0001 --message "started task task-0001"
```

Expected runtime outputs:

预期运行时输出：

```text
outbox/results/task-0001.json
outbox/results/task-0001.md
logs/events.jsonl
state/status.json
```

Validate after execution:

执行后校验：

```bash
npm run validate
```

The runtime files above are ignored by git and should not be committed.

以上运行时文件已被 git 忽略，不应提交。

## 9. Debugging / 调试说明

### 8.1 Basic health / 基础健康检查

Run:

运行：

```bash
npm run doctor
```

Use this when:

适用场景：

- Claude Code cannot launch.
- Claude Code 无法启动。
- Required files appear missing.
- 必需文件疑似缺失。
- API keys may not be configured.
- API key 可能未配置。

### 8.2 Protocol validation / 协议校验

Run:

运行：

```bash
npm run validate
```

This checks:

该命令检查：

- suspected plaintext secrets in committed project files.
- 提交文件中疑似明文密钥。
- hard-coded local home paths.
- 硬编码本地 home 路径。
- shared `cyber_protocol` schema for `agent.json`, task JSON, result JSON, and status JSON.
- 使用共享 `cyber_protocol` schema 校验 `agent.json`、任务 JSON、结果 JSON 和状态 JSON。
- companion Markdown report for every result JSON.
- 每个结果 JSON 是否有对应 Markdown 报告。
- `logs/events.jsonl` event shape.
- `logs/events.jsonl` 事件格式。

### 8.3 MCP config / MCP 配置

If Claude Code reports a project MCP parse error, run:

如果 Claude Code 报项目 MCP 解析错误，运行：

```bash
npm run sync
npm run validate
```

The expected empty MCP file is:

预期的空 MCP 文件是：

```json
{
  "mcpServers": {}
}
```

### 8.4 Model selection / 模型选择

If Claude Code starts with the wrong model:

如果 Claude Code 使用了错误模型：

```bash
npm run claude -- --profile junior-deepseek --dry-run
```

Confirm the output contains the intended `Provider base URL`, `Claude Code
model`, and `claude --model ...` command.

确认输出包含预期的 `Provider base URL`、`Claude Code model` 和
`claude --model ...` 命令。

Start a fresh session instead of resuming an old one.

请启动新会话，不要恢复旧会话。

### 8.5 Git hygiene / Git 卫生检查

Check local status:

检查本地状态：

```bash
git status --short --ignored
```

Ignored runtime files may include:

被忽略的运行时文件可能包括：

```text
.env
inbox/tasks/task-0001.json
outbox/results/task-0001.json
outbox/results/task-0001.md
logs/events.jsonl
state/status.json
```

These are local runtime files. Do not commit them.

这些是本地运行时文件，不要提交。

## 10. Development Conventions / 开发约定

Prefer Chinese for future project documentation, comments, test tasks, and
handoff notes, so the user can inspect and learn from the project more easily.
Keep command names, schema fields, file paths, and code identifiers in English.

后续项目文档、代码注释、测试任务和交接记录尽量使用中文，便于用户理解和学习。
命令名、schema 字段、文件路径和代码标识符保持英文。

When modifying this template:

修改本模板时：

```bash
npm run sync
npm run doctor
npm run validate
```

Only commit files that belong to the template. Do not commit local runtime
state, task instances, result packages, event logs, or API keys.

只提交属于模板的文件。不要提交本地运行状态、任务实例、结果包、事件日志或 API key。

## 11. Next Step / 下一步

The next major iteration should build the external PM workspace minimum loop:

下一个主要迭代应构建外部 PM 工作区最小闭环：

- discover employee repos;
- 发现员工 repo；
- submit task JSON to selected employee inbox;
- 向指定员工 inbox 提交任务 JSON；
- read employee status;
- 读取员工状态；
- collect result JSON;
- 收集结果 JSON；
- produce a PM-side summary.
- 生成 PM 侧汇总。
