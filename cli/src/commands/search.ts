/**
 * Search command — wraps the Python search engine for terminal use.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = resolve(__dirname, '..', '..');
const PKG_ROOT = resolve(CLI_ROOT, '..');

interface SearchOptions {
  verbose?: boolean;
  json?: boolean;
}

export async function searchCommand(query: string, options: SearchOptions): Promise<void> {
  const searchScript = join(PKG_ROOT, 'src', 'scripts', 'search.py');

  if (!existsSync(searchScript)) {
    console.error(red('  Search engine not found.'));
    console.error(dim(`  Expected: ${searchScript}`));
    process.exit(1);
  }

  // Check Python is available
  let python = 'python3';
  try {
    execFileSync(python, ['--version'], { stdio: 'ignore' });
  } catch {
    python = 'python';
    try {
      execFileSync(python, ['--version'], { stdio: 'ignore' });
    } catch {
      console.error(red('  Python 3 is required but not found.'));
      process.exit(1);
    }
  }

  const args: string[] = [searchScript, query];
  if (options.verbose) args.push('--verbose');
  if (options.json) args.push('--json');

  try {
    const result = execFileSync(python, args, {
      encoding: 'utf-8',
      cwd: PKG_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log(result);
  } catch (err: unknown) {
    const error = err as { stderr?: string; status?: number };
    if (error.stderr) {
      console.error(red(error.stderr));
    }
    process.exit(error.status || 1);
  }
}
