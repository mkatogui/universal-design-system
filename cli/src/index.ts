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

import { installCommand } from "./commands/install.js";
import { searchCommand } from "./commands/search.js";
import { generateCommand, tailwindCommand } from "./commands/generate.js";
import { initCommand } from "./commands/init.js";
import { paletteCommand } from "./commands/palette.js";

const VERSION = "0.1.1";

function parseArgs(args: string[]): { command: string; positional: string[]; flags: Record<string, string | boolean> } {
  let command = "";
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    // First non-flag arg is the command
    if (!command && !args[i].startsWith("-")) {
      command = args[i];
      continue;
    }
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, flags };
}

function showHelp(): void {
  console.log(`
  Universal Design System — CLI  v${VERSION}

  Usage: uds <command> [options]

  Commands:
    install              Install the design system skill into your AI coding platform
    search <query>       Search the design system databases
    generate <query>     Generate a full design system specification
    tailwind <query>     Generate a Tailwind CSS config from tokens
    init                 Interactive setup — choose platform, palette, and framework
    palette <sub>        Manage custom palettes (create, preview, list, remove, export)

  Options (install):
    -p, --platform <name>   Target platform (auto-detected if omitted)
    -d, --dir <directory>   Target project directory (default: .)
    --dry-run               Show what would be installed without making changes

  Options (search):
    -v, --verbose           Show detailed results
    -j, --json              Output as JSON

  Options (generate):
    -f, --format <format>   Output format (markdown, json, tailwind, css-in-js)
    --framework <name>      Framework-specific output (react, vue, svelte)

  Options (palette):
    --name <name>           Palette name (slug, e.g. 'my-brand')
    --colors <hex,...>      Comma-separated hex colors (1-5)
    --shape <preset>        Shape preset (sharp, balanced, round, brutalist)
    --format <format>       Export format (css, json)

  Global:
    -V, --version           Show version number
    -h, --help              Show this help
`);
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const { command, positional, flags } = parseArgs(rawArgs);

  if (flags.version || flags.V) {
    console.log(VERSION);
    return;
  }

  if (flags.help || flags.h || !command) {
    showHelp();
    return;
  }

  switch (command) {
    case "install":
      await installCommand({
        platform: (flags.platform || flags.p) as string | undefined,
        dir: ((flags.dir || flags.d) as string) || ".",
        dryRun: !!flags["dry-run"],
      });
      break;

    case "search":
      if (!positional[0]) {
        console.error("  Error: search requires a query argument\n  Usage: uds search \"your query\"");
        process.exit(1);
      }
      await searchCommand(positional[0], {
        verbose: !!(flags.verbose || flags.v),
        json: !!(flags.json || flags.j),
      });
      break;

    case "generate":
      if (!positional[0]) {
        console.error("  Error: generate requires a query argument\n  Usage: uds generate \"your query\"");
        process.exit(1);
      }
      await generateCommand(positional[0], {
        format: (flags.format || flags.f) as string | undefined,
        framework: flags.framework as string | undefined,
      });
      break;

    case "tailwind":
      if (!positional[0]) {
        console.error("  Error: tailwind requires a query argument\n  Usage: uds tailwind \"your query\"");
        process.exit(1);
      }
      await tailwindCommand(positional[0]);
      break;

    case "init":
      await initCommand();
      break;

    case "palette":
      if (!positional[0]) {
        console.error("  Error: palette requires a subcommand\n  Usage: uds palette <create|preview|list|remove|export> [options]");
        process.exit(1);
      }
      await paletteCommand(positional[0], {
        name: (flags.name || flags.n) as string | undefined,
        colors: flags.colors as string | undefined,
        shape: flags.shape as string | undefined,
        format: (flags.format || flags.f) as string | undefined,
      });
      break;

    case "help":
      showHelp();
      break;

    default:
      console.error(`  Unknown command: ${command}\n  Run "uds --help" for usage.`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
