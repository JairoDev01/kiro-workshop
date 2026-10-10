// Cross-platform child-process execution for the workshop scripts.
//
// Windows resolves executables differently from POSIX: `npm`/`npx`/`cdk` are
// `.cmd` shims there, and `spawn` will not find a bare `npm` without help. This
// module centralizes that handling so the rest of the scripts never worry about
// platform differences. We avoid `shell: true` string commands (which would be
// shell-specific and an injection risk) and instead pass argv arrays.

import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

/**
 * Resolve a Node-ecosystem binary name to the platform-correct executable.
 * On Windows, npm/npx/cdk are installed as `.cmd` batch shims.
 */
function resolveBin(command) {
  if (!isWindows) return command;
  const cmdShims = new Set(['npm', 'npx', 'cdk', 'node-gyp']);
  return cmdShims.has(command) ? `${command}.cmd` : command;
}

/**
 * Quote a single argument for safe use when `spawn` runs through cmd.exe
 * (Windows + `shell: true`).
 *
 * With `shell: true`, Node joins argv with spaces and hands the raw string to
 * cmd.exe, which does NOT quote for us. An argument containing a space or a
 * cmd metacharacter (& | < > ^ ! % ( ) " and others — e.g. a test-user
 * password like `Str0ngPass!`) would otherwise be split or reinterpreted.
 *
 * Strategy: wrap the whole argument in double quotes, escape embedded double
 * quotes, and additionally caret-escape the characters cmd.exe still expands
 * INSIDE double quotes (`%` and `!`, the latter only matters with delayed
 * expansion but we escape defensively). On POSIX we never reach this path, so
 * arguments pass through untouched to execvp with no shell interpretation.
 */
function quoteWinArg(arg) {
  const value = String(arg);
  // Only quote when needed; leave simple tokens (flags, stack names) as-is so
  // output stays readable.
  if (value.length > 0 && !/[\s&|<>^!%()"]/.test(value)) return value;
  const escaped = value
    .replace(/"/g, '\\"') // escape embedded double quotes
    .replace(/([%!^])/g, '^$1'); // caret-escape cmd metacharacters
  return `"${escaped}"`;
}

/** Apply Windows cmd quoting to every arg only when running through the shell. */
function prepareArgs(args) {
  return isWindows ? args.map(quoteWinArg) : args;
}

/**
 * Run a command to completion, inheriting stdio so the participant sees live
 * output (CDK progress, Vite logs, etc.). Rejects with a concise Error on a
 * non-zero exit instead of dumping a raw stack trace.
 *
 * @param {string} command           Executable name (e.g. "npm", "npx").
 * @param {string[]} args            Argument vector.
 * @param {object} [options]
 * @param {string} [options.cwd]     Working directory.
 * @param {object} [options.env]     Extra environment variables to merge.
 * @returns {Promise<void>}
 */
export function run(command, args = [], options = {}) {
  const { cwd, env } = options;
  return new Promise((resolve, reject) => {
    const child = spawn(resolveBin(command), prepareArgs(args), {
      cwd,
      stdio: 'inherit',
      // On Windows, .cmd shims must be run through the shell to be located and
      // executed correctly. We pass argv as an array (not a joined string) and
      // only enable the shell on Windows, keeping POSIX free of shell parsing.
      shell: isWindows,
      env: env ? { ...process.env, ...env } : process.env,
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start "${command}": ${err.message}`));
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`"${command} ${args.join(' ')}" exited with code ${code}.`),
        );
      }
    });
  });
}

/**
 * Replace the current process with `npm run dev:web` so the Vite dev server
 * owns the terminal with clean Ctrl+C handling. Node has no `exec`-style
 * process replacement, so we spawn with inherited stdio and mirror the child's
 * exit code — functionally equivalent for the workshop.
 *
 * This never returns (it exits the process when the server stops).
 */
export async function runDevServer() {
  const child = spawn(resolveBin('npm'), ['run', 'dev:web'], {
    stdio: 'inherit',
    shell: isWindows,
    env: process.env,
  });
  child.on('close', (code) => process.exit(code ?? 0));
  // Keep the parent alive while the dev server runs.
  await new Promise(() => {});
}

export { isWindows };
