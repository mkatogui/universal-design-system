/**
 * Tests for cli/src/commands/install.ts
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installCommand } from '../../cli/src/commands/install.js';

class ExitError extends Error {
  code: number;
  constructor(code: number) {
    super(`process.exit(${code})`);
    this.code = code;
  }
}

describe('installCommand', () => {
  let tempDir: string;
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Use workspace-relative temp dir so sandboxed CI can create .cursor, .vscode, etc.
    const workspaceTmp = join(process.cwd(), 'tmp-uds-install');
    mkdirSync(workspaceTmp, { recursive: true });
    tempDir = mkdtempSync(join(workspaceTmp, 'run-'));
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new ExitError(code ?? 0);
    }) as never);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(tempDir, { recursive: true, force: true });
    const workspaceTmp = join(process.cwd(), 'tmp-uds-install');
    if (existsSync(workspaceTmp)) {
      rmSync(workspaceTmp, { recursive: true, force: true });
    }
  });

  it('throws for unknown platform', async () => {
    await expect(
      installCommand({ platform: 'nonexistent-platform', dir: tempDir }),
    ).rejects.toThrow(ExitError);
  });

  it('runs dry-run for claude', async () => {
    await installCommand({ platform: 'claude', dir: tempDir, dryRun: true });
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('runs dry-run for cursor', async () => {
    await installCommand({ platform: 'cursor', dir: tempDir, dryRun: true });
    const dryRunLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('DRY RUN'),
    );
    expect(dryRunLog).toBeDefined();
  });

  it('defaults to claude when no platform markers', async () => {
    await installCommand({ dir: tempDir, dryRun: true });
    const targetLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Claude Code'),
    );
    expect(targetLog).toBeDefined();
  });

  it('detects cursor platform from .cursor directory', async () => {
    mkdirSync(join(tempDir, '.cursor'));
    await installCommand({ dir: tempDir, dryRun: true });
    const targetLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Cursor'),
    );
    expect(targetLog).toBeDefined();
  });

  it('detects kiro platform from .kiro directory', async () => {
    mkdirSync(join(tempDir, '.kiro'));
    await installCommand({ dir: tempDir, dryRun: true });
    const targetLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Kiro'),
    );
    expect(targetLog).toBeDefined();
  });

  it('detects droid platform from .factory directory', async () => {
    mkdirSync(join(tempDir, '.factory'));
    await installCommand({ dir: tempDir, dryRun: true });
    const targetLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('Droid'),
    );
    expect(targetLog).toBeDefined();
  });

  it('supports all 20 platforms with dry-run', async () => {
    const platforms = [
      'claude', 'cursor', 'windsurf', 'vscode', 'zed', 'aider', 'cline',
      'continue', 'bolt', 'lovable', 'replit', 'codex', 'kiro', 'gemini',
      'qoder', 'roocode', 'trae', 'opencode', 'copilot', 'droid',
    ];
    for (const platform of platforms) {
      logSpy.mockClear();
      await installCommand({ platform, dir: tempDir, dryRun: true });
    }
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('installs files for claude platform (real copy)', async () => {
    await installCommand({ platform: 'claude', dir: tempDir });

    // Verify SKILL.md was copied
    const { existsSync } = await import('node:fs');
    const skillPath = join(tempDir, '.claude', 'skills', 'universal-design-system', 'SKILL.md');
    expect(existsSync(skillPath)).toBe(true);
  });

  it('copies data and scripts directories', async () => {
    await installCommand({ platform: 'cursor', dir: tempDir });

    const { existsSync } = await import('node:fs');
    const dataDir = join(tempDir, '.cursor', 'skills', 'universal-design-system', 'data');
    const scriptsDir = join(tempDir, '.cursor', 'skills', 'universal-design-system', 'scripts');
    expect(existsSync(dataDir)).toBe(true);
    expect(existsSync(scriptsDir)).toBe(true);
  });

  it('skips token copy if tokens already exist', async () => {
    // Create tokens dir in temp to trigger skip
    mkdirSync(join(tempDir, 'tokens'), { recursive: true });

    await installCommand({ platform: 'zed', dir: tempDir });

    // Should still install skill files
    const { existsSync } = await import('node:fs');
    const skillPath = join(tempDir, '.zed', 'skills', 'universal-design-system', 'SKILL.md');
    expect(existsSync(skillPath)).toBe(true);
  });

  it('writes Zed MCP config to .zed/settings.json with context_servers', async () => {
    await installCommand({ platform: 'zed', dir: tempDir });

    const { existsSync } = await import('node:fs');
    const settingsPath = join(tempDir, '.zed', 'settings.json');
    expect(existsSync(settingsPath)).toBe(true);

    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    expect(settings.context_servers).toBeDefined();
    expect(settings.context_servers['universal-design-system']).toEqual({
      source: 'custom',
      command: 'node',
      args: expect.any(Array),
      env: {},
    });
    expect(settings.context_servers['universal-design-system'].args).toHaveLength(1);
    expect(settings.context_servers['universal-design-system'].args[0]).toMatch(/index\.js$/);
  });

  it('writes Continue MCP config to .continue/mcpServers/universal-design-system.yaml', async () => {
    await installCommand({ platform: 'continue', dir: tempDir });

    const { existsSync } = await import('node:fs');
    const yamlPath = join(tempDir, '.continue', 'mcpServers', 'universal-design-system.yaml');
    expect(existsSync(yamlPath)).toBe(true);

    const yaml = readFileSync(yamlPath, 'utf-8');
    expect(yaml).toContain('name: Universal Design System MCP');
    expect(yaml).toContain('schema: v1');
    expect(yaml).toContain('mcpServers:');
    expect(yaml).toContain('command: node');
    expect(yaml).toMatch(/args:\s*\n\s+-\s+".*index\.js"/);
  });

  it('writes Cline MCP config to .cline_mcp_servers.json with mcpServers', async () => {
    await installCommand({ platform: 'cline', dir: tempDir });

    const { existsSync } = await import('node:fs');
    const configPath = join(tempDir, '.cline_mcp_servers.json');
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers['universal-design-system']).toEqual({
      command: 'node',
      args: expect.any(Array),
    });
    expect(config.mcpServers['universal-design-system'].args).toHaveLength(1);
    expect(config.mcpServers['universal-design-system'].args[0]).toMatch(/index\.js$/);
  });

  it('writes VS Code MCP config with "servers" key not mcpServers', async () => {
    await installCommand({ platform: 'vscode', dir: tempDir });

    const { existsSync } = await import('node:fs');
    const configPath = join(tempDir, '.vscode', 'mcp.json');
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(config.servers).toBeDefined();
    expect(config.mcpServers).toBeUndefined();
    expect(config.servers['universal-design-system']).toEqual({
      command: 'node',
      args: expect.any(Array),
    });
    expect(config.servers['universal-design-system'].args[0]).toMatch(/index\.js$/);
  });

  it('writes standard MCP config (mcpServers) for cursor', async () => {
    await installCommand({ platform: 'cursor', dir: tempDir });

    const { existsSync } = await import('node:fs');
    const configPath = join(tempDir, '.cursor', 'mcp.json');
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers['universal-design-system']).toBeDefined();
    expect(config.mcpServers['universal-design-system'].command).toBe('node');
    expect(config.mcpServers['universal-design-system'].args).toHaveLength(1);
  });
});
