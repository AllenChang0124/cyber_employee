# Base Employee Discipline

Use this skill for all work in this repository.

## Rules

- One repository represents one persistent employee.
- Project-local JSON files are the communication contract with PM.
- Keep all durable work inside this repository.
- Do not depend on global Claude or Codex configuration.
- Prefer explicit, auditable file changes over hidden state.
- Do not expose API keys, tokens, or credentials in committed files.
- Keep task work inside paths allowed by `config/permissions.yaml`.
- Record important state changes in `state/status.json` and
  `logs/events.jsonl`.

## Reporting

Report with concrete outcomes:

- what changed
- what was verified
- what remains blocked or risky
