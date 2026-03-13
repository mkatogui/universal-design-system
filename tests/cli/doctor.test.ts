/**
 * Tests for cli/src/commands/doctor.ts
 *
 * Uses REAL execution — no mocking of node built-ins.
 * The doctor command checks for Python, Node, and project files,
 * all of which exist in the development environment.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { doctorCommand } from '../../cli/src/commands/doctor.js';

describe('doctorCommand — real execution', () => {
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

  it('runs all health checks', async () => {
    await doctorCommand();

    // Should print the header
    const headerLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Doctor'),
    );
    expect(headerLog).toBeDefined();

    // Should print check results (stdout.write is used for labels)
    expect(writeSpy).toHaveBeenCalled();
  });

  it('prints results summary', async () => {
    await doctorCommand();

    const resultLog = logSpy.mock.calls.find(
      (call) =>
        typeof call[0] === 'string' &&
        (call[0].includes('passed') || call[0].includes('issue')),
    );
    expect(resultLog).toBeDefined();
  });

  it('checks Python 3', async () => {
    await doctorCommand();

    const pythonCheck = writeSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Python'),
    );
    expect(pythonCheck).toBeDefined();
  });

  it('checks Node.js', async () => {
    await doctorCommand();

    const nodeCheck = writeSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Node'),
    );
    expect(nodeCheck).toBeDefined();
  });

  it('checks design-tokens.json', async () => {
    await doctorCommand();

    const tokenCheck = writeSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('design-tokens'),
    );
    expect(tokenCheck).toBeDefined();
  });

  it('checks CSV databases', async () => {
    await doctorCommand();

    const csvCheck = writeSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('CSV'),
    );
    expect(csvCheck).toBeDefined();
  });
});
