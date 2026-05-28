# Task Examples

JSON is the authoritative PM-to-employee protocol. Markdown companions are
optional and only for human reading.

## Minimal Validation Task

Copy `inbox/tasks/task-0001.example.json` to `inbox/tasks/task-0001.json`, then
run:

```bash
npm run validate
npm run claude -- --profile junior-deepseek --task task-0001
```

Inside Claude Code:

```text
/execute-task task-0001
```

Expected result files:

```text
outbox/results/task-0001.json
outbox/results/task-0001.md
state/status.json
logs/events.jsonl
```

## Task JSON Fields

- `schema_version`: must be `employee-task.v1`.
- `task_id`: stable id shared by inbox, outbox, and logs.
- `priority`: `low`, `normal`, `high`, or `urgent`.
- `task_type`: must be accepted by `agent.json`.
- `assignee_level`: target employee level.
- `model_hint`: recommended model profile from `config/models.yaml`.
- `input.title`: short human title.
- `input.body_md`: task body in Markdown.
- `input.attachments`: project-relative paths to extra files.
- `acceptance`: measurable completion checks.
- `constraints.allowed_paths`: project-relative writable/readable task scope.
- `constraints.deadline_at`: ISO timestamp or null.
