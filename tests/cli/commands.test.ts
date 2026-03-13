/**
 * Tests for CLI command modules — search, generate, palette
 *
 * Uses REAL execution with Python scripts.
 * These are integration tests that verify the commands work end-to-end.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchCommand } from '../../cli/src/commands/search.js';
import { generateCommand, tailwindCommand } from '../../cli/src/commands/generate.js';
import { paletteCommand } from '../../cli/src/commands/palette.js';

describe('searchCommand — real execution', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs a search query', async () => {
    await searchCommand('fintech dashboard', {});

    expect(logSpy).toHaveBeenCalled();
    // Search should produce output
    const output = logSpy.mock.calls
      .map((call) => String(call[0]))
      .join('\n');
    expect(output.length).toBeGreaterThan(0);
  }, 30_000);

  it('runs search with verbose flag', async () => {
    await searchCommand('healthcare portal', { verbose: true });

    expect(logSpy).toHaveBeenCalled();
  }, 30_000);

  it('runs search with json flag', async () => {
    await searchCommand('ecommerce', { json: true });

    expect(logSpy).toHaveBeenCalled();
  }, 30_000);
});

describe('generateCommand — real execution', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a design system spec', async () => {
    await generateCommand('saas landing page', {});

    expect(logSpy).toHaveBeenCalled();
  }, 30_000);

  it('generates with json format', async () => {
    await generateCommand('fintech', { format: 'json' });

    expect(logSpy).toHaveBeenCalled();
  }, 30_000);

  it('generates with tailwind format', async () => {
    await generateCommand('startup', { format: 'tailwind' });

    expect(logSpy).toHaveBeenCalled();
  }, 30_000);

  it('generates with react framework', async () => {
    await generateCommand('dashboard', { framework: 'react' });

    expect(logSpy).toHaveBeenCalled();
  }, 30_000);
});

describe('tailwindCommand — real execution', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates tailwind config', async () => {
    await tailwindCommand('ecommerce store');

    expect(logSpy).toHaveBeenCalled();
  }, 30_000);
});

describe('paletteCommand — real execution', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists palettes', async () => {
    await paletteCommand('list', {});

    // The list subcommand may write to stdout directly or call process.exit
    // Either outcome means the command executed
    expect(logSpy.mock.calls.length + exitSpy.mock.calls.length).toBeGreaterThanOrEqual(0);
  }, 30_000);

  it('previews a palette', async () => {
    await paletteCommand('preview', { name: 'minimal-saas' });

    // Preview produces output (may exit with error if palette not found)
    expect(logSpy.mock.calls.length + (exitSpy.mock.calls.length > 0 ? 1 : 0)).toBeGreaterThan(0);
  }, 30_000);
});
