#!/usr/bin/env python3
"""
Expanded WCAG 2.1 AA Contrast Audit — ALL foreground/background combinations.

Unlike wcag-audit.py (which tests 6 critical pairs), this script tests every
possible foreground/background token combination across all 9 palettes x 2 modes.
This includes text, brand, status, hover/active/disabled, and focus colors
against every background surface.

Usage:
    python3 scripts/contrast-audit-expanded.py
    python3 scripts/contrast-audit-expanded.py --tokens tokens/design-tokens.json
    python3 scripts/contrast-audit-expanded.py --output audits/expanded-audit.json

Exit code is always 0 (advisory, not blocking).
"""

import json
import argparse
import sys
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Dynamic palette registry (optional)
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "scripts"))
try:
    from registry import get_all_palettes
except ImportError:
    get_all_palettes = None

# ---------------------------------------------------------------------------
# WCAG colour-science helpers
# ---------------------------------------------------------------------------

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert a hex colour string to an (R, G, B) tuple (0-255 each)."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def relative_luminance(r: int, g: int, b: int) -> float:
    """Calculate relative luminance per WCAG 2.1 spec (sRGB linearisation)."""
    srgb = []
    for c in (r, g, b):
        c_linear = c / 255.0
        if c_linear <= 0.03928:
            srgb.append(c_linear / 12.92)
        else:
            srgb.append(((c_linear + 0.055) / 1.055) ** 2.4)
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]


def contrast_ratio(hex1: str, hex2: str) -> float:
    """Return the WCAG contrast ratio between two hex colours."""
    l1 = relative_luminance(*hex_to_rgb(hex1))
    l2 = relative_luminance(*hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


# ---------------------------------------------------------------------------
# Token helpers
# ---------------------------------------------------------------------------

def _get_value(token_obj) -> str:
    """Extract the $value from a token object or return the raw string."""
    if isinstance(token_obj, dict):
        return token_obj.get("$value", token_obj.get("value", ""))
    return str(token_obj) if token_obj is not None else ""


def _resolve_alias(value: str, primitives: dict) -> str:
    """Resolve a token alias like '{color.primitive.blue.600}' to a hex value.

    Follows the reference chain through the primitives dict. Returns the
    original string unchanged if it cannot be resolved.
    """
    if not isinstance(value, str) or not value.startswith("{"):
        return value

    path = value.strip("{}").split(".")

    # The primitives dict is already at the "color.primitive" level,
    # so skip the first two segments if they match.
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


# ---------------------------------------------------------------------------
# Semantic colour extraction
# ---------------------------------------------------------------------------

def _resolve_semantic(semantic_section: dict, primitives: dict) -> dict:
    """Flatten the semantic colour section into a dict of token-name -> hex.

    Handles nested groups like semantic.bg.primary -> "bg-primary".
    """
    result = {}

    for key, val in semantic_section.items():
        if key.startswith("$"):
            continue

        if isinstance(val, dict) and "$value" in val:
            # Top-level semantic token (e.g. "success", "success-bg")
            raw = _get_value(val)
            resolved = _resolve_alias(raw, primitives)
            if isinstance(resolved, str) and resolved.startswith("#"):
                result[key] = resolved
        elif isinstance(val, dict):
            # Nested group (e.g. "bg", "text", "brand", "border")
            for sub_key, sub_val in val.items():
                if sub_key.startswith("$"):
                    continue
                raw = _get_value(sub_val)
                resolved = _resolve_alias(raw, primitives)
                if isinstance(resolved, str) and resolved.startswith("#"):
                    result[f"{key}-{sub_key}"] = resolved

    return result


# ---------------------------------------------------------------------------
# Palette colour extraction
# ---------------------------------------------------------------------------

def extract_all_palette_colors(tokens: dict) -> dict:
    """Extract every resolved hex colour for each palette x mode.

    Returns:
        {
            "palette-name": {
                "light": {"token-name": "#hex", ...},
                "dark":  {"token-name": "#hex", ...}
            },
            ...
        }

    Also merges in semantic colours (status, surface, disabled, etc.) that
    are shared across all palettes.
    """
    color_section = tokens.get("color", {})
    primitives = color_section.get("primitive", {})
    semantic_section = color_section.get("semantic", {})
    theme_section = tokens.get("theme", {})

    # Resolve shared semantic colours once
    semantic_colors = _resolve_semantic(semantic_section, primitives)

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

        # ----- Newer format: explicit light/dark sub-dicts -----
        if "light" in palette_data and isinstance(palette_data["light"], dict):
            for mode in ("light", "dark"):
                mode_data = palette_data.get(mode, {})
                for token_key, token_obj in mode_data.items():
                    if token_key.startswith("$"):
                        continue
                    raw = _get_value(token_obj)
                    resolved = _resolve_alias(raw, primitives)
                    if isinstance(resolved, str) and resolved.startswith("#"):
                        result[palette_name][mode][token_key] = resolved

        # ----- Older format: flat keys with _dark suffix -----
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

        # Merge semantic colours as a baseline into each mode.
        # Palette-specific tokens take precedence over semantics.
        for mode in ("light", "dark"):
            merged = dict(semantic_colors)
            merged.update(result[palette_name][mode])
            result[palette_name][mode] = merged

    return result


# ---------------------------------------------------------------------------
# Token classification
# ---------------------------------------------------------------------------

# Tokens whose primary role is *foreground* (text, icons, status labels, etc.)
FOREGROUND_PREFIXES = (
    "text-",
    "brand-",
    "success",
    "warning",
    "error",
    "info",
    "border-",
    "surface-",
    "overlay",
)

# Tokens whose primary role is *background* (surfaces, cards, status-bg, etc.)
BACKGROUND_PREFIXES = (
    "bg-",
    "brand-muted",
    "success-bg",
    "warning-bg",
    "error-bg",
    "info-bg",
    "surface-",
)

# Non-colour tokens or tokens that should not participate in contrast checks
SKIP_SUFFIXES = ("-rgb",)


def classify_token(name: str) -> dict:
    """Return classification flags for a token name.

    Returns dict with keys:
        is_foreground: bool
        is_background: bool
        is_large_text_or_ui: bool  -- qualifies for the 3:1 threshold
        skip: bool                 -- should be excluded entirely
    """
    lower = name.lower()

    # Skip non-colour tokens (e.g. brand-primary-rgb)
    for suffix in SKIP_SUFFIXES:
        if lower.endswith(suffix):
            return {"is_foreground": False, "is_background": False,
                    "is_large_text_or_ui": False, "skip": True}

    is_fg = False
    is_bg = False
    is_large = False

    # Foreground checks
    for prefix in FOREGROUND_PREFIXES:
        if lower.startswith(prefix) or lower == prefix.rstrip("-"):
            is_fg = True
            break

    # Background checks
    for prefix in BACKGROUND_PREFIXES:
        if lower.startswith(prefix) or lower == prefix.rstrip("-"):
            is_bg = True
            break

    # Specific names that are always foreground
    if lower in ("success", "warning", "error", "info", "overlay"):
        is_fg = True

    # Specific names that are always background
    if lower in ("success-bg", "warning-bg", "error-bg", "info-bg"):
        is_bg = True
        is_fg = False  # status-bg is not foreground

    # Large text / UI element threshold (3:1 instead of 4.5:1)
    # - tertiary text is decorative / large-use
    # - brand colours used as links/icons are "large text or UI"
    # - border tokens count as UI elements
    # - disabled text has relaxed expectation (but we still flag at 3:1)
    if any(lower.startswith(p) for p in ("brand-", "border-", "text-tertiary",
                                          "text-disabled", "surface-")):
        is_large = True

    # Status colours used as text indicators are typically large / bold
    if lower in ("success", "warning", "error", "info"):
        is_large = True

    return {
        "is_foreground": is_fg,
        "is_background": is_bg,
        "is_large_text_or_ui": is_large,
        "skip": False,
    }


def determine_required_ratio(fg_name: str, bg_name: str, fg_class: dict) -> float:
    """Return the WCAG AA required contrast ratio for this fg/bg pair.

    - 4.5:1 for normal (body) text
    - 3.0:1 for large text and UI components
    """
    if fg_class.get("is_large_text_or_ui"):
        return 3.0
    return 4.5


# ---------------------------------------------------------------------------
# Core audit
# ---------------------------------------------------------------------------

def run_expanded_audit(tokens_path: str, output_path: str):
    """Run the expanded WCAG contrast audit across all combinations."""

    with open(tokens_path, "r") as f:
        tokens = json.load(f)

    palette_colors = extract_all_palette_colors(tokens)

    # Accumulators
    total_pairs = 0
    pass_count = 0
    fail_count = 0
    skip_count = 0
    violations = []
    per_palette = {}
    skipped_tokens_set = set()

    for palette in sorted(palette_colors.keys()):
        per_palette[palette] = {
            "light": {"tested": 0, "passed": 0, "failed": 0, "skipped": 0},
            "dark": {"tested": 0, "passed": 0, "failed": 0, "skipped": 0},
        }

        for mode in ("light", "dark"):
            colors = palette_colors[palette].get(mode, {})
            mode_stats = per_palette[palette][mode]

            # Classify every token
            token_classes = {}
            for name in colors:
                token_classes[name] = classify_token(name)

            # Collect foreground and background token names
            fg_tokens = [n for n, c in token_classes.items()
                         if c["is_foreground"] and not c["skip"]]
            bg_tokens = [n for n, c in token_classes.items()
                         if c["is_background"] and not c["skip"]]

            # Record skipped tokens
            for name, cls in token_classes.items():
                if cls["skip"]:
                    skipped_tokens_set.add(name)

            # Test every fg x bg combination
            for fg_name in sorted(fg_tokens):
                fg_hex = colors[fg_name]
                fg_class = token_classes[fg_name]

                for bg_name in sorted(bg_tokens):
                    bg_hex = colors[bg_name]

                    # Skip if fg and bg are the same token
                    if fg_name == bg_name:
                        continue

                    total_pairs += 1
                    mode_stats["tested"] += 1

                    required = determine_required_ratio(fg_name, bg_name, fg_class)
                    ratio = round(contrast_ratio(fg_hex, bg_hex), 2)
                    passed = ratio >= required

                    if passed:
                        pass_count += 1
                        mode_stats["passed"] += 1
                    else:
                        fail_count += 1
                        mode_stats["failed"] += 1
                        violations.append({
                            "palette": palette,
                            "mode": mode,
                            "fg_token": fg_name,
                            "bg_token": bg_name,
                            "fg_hex": fg_hex,
                            "bg_hex": bg_hex,
                            "ratio": ratio,
                            "required_ratio": required,
                            "level": "AA-normal" if required == 4.5 else "AA-large/UI",
                        })

    # Build output
    coverage_pct = round((pass_count / total_pairs * 100), 1) if total_pairs > 0 else 0.0

    report = {
        "title": "Expanded WCAG 2.1 AA Contrast Audit",
        "description": (
            "Tests ALL foreground/background token combinations across "
            "every palette and mode, not just the 6 critical pairs."
        ),
        "generated": datetime.now().isoformat(),
        "standard": "WCAG 2.1 AA",
        "thresholds": {
            "normal_text": "4.5:1",
            "large_text_and_ui": "3.0:1",
        },
        "summary": {
            "palettes_tested": len(palette_colors),
            "modes_tested": 2,
            "total_pairs_tested": total_pairs,
            "passed": pass_count,
            "failed": fail_count,
            "skipped_tokens": sorted(skipped_tokens_set),
            "coverage_percentage": coverage_pct,
        },
        "per_palette": per_palette,
        "violations": violations,
    }

    # Write output
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w") as f:
        json.dump(report, f, indent=2)
        f.write("\n")

    # ----- stdout summary -----
    print("=" * 70)
    print("  Expanded WCAG 2.1 AA Contrast Audit")
    print("=" * 70)
    print()
    print(f"  Palettes tested:     {len(palette_colors)}")
    print(f"  Modes:               light, dark")
    print(f"  Total pairs tested:  {total_pairs}")
    print(f"  Passed:              {pass_count}")
    print(f"  Failed:              {fail_count}")
    print(f"  Coverage:            {coverage_pct}%")
    print()

    if skipped_tokens_set:
        print(f"  Skipped tokens (non-colour): {', '.join(sorted(skipped_tokens_set))}")
        print()

    # Per-palette table
    print("  Per-palette breakdown:")
    print("  {:<22} {:>6} {:>6} {:>6} {:>6} {:>6}".format(
        "Palette", "Mode", "Tests", "Pass", "Fail", "Skip"))
    print("  " + "-" * 58)
    for palette in sorted(per_palette.keys()):
        for mode in ("light", "dark"):
            s = per_palette[palette][mode]
            print("  {:<22} {:>6} {:>6} {:>6} {:>6} {:>6}".format(
                palette, mode, s["tested"], s["passed"], s["failed"], s["skipped"]))
    print()

    # Violations summary
    if violations:
        print(f"  Violations ({len(violations)} total):")
        print("  {:<20} {:>5}  {:<20} {:<20} {:>7} {:>7}".format(
            "Palette", "Mode", "Foreground", "Background", "Ratio", "Req."))
        print("  " + "-" * 85)
        for v in violations[:50]:
            print("  {:<20} {:>5}  {:<20} {:<20} {:>6}:1 {:>5}:1".format(
                v["palette"], v["mode"],
                v["fg_token"][:20], v["bg_token"][:20],
                v["ratio"], v["required_ratio"]))
        if len(violations) > 50:
            print(f"  ... and {len(violations) - 50} more (see {output_path})")
        print()
    else:
        print("  No violations found. All tested pairs pass WCAG 2.1 AA.")
        print()

    print(f"  Output: {output_path}")
    print()

    # Always exit 0 (advisory)
    return True


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Expanded WCAG 2.1 AA Contrast Audit — all fg/bg combinations"
    )
    parser.add_argument(
        "--tokens",
        default="tokens/design-tokens.json",
        help="Path to design tokens JSON (default: tokens/design-tokens.json)",
    )
    parser.add_argument(
        "--output",
        default="audits/expanded-audit.json",
        help="Output path (default: audits/expanded-audit.json)",
    )
    args = parser.parse_args()

    run_expanded_audit(args.tokens, args.output)
    sys.exit(0)
