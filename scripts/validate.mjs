#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readJson } from './lib/project.mjs';
import { readYaml } from './lib/yaml-lite.mjs';

const root = process.cwd();
const errors = [];

function fail(message) {
  errors.push(message);
  console.error(`error - ${message}`);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.idea', '.vscode'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath).replaceAll(path.sep, '/');
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

function requireFields(object, fields, label) {
  for (const field of fields) {
    if (!(field in object)) fail(`${label} missing required field: ${field}`);
  }
}

function validateJsonFile(relativePath, fields) {
  try {
    const value = readJson(path.join(root, relativePath));
    requireFields(value, fields, relativePath);
    return value;
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

const files = walk(root);
const secretPatterns = [
  { name: 'github token', pattern: /ghp_[A-Za-z0-9_]{20,}/ },
  { name: 'generic api key', pattern: /\bsk-[A-Za-z0-9_-]{16,}/ },
  { name: 's2 token', pattern: /\bs2k-[A-Za-z0-9_-]{16,}/ }
];

const pathPatterns = [
  { name: 'macOS user home path', pattern: /(^|[^A-Za-z0-9_])\/Users\/[A-Za-z0-9._-]+/ },
  { name: 'Windows user home path', pattern: /\b[A-Za-z]:\/Users\/[A-Za-z0-9._-]+/ },
  { name: 'Claude home dependency', pattern: /~\/\.claude/ },
  { name: 'Codex home dependency', pattern: /~\/\.codex/ }
];

for (const relativePath of files) {
  if (relativePath === 'scripts/validate.mjs') continue;
  if (relativePath === 'logs/development-handoff.md') continue;
  if (/^\.env(\..+)?$/.test(relativePath) && relativePath !== '.env.example') continue;
  const fullPath = path.join(root, relativePath);
  const text = fs.readFileSync(fullPath, 'utf8');
  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(text)) fail(`${relativePath} contains suspected ${name}`);
  }
  for (const { name, pattern } of pathPatterns) {
    if (pattern.test(text)) fail(`${relativePath} contains hard-coded ${name}`);
  }
}

const agent = validateJsonFile('agent.json', [
  'schema_version',
  'employee_id',
  'name',
  'level',
  'role',
  'default_model_profile',
  'capabilities',
  'accepts_task_types',
  'paths'
]);
if (agent?.paths) {
  requireFields(agent.paths, ['inbox', 'outbox', 'status', 'events'], 'agent.json paths');
}

validateJsonFile('state/status.example.json', [
  'schema_version',
  'employee_id',
  'state',
  'active_task_id',
  'model_profile',
  'updated_at'
]);

if (fs.existsSync(path.join(root, 'state/status.json'))) {
  validateJsonFile('state/status.json', [
    'schema_version',
    'employee_id',
    'state',
    'active_task_id',
    'model_profile',
    'updated_at'
  ]);
}

const mcp = validateJsonFile('.mcp.json', ['mcpServers']);
if (mcp && (typeof mcp.mcpServers !== 'object' || mcp.mcpServers === null || Array.isArray(mcp.mcpServers))) {
  fail('.mcp.json mcpServers must be a JSON object');
}
if (mcp?.mcpServers?.['brave-search']) {
  const brave = mcp.mcpServers['brave-search'];
  requireFields(brave, ['type', 'command', 'args', 'env'], '.mcp.json mcpServers.brave-search');
  if (brave.type !== 'stdio') fail('.mcp.json brave-search type must be stdio');
  if (brave.command !== 'npx') fail('.mcp.json brave-search command must be npx');
  if (!Array.isArray(brave.args)) fail('.mcp.json brave-search args must be an array');
  if (!brave.args?.includes('@brave/brave-search-mcp-server')) fail('.mcp.json brave-search must use @brave/brave-search-mcp-server');
  if (brave.env?.BRAVE_API_KEY !== '${BRAVE_API_KEY}') fail('.mcp.json brave-search env.BRAVE_API_KEY must use ${BRAVE_API_KEY}');
}

for (const dir of ['inbox/tasks', 'outbox/results']) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) continue;
  for (const entry of fs.readdirSync(fullDir)) {
    if (!entry.endsWith('.json')) continue;
    const relativePath = `${dir}/${entry}`;
    if (dir === 'inbox/tasks') {
      const task = validateJsonFile(relativePath, [
        'schema_version',
        'task_id',
        'created_at',
        'priority',
        'task_type',
        'assignee_level',
        'model_hint',
        'input',
        'acceptance',
        'constraints'
      ]);
      if (task?.input) requireFields(task.input, ['title', 'body_md', 'attachments'], `${relativePath} input`);
    } else {
      const result = validateJsonFile(relativePath, [
        'schema_version',
        'task_id',
        'status',
        'model_used',
        'started_at',
        'completed_at',
        'summary',
        'changes',
        'verification',
        'artifacts',
        'notes'
      ]);
      if (result) {
        const markdownPath = relativePath.replace(/\.json$/, '.md');
        if (!fs.existsSync(path.join(root, markdownPath))) {
          fail(`${relativePath} is missing companion Markdown report ${markdownPath}`);
        }
      }
    }
  }
}

const eventsPath = path.join(root, 'logs/events.jsonl');
if (fs.existsSync(eventsPath)) {
  const lines = fs.readFileSync(eventsPath, 'utf8').split(/\r?\n/).filter(Boolean);
  lines.forEach((line, index) => {
    try {
      const event = JSON.parse(line);
      requireFields(event, ['schema_version', 'event_id', 'ts', 'task_id', 'type', 'message', 'data'], `logs/events.jsonl line ${index + 1}`);
      if (event.schema_version !== 'employee-event.v1') fail(`logs/events.jsonl line ${index + 1} has invalid schema_version`);
      if (!isNonEmptyString(event.event_id)) fail(`logs/events.jsonl line ${index + 1} has empty event_id`);
      if (!isNonEmptyString(event.ts)) fail(`logs/events.jsonl line ${index + 1} has empty ts`);
      if (!isNonEmptyString(event.type)) fail(`logs/events.jsonl line ${index + 1} has empty type`);
      if (typeof event.data !== 'object' || event.data === null || Array.isArray(event.data)) {
        fail(`logs/events.jsonl line ${index + 1} data must be an object`);
      }
    } catch (error) {
      fail(`logs/events.jsonl line ${index + 1} is not valid JSON: ${error.message}`);
    }
  });
}

try {
  readYaml(path.join(root, 'config/employee.yaml'));
  readYaml(path.join(root, 'config/models.yaml'));
  readYaml(path.join(root, 'config/mcp.yaml'));
  readYaml(path.join(root, 'config/permissions.yaml'));
} catch (error) {
  fail(`YAML parse failed: ${error.message}`);
}

const git = spawnSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' });
if (git.status === 0) {
  const tracked = new Set(git.stdout.split(/\r?\n/).filter(Boolean));
  for (const forbidden of ['.env', 'state/status.json']) {
    if (tracked.has(forbidden)) fail(`${forbidden} must not be tracked by git`);
  }
  for (const trackedPath of tracked) {
    if (/^\.claude\/settings\.local/.test(trackedPath) || /^\.codex\/settings\.local/.test(trackedPath)) {
      fail(`${trackedPath} must not be tracked by git`);
    }
  }
}

if (errors.length > 0) {
  console.error(`validate failed with ${errors.length} error(s)`);
  process.exit(1);
}

console.log('validate passed');
