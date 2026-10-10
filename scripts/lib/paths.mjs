// Cross-platform path resolution for the workshop scripts.
//
// Everything is derived from this module's own location so the scripts work no
// matter what the current working directory is, on Windows, macOS or Linux. No
// shell-specific `dirname`/`pwd` or Bash is involved.

import { fileURLToPath } from 'node:url';
import path from 'node:path';

// scripts/lib/paths.mjs -> repo root is two levels up.
const here = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to the repository root. */
export const repoRoot = path.resolve(here, '..', '..');

/** Absolute path to the CDK infrastructure workspace. */
export const infraDir = path.join(repoRoot, 'infra');

/** Absolute path to the frontend workspace. */
export const webDir = path.join(repoRoot, 'apps', 'web');

/** Absolute path to the built frontend output directory. */
export const webDistDir = path.join(webDir, 'dist');

/** Absolute path to the repo-root .env file (read by Vite via envDir). */
export const envFile = path.join(repoRoot, '.env');

/** Absolute path to the committed .env.example template. */
export const envExampleFile = path.join(repoRoot, '.env.example');
