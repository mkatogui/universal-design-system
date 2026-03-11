/**
 * Search command — wraps the Python search engine for terminal use.
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = resolve(__dirname, "..", "..");
const PKG_ROOT = resolve(CLI_ROOT, "..");

interface SearchOptions {
  verbose?: boolean;
  json?: boolean;
}

export async function searchCommand(
  query: string,
  options: SearchOptions,
): Promise<void> {
  const searchScript = join(PKG_ROOT, "src", "scripts", "search.py");

  if (!existsSync(searchScript)) {
    console.error(chalk.red("Search engine not found."));
    console.error(chalk.dim(`Expected: ${searchScript}`));
    process.exit(1);
  }

  // Check Python is available
  let python = "python3";
  try {
    execSync(`${python} --version`, { stdio: "ignore" });
  } catch {
    python = "python";
    try {
      execSync(`${python} --version`, { stdio: "ignore" });
    } catch {
      console.error(chalk.red("Python 3 is required but not found."));
      process.exit(1);
    }
  }

  const args: string[] = [searchScript, JSON.stringify(query)];
  if (options.verbose) args.push("--verbose");
  if (options.json) args.push("--json");

  try {
    const result = execSync(`${python} ${args.join(" ")}`, {
      encoding: "utf-8",
      cwd: PKG_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });
    console.log(result);
  } catch (err: unknown) {
    const error = err as { stderr?: string; status?: number };
    if (error.stderr) {
      console.error(chalk.red(error.stderr));
    }
    process.exit(error.status || 1);
  }
}
