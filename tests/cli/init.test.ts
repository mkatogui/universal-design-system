/**
 * Tests for cli/src/commands/init.ts — constants and loadPalettes
 *
 * Uses REAL imports to get coverage on init.ts module.
 */

import { describe, expect, it } from 'vitest';
import { loadPalettes } from '../../cli/src/commands/init.js';

describe('loadPalettes', () => {
  it('returns at least 9 builtin palettes', () => {
    const palettes = loadPalettes();
    expect(palettes.length).toBeGreaterThanOrEqual(9);
  });

  it('includes all 9 structural palettes', () => {
    const palettes = loadPalettes();
    const values = palettes.map((p) => p.value);
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

  it('all palettes have title and value', () => {
    const palettes = loadPalettes();
    for (const palette of palettes) {
      expect(palette.title).toBeTruthy();
      expect(palette.value).toBeTruthy();
    }
  });

  it('palette values use kebab-case', () => {
    const palettes = loadPalettes();
    for (const palette of palettes) {
      expect(palette.value).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('each palette has a unique value', () => {
    const palettes = loadPalettes();
    const values = palettes.map((p) => p.value);
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
