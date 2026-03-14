/**
 * Generate command — produces a full design system specification.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = resolve(__dirname, '..', '..');
const PKG_ROOT = resolve(CLI_ROOT, '..');

interface GenerateOptions {
  format?: string;
  framework?: string;
}

const VALID_FORMATS = ['markdown', 'json', 'tailwind', 'css-in-js'] as const;
const VALID_FRAMEWORKS = ['react', 'vue', 'svelte', 'web-components', 'html'] as const;

export async function generateCommand(query: string, options: GenerateOptions): Promise<void> {
  const script = join(PKG_ROOT, 'src', 'scripts', 'design_system.py');

  if (!existsSync(script)) {
    console.error(red('  Design system generator not found.'));
    process.exit(1);
  }

  if (options.format && !VALID_FORMATS.includes(options.format as (typeof VALID_FORMATS)[number])) {
    console.error(red(`  Invalid format: ${options.format}. Valid: ${VALID_FORMATS.join(', ')}`));
    process.exit(1);
  }

  if (
    options.framework &&
    !VALID_FRAMEWORKS.includes(options.framework as (typeof VALID_FRAMEWORKS)[number])
  ) {
    console.error(
      red(`  Invalid framework: ${options.framework}. Valid: ${VALID_FRAMEWORKS.join(', ')}`),
    );
    process.exit(1);
  }

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

  const args: string[] = [script, query];
  if (options.format) args.push('--format', options.format);
  if (options.framework) args.push('--framework', options.framework);

  try {
    const result = execFileSync(python, args, {
      encoding: 'utf-8',
      cwd: PKG_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log(result);
  } catch (err: unknown) {
    const error = err as { stderr?: string; status?: number };
    if (error.stderr) console.error(red(error.stderr));
    process.exit(error.status || 1);
  }
}

export async function tailwindCommand(query: string): Promise<void> {
  return generateCommand(query, { format: 'tailwind' });
}
