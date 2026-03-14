/**
 * Install command — copies skills, agents, commands, and MCP config
 * into the target platform's expected location.
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ANSI colors
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the package root (cli/) regardless of dist/ nesting
const CLI_ROOT = resolve(__dirname, '..', '..');
const PKG_ROOT = resolve(CLI_ROOT, '..');

type McpFormat = 'standard' | 'zed' | 'continue';

interface PlatformConfig {
  name: string;
  dotDir: string;
  skillDir: string;
  mcpConfig?: string;
  mcpFormat?: McpFormat;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  claude: {
    name: 'Claude Code',
    dotDir: '.claude',
    skillDir: '.claude/skills',
    mcpConfig: '.mcp.json',
  },
  cursor: {
    name: 'Cursor',
    dotDir: '.cursor',
    skillDir: '.cursor/skills',
    mcpConfig: '.cursor/mcp.json',
  },
  windsurf: {
    name: 'Windsurf',
    dotDir: '.windsurf',
    skillDir: '.windsurf/skills',
    mcpConfig: '.windsurf/mcp.json',
  },
  vscode: {
    name: 'VS Code (Copilot)',
    dotDir: '.github/copilot-instructions',
    skillDir: '.github/copilot-instructions',
    mcpConfig: '.vscode/mcp.json',
  },
  zed: {
    name: 'Zed',
    dotDir: '.zed',
    skillDir: '.zed/skills',
    mcpConfig: '.zed/settings.json',
    mcpFormat: 'zed',
  },
  aider: { name: 'Aider', dotDir: '.aider', skillDir: '.aider/skills' },
  cline: {
    name: 'Cline',
    dotDir: '.cline',
    skillDir: '.cline/skills',
    mcpConfig: '.cline_mcp_servers.json',
  },
  continue: {
    name: 'Continue',
    dotDir: '.continue',
    skillDir: '.continue/skills',
    mcpConfig: '.continue/mcpServers/universal-design-system.yaml',
    mcpFormat: 'continue',
  },
  bolt: { name: 'Bolt', dotDir: '.bolt', skillDir: '.bolt/skills' },
  lovable: { name: 'Lovable', dotDir: '.lovable', skillDir: '.lovable/skills' },
  replit: { name: 'Replit Agent', dotDir: '.replit', skillDir: '.replit/skills' },
  codex: { name: 'OpenAI Codex', dotDir: '.codex', skillDir: '.codex/skills' },
  kiro: { name: 'Kiro', dotDir: '.kiro', skillDir: '.kiro/skills' },
  gemini: { name: 'Gemini CLI', dotDir: '.gemini', skillDir: '.gemini/skills' },
  qoder: { name: 'Qoder', dotDir: '.qoder', skillDir: '.qoder/skills' },
  roocode: { name: 'Roo Code', dotDir: '.roocode', skillDir: '.roocode/skills' },
  trae: { name: 'Trae', dotDir: '.trae', skillDir: '.trae/skills' },
  opencode: { name: 'OpenCode', dotDir: '.opencode', skillDir: '.opencode/skills' },
  copilot: {
    name: 'GitHub Copilot',
    dotDir: '.github/copilot-instructions',
    skillDir: '.github/copilot-instructions',
    mcpConfig: '.vscode/mcp.json',
  },
  droid: { name: 'Droid', dotDir: '.factory', skillDir: '.factory/skills' },
};

/** Names of all skill directories to install */
const SKILL_NAMES = [
  'uds-getting-started',
  'universal-design-system',
  'brand-identity',
  'design-audit',
  'ui-styling',
  'slides-design',
  'pre-pr-review',
];

function detectPlatform(dir: string): string | null {
  const checks: [string, string][] = [
    ['.claude', 'claude'],
    ['.cursor', 'cursor'],
    ['.windsurf', 'windsurf'],
    ['.zed', 'zed'],
    ['.aider', 'aider'],
    ['.cline', 'cline'],
    ['.continue', 'continue'],
    ['.bolt', 'bolt'],
    ['.lovable', 'lovable'],
    ['.replit', 'replit'],
    ['.codex', 'codex'],
    ['.kiro', 'kiro'],
    ['.gemini', 'gemini'],
    ['.qoder', 'qoder'],
    ['.roocode', 'roocode'],
    ['.trae', 'trae'],
    ['.opencode', 'opencode'],
    ['.factory', 'droid'],
    ['.github/copilot-instructions', 'vscode'],
  ];

  for (const [marker, platform] of checks) {
    if (existsSync(join(dir, marker))) {
      return platform;
    }
  }

  return null;
}

/** Recursively copy a directory, counting files */
function copyDir(src: string, dest: string): number {
  if (!existsSync(src)) return 0;
  mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

/** Generate MCP server configuration for the platform */
function generateMcpConfig(targetDir: string, mcpConfigPath: string, mcpFormat?: McpFormat): void {
  const mcpServerPath = join(
    targetDir,
    'node_modules',
    '@mkatogui',
    'universal-design-system',
    'src',
    'mcp',
    'index.js',
  );
  const serverPath = existsSync(mcpServerPath)
    ? mcpServerPath
    : join(PKG_ROOT, 'src', 'mcp', 'index.js');

  const configFile = join(targetDir, mcpConfigPath);
  const configDir = dirname(configFile);
  mkdirSync(configDir, { recursive: true });

  if (mcpFormat === 'zed') {
    let settings: Record<string, unknown> = {};
    try {
      settings = JSON.parse(readFileSync(configFile, 'utf-8'));
    } catch {
      // New file
    }
    const contextServers = (settings.context_servers ?? {}) as Record<string, unknown>;
    if (!contextServers['universal-design-system']) {
      contextServers['universal-design-system'] = {
        source: 'custom',
        command: 'node',
        args: [serverPath],
        env: {},
      };
      settings.context_servers = contextServers;
      writeFileSync(configFile, `${JSON.stringify(settings, null, 2)}\n`);
    }
    return;
  }

  if (mcpFormat === 'continue') {
    const yamlPath = join(targetDir, mcpConfigPath);
    const pathArg = serverPath.replace(/\\/g, '/');
    const yaml = `name: Universal Design System MCP
version: 0.4.1
schema: v1
mcpServers:
  - name: universal-design-system
    command: node
    args:
      - "${pathArg}"
`;
    try {
      writeFileSync(yamlPath, yaml, { flag: 'wx' });
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code !== 'EEXIST') throw err;
    }
    return;
  }

  // Standard JSON (Claude, Cursor, Windsurf, VS Code)
  let config: Record<string, unknown> = {};
  try {
    config = JSON.parse(readFileSync(configFile, 'utf-8'));
  } catch {
    // File doesn't exist or is malformed
  }
  const useServersKey = mcpConfigPath.includes('vscode');
  const existing = (config.mcpServers ?? config.servers ?? {}) as Record<string, unknown>;
  if (!existing['universal-design-system']) {
    existing['universal-design-system'] = {
      command: 'node',
      args: [serverPath],
    };
    if (useServersKey) {
      config.servers = existing;
    } else {
      config.mcpServers = existing;
    }
    writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`);
  }
}

export interface InstallOptions {
  platform?: string;
  dir: string;
  dryRun?: boolean;
}

export async function installCommand(options: InstallOptions): Promise<void> {
  const targetDir = resolve(options.dir);
  const platform = options.platform || detectPlatform(targetDir) || 'claude';
  const config = PLATFORMS[platform];

  if (!config) {
    console.error(
      red(`  Unknown platform: ${platform}`),
      `\n  Available: ${Object.keys(PLATFORMS).join(', ')}`,
    );
    process.exit(1);
  }

  console.log(bold('\n  Universal Design System Installer'));
  console.log(dim(`  Target: ${config.name}`));
  console.log(dim(`  Dir:    ${targetDir}\n`));

  // Detect if running from within the UDS package itself
  if (resolve(targetDir) === resolve(PKG_ROOT)) {
    console.log(green('  Already inside the Universal Design System project.'));
    console.log(dim('  No files need to be copied — everything is already in place.\n'));
    return;
  }

  const srcSkillsBase = join(PKG_ROOT, '.claude', 'skills');
  const srcAgents = join(PKG_ROOT, '.claude', 'agents');
  const srcCommands = join(PKG_ROOT, '.claude', 'commands');
  const srcData = join(PKG_ROOT, 'src', 'data');
  const srcScripts = join(PKG_ROOT, 'src', 'scripts');
  const srcTokens = join(PKG_ROOT, 'tokens');

  if (options.dryRun) {
    console.log(yellow('  [DRY RUN] Would install:\n'));
    console.log(cyan('  Skills:'));
    for (const name of SKILL_NAMES) {
      const exists = existsSync(join(srcSkillsBase, name, 'SKILL.md'));
      console.log(`    ${exists ? green('+') : dim('?')} ${name}/SKILL.md`);
    }
    console.log(cyan('\n  Agents:'));
    if (existsSync(srcAgents)) {
      for (const f of readdirSync(srcAgents)) {
        console.log(`    ${green('+')} ${f}`);
      }
    }
    console.log(cyan('\n  Commands:'));
    if (existsSync(srcCommands)) {
      for (const f of readdirSync(srcCommands)) {
        console.log(`    ${green('+')} ${f}`);
      }
    }
    console.log(cyan('\n  Data:'));
    console.log(`    ${green('+')} data/ (20 CSV databases)`);
    console.log(`    ${green('+')} scripts/ (Python reasoning engine)`);
    if (existsSync(srcTokens)) {
      console.log(`    ${green('+')} tokens/ (design tokens)`);
    }
    if (config.mcpConfig) {
      console.log(cyan('\n  MCP:'));
      console.log(`    ${green('+')} ${config.mcpConfig} (MCP server config)`);
    }
    console.log(yellow('\n  No changes made.'));
    return;
  }

  // ── Install Skills ──
  console.log(cyan('  Skills'));
  let skillCount = 0;
  for (const name of SKILL_NAMES) {
    const srcSkillDir = join(srcSkillsBase, name);
    const srcSkillFile = join(srcSkillDir, 'SKILL.md');
    if (!existsSync(srcSkillFile)) continue;

    const destSkillDir = join(targetDir, config.skillDir, name);
    mkdirSync(destSkillDir, { recursive: true });

    // Copy SKILL.md
    cpSync(srcSkillFile, join(destSkillDir, 'SKILL.md'));

    // For the main skill, also copy data and scripts
    if (name === 'universal-design-system') {
      const destData = join(destSkillDir, 'data');
      const destScripts = join(destSkillDir, 'scripts');
      copyDir(srcData, destData);
      copyDir(srcScripts, destScripts);
    }

    skillCount++;
    console.log(`  ${green('+')} ${name}`);
  }

  // ── Install Agents ──
  console.log(cyan('\n  Agents'));
  let agentCount = 0;
  if (existsSync(srcAgents)) {
    const destAgents = join(targetDir, config.dotDir, 'agents');
    mkdirSync(destAgents, { recursive: true });
    for (const file of readdirSync(srcAgents)) {
      if (!file.endsWith('.md')) continue;
      cpSync(join(srcAgents, file), join(destAgents, file));
      agentCount++;
      const agentName = file.replace('.md', '');
      console.log(`  ${green('+')} ${agentName}`);
    }
  }

  // ── Install Commands ──
  console.log(cyan('\n  Commands'));
  let commandCount = 0;
  if (existsSync(srcCommands)) {
    const destCommands = join(targetDir, config.dotDir, 'commands');
    mkdirSync(destCommands, { recursive: true });
    for (const file of readdirSync(srcCommands)) {
      if (!file.endsWith('.md')) continue;
      cpSync(join(srcCommands, file), join(destCommands, file));
      commandCount++;
      const cmdName = file.replace('.md', '');
      console.log(`  ${green('+')} /${cmdName}`);
    }
  }

  // ── Copy Tokens ──
  const targetTokens = join(targetDir, 'tokens');
  if (existsSync(srcTokens) && !existsSync(targetTokens)) {
    cpSync(srcTokens, targetTokens, { recursive: true });
    console.log(cyan('\n  Tokens'));
    console.log(`  ${green('+')} tokens/`);
  }

  // ── Configure MCP Server ──
  if (config.mcpConfig) {
    console.log(cyan('\n  MCP Server'));
    generateMcpConfig(targetDir, config.mcpConfig, config.mcpFormat);
    console.log(`  ${green('+')} ${config.mcpConfig}`);
  }

  // ── Summary ──
  console.log(bold(green(`\n  Installed for ${config.name}`)));
  console.log(dim(`  ${skillCount} skills, ${agentCount} agents, ${commandCount} commands`));
  if (config.mcpConfig) {
    console.log(dim(`  MCP server configured in ${config.mcpConfig}`));
  }
  console.log(dim(`  Location: ${join(targetDir, config.dotDir)}`));

  // ── Quick Start ──
  console.log(bold('\n  Quick Start'));
  console.log(
    dim(
      '  Ask:       "how to use UDS skills" or "which skills are installed" (uds-getting-started skill)',
    ),
  );
  console.log(
    dim(
      `  Search:    python ${join(config.skillDir, 'universal-design-system', 'scripts', 'search.py')} "your query"`,
    ),
  );
  console.log(
    dim(
      '  Commands:  /pre-pr-review, /palette-sync, /a11y-fix, /align-metrics, /new-component, /docs-sync',
    ),
  );
  if (config.mcpConfig) {
    console.log(
      dim('  MCP tools: search_design_system, get_palette, get_component, generate_tokens'),
    );
  }
  console.log('');
}
