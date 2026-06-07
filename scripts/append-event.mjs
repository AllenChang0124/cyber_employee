#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ensureDir, nowIso } from './lib/project.mjs';

const root = process.cwd();
const EVENT_SCHEMA = 'employee-event.v1';

function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      if (!args._) args._ = [];
      args._.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    const value = (!next || next.startsWith('--')) ? true : next;
    args[key] = value;
    if (value !== true) index += 1;
  }
  return args;
}

function usage() {
  console.error('usage: npm run event -- --type started --task-id task-0001 --message "message" [--level info] [--run-id run-...] [--data-json "{}"]');
  process.exit(1);
}

function required(args, key) {
  const value = args[key];
  if (!value || value === true || String(value).trim() === '') usage();
  return String(value).trim();
}

function parseDataJson(raw) {
  if (!raw || raw === true) return {};
  const value = JSON.parse(String(raw));
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('--data-json must decode to a JSON object');
  }
  return value;
}

function needsLeadingNewline(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const stat = fs.statSync(filePath);
  if (stat.size === 0) return false;
  const fd = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(1);
    fs.readSync(fd, buffer, 0, 1, stat.size - 1);
    return buffer[0] !== 10;
  } finally {
    fs.closeSync(fd);
  }
}

const args = parseArgs();
const type = required(args, 'type');
const taskId = required(args, 'task-id');
const message = required(args, 'message');
const level = args.level && args.level !== true ? String(args.level).trim() : 'info';
const runId = args['run-id'] && args['run-id'] !== true ? String(args['run-id']).trim() : '';
const data = parseDataJson(args['data-json']);

const event = {
  schema_version: EVENT_SCHEMA,
  event_id: `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,
  ts: nowIso(),
  task_id: taskId,
  type,
  level,
  message,
  data
};
if (runId) event.run_id = runId;

const eventsPath = path.join(root, 'logs/events.jsonl');
ensureDir(path.dirname(eventsPath));
const prefix = needsLeadingNewline(eventsPath) ? '\n' : '';
fs.appendFileSync(eventsPath, `${prefix}${JSON.stringify(event)}\n`, 'utf8');
console.log(`event appended: ${type} ${taskId}`);
