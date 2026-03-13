/**
 * `uds validate` — Run token + WCAG + docs validation suite.
 *
 * Executes the same checks as `npm run check`:
 *   1. W3C DTCG token format validation
 *   2. WCAG 2.1 AA contrast audit
 *   3. HTML docs integrity check
 */

import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');

interface Step {
  label: string;
  binary: string;
  args: string[];
}

const STEPS: Step[] = [
  { label: 'W3C DTCG token format', binary: 'python3', args: ['scripts/validate-tokens.py'] },
  { label: 'WCAG 2.2 AA contrast', binary: 'python3', args: ['scripts/wcag-audit.py'] },
  {
    label: 'HTML docs integrity',
    binary: 'python3',
    args: ['scripts/verify-docs.py', '--file', 'docs/docs.html'],
  },
  { label: 'CSV cross-reference', binary: 'python3', args: ['src/data/_sync_all.py'] },
];

export async function validateCommand(): Promise<void> {
  console.log('\n  Universal Design System — Validation Suite\n');

  let passed = 0;
  let failed = 0;

  for (const step of STEPS) {
    process.stdout.write(`  ▸ ${step.label}... `);
    try {
      execFileSync(step.binary, step.args, { cwd: PROJECT_ROOT, stdio: 'pipe', timeout: 30_000 });
      console.log('✓ pass');
      passed++;
    } catch (err: unknown) {
      console.log('✗ FAIL');
      const execErr = err as { stderr?: Buffer };
      if (execErr.stderr) {
        const msg = execErr.stderr.toString().trim().split('\n').slice(0, 5).join('\n    ');
        console.log(`    ${msg}`);
      }
      failed++;
    }
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}
