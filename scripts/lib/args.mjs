// Minimal, dependency-free CLI argument parsing for the workshop scripts.
//
// Windows shells (PowerShell, Command Prompt) make Bash-style inline env vars
// awkward, so the scripts expose cross-platform `--flags` instead. Environment
// variables remain supported for backward compatibility; this helper lets each
// script treat either source uniformly.

/**
 * Parse argv into { flags, positionals }.
 *
 * Supports:
 *   --flag                 -> flags.flag === true
 *   --flag=value           -> flags.flag === "value"
 *   --no-flag              -> flags.flag === false
 *   everything else        -> positionals[]
 *
 * Flag names are normalized to camelCase (e.g. --skip-deploy -> skipDeploy).
 */
export function parseArgs(argv = process.argv.slice(2)) {
  const flags = {};
  const positionals = [];

  for (const arg of argv) {
    if (arg.startsWith('--')) {
      let body = arg.slice(2);
      let value = true;

      const eq = body.indexOf('=');
      if (eq !== -1) {
        value = body.slice(eq + 1);
        body = body.slice(0, eq);
      } else if (body.startsWith('no-')) {
        body = body.slice(3);
        value = false;
      }

      flags[toCamelCase(body)] = value;
    } else {
      positionals.push(arg);
    }
  }

  return { flags, positionals };
}

function toCamelCase(name) {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/**
 * Resolve a boolean "skip" option from either a CLI flag or a legacy env var.
 * CLI flags take precedence. The env var is truthy when set to "1" or "true".
 */
export function resolveSkip(flags, flagName, envName) {
  if (flagName in flags) return Boolean(flags[flagName]);
  const envValue = process.env[envName];
  return envValue === '1' || envValue === 'true';
}

/**
 * Resolve a string option from a CLI flag, then a legacy env var, then a default.
 */
export function resolveString(flags, flagName, envName, defaultValue) {
  if (flagName in flags && typeof flags[flagName] === 'string') {
    return flags[flagName];
  }
  if (envName && process.env[envName]) return process.env[envName];
  return defaultValue;
}
