import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

function protocolIndexPath(protocolDir) {
  return path.join(protocolDir, 'index.mjs');
}

function protocolCandidates(startDir) {
  const candidates = [];
  let current = path.resolve(startDir);
  while (true) {
    candidates.push(path.join(current, 'cyber_protocol'));
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return candidates;
}

export function resolveProtocolDir() {
  if (process.env.CYBER_PROTOCOL_DIR) {
    const explicit = path.resolve(process.cwd(), process.env.CYBER_PROTOCOL_DIR);
    if (fs.existsSync(protocolIndexPath(explicit))) return explicit;
    throw new Error(`CYBER_PROTOCOL_DIR does not contain index.mjs: ${explicit}`);
  }

  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const starts = [process.cwd(), moduleDir];
  const seen = new Set();
  for (const start of starts) {
    for (const candidate of protocolCandidates(start)) {
      if (seen.has(candidate)) continue;
      seen.add(candidate);
      if (fs.existsSync(protocolIndexPath(candidate))) return candidate;
    }
  }

  throw new Error('cyber_protocol not found; set CYBER_PROTOCOL_DIR or place cyber_protocol as a sibling/ancestor repo');
}

export async function loadProtocol() {
  return import(pathToFileURL(protocolIndexPath(resolveProtocolDir())).href);
}
