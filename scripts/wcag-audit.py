#!/usr/bin/env python3
"""
WCAG 2.2 AA Contrast Audit
Runs automated contrast ratio checks across all palette x mode combinations.
Outputs results to audits/a11y-audit.json

Usage:
    python scripts/wcag-audit.py
    python scripts/wcag-audit.py --tokens tokens/design-tokens.json --output audits/a11y-audit.json
"""

import json
import argparse
import math
import re
import sys
from datetime import datetime
from pathlib import Path

# Dynamic palette registry
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "scripts"))
try:
    from registry import get_all_palettes
except ImportError:
    get_all_palettes = None


def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def relative_luminance(r: int, g: int, b: int) -> float:
    """Calculate relative luminance per WCAG 2.2 spec."""
    srgb = []
    for c in (r, g, b):
        c_linear = c / 255.0
        if c_linear <= 0.03928:
            srgb.append(c_linear / 12.92)
        else:
            srgb.append(((c_linear + 0.055) / 1.055) ** 2.4)
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]


def contrast_ratio(hex1: str, hex2: str) -> float:
    """Calculate WCAG contrast ratio between two hex colors."""
    l1 = relative_luminance(*hex_to_rgb(hex1))
    l2 = relative_luminance(*hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def _resolve_alias(value: str, primitives: dict) -> str:
    """Resolve a token alias like '{color.primitive.blue.600}' to a hex value.

    Follows the reference chain through the primitives dict. Returns the
    original string unchanged if it cannot be resolved.
    """
    if not isinstance(value, str) or not value.startswith("{"):
        return value

    path = value.strip("{}").split(".")

    # Navigate: color -> primitive -> blue -> 600
    # The primitives dict is already the "color.primitive" level,
    # so we skip the first two segments if they match.
    if len(path) >= 4 and path[0] == "color" and path[1] == "primitive":
        path = path[2:]

    node = primitives
    for segment in path:
        if isinstance(node, dict):
            node = node.get(segment)
        else:
            return value

    if node is None:
        return value

    if isinstance(node, dict) and "$value" in node:
        resolved = node["$value"]
        if isinstance(resolved, str) and resolved.startswith("{"):
            return _resolve_alias(resolved, primitives)
        return resolved

    if isinstance(node, str):
        return node

    return value


def _get_value(token_obj) -> str:
    """Extract the $value from a token object or return the raw string."""
    if isinstance(token_obj, dict):
        return token_obj.get("$value", token_obj.get("value", ""))
    return str(token_obj) if token_obj is not None else ""


def extract_palette_colors(tokens: dict) -> dict:
    """Extract resolved hex colors for each palette and mode.

    Handles two formats:
    - Newer: "light"/"dark" sub-dicts with hyphenated keys
    - Older: flat underscore keys with _dark suffix for dark mode
    """
    color_section = tokens.get("color", {})
    primitives = color_section.get("primitive", {})
    theme_section = tokens.get("theme", {})

    if get_all_palettes:
        palette_names = get_all_palettes()
    else:
        palette_names = [
            "minimal-saas",
            "ai-futuristic",
            "gradient-startup",
            "corporate",
            "apple-minimal",
            "illustration",
            "dashboard",
            "bold-lifestyle",
            "minimal-corporate",
        ]

    result = {}

    for palette_name in palette_names:
        palette_data = theme_section.get(palette_name)
        if palette_data is None:
            continue

        result[palette_name] = {"light": {}, "dark": {}}

        if "light" in palette_data and isinstance(palette_data["light"], dict):
            for mode in ("light", "dark"):
                mode_data = palette_data.get(mode, {})
                for token_key, token_obj in mode_data.items():
                    raw = _get_value(token_obj)
                    resolved = _resolve_alias(raw, primitives)
                    if isinstance(resolved, str) and resolved.startswith("#"):
                        result[palette_name][mode][token_key] = resolved
        else:
            for token_key, token_obj in palette_data.items():
                if token_key.startswith("$"):
                    continue
                raw = _get_value(token_obj)
                resolved = _resolve_alias(raw, primitives)
                if not isinstance(resolved, str) or not resolved.startswith("#"):
                    continue
                if token_key.endswith("_dark"):
                    normalized = token_key[:-5].replace("_", "-")
                    result[palette_name]["dark"][normalized] = resolved
                else:
                    normalized = token_key.replace("_", "-")
                    result[palette_name]["light"][normalized] = resolved

    return result


def run_audit(tokens_path: str, output_path: str):
    """Run the full WCAG contrast audit."""
    with open(tokens_path, "r") as f:
        tokens = json.load(f)

    critical_pairs = [
        ("text-primary", "bg-primary", 4.5, "Body text on background"),
        ("text-secondary", "bg-primary", 4.5, "Secondary text on background"),
        ("text-primary", "bg-secondary", 4.5, "Text on card surface"),
        ("text-on-brand", "brand-primary", 4.5, "Button label on brand"),
        ("brand-primary", "bg-primary", 3.0, "Brand link on background"),
        ("text-tertiary", "bg-primary", 3.0, "Tertiary text on background"),
    ]

    results = {
        "version": tokens.get("$version", "unknown"),
        "generated": datetime.now().isoformat(),
        "standard": "WCAG 2.2 AA",
        "total_checks": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "results": [],
    }

    palette_colors = extract_palette_colors(tokens)
    modes = ["light", "dark"]

    print(f"Running WCAG 2.2 AA contrast audit...")
    print(f"Palettes: {len(palette_colors)}")
    print(f"Modes: {len(modes)}")
    print(f"Critical pairs: {len(critical_pairs)}")
    print(f"Total checks: {len(palette_colors) * len(modes) * len(critical_pairs)}")
    print()

    for palette in sorted(palette_colors.keys()):
        palette_data = palette_colors[palette]

        for mode in modes:
            colors = palette_data.get(mode, {})

            for fg_token, bg_token, min_ratio, description in critical_pairs:
                results["total_checks"] += 1

                check = {
                    "palette": palette,
                    "mode": mode,
                    "pair": f"{fg_token} / {bg_token}",
                    "description": description,
                    "min_ratio": min_ratio,
                }

                fg_val = colors.get(fg_token)
                bg_val = colors.get(bg_token)

                if (
                    fg_val
                    and bg_val
                    and fg_val.startswith("#")
                    and bg_val.startswith("#")
                ):
                    ratio = round(contrast_ratio(fg_val, bg_val), 2)
                    passed = ratio >= min_ratio
                    check.update(
                        {
                            "foreground": fg_val,
                            "background": bg_val,
                            "ratio": ratio,
                            "passed": passed,
                        }
                    )
                    if passed:
                        results["passed"] += 1
                    else:
                        results["failed"] += 1
                else:
                    check["skipped"] = True
                    missing = []
                    if not fg_val:
                        missing.append(fg_token)
                    if not bg_val:
                        missing.append(bg_token)
                    check["reason"] = f"Missing tokens: {', '.join(missing)}" if missing else "Color values not resolved"
                    results["skipped"] += 1

                results["results"].append(check)

    # Pass rate excludes skipped checks
    evaluated = results["total_checks"] - results["skipped"]
    results["pass_rate"] = (
        f"{(results['passed'] / evaluated * 100):.1f}%"
        if evaluated > 0
        else "N/A"
    )

    # Write output
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w") as f:
        json.dump(results, f, indent=2)
        f.write("\n")

    print(f"Results: {results['passed']}/{evaluated} passed ({results['skipped']} skipped)")
    print(f"Pass rate: {results['pass_rate']}")
    if results["failed"] > 0:
        print(f"Failed: {results['failed']}")
        for r in results["results"]:
            if r.get("passed") is False:
                print(f"  [{r['palette']}] {r['mode']} - {r['description']}: {r['ratio']}:1 (need {r['min_ratio']}:1)")
    print(f"Output: {output_path}")

    return results["failed"] == 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WCAG 2.2 AA Contrast Audit")
    parser.add_argument(
        "--tokens", default="tokens/design-tokens.json", help="Path to design tokens"
    )
    parser.add_argument(
        "--output", default="audits/a11y-audit.json", help="Output path"
    )
    args = parser.parse_args()

    success = run_audit(args.tokens, args.output)
    exit(0 if success else 1)
