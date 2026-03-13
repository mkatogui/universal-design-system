#!/usr/bin/env python3
"""
WCAG 2.1 AA Contrast Audit
Runs automated contrast ratio checks across all palette x mode combinations.
Outputs results to audits/a11y-audit.json

Now includes APCA Lc (Lightness Contrast) values as informational dual-reporting.
APCA values do NOT affect pass/fail — WCAG 2.1 AA contrast ratios remain the
gating criterion.

Usage:
    python scripts/wcag-audit.py
    python scripts/wcag-audit.py --tokens tokens/design-tokens.json --output audits/a11y-audit.json
    python scripts/wcag-audit.py --json   # output JSON to stdout
"""

import json
import argparse
import math
import re
import sys
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Import shared utilities (with graceful fallback)
# ---------------------------------------------------------------------------

try:
    from audit_utils import (
        parse_hex_to_rgb as hex_to_rgb,
        _resolve_alias,
        _get_value,
        extract_palette_colors,
        relative_luminance,
        contrast_ratio,
    )

    _USING_AUDIT_UTILS = True
except ImportError:
    _USING_AUDIT_UTILS = False

# Dynamic palette registry (fallback path)
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "scripts"))

if not _USING_AUDIT_UTILS:
    try:
        from registry import get_all_palettes
    except ImportError:
        get_all_palettes = None

# ---------------------------------------------------------------------------
# APCA imports (for dual-reporting)
# ---------------------------------------------------------------------------

try:
    from apca import (
        apca_contrast,
        THRESHOLD_BODY_TEXT as APCA_BODY,
        THRESHOLD_LARGE_TEXT as APCA_LARGE,
        THRESHOLD_UI_ELEMENT as APCA_UI,
    )

    _HAS_APCA = True
except ImportError:
    _HAS_APCA = False

# APCA thresholds (used even without the full apca module)
_APCA_THRESHOLD_BODY = 75  # Body text (< 24px)
_APCA_THRESHOLD_LARGE = 60  # Large text (>= 24px)
_APCA_THRESHOLD_UI = 45  # Non-text UI elements

# ---------------------------------------------------------------------------
# Fallback implementations (used when audit_utils is unavailable)
# ---------------------------------------------------------------------------

if not _USING_AUDIT_UTILS:

    def hex_to_rgb(hex_color: str) -> tuple:
        """Convert hex color to RGB tuple."""
        hex_color = hex_color.lstrip("#")
        if len(hex_color) == 3:
            hex_color = "".join(c * 2 for c in hex_color)
        return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))

    def relative_luminance(r: int, g: int, b: int) -> float:
        """Calculate relative luminance per WCAG 2.1 spec."""
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
        """Resolve a token alias like '{color.primitive.blue.600}' to a hex value."""
        if not isinstance(value, str) or not value.startswith("{"):
            return value
        path = value.strip("{}").split(".")
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
        """Extract resolved hex colors for each palette and mode."""
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


# ---------------------------------------------------------------------------
# Simplified APCA Lc calculation (inline fallback when apca module unavailable)
# ---------------------------------------------------------------------------


def _apca_lc_simplified(text_hex: str, bg_hex: str) -> float:
    """Calculate APCA Lightness Contrast using the simplified formula.

    Lc = (Y_text^0.56 - Y_bg^0.57) * 1.14
    where Y is relative luminance (WCAG 2.1 definition).

    This is the simplified APCA formula specified in the task requirements.
    When the full apca module is available, that implementation is preferred.
    """
    r_t, g_t, b_t = hex_to_rgb(text_hex)
    r_b, g_b, b_b = hex_to_rgb(bg_hex)

    y_text = relative_luminance(r_t, g_t, b_t)
    y_bg = relative_luminance(r_b, g_b, b_b)

    lc = (pow(y_text, 0.56) - pow(y_bg, 0.57)) * 1.14

    return lc * 100.0


def _compute_apca_lc(fg_hex: str, bg_hex: str) -> float:
    """Compute APCA Lc using the best available implementation."""
    if _HAS_APCA:
        return apca_contrast(fg_hex, bg_hex)
    return _apca_lc_simplified(fg_hex, bg_hex)


def _apca_threshold_for_pair(min_wcag_ratio: float) -> int:
    """Determine the APCA threshold based on the WCAG min ratio.

    WCAG min_ratio of 4.5 implies body text (< 24px) -> Lc 75
    WCAG min_ratio of 3.0 implies large text / UI -> Lc 60 or Lc 45
    """
    if min_wcag_ratio >= 4.5:
        return _APCA_THRESHOLD_BODY  # 75
    if min_wcag_ratio >= 3.0:
        return _APCA_THRESHOLD_LARGE  # 60
    return _APCA_THRESHOLD_UI  # 45


def run_audit(tokens_path: str, output_path: str, json_stdout: bool = False):
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
        "standard": "WCAG 2.1 AA",
        "total_checks": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "results": [],
    }

    palette_colors = extract_palette_colors(tokens)
    modes = ["light", "dark"]

    if not json_stdout:
        print(f"Running WCAG 2.1 AA contrast audit...")
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

                    # APCA dual-reporting (informational only)
                    apca_lc = round(_compute_apca_lc(fg_val, bg_val), 1)
                    apca_threshold = _apca_threshold_for_pair(min_ratio)

                    check.update(
                        {
                            "foreground": fg_val,
                            "background": bg_val,
                            "ratio": ratio,
                            "passed": passed,
                            "apca_lc": apca_lc,
                            "apca_threshold": apca_threshold,
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

    # Write output file
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w") as f:
        json.dump(results, f, indent=2)
        f.write("\n")

    if json_stdout:
        # Output JSON to stdout for piping
        json.dump(results, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
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
    parser = argparse.ArgumentParser(description="WCAG 2.1 AA Contrast Audit")
    parser.add_argument(
        "--tokens", default="tokens/design-tokens.json", help="Path to design tokens"
    )
    parser.add_argument(
        "--output", default="audits/a11y-audit.json", help="Output path"
    )
    parser.add_argument(
        "--json", action="store_true", help="Output JSON to stdout"
    )
    args = parser.parse_args()

    success = run_audit(args.tokens, args.output, json_stdout=args.json)
    exit(0 if success else 1)
