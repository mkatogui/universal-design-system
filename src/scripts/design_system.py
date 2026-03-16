#!/usr/bin/env python3
"""
Universal Design System — Design System Generator

Generates a complete design system specification from a query,
including palette, tokens, components, patterns, and guidelines.

Usage:
    python src/scripts/design_system.py "fintech dashboard"
    python src/scripts/design_system.py "kids education app" --format markdown
    python src/scripts/design_system.py "saas landing page" --format json
    python src/scripts/design_system.py "saas landing page" --format tailwind
    python src/scripts/design_system.py "saas landing page" --format css-in-js
    python src/scripts/design_system.py "fintech dashboard" --framework react
    python src/scripts/design_system.py "fintech dashboard" --framework vue
    python src/scripts/design_system.py "fintech dashboard" --framework svelte
    python src/scripts/design_system.py "fintech dashboard" --framework web-components
    python src/scripts/design_system.py "test app" --unstyled
    python src/scripts/design_system.py "fintech dashboard" --unstyled --format json
    python src/scripts/design_system.py "saas landing" --persist
    python src/scripts/design_system.py "saas dashboard" --persist --page dashboard
    python src/scripts/design_system.py "fintech dashboard" --format box
"""

import json
import sys
import argparse
from pathlib import Path
from typing import Optional

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from core import ReasoningEngine, load_csv
from tokens import (
    load_tokens,
    resolve_foundation_tokens,
    resolve_palette_tokens,
)
from checklist import get_pre_delivery_checklist
from formatters import (
    FORMATTERS,
    build_json_output,
    generate_box_output,
    generate_framework_output,
    generate_markdown,
    generate_unstyled_json,
    generate_unstyled_markdown,
)

# Re-exports for backward compatibility (tests, MCP, CLI)
__all__ = [
    "load_tokens",
    "resolve_foundation_tokens",
    "resolve_palette_tokens",
    "get_pre_delivery_checklist",
    "generate_box_output",
    "generate_markdown",
]

try:
    from registry import get_all_palettes, get_custom_palette_names
except ImportError:
    get_all_palettes = None
    get_custom_palette_names = None

PALETTE_DISPLAY_NAMES = {
    "minimal-saas": "Minimal SaaS",
    "ai-futuristic": "AI Futuristic",
    "gradient-startup": "Gradient Startup",
    "corporate": "Corporate",
    "apple-minimal": "Apple Minimal",
    "illustration": "Illustration",
    "dashboard": "Dashboard",
    "bold-lifestyle": "Bold Lifestyle",
    "minimal-corporate": "Minimal Corporate",
}

# Add custom palettes from registry
if get_custom_palette_names:
    for name in get_custom_palette_names():
        if name not in PALETTE_DISPLAY_NAMES:
            display = " ".join(w.capitalize() for w in name.split("-"))
            PALETTE_DISPLAY_NAMES[name] = display


def main():
    parser = argparse.ArgumentParser(
        description="Generate a Design System Specification",
    )
    parser.add_argument("query", help="Design system query (e.g., 'fintech dashboard')")
    parser.add_argument("--format", "-f", choices=["markdown", "json", "tailwind", "css-in-js", "box"], default="markdown", help="Output format")
    parser.add_argument("--framework", choices=["react", "vue", "svelte", "web-components", "html"], default=None, help="Generate framework-specific component code")
    parser.add_argument("--unstyled", action="store_true", default=False, help="Output headless/unstyled behavior-only specs (ARIA, keyboard, states, focus management) without CSS classes or visual tokens")
    parser.add_argument("--persist", action="store_true", help="Write design system to design-system/MASTER.md for reuse by AI and humans")
    parser.add_argument("--page", metavar="NAME", default=None, help="With --persist, also write design-system/pages/NAME.md for page-specific overrides")
    args = parser.parse_args()

    engine = ReasoningEngine()
    result = engine.reason(args.query)

    # Unstyled / headless mode — skip token resolution entirely
    if args.unstyled:
        if args.format == "json":
            print(json.dumps(generate_unstyled_json(result), indent=2))
        else:
            print(generate_unstyled_markdown(result))
        return

    tokens = load_tokens()
    palette_tokens = resolve_palette_tokens(tokens, result["recommended_palette"])
    foundation = resolve_foundation_tokens(tokens)

    palette_display_name = PALETTE_DISPLAY_NAMES.get(result["recommended_palette"], result["recommended_palette"])
    result_with_display = {**result, "palette_display": palette_display_name, "foundation": foundation}

    # OCP: dispatch via formatter registry where possible
    formatter_fn = FORMATTERS.get(args.format)
    if args.framework:
        print(generate_framework_output(result_with_display, palette_tokens, args.framework))
    elif args.format == "json":
        palette_source = "default"
        palette_rule_id = None
        for rule in result["rules_applied"]:
            if rule["then_field"] == "palette":
                palette_source = "rule"
                palette_rule_id = rule.get("rule_id")
                break
        if palette_source == "default" and result["search_results"]["products"]:
            top_product = result["search_results"]["products"][0]
            if top_product.get("palette") == result["recommended_palette"]:
                palette_source = "product_search"
        output = build_json_output(
            result, palette_tokens, palette_display_name, palette_source, palette_rule_id
        )
        print(json.dumps(output, indent=2))
    elif formatter_fn is not None:
        print(formatter_fn(result_with_display, palette_tokens))
    else:
        print(generate_markdown(result_with_display, palette_tokens))

    # Persist to design-system/ for reuse by AI and humans
    if args.persist and not args.unstyled and not args.framework:
        design_system_dir = Path("design-system")
        design_system_dir.mkdir(parents=True, exist_ok=True)
        md_content = generate_markdown(result_with_display, palette_tokens)
        (design_system_dir / "MASTER.md").write_text(md_content, encoding="utf-8")
        if args.page:
            pages_dir = design_system_dir / "pages"
            pages_dir.mkdir(parents=True, exist_ok=True)
            palette = result["recommended_palette"]
            page_name = args.page.replace(" ", "-").lower()
            page_content = f"""# Page: {args.page}

See `design-system/MASTER.md` for the full design system.

## Page-specific overrides

- **Palette:** {palette} (same as master unless overridden below)
- **Components to emphasize:**
- **Notes:**

"""
            (pages_dir / f"{page_name}.md").write_text(page_content, encoding="utf-8")


if __name__ == "__main__":
    main()
