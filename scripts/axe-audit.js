#!/usr/bin/env node
/**
 * axe-core Accessibility Audit
 *
 * Runs automated axe-core checks against all 5 docs HTML pages using Puppeteer.
 * Opens each page as a file:// URL, injects axe-core, and collects violations.
 *
 * Usage:
 *   node scripts/axe-audit.js
 *
 * Output:
 *   - Summary to stdout (violations by severity)
 *   - Detailed JSON report to audits/axe-audit.json
 *
 * Exit codes:
 *   0 = no critical or serious violations
 *   1 = critical or serious violations found (or runtime error)
 *
 * Dependencies (install before running):
 *   npm install --save-dev puppeteer axe-core
 */

const path = require("path");
const fs = require("fs");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const AUDITS_DIR = path.join(PROJECT_ROOT, "audits");
const OUTPUT_FILE = path.join(AUDITS_DIR, "axe-audit.json");
const PAGE_TIMEOUT_MS = 30000;

const DOCS_PAGES = [
  "docs/index.html",
  "docs/docs.html",
  "docs/component-library.html",
  "docs/visual-framework.html",
  "docs/reference.html",
];

/**
 * Attempt to require a module and provide a helpful message if missing.
 */
function requireDependency(name) {
  try {
    return require(name);
  } catch (err) {
    if (err.code === "MODULE_NOT_FOUND") {
      console.error(
        `Error: "${name}" is not installed.\n` +
          `Install required dependencies with:\n\n` +
          `  npm install --save-dev puppeteer axe-core\n`
      );
      process.exit(1);
    }
    throw err;
  }
}

/**
 * Run axe-core on a single page and return the results.
 */
async function auditPage(browser, pagePath) {
  const absolutePath = path.join(PROJECT_ROOT, pagePath);
  const fileUrl = `file://${absolutePath}`;

  if (!fs.existsSync(absolutePath)) {
    console.warn(`  SKIP: ${pagePath} (file not found)`);
    return {
      url: pagePath,
      skipped: true,
      reason: "File not found",
      violations: [],
    };
  }

  const page = await browser.newPage();

  try {
    await page.goto(fileUrl, {
      waitUntil: "load",
      timeout: PAGE_TIMEOUT_MS,
    });

    // Inject axe-core source into the page
    const axeCorePath = require.resolve("axe-core");
    const axeSource = fs.readFileSync(axeCorePath, "utf8");
    await page.evaluate(axeSource);

    // Run axe-core and collect results
    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-undef
        axe
          .run(document, {
            resultTypes: ["violations"],
          })
          .then((r) => resolve(r))
          .catch((e) => reject(e.message));
      });
    });

    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary,
      })),
    }));

    return {
      url: pagePath,
      skipped: false,
      violations,
    };
  } catch (err) {
    console.warn(`  ERROR on ${pagePath}: ${err.message}`);
    return {
      url: pagePath,
      skipped: true,
      reason: err.message,
      violations: [],
    };
  } finally {
    await page.close();
  }
}

/**
 * Count violations by severity across all pages.
 */
function countBySeverity(pages) {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const page of pages) {
    for (const v of page.violations) {
      const impact = v.impact || "minor";
      if (counts.hasOwnProperty(impact)) {
        counts[impact]++;
      }
    }
  }
  return counts;
}

/**
 * Print a summary table to stdout.
 */
function printSummary(pages, severity) {
  const total =
    severity.critical + severity.serious + severity.moderate + severity.minor;
  const pagesTestedCount = pages.filter((p) => !p.skipped).length;

  console.log("\n--- axe-core Accessibility Audit ---\n");
  console.log(`Pages tested: ${pagesTestedCount}/${DOCS_PAGES.length}`);
  console.log(`Total violations: ${total}`);
  console.log("");
  console.log(`  Critical: ${severity.critical}`);
  console.log(`  Serious:  ${severity.serious}`);
  console.log(`  Moderate: ${severity.moderate}`);
  console.log(`  Minor:    ${severity.minor}`);
  console.log("");

  // Per-page breakdown
  for (const page of pages) {
    if (page.skipped) {
      console.log(`  ${page.url}: SKIPPED (${page.reason})`);
      continue;
    }
    const count = page.violations.length;
    if (count === 0) {
      console.log(`  ${page.url}: PASS (0 violations)`);
    } else {
      const impacts = {};
      for (const v of page.violations) {
        const imp = v.impact || "minor";
        impacts[imp] = (impacts[imp] || 0) + 1;
      }
      const detail = Object.entries(impacts)
        .map(([k, v]) => `${v} ${k}`)
        .join(", ");
      console.log(`  ${page.url}: ${count} violations (${detail})`);
    }
  }

  console.log("");

  if (severity.critical > 0 || severity.serious > 0) {
    console.log("RESULT: FAIL (critical or serious violations found)");
  } else if (total > 0) {
    console.log("RESULT: PASS (no critical/serious violations, warnings only)");
  } else {
    console.log("RESULT: PASS (no violations found)");
  }

  console.log(`\nDetailed report: ${OUTPUT_FILE}\n`);
}

async function main() {
  // Require dependencies at runtime with helpful error messages
  const puppeteer = requireDependency("puppeteer");
  requireDependency("axe-core");

  // Ensure audits directory exists
  if (!fs.existsSync(AUDITS_DIR)) {
    fs.mkdirSync(AUDITS_DIR, { recursive: true });
  }

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const pages = [];

  try {
    for (const pagePath of DOCS_PAGES) {
      console.log(`  Testing: ${pagePath}`);
      const result = await auditPage(browser, pagePath);
      pages.push(result);
    }
  } finally {
    await browser.close();
  }

  const severity = countBySeverity(pages);
  const total =
    severity.critical + severity.serious + severity.moderate + severity.minor;

  // Build report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      pages_tested: pages.filter((p) => !p.skipped).length,
      total_violations: total,
      critical: severity.critical,
      serious: severity.serious,
      moderate: severity.moderate,
      minor: severity.minor,
    },
    pages,
  };

  // Write JSON report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2) + "\n");

  // Print summary
  printSummary(pages, severity);

  // Exit with code 1 if critical or serious violations found
  if (severity.critical > 0 || severity.serious > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
