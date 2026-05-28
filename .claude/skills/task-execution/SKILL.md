# JSON Task Execution

Use this skill when executing a task from `inbox/tasks`.

## Input

The authoritative task file is:

```text
inbox/tasks/<task_id>.json
```

The optional human-readable companion is:

```text
inbox/tasks/<task_id>.md
```

## Workflow

1. Confirm the task JSON has `schema_version`, `task_id`, `priority`,
   `task_type`, `input`, and `acceptance`.
2. Confirm the task type is listed in `agent.json`.
3. Set `state/status.json` to `working`.
4. Append a `started` event to `logs/events.jsonl`.
5. Perform the task inside allowed paths.
6. Verify every acceptance criterion.
7. Write `outbox/results/<task_id>.json`.
8. Set `state/status.json` back to `idle`.
9. Append a terminal event to `logs/events.jsonl`.

## Failure Handling

If the task cannot be completed, write a result JSON with status `blocked` or
`failed`, explain the reason in `notes`, and include any partial verification.
