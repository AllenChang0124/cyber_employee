# Execute Task

Execute a single PM-assigned task from the project-local JSON bridge.

Task id: `$ARGUMENTS`

## Protocol

1. Read `agent.json`, `config/employee.yaml`, and `config/permissions.yaml`.
2. Read `inbox/tasks/$ARGUMENTS.json`.
3. If `inbox/tasks/$ARGUMENTS.md` exists, use it only as a human-readable
   supplement. The JSON task file remains authoritative.
4. Update `state/status.json` to `working` before implementation.
5. Append a `started` event to `logs/events.jsonl`.
6. Execute only within the allowed project-local paths.
7. Verify each acceptance criterion from the JSON task.
8. Write `outbox/results/$ARGUMENTS.json`.
9. Always write `outbox/results/$ARGUMENTS.md` as the human-readable report.
10. Update `state/status.json` to `idle`.
11. Append a `completed`, `failed`, or `blocked` event to `logs/events.jsonl`.

Use the real current time for `started_at`, `completed_at`, `updated_at`, and
event `ts` values. Do not copy placeholder timestamps from examples.

Every event log line must be valid JSON with this shape:

```json
{"schema_version":"employee-event.v1","event_id":"","ts":"","task_id":"","type":"started","message":"","data":{}}
```

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
  "verification": [],
  "artifacts": [],
  "notes": []
}
```

## Result Markdown

The Markdown report must contain:

```markdown
# Result

# Verification

# Notes
```
