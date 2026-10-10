// Cross-platform console/status output helpers for the workshop scripts.
//
// Keep output friendly and consistent across setup/deploy scripts. Colors are
// applied only when stdout is a TTY and the terminal is not explicitly opting
// out (NO_COLOR), so logs stay clean when redirected to a file or CI.

const useColor =
  process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== 'dumb';

const wrap = (code) => (text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text);

export const color = {
  bold: wrap('1'),
  dim: wrap('2'),
  red: wrap('31'),
  green: wrap('32'),
  yellow: wrap('33'),
  blue: wrap('34'),
  cyan: wrap('36'),
};

/** A top-level step heading, e.g. "📦 Installing dependencies...". */
export function step(message) {
  console.log(`${message}`);
}

/** An indented success line under a step. */
export function ok(message) {
  console.log(`  ${color.green('✓')} ${message}`);
}

/** An indented informational line under a step. */
export function info(message) {
  console.log(`  ${color.dim('↳')} ${message}`);
}

/** An indented in-progress line under a step. */
export function working(message) {
  console.log(`  ${color.dim('⏳')} ${message}`);
}

/** A skipped-step line. */
export function skipped(message) {
  console.log(`⏭️  ${message}`);
}

/** A warning line (non-fatal). */
export function warn(message) {
  console.warn(`${color.yellow('⚠️')}  ${message}`);
}

/** A blank line. */
export function blank() {
  console.log('');
}

/**
 * Print a short, actionable, workshop-friendly error and exit.
 *
 * Participants should see a clear message instead of a large stack trace. Pass
 * an array of hint lines to guide the next action.
 */
export function fail(message, hints = []) {
  console.error('');
  console.error(`${color.red('✖')} ${color.bold(message)}`);
  for (const hint of hints) {
    console.error(`  ${color.dim('→')} ${hint}`);
  }
  console.error('');
  process.exit(1);
}

/**
 * A heading for the final summary block.
 */
export function heading(message) {
  console.log(color.bold(message));
}
