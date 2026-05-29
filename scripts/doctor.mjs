#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readYaml } from './lib/yaml-lite.mjs';

const root = process.cwd();
const errors = [];
const warnings = [];

function ok(message) {
  console.log(`ok - ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`warning - ${message}`);
}

function fail(message) {
  errors.push(message);
  console.error(`error - ${message}`);
}

function requirePath(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (fs.existsSync(fullPath)) ok(`${relativePath} exists`);
  else fail(`${relativePath} is missing`);
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor >= 18) ok(`Node ${process.versions.node}`);
else fail(`Node ${process.versions.node} is too old; use Node 18 or newer`);

const claude = spawnSync('claude', ['--version'], { encoding: 'utf8' });
if (claude.status === 0) ok(`Claude Code found: ${claude.stdout.trim() || 'installed'}`);
else warn('Claude Code CLI was not found in PATH');

[
  'README.md',
  'CLAUDE.md',
  'AGENTS.md',
  'package.json',
  '.env.example',
  '.gitignore',
  '.mcp.json',
  'agent.json',
  'config/employee.yaml',
  'config/models.yaml',
  'config/mcp.yaml',
  'config/permissions.yaml',
  '.claude/settings.json',
  '.claude/commands/execute-task.md',
  '.claude/skills/base/SKILL.md',
  '.claude/skills/task-execution/SKILL.md',
  'state/status.example.json'
].forEach(requirePath);

[
  'inbox/tasks',
  'outbox/results',
  'workspace',
  'memory',
  'logs',
  'scripts'
].forEach(requirePath);

try {
  JSON.parse(fs.readFileSync(path.join(root, 'agent.json'), 'utf8'));
  JSON.parse(fs.readFileSync(path.join(root, 'state/status.example.json'), 'utf8'));
  readJsonIfExists('state/status.json');
  JSON.parse(fs.readFileSync(path.join(root, '.mcp.json'), 'utf8'));
  readYaml(path.join(root, 'config/employee.yaml'));
  readYaml(path.join(root, 'config/models.yaml'));
  ok('JSON and YAML configuration files parse');
} catch (error) {
  fail(`configuration parse failed: ${error.message}`);
}

if (fs.existsSync(path.join(root, 'state/status.json'))) {
  ok('state/status.json runtime state exists');
} else {
  warn('state/status.json runtime state is missing; run npm run sync to initialize it');
}

const envText = fs.existsSync(path.join(root, '.env'))
  ? fs.readFileSync(path.join(root, '.env'), 'utf8')
  : '';
for (const key of ['DEEPSEEK_API_KEY', 'MINIMAX_API_KEY', 'OPENAI_API_KEY', 'BRAVE_API_KEY']) {
  if (process.env[key] || new RegExp(`^${key}=.+`, 'm').test(envText)) ok(`${key} is configured`);
  else warn(`${key} is not configured`);
}

if (errors.length > 0) {
  console.error(`doctor failed with ${errors.length} error(s) and ${warnings.length} warning(s)`);
  process.exit(1);
}

console.log(`doctor passed with ${warnings.length} warning(s)`);
