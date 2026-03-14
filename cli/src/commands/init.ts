/**
 * Init command — interactive setup wizard.
 * Uses Node.js built-in readline (zero dependencies).
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { installCommand } from './install.js';

const __filename_init = fileURLToPath(import.meta.url);
const __dirname_init = dirname(__filename_init);
const CLI_ROOT = resolve(__dirname_init, '..', '..');
const PKG_ROOT = resolve(CLI_ROOT, '..');

// ANSI helpers
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;

interface Choice {
  title: string;
  value: string;
  description?: string;
}

const BUILTIN_PALETTES: Choice[] = [
  {
    title: 'Minimal SaaS',
    value: 'minimal-saas',
    description: 'Clean, professional — SaaS, productivity',
  },
  {
    title: 'AI Futuristic',
    value: 'ai-futuristic',
    description: 'Dark, neon — AI products, dev tools',
  },
  {
    title: 'Gradient Startup',
    value: 'gradient-startup',
    description: 'Bold, vibrant — Startups, MVPs',
  },
  {
    title: 'Corporate',
    value: 'corporate',
    description: 'Conservative — Enterprise, B2B, regulated',
  },
  {
    title: 'Apple Minimal',
    value: 'apple-minimal',
    description: 'Premium, diffused — Luxury brands',
  },
  {
    title: 'Illustration',
    value: 'illustration',
    description: 'Playful, rounded — Education, kids',
  },
  { title: 'Dashboard', value: 'dashboard', description: 'Data-dense — Analytics, admin panels' },
  { title: 'Bold Lifestyle', value: 'bold-lifestyle', description: 'Hard edges — Fashion, media' },
  {
    title: 'Minimal Corporate',
    value: 'minimal-corporate',
    description: 'Warm neutrals — Legal, consulting',
  },
];

export function loadPalettes(): Choice[] {
  const palettes = [...BUILTIN_PALETTES];
  try {
    const registryPath = resolve(PKG_ROOT, 'tokens', 'palette-registry.json');
    if (existsSync(registryPath)) {
      const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
      const custom = registry.custom || [];
      for (const p of custom) {
        const name = p.name as string;
        const title = name
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        palettes.push({
          title: `${title} (custom)`,
          value: name,
          description: `Custom palette — ${(p.source_colors || []).join(', ')}`,
        });
      }
    }
  } catch {
    /* fallback to built-in only */
  }
  return palettes;
}

const PLATFORMS: Choice[] = [
  { title: 'Claude Code', value: 'claude' },
  { title: 'Cursor', value: 'cursor' },
  { title: 'Windsurf', value: 'windsurf' },
  { title: 'GitHub Copilot', value: 'copilot' },
  { title: 'Kiro', value: 'kiro' },
  { title: 'Gemini CLI', value: 'gemini' },
  { title: 'Zed', value: 'zed' },
  { title: 'Aider', value: 'aider' },
  { title: 'Cline', value: 'cline' },
  { title: 'Continue', value: 'continue' },
  { title: 'Bolt', value: 'bolt' },
  { title: 'Lovable', value: 'lovable' },
  { title: 'Replit', value: 'replit' },
  { title: 'OpenAI Codex', value: 'codex' },
  { title: 'Qoder', value: 'qoder' },
  { title: 'Roo Code', value: 'roocode' },
  { title: 'Trae', value: 'trae' },
  { title: 'OpenCode', value: 'opencode' },
  { title: 'Droid', value: 'droid' },
];

const FRAMEWORKS: Choice[] = [
  { title: 'HTML/CSS (vanilla)', value: 'html' },
  { title: 'React + Tailwind', value: 'react' },
  { title: 'Vue 3', value: 'vue' },
  { title: 'Svelte 5', value: 'svelte' },
  { title: 'Next.js', value: 'nextjs' },
  { title: 'React Native', value: 'react-native' },
];

async function selectPrompt(message: string, choices: Choice[]): Promise<string | null> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log(`\n  ${bold(message)}\n`);
  choices.forEach((c, i) => {
    const desc = c.description ? dim(` — ${c.description}`) : '';
    console.log(`    ${dim(`${i + 1}.`)} ${c.title}${desc}`);
  });
  console.log();

  return new Promise((resolve) => {
    rl.question(`  Enter number (1-${choices.length}): `, (answer) => {
      rl.close();
      const num = Number.parseInt(answer.trim(), 10);
      if (num >= 1 && num <= choices.length) {
        resolve(choices[num - 1].value);
      } else {
        resolve(null);
      }
    });
  });
}

export async function initCommand(): Promise<void> {
  console.log(bold('\n  Universal Design System — Setup Wizard'));
  console.log(dim('  9 Palettes · 600 Tokens · 43 Components · WCAG 2.1 AA\n'));

  const platform = await selectPrompt('Which AI coding platform?', PLATFORMS);
  if (!platform) {
    console.log(dim('\n  Setup cancelled.\n'));
    return;
  }

  const palette = await selectPrompt('Default palette?', loadPalettes());
  if (!palette) {
    console.log(dim('\n  Setup cancelled.\n'));
    return;
  }

  const framework = await selectPrompt('Primary framework?', FRAMEWORKS);
  if (!framework) {
    console.log(dim('\n  Setup cancelled.\n'));
    return;
  }

  console.log(dim('\n  Installing design system skill...'));

  try {
    await installCommand({
      platform,
      dir: '.',
    });
  } catch {
    console.error('\x1b[31m  Installation failed\x1b[0m');
    process.exit(1);
  }

  console.log(bold(green('\n  Setup complete!\n')));
  console.log(dim(`  Platform:  ${platform}`));
  console.log(dim(`  Palette:   ${palette}`));
  console.log(dim(`  Framework: ${framework}`));
  console.log();
  console.log(dim('  Try: uds search "your product idea"'));
  console.log(dim('  Try: uds generate "your product idea" --format tailwind'));
  console.log();
}
