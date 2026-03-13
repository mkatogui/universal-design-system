#!/usr/bin/env python3
"""
APCA (Advanced Perceptual Contrast Algorithm) Audit

Validates all 9 palettes against APCA Lc (Lightness Contrast) thresholds
for body text, large text, and UI elements. Outputs a comparison table
showing both WCAG 2.1 ratio and APCA Lc value side by side.

Saves a JSON report to audits/apca-audit.json.

Usage:
    python scripts/apca-audit.py
    python scripts/apca-audit.py --tokens tokens/design-tokens.json --output audits/apca-audit.json
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

# Add src/scripts to path for the APCA module and registry
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "scripts"))

from apca import (
    apca_contrast,
    wcag_contrast_ratio,
    hex_to_rgb,
    THRESHOLD_BODY_TEXT,
    THRESHOLD_LARGE_TEXT,
    THRESHOLD_UI_ELEMENT,
)

# ---------------------------------------------------------------------------
# Import shared utilities from audit_utils (with graceful fallback)
# ---------------------------------------------------------------------------

try:
    from audit_utils import (
        _resolve_alias,
        _get_value,
        extract_palette_colors,
    )

    _USING_AUDIT_UTILS = True
except ImportError:
    _USING_AUDIT_UTILS = False

if not _USING_AUDIT_UTILS:
    try:
        from registry import get_all_palettes
    except ImportError:
        get_all_palettes = None

# ---------------------------------------------------------------------------
# Fallback: Token resolution (used only when audit_utils is unavailable)
# ---------------------------------------------------------------------------

if not _USING_AUDIT_UTILS:

    def _resolve_alias(value: str, primitives: dict) -> str:
        """Resolve a token alias like '{color.primitive.blue.600}' to a hex value.

        Follows the reference chain through the primitives dict. Returns the
        original string unchanged if it cannot be resolved.
        """
        if not isinstance(value, str) or not value.startswith("{"):
            return value

        # Strip braces: '{color.primitive.blue.600}' -> 'color.primitive.blue.600'
        path = value.strip("{}").split(".")

        # Navigate: color -> primitive -> blue -> 600
        # The primitives dict is already the "color.primitive" level,
        # so we skip the first two segments if they match.
        if len(path) >= 4 and path[0] == "color" and path[1] == "primitive":
            path = path[2:]  # e.g. ['blue', '600']

        node = primitives
        for segment in path:
            if isinstance(node, dict):
                node = node.get(segment)
            else:
                return value  # Cannot resolve

        if node is None:
            return value

        # Might be a token object with $value
        if isinstance(node, dict) and "$value" in node:
            resolved = node["$value"]
            # Recursively resolve in case of chained aliases
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

    # ---------------------------------------------------------------------------
    # Fallback: Palette color extraction
    # ---------------------------------------------------------------------------

    def extract_palette_colors(tokens: dict) -> dict:
        """Extract resolved hex colors for each palette and mode.

        Palettes live under tokens["theme"]. Two formats exist:

        Newer format (minimal-saas, ai-futuristic, gradient-startup, corporate,
        apple-minimal): has "light"/"dark" sub-dicts with hyphenated keys like
        "text-primary", "bg-primary", "brand-primary".

        Older format (bold-lifestyle, minimal-corporate, illustration, dashboard):
        flat structure with underscore keys ("text_primary") and "_dark" suffixes
        for dark mode ("text_primary_dark").

        Returns a dict like:
            {
                "corporate": {
                    "light": {
                        "text-primary": "#1A202C",
                        "text-secondary": "#4A5568",
                        "bg-primary": "#FFFFFF",
                        "bg-secondary": "#F7F8FA",
                        "brand-primary": "#1A365D",
                    },
                    "dark": { ... }
                },
                ...
            }
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

            # Detect format: newer format has 'light'/'dark' sub-dicts
            if "light" in palette_data and isinstance(palette_data["light"], dict):
                # Newer format: light/dark sub-objects with hyphenated keys
                for mode in ("light", "dark"):
                    mode_data = palette_data.get(mode, {})
                    for token_key, token_obj in mode_data.items():
                        raw = _get_value(token_obj)
                        resolved = _resolve_alias(raw, primitives)
                        if isinstance(resolved, str) and resolved.startswith("#"):
                            result[palette_name][mode][token_key] = resolved
            else:
                # Older format: flat keys with underscores; _dark suffix for dark mode
                for token_key, token_obj in palette_data.items():
                    if token_key.startswith("$"):
                        continue

                    raw = _get_value(token_obj)
                    resolved = _resolve_alias(raw, primitives)

                    if not isinstance(resolved, str) or not resolved.startswith("#"):
                        continue

                    if token_key.endswith("_dark"):
                        # Dark mode token -- normalize key to hyphenated
                        normalized = token_key[:-5].replace("_", "-")
                        result[palette_name]["dark"][normalized] = resolved
                    else:
                        normalized = token_key.replace("_", "-")
                        result[palette_name]["light"][normalized] = resolved

        return result


# ---------------------------------------------------------------------------
# Audit checks
# ---------------------------------------------------------------------------

# Each check: (fg_token, bg_token, threshold, use_case, description)
CRITICAL_CHECKS = [
    ("text-primary", "bg-primary", THRESHOLD_BODY_TEXT, "body",
     "Body text on background"),
    ("text-primary", "bg-secondary", THRESHOLD_BODY_TEXT, "body",
     "Body text on surface"),
    ("brand-primary", "bg-primary", THRESHOLD_UI_ELEMENT, "ui",
     "Brand on background (UI)"),
    ("text-secondary", "bg-primary", THRESHOLD_LARGE_TEXT, "large",
     "Muted text on background"),
]


def run_audit(tokens_path: str, output_path: str) -> bool:
    """Run the full APCA contrast audit across all palettes and modes.

    Returns True if all checks pass, False if any fail.
    """
    with open(tokens_path, "r") as f:
        tokens = json.load(f)

    palette_colors = extract_palette_colors(tokens)

    modes = ["light", "dark"]

    report = {
        "version": tokens.get("$version", "unknown"),
        "generated": datetime.now().isoformat(),
        "standard": "APCA (SAPC-APCA 0.0.98G-4g)",
        "thresholds": {
            "body_text": THRESHOLD_BODY_TEXT,
            "large_text": THRESHOLD_LARGE_TEXT,
            "ui_element": THRESHOLD_UI_ELEMENT,
        },
        "total_checks": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "results": [],
    }

    # Table header
    header = (
        f"{'Palette':<22} {'Mode':<6} {'Check':<28} "
        f"{'FG':>9} {'BG':>9} "
        f"{'WCAG':>7} {'Lc':>7} {'Req':>5} {'Status':<6}"
    )
    separator = "-" * len(header)

    print("APCA Lightness Contrast Audit")
    print(f"Tokens: {tokens_path}")
    print(f"Palettes: {len(palette_colors)}")
    print(f"Modes: {len(modes)}")
    print(f"Checks per combination: {len(CRITICAL_CHECKS)}")
    print()
    print(header)
    print(separator)

    for palette_name in sorted(palette_colors.keys()):
        palette_data = palette_colors[palette_name]

        for mode in modes:
            colors = palette_data.get(mode, {})

            for fg_token, bg_token, threshold, use_case, description in CRITICAL_CHECKS:
                report["total_checks"] += 1

                fg_hex = colors.get(fg_token)
                bg_hex = colors.get(bg_token)

                check_result = {
                    "palette": palette_name,
                    "mode": mode,
                    "check": description,
                    "use_case": use_case,
                    "fg_token": fg_token,
                    "bg_token": bg_token,
                    "threshold_lc": threshold,
                }

                if fg_hex is None or bg_hex is None:
                    check_result["skipped"] = True
                    missing = []
                    if fg_hex is None:
                        missing.append(fg_token)
                    if bg_hex is None:
                        missing.append(bg_token)
                    check_result["reason"] = f"Missing tokens: {', '.join(missing)}"
                    report["skipped"] += 1
                    report["results"].append(check_result)

                    print(
                        f"{palette_name:<22} {mode:<6} {description:<28} "
                        f"{'---':>9} {'---':>9} "
                        f"{'---':>7} {'---':>7} {threshold:>5} {'SKIP':<6}"
                    )
                    continue

                lc = apca_contrast(fg_hex, bg_hex)
                wcag = wcag_contrast_ratio(fg_hex, bg_hex)
                passed = abs(lc) >= threshold

                check_result["foreground"] = fg_hex
                check_result["background"] = bg_hex
                check_result["apca_lc"] = round(lc, 1)
                check_result["apca_abs_lc"] = round(abs(lc), 1)
                check_result["wcag_ratio"] = round(wcag, 2)
                check_result["passed"] = passed

                if passed:
                    report["passed"] += 1
                    status = "PASS"
                else:
                    report["failed"] += 1
                    status = "FAIL"

                report["results"].append(check_result)

                print(
                    f"{palette_name:<22} {mode:<6} {description:<28} "
                    f"{fg_hex:>9} {bg_hex:>9} "
                    f"{wcag:>6.2f}x {lc:>+7.1f} {threshold:>5} {status:<6}"
                )

    print(separator)

    # Summary
    total = report["total_checks"]
    report["pass_rate"] = (
        f"{(report['passed'] / (total - report['skipped']) * 100):.1f}%"
        if (total - report["skipped"]) > 0
        else "N/A"
    )

    print()
    print(f"Total checks:  {total}")
    print(f"Passed:        {report['passed']}")
    print(f"Failed:        {report['failed']}")
    print(f"Skipped:       {report['skipped']}")
    print(f"Pass rate:     {report['pass_rate']}")
    print()

    if report["failed"] > 0:
        print("Failed checks:")
        for r in report["results"]:
            if r.get("passed") is False:
                print(
                    f"  [{r['palette']}] {r['mode']} - {r['check']}: "
                    f"Lc {r['apca_lc']:+.1f} (need |Lc| >= {r['threshold_lc']})"
                )
        print()

    # Write JSON report
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w") as f:
        json.dump(report, f, indent=2)
        f.write("\n")

    print(f"Report saved to: {output_path}")

    return report["failed"] == 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="APCA Lightness Contrast Audit for Universal Design System"
    )
    parser.add_argument(
        "--tokens",
        default="tokens/design-tokens.json",
        help="Path to design tokens JSON file",
    )
    parser.add_argument(
        "--output",
        default="audits/apca-audit.json",
        help="Path for the JSON audit report",
    )
    args = parser.parse_args()

    success = run_audit(args.tokens, args.output)
    sys.exit(0 if success else 1)
