#!/usr/bin/env python3
"""
Compute all project metrics from actual data sources.

Produces metrics.json (machine-readable) used by docs, README badges,
CI checks, and promotional materials.

Usage:
    python scripts/compute-metrics.py              # print summary + write metrics.json
    python scripts/compute-metrics.py --json        # JSON to stdout only
    python scripts/compute-metrics.py --badges      # update README badge values
"""

import csv
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Counters
# ---------------------------------------------------------------------------


def count_csv_rows(path):
    """Return row count (excluding header) for a CSV file."""
    if not path.exists():
        return 0
    with open(path, newline="", encoding="utf-8") as f:
        return max(sum(1 for _ in csv.reader(f)) - 1, 0)


def count_csv_databases():
    """Count CSV files and total rows under src/data/."""
    data_dir = ROOT / "src" / "data"
    files = sorted(data_dir.rglob("*.csv"))
    total_rows = 0
    db_details = []
    for f in files:
        rows = count_csv_rows(f)
        total_rows += rows
        db_details.append({"file": str(f.relative_to(ROOT)), "rows": rows})
    return len(files), total_rows, db_details


def count_leaf_tokens(obj, depth=0):
    """Recursively count leaf tokens ($value nodes) in design-tokens.json."""
    if not isinstance(obj, dict):
        return 0
    if "$value" in obj:
        return 1
    total = 0
    for key, value in obj.items():
        if key.startswith("$"):
            continue
        total += count_leaf_tokens(value, depth + 1)
    return total


def count_token_categories(tokens):
    """Count top-level categories in design-tokens.json."""
    return len([k for k in tokens if not k.startswith("$")])


def count_components_csv():
    """Count rows in components.csv (canonical component count)."""
    return count_csv_rows(ROOT / "src" / "data" / "components.csv")


def count_react_components():
    """Count component directories under packages/react/src/components/."""
    comp_dir = ROOT / "packages" / "react" / "src" / "components"
    if not comp_dir.exists():
        return 0
    return len([d for d in comp_dir.iterdir() if d.is_dir()])


def count_reasoning_rules():
    """Count rows in ui-reasoning.csv."""
    return count_csv_rows(ROOT / "src" / "data" / "ui-reasoning.csv")


def count_anti_patterns():
    """Count rows in anti-patterns.csv."""
    return count_csv_rows(ROOT / "src" / "data" / "anti-patterns.csv")


def count_palettes():
    """Read palette-registry.json for palette list."""
    path = ROOT / "tokens" / "palette-registry.json"
    if not path.exists():
        return 9, []
    with open(path, encoding="utf-8") as f:
        registry = json.load(f)
    builtin = registry.get("builtin", [])
    custom = registry.get("custom", [])
    return len(builtin) + len(custom), builtin + custom


def count_mcp_tools():
    """Count tool definitions in the TOOLS array in src/mcp/index.js."""
    path = ROOT / "src" / "mcp" / "index.js"
    if not path.exists():
        return 0
    text = path.read_text(encoding="utf-8")
    # Extract just the TOOLS array block
    match = re.search(r"const TOOLS\s*=\s*\[(.*?)\];", text, re.DOTALL)
    if not match:
        return 0
    tools_block = match.group(1)
    return len(re.findall(r"name:\s*'(\w+)'", tools_block))


def count_docs_pages():
    """Count HTML files in docs/."""
    docs_dir = ROOT / "docs"
    if not docs_dir.exists():
        return 0
    return len(list(docs_dir.glob("*.html")))


def count_cli_platforms():
    """Count supported platforms in the PLATFORMS object in install.ts."""
    path = ROOT / "cli" / "src" / "commands" / "install.ts"
    if not path.exists():
        return 0
    text = path.read_text(encoding="utf-8")
    # Match keys of the PLATFORMS Record object
    match = re.search(r"const PLATFORMS.*?=\s*\{(.*?)\};", text, re.DOTALL)
    if not match:
        return 0
    return len(re.findall(r"^\s+(\w+):\s*\{", match.group(1), re.MULTILINE))


def count_frameworks():
    """Count supported frameworks from design_system.py --framework choices."""
    path = ROOT / "src" / "scripts" / "design_system.py"
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    match = re.search(r'--framework.*?choices\s*=\s*\[([^\]]+)\]', text)
    if match:
        return re.findall(r'"([\w-]+)"', match.group(1))
    return ["react", "vue", "svelte", "web-components"]


def count_tests():
    """Count test files and estimate test count from test directories."""
    test_dirs = {
        "components": ROOT / "tests" / "components",
        "cli": ROOT / "tests" / "cli",
        "accessibility": ROOT / "tests" / "accessibility",
        "visual": ROOT / "tests" / "visual",
        "contracts": ROOT / "tests" / "contracts",
    }
    results = {}
    for name, d in test_dirs.items():
        if not d.exists():
            results[name] = {"files": 0, "test_count": 0}
            continue
        files = list(d.glob("*.test.*")) + list(d.glob("*.spec.*"))
        test_count = 0
        for f in files:
            text = f.read_text(encoding="utf-8")
            test_count += len(re.findall(r"\bit\s*\(", text))
        results[name] = {"files": len(files), "test_count": test_count}
    return results


def load_wcag_audit():
    """Load WCAG audit results from audits/a11y-audit.json."""
    path = ROOT / "audits" / "a11y-audit.json"
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    summary = data.get("summary", data)
    return {
        "total": summary.get("total_checks", 0),
        "passed": summary.get("passed", 0),
        "failed": summary.get("failed", 0),
        "skipped": summary.get("skipped", 0),
        "standard": summary.get("standard", "WCAG 2.2 AA"),
    }


def get_version():
    """Read version from package.json."""
    with open(ROOT / "package.json", encoding="utf-8") as f:
        return json.load(f).get("version", "0.0.0")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def compute_all():
    """Compute all metrics and return as dict."""
    # Tokens
    tokens_path = ROOT / "tokens" / "design-tokens.json"
    tokens = {}
    if tokens_path.exists():
        with open(tokens_path, encoding="utf-8") as f:
            tokens = json.load(f)

    leaf_count = count_leaf_tokens(tokens)
    category_count = count_token_categories(tokens)

    # CSV databases
    csv_count, csv_rows, csv_details = count_csv_databases()

    # Components
    components_csv_count = count_components_csv()
    react_count = count_react_components()

    # Rules
    reasoning_count = count_reasoning_rules()
    anti_pattern_count = count_anti_patterns()

    # Palettes
    palette_count, palette_list = count_palettes()

    # MCP
    mcp_tool_count = count_mcp_tools()

    # Docs
    docs_count = count_docs_pages()

    # CLI
    platform_count = count_cli_platforms()
    frameworks = count_frameworks()

    # Tests
    test_results = count_tests()
    total_tests = sum(t["test_count"] for t in test_results.values())

    # WCAG
    wcag = load_wcag_audit()

    # Version
    version = get_version()

    return {
        "version": version,
        "computed_at": datetime.now(timezone.utc).isoformat(),
        "tokens": {
            "leaf_count": leaf_count,
            "categories": category_count,
        },
        "csv_databases": {
            "count": csv_count,
            "total_rows": csv_rows,
        },
        "components": {
            "total": components_csv_count,
            "react_implemented": react_count,
            "react_coverage_pct": round(react_count / max(components_csv_count, 1) * 100),
        },
        "palettes": {
            "count": palette_count,
            "names": palette_list,
        },
        "rules": {
            "reasoning": reasoning_count,
            "anti_patterns": anti_pattern_count,
            "total": reasoning_count + anti_pattern_count,
        },
        "mcp_tools": mcp_tool_count,
        "docs_pages": docs_count,
        "platforms": platform_count,
        "frameworks": frameworks,
        "tests": {
            "total": total_tests,
            "breakdown": test_results,
        },
        "wcag": wcag,
    }


def print_summary(m):
    """Print human-readable summary."""
    print(f"Universal Design System v{m['version']} — Metrics")
    print(f"{'=' * 55}")
    print(f"  Tokens:          ~{m['tokens']['leaf_count']} across {m['tokens']['categories']} categories")
    print(f"  CSV databases:   {m['csv_databases']['count']} files, {m['csv_databases']['total_rows']:,} rows")
    print(f"  Components:      {m['components']['total']} defined, {m['components']['react_implemented']} React ({m['components']['react_coverage_pct']}%)")
    print(f"  Palettes:        {m['palettes']['count']}")
    print(f"  Rules:           {m['rules']['reasoning']} reasoning + {m['rules']['anti_patterns']} anti-patterns = {m['rules']['total']}")
    print(f"  MCP tools:       {m['mcp_tools']}")
    print(f"  Docs pages:      {m['docs_pages']}")
    print(f"  AI platforms:    {m['platforms']}")
    print(f"  Frameworks:      {', '.join(m['frameworks'])}")
    print(f"  Tests:           {m['tests']['total']}")
    if m["wcag"]:
        w = m["wcag"]
        print(f"  WCAG:            {w['passed']}/{w['total']} passed ({w['standard']})")
    print(f"\n  Computed at: {m['computed_at']}")


def inject_into_docs(m):
    """Update README badges and key docs files with computed metrics."""
    changes = 0
    tokens_exact = m["tokens"]["leaf_count"]
    # Round to nearest 50 for badges (e.g., 601 → 600, 632 → 650)
    tokens = round(tokens_exact / 50) * 50 or tokens_exact
    components = m["components"]["total"]
    palettes = m["palettes"]["count"]
    platforms = m["platforms"]
    wcag_std = m["wcag"]["standard"] if m["wcag"] else "WCAG 2.2 AA"
    wcag_ver = wcag_std.replace("WCAG ", "").replace(" AA", "")
    csv_rows = m["csv_databases"]["total_rows"]
    csv_count = m["csv_databases"]["count"]
    rules_total = m["rules"]["total"]
    anti_patterns = m["rules"]["anti_patterns"]
    reasoning = m["rules"]["reasoning"]
    mcp_tools = m["mcp_tools"]

    # ---- README.md ----
    readme_path = ROOT / "README.md"
    if readme_path.exists():
        text = readme_path.read_text(encoding="utf-8")
        original = text
        # Badge URLs (shields.io format uses underscores/dashes, no spaces)
        text = re.sub(
            r"badge/WCAG[_ ][\d.]+-AA",
            f"badge/WCAG_{wcag_ver}-AA",
            text,
        )
        # Badge alt text (inside square brackets)
        text = re.sub(
            r"\[WCAG[_ ][\d.]+ ?AA\]",
            f"[WCAG {wcag_ver} AA]",
            text,
        )
        text = re.sub(r"Components-\d+-", f"Components-{components}-", text)
        text = re.sub(r"Tokens-\d+-", f"Tokens-{tokens}-", text)
        text = re.sub(r"Palettes-\d+-", f"Palettes-{palettes}-", text)
        text = re.sub(r"AI_Platforms-\d+-", f"AI_Platforms-{platforms}-", text)
        # Prose references
        text = re.sub(r"~\d+ W3C DTCG tokens", f"~{tokens} W3C DTCG tokens", text)
        text = re.sub(r"~\d+ tokens", f"~{tokens} tokens", text)
        text = re.sub(r"(\d+) components", f"{components} components", text)
        text = re.sub(r"(\d+) palettes", f"{palettes} palettes", text)
        text = re.sub(r"WCAG 2\.\d+ AA", f"WCAG {wcag_ver} AA", text)
        text = re.sub(r"\d+ anti-pattern", f"{anti_patterns} anti-pattern", text)
        text = re.sub(r"\d+ domain-specific rules", f"{anti_patterns} domain-specific rules", text)
        text = re.sub(r"[\d,]+\+ rows", f"{csv_rows:,}+ rows", text)
        text = re.sub(r"(\d+) CSV databases", f"{csv_count} CSV databases", text)
        text = re.sub(r"(\d+) databases", f"{csv_count} databases", text)
        text = re.sub(r"(\d+) platforms", f"{platforms} platforms", text)
        text = re.sub(r"(\d+) reasoning", f"{reasoning} reasoning", text)
        if text != original:
            readme_path.write_text(text, encoding="utf-8")
            changes += 1
            print(f"  Updated: README.md")

    # ---- package.json description ----
    pkg_path = ROOT / "package.json"
    if pkg_path.exists():
        text = pkg_path.read_text(encoding="utf-8")
        original = text
        text = re.sub(r"(\d+) structural palettes", f"{palettes} structural palettes", text)
        text = re.sub(r"(\d+) components", f"{components} components", text)
        text = re.sub(r"WCAG 2\.\d+ AA", f"WCAG {wcag_ver} AA", text)
        if text != original:
            pkg_path.write_text(text, encoding="utf-8")
            changes += 1
            print(f"  Updated: package.json")

    # ---- docs HTML meta descriptions ----
    docs_dir = ROOT / "docs"
    if docs_dir.exists():
        for html_file in docs_dir.glob("*.html"):
            text = html_file.read_text(encoding="utf-8")
            original = text
            text = re.sub(r"(\d+) components", f"{components} components", text)
            text = re.sub(r"~\d+ (?:design )?tokens", f"~{tokens} design tokens", text)
            text = re.sub(r"WCAG 2\.\d+ AA", f"WCAG {wcag_ver} AA", text)
            text = re.sub(r"(\d+) palettes", f"{palettes} palettes", text)
            if text != original:
                html_file.write_text(text, encoding="utf-8")
                changes += 1
                print(f"  Updated: {html_file.relative_to(ROOT)}")

    # ---- CONTRIBUTING.md ----
    contrib_path = ROOT / "CONTRIBUTING.md"
    if contrib_path.exists():
        text = contrib_path.read_text(encoding="utf-8")
        original = text
        text = re.sub(r"(\d+) components", f"{components} components", text)
        text = re.sub(r"~\d+ tokens", f"~{tokens} tokens", text)
        text = re.sub(r"WCAG 2\.\d+ AA", f"WCAG {wcag_ver} AA", text)
        if text != original:
            contrib_path.write_text(text, encoding="utf-8")
            changes += 1
            print(f"  Updated: CONTRIBUTING.md")

    # ---- CLAUDE.md ----
    claude_path = ROOT / "CLAUDE.md"
    if claude_path.exists():
        text = claude_path.read_text(encoding="utf-8")
        original = text
        text = re.sub(r"(\d+) components", f"{components} components", text)
        text = re.sub(r"~\d+ tokens", f"~{tokens} tokens", text)
        text = re.sub(r"(\d+) CSV databases", f"{csv_count} CSV databases", text)
        text = re.sub(r"[\d,]+\+ rows", f"{csv_rows:,}+ rows", text)
        text = re.sub(r"(\d+) anti-pattern rules", f"{anti_patterns} anti-pattern rules", text)
        text = re.sub(r"WCAG 2\.\d+ AA", f"WCAG {wcag_ver} AA", text)
        text = re.sub(r"(\d+) AI platform", f"{platforms} AI platform", text)
        if text != original:
            claude_path.write_text(text, encoding="utf-8")
            changes += 1
            print(f"  Updated: CLAUDE.md")

    return changes


def main():
    json_only = "--json" in sys.argv
    inject = "--inject" in sys.argv

    metrics = compute_all()

    # Always write metrics.json
    out_path = ROOT / "metrics.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    if json_only:
        print(json.dumps(metrics, indent=2))
    elif inject:
        print_summary(metrics)
        print(f"\nInjecting metrics into docs...")
        n = inject_into_docs(metrics)
        print(f"\n  {n} file(s) updated from metrics.json")
    else:
        print_summary(metrics)
        print(f"\n  Written to: {out_path}")
        print(f"  Run with --inject to update README/docs")

    return 0


if __name__ == "__main__":
    sys.exit(main())
