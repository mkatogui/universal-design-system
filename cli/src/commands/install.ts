/**
 * Install command — copies the design system skill
 * into the target platform's expected location.
 */

import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ANSI colors
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the package root (cli/) regardless of dist/ nesting
const CLI_ROOT = resolve(__dirname, "..", "..");
const PKG_ROOT = resolve(CLI_ROOT, "..");

interface PlatformConfig {
  name: string;
  skillDir: string;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  claude: { name: "Claude Code", skillDir: ".claude/skills/universal-design-system" },
  cursor: { name: "Cursor", skillDir: ".cursor/skills/universal-design-system" },
  windsurf: { name: "Windsurf", skillDir: ".windsurf/skills/universal-design-system" },
  vscode: { name: "VS Code (Copilot)", skillDir: ".github/copilot-instructions/universal-design-system" },
  zed: { name: "Zed", skillDir: ".zed/skills/universal-design-system" },
  aider: { name: "Aider", skillDir: ".aider/skills/universal-design-system" },
  cline: { name: "Cline", skillDir: ".cline/skills/universal-design-system" },
  continue: { name: "Continue", skillDir: ".continue/skills/universal-design-system" },
  bolt: { name: "Bolt", skillDir: ".bolt/skills/universal-design-system" },
  lovable: { name: "Lovable", skillDir: ".lovable/skills/universal-design-system" },
  replit: { name: "Replit Agent", skillDir: ".replit/skills/universal-design-system" },
  codex: { name: "OpenAI Codex", skillDir: ".codex/skills/universal-design-system" },
  kiro: { name: "Kiro", skillDir: ".kiro/skills/universal-design-system" },
  gemini: { name: "Gemini CLI", skillDir: ".gemini/skills/universal-design-system" },
  qoder: { name: "Qoder", skillDir: ".qoder/skills/universal-design-system" },
  roocode: { name: "Roo Code", skillDir: ".roocode/skills/universal-design-system" },
  trae: { name: "Trae", skillDir: ".trae/skills/universal-design-system" },
  opencode: { name: "OpenCode", skillDir: ".opencode/skills/universal-design-system" },
  copilot: { name: "GitHub Copilot", skillDir: ".github/copilot-instructions/universal-design-system" },
  droid: { name: "Droid", skillDir: ".factory/skills/universal-design-system" },
};

function detectPlatform(dir: string): string | null {
  const checks: [string, string][] = [
    [".claude", "claude"],
    [".cursor", "cursor"],
    [".windsurf", "windsurf"],
    [".zed", "zed"],
    [".aider", "aider"],
    [".cline", "cline"],
    [".continue", "continue"],
    [".bolt", "bolt"],
    [".lovable", "lovable"],
    [".replit", "replit"],
    [".codex", "codex"],
    [".kiro", "kiro"],
    [".gemini", "gemini"],
    [".qoder", "qoder"],
    [".roocode", "roocode"],
    [".trae", "trae"],
    [".opencode", "opencode"],
    [".factory", "droid"],
    [".github/copilot-instructions", "vscode"],
  ];

  for (const [marker, platform] of checks) {
    if (existsSync(join(dir, marker))) {
      return platform;
    }
  }

  return null;
}

export interface InstallOptions {
  platform?: string;
  dir: string;
  dryRun?: boolean;
}

export async function installCommand(options: InstallOptions): Promise<void> {
  const targetDir = resolve(options.dir);
  const platform = options.platform || detectPlatform(targetDir) || "claude";
  const config = PLATFORMS[platform];

  if (!config) {
    console.error(
      red(`  Unknown platform: ${platform}`),
      `\n  Available: ${Object.keys(PLATFORMS).join(", ")}`,
    );
    process.exit(1);
  }

  console.log(bold(`\n  Universal Design System Installer`));
  console.log(dim(`  Target: ${config.name}`));
  console.log(dim(`  Dir:    ${targetDir}\n`));

  const skillDir = join(targetDir, config.skillDir);
  const dataDir = join(skillDir, "data");
  const scriptsDir = join(skillDir, "scripts");

  const srcSkill = join(PKG_ROOT, ".claude", "skills", "universal-design-system", "SKILL.md");
  const srcData = join(PKG_ROOT, "src", "data");
  const srcScripts = join(PKG_ROOT, "src", "scripts");
  const srcTokens = join(PKG_ROOT, "tokens");

  // Verify source files exist
  if (!existsSync(srcSkill)) {
    console.error(red("  SKILL.md not found. Is the package installed correctly?"));
    process.exit(1);
  }

  // Detect if running from within the UDS package itself
  if (resolve(targetDir) === resolve(PKG_ROOT)) {
    console.log(green("  Already inside the Universal Design System project."));
    console.log(dim("  No files need to be copied — everything is already in place.\n"));
    return;
  }

  if (options.dryRun) {
    console.log(yellow("  [DRY RUN] Would create:"));
    console.log(`    ${skillDir}/SKILL.md`);
    console.log(`    ${dataDir}/ (14 CSV databases)`);
    console.log(`    ${scriptsDir}/ (3 Python scripts)`);
    if (existsSync(srcTokens)) {
      console.log(`    ${join(targetDir, "tokens")}/ (design tokens)`);
    }
    console.log(yellow("\n  No changes made."));
    return;
  }

  // Create directories
  mkdirSync(skillDir, { recursive: true });
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(scriptsDir, { recursive: true });

  // Copy SKILL.md
  cpSync(srcSkill, join(skillDir, "SKILL.md"));
  console.log(green("  +") + " SKILL.md");

  // Copy data files (including subdirectories like stacks/)
  let dataCount = 0;
  if (existsSync(srcData)) {
    const entries = readdirSync(srcData);
    for (const entry of entries) {
      const src = join(srcData, entry);
      const dest = join(dataDir, entry);
      if (statSync(src).isDirectory()) {
        cpSync(src, dest, { recursive: true });
      } else {
        cpSync(src, dest);
      }
      dataCount++;
    }
  }
  console.log(green("  +") + ` data/ (${dataCount} entries)`);

  // Copy Python scripts
  let scriptCount = 0;
  if (existsSync(srcScripts)) {
    const entries = readdirSync(srcScripts);
    for (const entry of entries) {
      const src = join(srcScripts, entry);
      const dest = join(scriptsDir, entry);
      if (statSync(src).isDirectory()) {
        cpSync(src, dest, { recursive: true });
      } else {
        cpSync(src, dest);
      }
      scriptCount++;
    }
  }
  console.log(green("  +") + ` scripts/ (${scriptCount} entries)`);

  // Copy tokens if they don't exist in target
  const targetTokens = join(targetDir, "tokens");
  if (existsSync(srcTokens) && !existsSync(targetTokens)) {
    cpSync(srcTokens, targetTokens, { recursive: true });
    console.log(green("  +") + " tokens/");
  }

  // Summary
  console.log(bold(green(`\n  Installed for ${config.name}`)));
  console.log(dim(`  Location: ${skillDir}`));
  console.log(dim(`  Search:   python ${scriptsDir}/search.py "your query"\n`));
}
