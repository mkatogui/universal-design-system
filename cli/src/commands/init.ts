/**
 * Init command — interactive setup wizard.
 */

import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";
import { installCommand } from "./install.js";

const PALETTES = [
  { title: "Minimal SaaS", value: "minimal-saas", description: "Clean, professional — SaaS, productivity" },
  { title: "AI Futuristic", value: "ai-futuristic", description: "Dark, neon — AI products, dev tools" },
  { title: "Gradient Startup", value: "gradient-startup", description: "Bold, vibrant — Startups, MVPs" },
  { title: "Corporate", value: "corporate", description: "Conservative — Enterprise, B2B, regulated" },
  { title: "Apple Minimal", value: "apple-minimal", description: "Premium, diffused — Luxury brands" },
  { title: "Illustration", value: "illustration", description: "Playful, rounded — Education, kids" },
  { title: "Dashboard", value: "dashboard", description: "Data-dense — Analytics, admin panels" },
  { title: "Bold Lifestyle", value: "bold-lifestyle", description: "Hard edges — Fashion, media" },
  { title: "Minimal Corporate", value: "minimal-corporate", description: "Warm neutrals — Legal, consulting" },
];

const PLATFORMS = [
  { title: "Claude Code", value: "claude" },
  { title: "Cursor", value: "cursor" },
  { title: "Windsurf", value: "windsurf" },
  { title: "GitHub Copilot", value: "copilot" },
  { title: "Kiro", value: "kiro" },
  { title: "Gemini CLI", value: "gemini" },
  { title: "Zed", value: "zed" },
  { title: "Aider", value: "aider" },
  { title: "Cline", value: "cline" },
  { title: "Continue", value: "continue" },
  { title: "Bolt", value: "bolt" },
  { title: "Lovable", value: "lovable" },
  { title: "Replit", value: "replit" },
  { title: "OpenAI Codex", value: "codex" },
  { title: "Qoder", value: "qoder" },
  { title: "Roo Code", value: "roocode" },
  { title: "Trae", value: "trae" },
  { title: "OpenCode", value: "opencode" },
  { title: "Droid", value: "droid" },
];

export async function initCommand(): Promise<void> {
  console.log(chalk.bold("\n  Universal Design System — Setup Wizard\n"));
  console.log(chalk.dim("  9 Palettes · 496 Tokens · 31 Components · WCAG 2.1 AA\n"));

  const response = await prompts([
    {
      type: "select",
      name: "platform",
      message: "Which AI coding platform?",
      choices: PLATFORMS,
    },
    {
      type: "select",
      name: "palette",
      message: "Default palette?",
      choices: PALETTES,
    },
    {
      type: "select",
      name: "framework",
      message: "Primary framework?",
      choices: [
        { title: "HTML/CSS (vanilla)", value: "html" },
        { title: "React + Tailwind", value: "react" },
        { title: "Vue 3", value: "vue" },
        { title: "Svelte 5", value: "svelte" },
        { title: "Next.js", value: "nextjs" },
        { title: "React Native", value: "react-native" },
      ],
    },
  ]);

  if (!response.platform) {
    console.log(chalk.dim("\n  Setup cancelled.\n"));
    return;
  }

  const spinner = ora("Installing design system skill...").start();

  try {
    await installCommand({
      platform: response.platform,
      dir: ".",
    });
    spinner.succeed("Skill installed");
  } catch {
    spinner.fail("Installation failed");
    process.exit(1);
  }

  console.log(chalk.bold.green("\n  Setup complete!\n"));
  console.log(chalk.dim(`  Platform:  ${response.platform}`));
  console.log(chalk.dim(`  Palette:   ${response.palette}`));
  console.log(chalk.dim(`  Framework: ${response.framework}`));
  console.log();
  console.log(chalk.dim('  Try: uds search "your product idea"'));
  console.log(chalk.dim('  Try: uds generate "your product idea" --format tailwind'));
  console.log();
}
