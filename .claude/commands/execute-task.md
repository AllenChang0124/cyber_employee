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
9. Write `outbox/results/$ARGUMENTS.md` when a human-readable report is useful.
10. Update `state/status.json` to `idle`.
11. Append a `completed`, `failed`, or `blocked` event to `logs/events.jsonl`.

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
