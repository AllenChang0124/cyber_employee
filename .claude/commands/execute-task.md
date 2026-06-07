# Execute Task

Execute a single PM-assigned task from the project-local JSON bridge.

Task id: `$ARGUMENTS`

## Protocol

1. Read `agent.json`, `config/employee.yaml`, and `config/permissions.yaml`.
2. Read `inbox/tasks/$ARGUMENTS.json`.
3. If `inbox/tasks/$ARGUMENTS.md` exists, use it only as a human-readable
   supplement. The JSON task file remains authoritative.
4. Update `state/status.json` to `working` before implementation.
5. Append a `started` event by running:

   ```bash
   npm run event -- --type started --task-id "$ARGUMENTS" --message "started task $ARGUMENTS"
   ```

6. Execute only within the allowed project-local paths.
7. Verify each acceptance criterion from the JSON task.
8. Write `outbox/results/$ARGUMENTS.json`.
9. Always write `outbox/results/$ARGUMENTS.md` as the human-readable report.
10. Update `state/status.json` to `idle`.
11. Append a `completed`, `failed`, or `blocked` event by running `npm run event` again.

Use the real current time for `started_at`, `completed_at`, and `updated_at`.
Do not copy placeholder timestamps from examples. Do not edit `logs/events.jsonl`
directly; `npm run event` owns JSONL line safety.

## Event command

Use this command shape for event logging:

```bash
npm run event -- --type completed --task-id "$ARGUMENTS" --message "completed task $ARGUMENTS" --data-json '{"status":"completed"}'
```

Optional flags: `--level`, `--run-id`, `--data-json`.

## Result JSON

The result file must contain:

```json
{
  "schema_version": "employee-result.v1",
  "task_id": "",
  "status": "completed",
  "model_used": "",
  "started_at": "",
  "completed_at": "",
  "summary": "",
  "changes": [],
  "verification": [
    {
      "criterion": "copy one acceptance criterion exactly",
      "passed": true,
      "detail": "brief evidence"
    }
  ],
  "artifacts": [],
  "notes": []
}
```

Each `verification[]` item must be an object with `criterion` copied exactly
from `acceptance[]` and explicit boolean `passed`.

## Result Markdown

The Markdown report must contain:

```markdown
# Result

# Verification

# Notes
```
