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
- Brave Search API key if web search MCP is enabled.
- 如果启用 Web 搜索 MCP，需要 Brave Search API key。

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
BRAVE_API_KEY=
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

## 6. Project MCP / 项目级 MCP

Brave Search is built into the employee template as the default project-local
web search MCP server. The source configuration is `config/mcp.yaml`; running
`npm run sync` generates `.mcp.json`.

Brave Search 已作为默认项目级 Web 搜索 MCP 内置在员工模板中。源配置是
`config/mcp.yaml`，运行 `npm run sync` 会生成 `.mcp.json`。

The generated project MCP entry uses the official Brave MCP server package:

生成的项目 MCP 入口使用官方 Brave MCP server 包：

```json
{
  "mcpServers": {
    "brave-search": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@brave/brave-search-mcp-server", "--transport", "stdio"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}",
        "BRAVE_MCP_TRANSPORT": "stdio",
        "BRAVE_MCP_ENABLED_TOOLS": "brave_web_search"
      }
    }
  }
}
```

`BRAVE_API_KEY` must be set in `.env` or the process environment before
launching Claude Code through `npm run claude`. Do not hard-code the key into
`.mcp.json` or commit `.env`.

启动 Claude Code 前，`BRAVE_API_KEY` 必须存在于 `.env` 或进程环境变量中。
不要把 key 硬编码到 `.mcp.json`，也不要提交 `.env`。

The template enables only `brave_web_search` by default. This keeps the tool
surface small and works well for the free Search API. You can expand enabled
tools later by editing `config/mcp.yaml` and running `npm run sync`.

模板默认只启用 `brave_web_search`，降低工具噪音，并更适合免费 Search API。
后续如需扩展工具，修改 `config/mcp.yaml` 后运行 `npm run sync`。

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
- `logs/events.jsonl`: append-only runtime event log.
- `logs/events.jsonl`：追加式运行事件日志。

Markdown companions are human-readable reports or task notes. JSON remains the
authoritative machine protocol.

Markdown companion 是给人阅读的报告或任务说明。JSON 始终是权威机器协议。

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

### 9.1 Basic health / 基础健康检查

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

### 9.2 Protocol validation / 协议校验

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
- required fields in `agent.json`, task JSON, result JSON, and status JSON.
- `agent.json`、任务 JSON、结果 JSON 和状态 JSON 的必填字段。
- companion Markdown report for every result JSON.
- 每个结果 JSON 是否有对应 Markdown 报告。
- `logs/events.jsonl` event shape.
- `logs/events.jsonl` 事件格式。

### 9.3 MCP config / MCP 配置

If Claude Code reports a project MCP parse error, run:

如果 Claude Code 报项目 MCP 解析错误，运行：

```bash
npm run sync
npm run validate
```

The expected project MCP file contains `mcpServers.brave-search` and references
`${BRAVE_API_KEY}` rather than a literal key.

预期的项目 MCP 文件包含 `mcpServers.brave-search`，并通过 `${BRAVE_API_KEY}`
引用环境变量，而不是写入明文 key。

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx"
    }
  }
}
```

To debug in `senior-demo`:

在 `senior-demo` 中调试：

```bash
cd employees/senior-demo
npm run sync
npm run doctor
npm run validate
npm run claude -- --profile senior-deepseek --dry-run
```

Then launch Claude Code and run `/doctor` and `/mcp` inside Claude Code. The MCP
diagnostics should show the project `brave-search` server without writing to
user home configuration.

之后启动 Claude Code，在 Claude Code 内运行 `/doctor` 和 `/mcp`。MCP 诊断应显示
项目级 `brave-search` server，且不写入用户 home 配置。

### 9.4 Model selection / 模型选择

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

### 9.5 Git hygiene / Git 卫生检查

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
