#!/usr/bin/env node
/**
 * Universal Design System CLI
 *
 * Install the design system skill into any AI coding platform,
 * or search the design system databases from the terminal.
 *
 * Usage:
 *   uds install              # Auto-detect platform
 *   uds install --platform cursor
 *   uds search "fintech dashboard"
 */

import { Command } from "commander";
import { installCommand } from "./commands/install.js";
import { searchCommand } from "./commands/search.js";
import { generateCommand, tailwindCommand } from "./commands/generate.js";
import { initCommand } from "./commands/init.js";

const program = new Command();

program
  .name("uds")
  .description("Universal Design System — CLI")
  .version("0.1.0");

program
  .command("install")
  .description("Install the design system skill into your AI coding platform")
  .option("-p, --platform <platform>", "Target platform (auto-detected if omitted)")
  .option("-d, --dir <directory>", "Target project directory", ".")
  .option("--dry-run", "Show what would be installed without making changes")
  .action(installCommand);

program
  .command("search <query>")
  .description("Search the design system databases")
  .option("-v, --verbose", "Show detailed results")
  .option("-j, --json", "Output as JSON")
  .action(searchCommand);

program
  .command("generate <query>")
  .description("Generate a full design system specification")
  .option("-f, --format <format>", "Output format (markdown, json, tailwind)", "markdown")
  .option("--framework <framework>", "Framework-specific output (react, vue, svelte)")
  .action(generateCommand);

program
  .command("tailwind <query>")
  .description("Generate a Tailwind CSS config from design system tokens")
  .action(tailwindCommand);

program
  .command("init")
  .description("Interactive setup — choose platform, palette, and framework")
  .action(initCommand);

program.parse();
