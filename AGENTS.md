# Codex Compatibility Entry

This repository is Claude Code first. Codex may use this file as a compatibility
entry when acting as PM or inspecting the employee repository.

For PM automation, use the JSON bridge:

- Read `agent.json`.
- Write task JSON files into `inbox/tasks/`.
- Poll `state/status.json`.
- Read result JSON files from `outbox/results/`.
- Read append-only events from `logs/events.jsonl`.

For current or external web information, the employee template provides a
project-level Firecrawl MCP server. Do not rely on a specific model's built-in
web search capability. Web-derived results must include source URLs in the
result package.

Do not assume this repository contains a multi-employee scheduler. One clone or
branch equals one employee.
