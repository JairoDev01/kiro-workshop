// Cross-platform .env loading and writing for the workshop scripts.
//
// Replaces the Bash `grep`/`sed`/`cp`/`cat` approach from setup-local.sh with
// pure Node fs/path APIs so it behaves identically on Windows, macOS and Linux.
//
// Responsibilities:
//   - create .env from .env.example on a fresh clone;
//   - parse KEY=value pairs (tolerating quotes/whitespace/`export `);
//   - load the AWS_* credentials into process.env for the SDK/CDK;
//   - rewrite .env with resolved VITE_* values while PRESERVING the AWS
//     workshop credentials that the participant filled in.

import fs from 'node:fs';
import { envFile, envExampleFile } from './paths.mjs';

/** AWS credential keys that must survive a .env rewrite. */
export const AWS_CREDENTIAL_KEYS = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
  'AWS_REGION',
  'AWS_DEFAULT_REGION',
];

/**
 * Parse the contents of a .env file into a plain object.
 *
 * Tolerates surrounding whitespace, an optional leading `export `, blank lines,
 * `#` comments, and a single pair of matching surrounding quotes around values.
 * The last occurrence of a key wins (matches the old `tail -n1` behavior).
 */
export function parseEnv(contents) {
  const result = {};
  const lines = contents.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const withoutExport = line.startsWith('export ')
      ? line.slice('export '.length).trim()
      : line;

    const eq = withoutExport.indexOf('=');
    if (eq === -1) continue;

    const key = withoutExport.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    let value = withoutExport.slice(eq + 1).trim();
    // Strip a single pair of matching surrounding quotes, if present.
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

/** Does a .env exist at the repo root? */
export function envFileExists() {
  return fs.existsSync(envFile);
}

/**
 * Ensure a .env exists. On a fresh clone (no .env) it is created from
 * .env.example. Returns `true` when it created the file (meaning the caller
 * should ask the participant to fill in credentials and stop), `false` when a
 * .env already existed.
 */
export function ensureEnvFile() {
  if (fs.existsSync(envFile)) return false;
  if (!fs.existsSync(envExampleFile)) {
    throw new Error('Neither .env nor .env.example was found at the repo root.');
  }
  fs.copyFileSync(envExampleFile, envFile);
  return true;
}

/** Read and parse the repo-root .env. Returns {} if it does not exist. */
export function readEnv() {
  if (!fs.existsSync(envFile)) return {};
  return parseEnv(fs.readFileSync(envFile, 'utf8'));
}

/**
 * Load AWS_* credentials from .env into process.env so the AWS SDK v3 default
 * credential provider chain and `npx cdk` pick them up. Values already present
 * in the real environment are NOT overwritten (explicit shell exports win).
 *
 * AWS_REGION is mirrored to AWS_DEFAULT_REGION (and vice versa) for tools that
 * only read one of them.
 *
 * Returns the parsed env object for further use.
 */
export function loadAwsCredentials() {
  const env = readEnv();
  for (const key of AWS_CREDENTIAL_KEYS) {
    const value = env[key];
    if (value && !process.env[key] && !isPlaceholder(key, value)) {
      process.env[key] = value;
    }
  }
  if (process.env.AWS_REGION && !process.env.AWS_DEFAULT_REGION) {
    process.env.AWS_DEFAULT_REGION = process.env.AWS_REGION;
  } else if (process.env.AWS_DEFAULT_REGION && !process.env.AWS_REGION) {
    process.env.AWS_REGION = process.env.AWS_DEFAULT_REGION;
  }
  return env;
}

/**
 * Detect the untouched .env.example placeholder values so we can treat a
 * freshly-copied .env as "credentials not filled in yet".
 */
export function isPlaceholder(key, value) {
  const placeholders = {
    AWS_ACCESS_KEY_ID: 'your-access-key-id',
    AWS_SECRET_ACCESS_KEY: 'your-secret-access-key',
    AWS_SESSION_TOKEN: 'your-session-token-if-temporary',
  };
  return placeholders[key] === value;
}

/**
 * Are usable AWS credentials present in process.env? A placeholder session
 * token is ignored. Temporary credentials (with a real session token) are
 * fully supported.
 */
export function hasAwsCredentials() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      !isPlaceholder('AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID) &&
      !isPlaceholder('AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY),
  );
}

/**
 * Return the AWS_SESSION_TOKEN only if it is a real value (not the example
 * placeholder). Temporary sandbox credentials include one; permanent keys do not.
 */
export function sessionToken() {
  const token = process.env.AWS_SESSION_TOKEN;
  if (!token || isPlaceholder('AWS_SESSION_TOKEN', token)) return undefined;
  return token;
}

/**
 * Rewrite the repo-root .env, preserving the AWS workshop credentials and
 * writing the resolved VITE_* frontend configuration.
 *
 * `aws` holds the credential values to keep; `vite` holds the resolved
 * frontend configuration. The file is written atomically-ish (write then
 * nothing fancy) and secrets are never logged by this function.
 */
export function writeLocalEnv({ aws, vite }) {
  const region = aws.region || 'us-east-1';
  const sessionLine =
    aws.sessionToken && !isPlaceholder('AWS_SESSION_TOKEN', aws.sessionToken)
      ? `AWS_SESSION_TOKEN=${aws.sessionToken}`
      : 'AWS_SESSION_TOKEN=';

  const contents = `# Generated by scripts/setup.mjs for LOCAL development.
# Values resolved from deployed CloudFormation outputs. Do not commit this file.

# AWS Access Keys (workshop sandbox accounts — used by the AWS SDK / CDK)
AWS_ACCESS_KEY_ID=${aws.accessKeyId || ''}
AWS_SECRET_ACCESS_KEY=${aws.secretAccessKey || ''}
${sessionLine}
AWS_REGION=${region}

# AWS Cognito Authentication
VITE_COGNITO_USER_POOL_ID=${vite.userPoolId}
VITE_COGNITO_CLIENT_ID=${vite.clientId}
VITE_COGNITO_DOMAIN=${vite.cognitoDomain}

# Redirect URIs (OAuth 2.0 Authorization Code Flow with PKCE) — local dev
VITE_REDIRECT_URI=${vite.redirectUri}
VITE_LOGOUT_URI=${vite.logoutUri}

# API Gateway Configuration
VITE_API_URL=${vite.apiUrl || ''}
`;

  fs.writeFileSync(envFile, contents, 'utf8');
}
