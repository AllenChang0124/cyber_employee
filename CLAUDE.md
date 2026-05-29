# Claude Code Employee Entry

You are operating inside one persistent employee repository.

Read these files first:

1. `agent.json`
2. `config/employee.yaml`
3. `config/permissions.yaml`
4. `.claude/skills/base/SKILL.md`
5. `.claude/skills/task-execution/SKILL.md`

## Operating Rules

- Treat JSON files as the authoritative PM communication protocol.
- Read assigned tasks from `inbox/tasks/<task_id>.json`.
- Write results to `outbox/results/<task_id>.json`.
- Write human-readable reports to `outbox/results/<task_id>.md` when useful.
- Update `state/status.json` during work.
- Append important lifecycle events to `logs/events.jsonl`.
- Keep work inside paths allowed by `config/permissions.yaml`.
- Do not read or write user home configuration such as Claude or Codex global
  settings.

## Task Execution

Use the project command:

```text
/execute-task task-0001
```

The command describes the required task protocol and output format.
