#!/usr/bin/env node
// kiro-essentials — Run the WHOLE stack locally.
//
// Starts both dev processes with no AWS runtime involved:
//   [api] the local Express backend  (apps/api, tsx watch) on :3001
//   [web] the Vite dev server        (apps/web)            on :5173
//
// Login still uses Amazon Cognito Managed Login in the browser; the local API
// validates the resulting access token against the pool's PUBLIC JWKS. Data is
// ephemeral (in-memory on the API / localStorage on the web).
//
//   npm run dev:local
//
// Output from both processes is streamed with a colored [api]/[web] prefix so
// you can tell them apart. Ctrl+C stops both cleanly.

import { spawn } from 'node:child_process';
import { loadAwsCredentials, loadExternalCognito } from './lib/env.mjs';
import { repoRoot } from './lib/paths.mjs';
import * as log from './lib/console.mjs';

const isWindows = process.platform === 'win32';
const npmBin = isWindows ? 'npm.cmd' : 'npm';

// Load the repo-root .env so the API inherits the Cognito pool config. We also
// mirror VITE_COGNITO_* into COGNITO_* for the backend's env lookups.
loadAwsCredentials();
loadExternalCognito();

const children = [];
let shuttingDown = false;

/**
 * Spawn one workspace dev process, prefixing each output line with a colored
 * tag so interleaved logs stay readable.
 */
function start(name, color, args) {
  const child = spawn(npmBin, args, {
    cwd: repoRoot,
    shell: isWindows,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const tag = color(`[${name}]`);
  const pipe = (stream, sink) => {
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) sink(`${tag} ${line}`);
    });
    stream.on('end', () => {
      if (buffer.length) sink(`${tag} ${buffer}`);
    });
  };

  pipe(child.stdout, (l) => console.log(l));
  pipe(child.stderr, (l) => console.error(l));

  child.on('exit', (code) => {
    if (shuttingDown) return;
    // If one process dies, bring the whole stack down so failures are obvious.
    log.warn(`${name} exited with code ${code ?? 0}. Stopping the stack...`);
    shutdown(code ?? 1);
  });

  children.push(child);
  return child;
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  // Give children a moment to exit, then force.
  setTimeout(() => process.exit(code), 500).unref();
}

process.on('SIGINT', () => {
  log.blank();
  log.step('Stopping local stack...');
  shutdown(0);
});
process.on('SIGTERM', () => shutdown(0));

log.step('🚀 Starting the full local stack (Ctrl+C to stop)...');
console.log('   [api] http://localhost:3001   (GET /hello, protected)');
console.log('   [web] http://localhost:5173   (open this in your browser)');
log.blank();

start('api', log.color.cyan, ['run', 'dev:api']);
start('web', log.color.green, ['run', 'dev:web']);
