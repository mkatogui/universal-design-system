#!/usr/bin/env node
/**
 * Syncs .claude/ (skills, agents, commands) to plugins/universal-design-system/.
 * Single source of truth: .claude/. Run after editing skills/agents/commands.
 * Used by: npm run build:plugin
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

const SRC_SKILLS = join(PKG_ROOT, '.claude', 'skills');
const SRC_AGENTS = join(PKG_ROOT, '.claude', 'agents');
const SRC_COMMANDS = join(PKG_ROOT, '.claude', 'commands');
const SRC_DATA = join(PKG_ROOT, 'src', 'data');
const SRC_SCRIPTS = join(PKG_ROOT, 'src', 'scripts');

const DEST_PLUGIN = join(PKG_ROOT, 'plugins', 'universal-design-system');
const DEST_SKILLS = join(DEST_PLUGIN, 'skills');
const DEST_AGENTS = join(DEST_PLUGIN, 'agents');
const DEST_COMMANDS = join(DEST_PLUGIN, 'commands');
const DEST_CLAUDE_PLUGIN = join(DEST_PLUGIN, '.claude-plugin');

function copyDirRecursive(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

function getSkillNames() {
  if (!existsSync(SRC_SKILLS)) return [];
  return readdirSync(SRC_SKILLS).filter((name) => {
    const skillDir = join(SRC_SKILLS, name);
    return statSync(skillDir).isDirectory() && existsSync(join(skillDir, 'SKILL.md'));
  });
}

// ── Skills ──
mkdirSync(DEST_SKILLS, { recursive: true });
const skillNames = getSkillNames();
for (const name of skillNames) {
  const srcSkillDir = join(SRC_SKILLS, name);
  const destSkillDir = join(DEST_SKILLS, name);
  if (name === 'universal-design-system') {
    // Copy skill dir but skip data/scripts (replaced by repo src/data and src/scripts)
    mkdirSync(destSkillDir, { recursive: true });
    for (const entry of readdirSync(srcSkillDir)) {
      if (entry === 'data' || entry === 'scripts') continue;
      const srcPath = join(srcSkillDir, entry);
      const destPath = join(destSkillDir, entry);
      if (statSync(srcPath).isDirectory()) {
        copyDirRecursive(srcPath, destPath);
      } else {
        cpSync(srcPath, destPath);
      }
    }
    copyDirRecursive(SRC_DATA, join(destSkillDir, 'data'));
    copyDirRecursive(SRC_SCRIPTS, join(destSkillDir, 'scripts'));
  } else {
    copyDirRecursive(srcSkillDir, destSkillDir);
  }
  console.log(`  + ${name}`);
}

// ── Agents ──
if (existsSync(SRC_AGENTS)) {
  mkdirSync(DEST_AGENTS, { recursive: true });
  for (const file of readdirSync(SRC_AGENTS)) {
    if (!file.endsWith('.md')) continue;
    cpSync(join(SRC_AGENTS, file), join(DEST_AGENTS, file));
    console.log(`  + agents/${file}`);
  }
}

// ── Commands ──
if (existsSync(SRC_COMMANDS)) {
  mkdirSync(DEST_COMMANDS, { recursive: true });
  for (const file of readdirSync(SRC_COMMANDS)) {
    if (!file.endsWith('.md')) continue;
    cpSync(join(SRC_COMMANDS, file), join(DEST_COMMANDS, file));
    console.log(`  + commands/${file}`);
  }
}

// ── .claude-plugin/plugin.json ──
const pkgPath = join(PKG_ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const author = pkg.author;
const pluginManifest = {
  name: 'universal-design-system',
  description:
    pkg.description ||
    'AI-native design system that reasons about your product. 9 palettes, 600 design tokens, 43 accessible components, BM25 search engine across 20 databases, 190 industry rules, and automated WCAG validation.',
  version: pkg.version || '0.6.0',
  author:
    typeof author === 'string'
      ? { name: author }
      : author && typeof author === 'object'
        ? { name: author.name || 'mkatogui', email: author.email }
        : { name: 'mkatogui' },
};
mkdirSync(DEST_CLAUDE_PLUGIN, { recursive: true });
writeFileSync(join(DEST_CLAUDE_PLUGIN, 'plugin.json'), `${JSON.stringify(pluginManifest, null, 2)}\n`);
console.log('  + .claude-plugin/plugin.json');

console.log('\nDone. plugins/universal-design-system/ is in sync with .claude/.');
