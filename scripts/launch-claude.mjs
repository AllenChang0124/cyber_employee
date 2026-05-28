#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { readYaml } from './lib/yaml-lite.mjs';

const root = process.cwd();

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    values[key] = rawValue.replace(/^["']|["']$/g, '');
  }
  return values;
}

function parseArgs(argv) {
  const parsed = { profile: '', task: '', dryRun: false, skipPermissions: false, passthrough: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--profile') {
      parsed.profile = argv[i + 1] || '';
      i += 1;
    } else if (arg.startsWith('--profile=')) {
      parsed.profile = arg.slice('--profile='.length);
    } else if (arg === '--task') {
      parsed.task = argv[i + 1] || '';
      i += 1;
    } else if (arg.startsWith('--task=')) {
      parsed.task = arg.slice('--task='.length);
    } else if (arg === '--dry-run') {
      parsed.dryRun = true;
    } else if (arg === '--skip-permissions') {
      parsed.skipPermissions = true;
    } else {
      parsed.passthrough.push(arg);
    }
  }
  return parsed;
}

const args = parseArgs(process.argv.slice(2));
const modelConfig = readYaml(path.join(root, 'config/models.yaml'));
const profileName = args.profile || modelConfig.default_profile;
const profile = modelConfig.profiles?.[profileName];

if (!profile) {
  console.error(`unknown model profile: ${profileName}`);
  console.error(`available profiles: ${Object.keys(modelConfig.profiles || {}).join(', ')}`);
  process.exit(1);
}

const dotEnv = loadDotEnv(path.join(root, '.env'));
const authToken = process.env[profile.auth_env] || dotEnv[profile.auth_env];
if (!authToken) {
  console.error(`missing ${profile.auth_env}; set it in .env or the process environment`);
  process.exit(1);
}

const env = {
  ...process.env,
  ...dotEnv,
  ANTHROPIC_AUTH_TOKEN: authToken,
  ANTHROPIC_MODEL: profile.model,
  ANTHROPIC_DEFAULT_OPUS_MODEL: profile.opus_model || profile.model,
  ANTHROPIC_DEFAULT_SONNET_MODEL: profile.sonnet_model || profile.model,
  ANTHROPIC_DEFAULT_HAIKU_MODEL: profile.haiku_model || profile.model,
  CLAUDE_CODE_SUBAGENT_MODEL: profile.subagent_model || profile.model,
  EMPLOYEE_MODEL_PROFILE: profileName
};

if (profile.base_url) env.ANTHROPIC_BASE_URL = profile.base_url;
if (profile.effort_level) env.CLAUDE_CODE_EFFORT_LEVEL = profile.effort_level;
if (args.task) env.EMPLOYEE_TASK_ID = args.task;

console.log(`Launching Claude Code with profile ${profileName}`);
console.log(`Provider base URL: ${profile.base_url || '(default)'}`);
console.log(`Claude Code model: ${profile.model}`);
if (args.task) {
  console.log(`Task ${args.task} is available as EMPLOYEE_TASK_ID.`);
  console.log(`Inside Claude Code, run: /execute-task ${args.task}`);
}

const hasModelFlag = args.passthrough.some((arg) => arg === '--model' || arg.startsWith('--model='));
const launchArgs = hasModelFlag ? [...args.passthrough] : ['--model', profile.model, ...args.passthrough];
if (args.skipPermissions && !launchArgs.includes('--dangerously-skip-permissions')) {
  launchArgs.push('--dangerously-skip-permissions');
  console.warn('warning - permission checks will be bypassed for this Claude Code session');
}

if (args.passthrough.includes('--resume') || args.passthrough.includes('--continue')) {
  console.warn('warning - resumed Claude Code sessions may keep the model saved in the transcript');
}

if (args.dryRun) {
  console.log(`Command: claude ${launchArgs.map((arg) => JSON.stringify(arg)).join(' ')}`);
  console.log('Dry run only; Claude Code was not launched.');
  process.exit(0);
}

const child = spawn('claude', launchArgs,
{
  cwd: root,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`claude exited from signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(`failed to launch claude: ${error.message}`);
  process.exit(1);
});
