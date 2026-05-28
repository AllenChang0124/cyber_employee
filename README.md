# template-base Employee Template

This repository is a single persistent employee template.

It is designed for a workspace where a Codex PM clones multiple employee
repositories and communicates with each employee through project-local JSON
files. This repository does not implement the PM scheduler.

## Quick Start

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill only the API keys you need in `.env`.

3. Check the repository:

   ```bash
   npm run doctor
   npm run validate
   ```

4. Refresh generated adapters:

   ```bash
   npm run sync
   ```

   This also initializes runtime files such as `state/status.json` when they
   are missing.

5. Launch Claude Code with a model profile:

   ```bash
   npm run claude -- --profile junior-deepseek
   npm run claude -- --profile senior-deepseek
   npm run claude -- --profile junior-minimax-cn
   ```

For trusted disposable sandboxes only, you can explicitly bypass Claude Code
permission prompts:

```bash
npm run claude -- --profile junior-deepseek --skip-permissions
```

This passes `--dangerously-skip-permissions`. Do not use it when the employee
repository has broad filesystem or network access.

## Employee Bridge

Codex PM should treat this repository as one employee. The machine-readable
interface is JSON-first:

- `agent.json` describes this employee.
- `inbox/tasks/*.json` contains assigned tasks.
- `outbox/results/*.json` contains task results.
- `state/status.json` exposes current employee state.
- `state/status.example.json` is the committed status template.
- `logs/events.jsonl` stores append-only local events.

Markdown files beside JSON files are optional human-readable attachments.

Task examples:

- `inbox/tasks/task-0001.example.json`
- `docs/task-examples.md`

## Explicit Wake Mode

Version 1 does not run a watcher or daemon. After PM writes a task file, wake
the employee explicitly:

```bash
npm run claude -- --profile junior-deepseek --task task-0001
```

Inside Claude Code, run:

```text
/execute-task task-0001
```

## Model Profiles

Profiles live in `config/models.yaml`.

The launcher maps a profile to Claude Code environment variables:

- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `CLAUDE_CODE_SUBAGENT_MODEL`

It also passes `claude --model <profile.model>` so the project profile wins over
your user-level default for new sessions. Do not launch with `--resume` or
`--continue` when validating a profile; resumed sessions may keep the model from
the saved transcript.

API keys are loaded from `.env` or the parent process environment.

## Troubleshooting

If `/doctor` reports `.mcp.json` parse errors, run:

```bash
npm run sync
npm run validate
```

The expected empty MCP file is:

```json
{
  "mcpServers": {}
}
```

## Boundaries

This template intentionally does not include:

- a PM workspace
- multi-employee scheduling
- background task polling
- direct provider API calls

All project skills, MCP declarations, commands, and bridge files live inside
this repository.
