/**
 * `uds doctor` — Check system health.
 *
 * Verifies that the development environment and project files are
 * correctly set up: Python, Node, required files, token integrity,
 * and dataset integrity.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');

interface Check {
  label: string;
  fn: () => string | true;
}

function checkCommand(binary: string, args: string[]): string {
  try {
    return execFileSync(binary, args, { encoding: 'utf-8', timeout: 10_000 }).trim();
  } catch {
    return '';
  }
}

function fileExists(rel: string): boolean {
  return existsSync(resolve(PROJECT_ROOT, rel));
}

const CHECKS: Check[] = [
  {
    label: 'Python 3',
    fn: () => {
      const ver = checkCommand('python3', ['--version']);
      return ver ? ver : 'python3 not found — install Python 3.8+';
    },
  },
  {
    label: 'Node.js',
    fn: () => {
      const ver = checkCommand('node', ['--version']);
      return ver ? `Node.js ${ver}` : 'node not found';
    },
  },
  {
    label: 'design-tokens.json',
    fn: () => {
      if (!fileExists('tokens/design-tokens.json')) return 'MISSING: tokens/design-tokens.json';
      try {
        const raw = readFileSync(resolve(PROJECT_ROOT, 'tokens/design-tokens.json'), 'utf-8');
        const json = JSON.parse(raw);
        const hasTheme = json.theme && typeof json.theme === 'object';
        const paletteCount = hasTheme ? Object.keys(json.theme).length : 0;
        return hasTheme
          ? `valid JSON, ${paletteCount} palettes in theme`
          : 'valid JSON but missing theme section';
      } catch {
        return 'INVALID: failed to parse JSON';
      }
    },
  },
  {
    label: 'palette-registry.json',
    fn: () => {
      if (!fileExists('tokens/palette-registry.json'))
        return 'MISSING: tokens/palette-registry.json';
      try {
        const raw = readFileSync(resolve(PROJECT_ROOT, 'tokens/palette-registry.json'), 'utf-8');
        const json = JSON.parse(raw);
        const count = Array.isArray(json.builtin) ? json.builtin.length : 0;
        return `${count} builtin palettes`;
      } catch {
        return 'INVALID: failed to parse';
      }
    },
  },
  {
    label: 'CSV databases',
    fn: () => {
      const csvDir = resolve(PROJECT_ROOT, 'src', 'data');
      const expected = [
        'products.csv',
        'components.csv',
        'ui-reasoning.csv',
        'anti-patterns.csv',
        'typography.csv',
        'styles.csv',
        'colors.csv',
        'patterns.csv',
        'google-fonts.csv',
        'icons.csv',
        'landing.csv',
        'charts.csv',
        'ux-guidelines.csv',
        'app-interface.csv',
        'react-performance.csv',
      ];
      const missing = expected.filter((f) => !existsSync(resolve(csvDir, f)));
      if (missing.length > 0) return `MISSING: ${missing.join(', ')}`;
      return `${expected.length} main CSVs present`;
    },
  },
  {
    label: 'Validation scripts',
    fn: () => {
      const scripts = [
        'scripts/validate-tokens.py',
        'scripts/wcag-audit.py',
        'scripts/verify-docs.py',
      ];
      const missing = scripts.filter((s) => !fileExists(s));
      if (missing.length > 0) return `MISSING: ${missing.join(', ')}`;
      return true;
    },
  },
  {
    label: 'Style Dictionary',
    fn: () => {
      if (!fileExists('node_modules/style-dictionary')) return 'not installed — run npm install';
      return true;
    },
  },
  {
    label: 'CLI compilation',
    fn: () => {
      if (!fileExists('cli/dist/index.js')) return 'not built — run npm run build:cli';
      return true;
    },
  },
];

export async function doctorCommand(): Promise<void> {
  console.log('\n  Universal Design System — Doctor\n');

  let issues = 0;

  for (const check of CHECKS) {
    process.stdout.write(`  ▸ ${check.label}... `);
    const result = check.fn();
    if (result === true) {
      console.log('✓ ok');
    } else if (
      result.startsWith('MISSING') ||
      result.startsWith('INVALID') ||
      result.includes('not found') ||
      result.includes('not installed') ||
      result.includes('not built')
    ) {
      console.log(`✗ ${result}`);
      issues++;
    } else {
      console.log(`✓ ${result}`);
    }
  }

  const summary = issues === 0 ? 'All checks passed.' : `${issues} issue(s) found.`;
  console.log(`\n  ${summary}\n`);

  if (issues > 0) {
    process.exit(1);
  }
}
