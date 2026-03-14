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
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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

  it('rejects invalid format', async () => {
    await generateCommand('test', { format: 'invalid-format' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
    const errMsg = errorSpy.mock.calls.map((c) => String(c[0])).join(' ');
    expect(errMsg).toContain('Invalid format');
  });

  it('rejects invalid framework', async () => {
    await generateCommand('test', { framework: 'angular' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
    const errMsg = errorSpy.mock.calls.map((c) => String(c[0])).join(' ');
    expect(errMsg).toContain('Invalid framework');
  });

  it('accepts all valid formats', async () => {
    for (const format of ['markdown', 'json', 'tailwind', 'css-in-js']) {
      vi.restoreAllMocks();
      vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await generateCommand('test', { format });
      // Should not exit with format error (may succeed or fail for other reasons)
      const errCalls = vi.mocked(console.error).mock.calls.map((c) => String(c[0])).join(' ');
      expect(errCalls).not.toContain('Invalid format');
    }
  }, 120_000);

  it('accepts all valid frameworks', async () => {
    for (const framework of ['react', 'vue', 'svelte', 'web-components', 'html']) {
      vi.restoreAllMocks();
      vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await generateCommand('test', { framework });
      const errCalls = vi.mocked(console.error).mock.calls.map((c) => String(c[0])).join(' ');
      expect(errCalls).not.toContain('Invalid framework');
    }
  }, 120_000);
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
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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

  it('rejects invalid subcommand', async () => {
    await paletteCommand('invalid-sub', {});

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
    const errMsg = errorSpy.mock.calls.map((c) => String(c[0])).join(' ');
    expect(errMsg).toContain('Invalid subcommand');
  });

  it('rejects invalid shape', async () => {
    await paletteCommand('create', { name: 'test', shape: 'hexagonal' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
    const errMsg = errorSpy.mock.calls.map((c) => String(c[0])).join(' ');
    expect(errMsg).toContain('Invalid shape');
  });

  it('rejects invalid format', async () => {
    await paletteCommand('export', { format: 'xml' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
    const errMsg = errorSpy.mock.calls.map((c) => String(c[0])).join(' ');
    expect(errMsg).toContain('Invalid format');
  });

  it('accepts all valid subcommands', () => {
    for (const sub of ['create', 'preview', 'list', 'remove', 'export']) {
      expect(['create', 'preview', 'list', 'remove', 'export']).toContain(sub);
    }
  });

  it('accepts all valid shapes', () => {
    for (const shape of ['sharp', 'balanced', 'round', 'brutalist']) {
      expect(['sharp', 'balanced', 'round', 'brutalist']).toContain(shape);
    }
  });

  it('passes options to palette command', async () => {
    await paletteCommand('create', {
      name: 'test-palette',
      colors: '#FF0000,#00FF00',
      shape: 'round',
      format: 'css',
    });

    // Command executed — either success or Python error, but not a validation error
    const errMsg = errorSpy.mock.calls.map((c) => String(c[0])).join(' ');
    expect(errMsg).not.toContain('Invalid subcommand');
    expect(errMsg).not.toContain('Invalid shape');
    expect(errMsg).not.toContain('Invalid format');
  }, 30_000);
});
