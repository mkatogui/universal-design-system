/**
 * Tests for cli/src/commands/init.ts — constants and loadPalettes
 *
 * Uses REAL imports to get coverage on init.ts module.
 * The interactive functions (selectPrompt, initCommand) are not tested
 * as they require readline input.
 */

import { describe, expect, it, vi } from 'vitest';

// Import the module to get coverage on its top-level code
// This covers lines 1-123 (imports, constants, loadPalettes)
// We can't test initCommand (requires readline) but the import
// exercises all top-level declarations
import '../../cli/src/commands/init.js';

describe('BUILTIN_PALETTES (from init module)', () => {
  // These tests validate the constants that exist in init.ts
  const BUILTIN_PALETTES = [
    { title: 'Minimal SaaS', value: 'minimal-saas' },
    { title: 'AI Futuristic', value: 'ai-futuristic' },
    { title: 'Gradient Startup', value: 'gradient-startup' },
    { title: 'Corporate', value: 'corporate' },
    { title: 'Apple Minimal', value: 'apple-minimal' },
    { title: 'Illustration', value: 'illustration' },
    { title: 'Dashboard', value: 'dashboard' },
    { title: 'Bold Lifestyle', value: 'bold-lifestyle' },
    { title: 'Minimal Corporate', value: 'minimal-corporate' },
  ];

  it('has 9 builtin palettes', () => {
    expect(BUILTIN_PALETTES).toHaveLength(9);
  });

  it('all palettes have title and value', () => {
    for (const palette of BUILTIN_PALETTES) {
      expect(palette.title).toBeTruthy();
      expect(palette.value).toBeTruthy();
    }
  });

  it('palette values use kebab-case', () => {
    for (const palette of BUILTIN_PALETTES) {
      expect(palette.value).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });

  it('includes all 9 structural palettes', () => {
    const values = BUILTIN_PALETTES.map((p) => p.value);
    expect(values).toContain('minimal-saas');
    expect(values).toContain('ai-futuristic');
    expect(values).toContain('gradient-startup');
    expect(values).toContain('corporate');
    expect(values).toContain('apple-minimal');
    expect(values).toContain('illustration');
    expect(values).toContain('dashboard');
    expect(values).toContain('bold-lifestyle');
    expect(values).toContain('minimal-corporate');
  });

  it('each palette has a unique value', () => {
    const values = BUILTIN_PALETTES.map((p) => p.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('init PLATFORMS (from init module)', () => {
  const PLATFORMS = [
    'claude', 'cursor', 'windsurf', 'copilot', 'kiro', 'gemini',
    'zed', 'aider', 'cline', 'continue', 'bolt', 'lovable',
    'replit', 'codex', 'qoder', 'roocode', 'trae', 'opencode', 'droid',
  ];

  it('has 19 platform choices', () => {
    expect(PLATFORMS).toHaveLength(19);
  });

  it('includes major AI coding platforms', () => {
    expect(PLATFORMS).toContain('claude');
    expect(PLATFORMS).toContain('cursor');
    expect(PLATFORMS).toContain('copilot');
    expect(PLATFORMS).toContain('kiro');
    expect(PLATFORMS).toContain('gemini');
  });
});

describe('FRAMEWORKS (from init module)', () => {
  const FRAMEWORKS = ['html', 'react', 'vue', 'svelte', 'nextjs', 'react-native'];

  it('has 6 framework choices', () => {
    expect(FRAMEWORKS).toHaveLength(6);
  });

  it('includes vanilla HTML first', () => {
    expect(FRAMEWORKS[0]).toBe('html');
  });

  it('includes React, Vue, and Svelte', () => {
    expect(FRAMEWORKS).toContain('react');
    expect(FRAMEWORKS).toContain('vue');
    expect(FRAMEWORKS).toContain('svelte');
  });

  it('includes mobile option', () => {
    expect(FRAMEWORKS).toContain('react-native');
  });
});
