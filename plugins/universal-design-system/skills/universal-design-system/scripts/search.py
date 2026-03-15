#!/usr/bin/env python3
"""
Universal Design System — CLI Search Interface

Search across all design system databases using BM25 ranking
and domain-aware reasoning.

Usage:
    python src/scripts/search.py "fintech dashboard"
    python src/scripts/search.py "saas landing page" --verbose
    python src/scripts/search.py "kids education app" --json
"""

import json
import sys
import argparse
from pathlib import Path

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from core import ReasoningEngine


def format_result(result: dict, verbose: bool = False) -> str:
    """Format a reasoning result for terminal display."""
    lines = []
    domain = result["domain"]
    search = result["search_results"]

    # Header
    lines.append("=" * 60)
    lines.append(f"  Universal Design System — Search Results")
    lines.append("=" * 60)
    lines.append(f"  Query:   {result['query']}")
    lines.append(f"  Sector:  {domain['sector']} (confidence: {domain['sector_confidence']})")
    lines.append(f"  Product: {domain['product_type']} (confidence: {domain['product_confidence']})")
    lines.append(f"  Palette: {result['recommended_palette']}")
    lines.append("")

    # Rules applied
    if result["rules_applied"]:
        lines.append(f"  Rules Applied ({len(result['rules_applied'])})")
        lines.append("  " + "-" * 40)
        for rule in result["rules_applied"][:8]:
            prio = rule["priority"]
            lines.append(f"  [{prio}] {rule['then_field']} = {rule['then_value']}")
            if verbose and rule.get("reasoning"):
                lines.append(f"      {rule['reasoning']}")
        lines.append("")

    # Anti-patterns
    if result["anti_patterns"]:
        lines.append(f"  Anti-Patterns ({len(result['anti_patterns'])})")
        lines.append("  " + "-" * 40)
        for ap in result["anti_patterns"][:5]:
            sev = ap["severity"].upper()
            lines.append(f"  [{sev}] {ap['anti_pattern']}")
            if verbose:
                lines.append(f"      {ap['description']}")
                lines.append(f"      -> {ap['alternative']}")
        lines.append("")

    # Top product matches
    if search["products"]:
        lines.append(f"  Product Matches ({len(search['products'])})")
        lines.append("  " + "-" * 40)
        for p in search["products"][:5]:
            score = p.get("_score", 0)
            lines.append(f"  [{score:.1f}] {p.get('name', '?')} — {p.get('palette', '?')}")
            if verbose:
                comps = p.get("key_components", "")
                if comps:
                    lines.append(f"      Components: {comps}")
        lines.append("")

    # Recommended components
    if search["components"]:
        lines.append(f"  Components ({len(search['components'])})")
        lines.append("  " + "-" * 40)
        comp_names = [c.get("name", "?") for c in search["components"][:10]]
        lines.append(f"  {', '.join(comp_names)}")
        lines.append("")

    # Recommended patterns
    if search["patterns"]:
        lines.append(f"  Patterns ({len(search['patterns'])})")
        lines.append("  " + "-" * 40)
        for pat in search["patterns"][:5]:
            lines.append(f"  {pat.get('name', '?')} — {pat.get('description', '')[:60]}")
        lines.append("")

    # Style recommendations
    if search["styles"]:
        lines.append(f"  Style ({len(search['styles'])})")
        lines.append("  " + "-" * 40)
        for s in search["styles"][:3]:
            lines.append(f"  {s.get('name', '?')} — {s.get('description', '')[:60]}")
        lines.append("")

    # Typography
    if search["typography"]:
        lines.append(f"  Typography ({len(search['typography'])})")
        lines.append("  " + "-" * 40)
        for t in search["typography"][:3]:
            lines.append(f"  {t.get('heading_font', '?')} / {t.get('body_font', '?')} — {t.get('mood', '')}")
        lines.append("")

    # Guidelines
    if verbose and search["guidelines"]:
        lines.append(f"  UX Guidelines ({len(search['guidelines'])})")
        lines.append("  " + "-" * 40)
        for g in search["guidelines"][:5]:
            lines.append(f"  [{g.get('priority', '?')}] {g.get('guideline', '')[:70]}")
        lines.append("")

    lines.append("=" * 60)
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Universal Design System Search",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python src/scripts/search.py "saas dashboard"
  python src/scripts/search.py "fintech mobile app" --verbose
  python src/scripts/search.py "kids education" --json
        """,
    )
    parser.add_argument("query", help="Search query (e.g., 'fintech dashboard')")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed results")
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    engine = ReasoningEngine()
    result = engine.reason(args.query)

    if args.json:
        # Clean up non-serializable fields
        output = {
            "query": result["query"],
            "domain": result["domain"],
            "recommended_palette": result["recommended_palette"],
            "rules_applied": result["rules_applied"],
            "anti_patterns": result["anti_patterns"],
            "products": [
                {"name": p.get("name"), "palette": p.get("palette"), "score": p.get("_score")}
                for p in result["search_results"]["products"]
            ],
            "components": [c.get("name") for c in result["search_results"]["components"]],
            "patterns": [p.get("name") for p in result["search_results"]["patterns"]],
            "styles": [
                {"name": s.get("name"), "palette": s.get("palette")}
                for s in result["search_results"]["styles"]
            ],
            "typography": [
                {"heading": t.get("heading_font"), "body": t.get("body_font"), "mood": t.get("mood")}
                for t in result["search_results"]["typography"]
            ],
        }
        print(json.dumps(output, indent=2))
    else:
        print(format_result(result, verbose=args.verbose))


if __name__ == "__main__":
    main()
