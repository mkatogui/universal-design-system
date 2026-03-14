/**
 * Palette command — manage custom color palettes.
 * Delegates to src/scripts/palette.py via execSync.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

const __filename_p = fileURLToPath(import.meta.url);
const __dirname_p = dirname(__filename_p);
const CLI_ROOT = resolve(__dirname_p, '..', '..');
const PKG_ROOT = resolve(CLI_ROOT, '..');

export interface PaletteOptions {
  name?: string;
  colors?: string;
  shape?: string;
  format?: string;
}

const VALID_SUBCOMMANDS = ['create', 'preview', 'list', 'remove', 'export'] as const;
const VALID_SHAPES = ['sharp', 'balanced', 'round', 'brutalist'] as const;
const VALID_FORMATS = ['css', 'json'] as const;

function getPython(): string {
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
  return python;
}

export async function paletteCommand(subcommand: string, options: PaletteOptions): Promise<void> {
  const script = join(PKG_ROOT, 'src', 'scripts', 'palette.py');

  if (!existsSync(script)) {
    console.error(red('  Palette manager not found.'));
    process.exit(1);
  }

  if (!VALID_SUBCOMMANDS.includes(subcommand as (typeof VALID_SUBCOMMANDS)[number])) {
    console.error(
      red(`  Invalid subcommand: ${subcommand}. Valid: ${VALID_SUBCOMMANDS.join(', ')}`),
    );
    process.exit(1);
  }

  if (options.shape && !VALID_SHAPES.includes(options.shape as (typeof VALID_SHAPES)[number])) {
    console.error(red(`  Invalid shape: ${options.shape}. Valid: ${VALID_SHAPES.join(', ')}`));
    process.exit(1);
  }

  if (options.format && !VALID_FORMATS.includes(options.format as (typeof VALID_FORMATS)[number])) {
    console.error(red(`  Invalid format: ${options.format}. Valid: ${VALID_FORMATS.join(', ')}`));
    process.exit(1);
  }

  const python = getPython();
  const args: string[] = [script, subcommand];

  if (options.name) {
    args.push('--name', options.name);
  }
  if (options.colors) {
    args.push('--colors', JSON.stringify(options.colors));
  }
  if (options.shape) {
    args.push('--shape', options.shape);
  }
  if (options.format) {
    args.push('--format', options.format);
  }

  try {
    const result = execFileSync(python, args, {
      encoding: 'utf-8',
      cwd: PKG_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log(result);
  } catch (err: unknown) {
    const error = err as { stderr?: string; stdout?: string; status?: number };
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(red(error.stderr));
    process.exit(error.status || 1);
  }
}
