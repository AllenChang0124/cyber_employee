# Codex Compatibility Entry

This repository is Claude Code first. Codex may use this file as a compatibility
entry when acting as PM or inspecting the employee repository.

For PM automation, use the JSON bridge:

- Read `agent.json`.
- Write task JSON files into `inbox/tasks/`.
- Poll `state/status.json`.
- Read result JSON files from `outbox/results/`.
- Read append-only events from `logs/events.jsonl`.

Project-local MCP is generated from `config/mcp.yaml`. Brave Search is included
as the default web search MCP server and should use `BRAVE_API_KEY` from `.env`
or the process environment, never a committed literal key.

Do not assume this repository contains a multi-employee scheduler. One clone or
branch equals one employee.
