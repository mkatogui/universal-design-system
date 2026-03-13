/**
 * Tests for cli/src/commands/validate.ts
 *
 * Uses REAL execution — runs actual Python validation scripts.
 * These are integration tests that verify the validation pipeline works.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateCommand } from '../../cli/src/commands/validate.js';

describe('validateCommand — real execution', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let writeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the validation suite', async () => {
    await validateCommand();

    // Should print the header
    const headerLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Validation Suite'),
    );
    expect(headerLog).toBeDefined();
  }, 60_000);

  it('prints results summary', async () => {
    await validateCommand();

    const resultLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Results'),
    );
    expect(resultLog).toBeDefined();
  }, 60_000);

  it('runs WCAG audit step', async () => {
    await validateCommand();

    const wcagCheck = writeSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('WCAG'),
    );
    expect(wcagCheck).toBeDefined();
  }, 60_000);

  it('runs token validation step', async () => {
    await validateCommand();

    const tokenCheck = writeSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('DTCG'),
    );
    expect(tokenCheck).toBeDefined();
  }, 60_000);
});
