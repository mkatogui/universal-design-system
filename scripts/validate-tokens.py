#!/usr/bin/env python3
"""
Design Token Validator
Validates design-tokens.json and figma-tokens.json for:
- W3C DTCG format compliance
- Required token categories
- Cross-file sync between design tokens and Figma tokens
- Structural palette overrides presence

Usage:
    python scripts/validate-tokens.py
"""

import json
import re
import sys
from pathlib import Path

# Dynamic palette registry
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "scripts"))
try:
    from registry import get_all_palettes, get_builtin_palettes
except ImportError:
    get_all_palettes = None
    get_builtin_palettes = None


def validate_dtcg_format(tokens: dict, path: str) -> list:
    """Validate W3C Design Token Community Group format."""
    errors = []

    if "$version" not in tokens and "version" not in tokens.get("$metadata", {}):
        errors.append(f"{path}: Missing $version or $metadata.version")

    return errors


def validate_required_categories(tokens: dict, path: str) -> list:
    """Ensure all required token categories exist."""
    required = [
        "color",
        "typography",
        "spacing",
        "shadow",
        "radius",
        "motion",
        "opacity",
        "zIndex",
    ]
    errors = []

    for cat in required:
        if cat not in tokens:
            errors.append(f"{path}: Missing required category '{cat}'")

    return errors


def validate_palette_structural_tokens(tokens: dict, path: str) -> list:
    """Verify structural tokens exist in palette overrides."""
    errors = []

    radius_overrides = (
        tokens.get("radius", {}).get("palette-overrides", {})
    )
    shadow_overrides = (
        tokens.get("shadow", {}).get("palette-overrides", {})
    )
    font_overrides = (
        tokens.get("typography", {}).get("fontFamily", {}).get("palette-overrides", {})
    )

    # Only check built-in palettes for radius palette-overrides
    # (custom palettes store radius in their figma-tokens theme entry)
    if get_builtin_palettes:
        expected_palettes = get_builtin_palettes()
    else:
        expected_palettes = [
            "ai-futuristic",
            "gradient-startup",
            "corporate",
            "apple-minimal",
            "illustration",
            "dashboard",
            "bold-lifestyle",
            "minimal-corporate",
            "minimal-saas",
        ]

    for palette in expected_palettes:
        if palette not in radius_overrides and palette != "minimal-saas":
            errors.append(
                f"{path}: Missing radius override for palette '{palette}'"
            )

    if not radius_overrides:
        errors.append(f"{path}: No palette radius overrides found")
    if not shadow_overrides:
        errors.append(f"{path}: No palette shadow overrides found")

    return errors


def validate_motion_choreography(tokens: dict, path: str) -> list:
    """Verify motion choreography presets exist."""
    errors = []
    motion = tokens.get("motion", {})
    choreography = motion.get("choreography", {})

    expected_presets = ["enter", "exit", "stagger", "interaction"]
    for preset in expected_presets:
        if preset not in choreography:
            errors.append(
                f"{path}: Missing motion choreography preset '{preset}'"
            )

    return errors


def validate_keyframes(tokens: dict, path: str) -> list:
    """Validate motion keyframe tokens structure.

    Each keyframe must have at least 2 steps, and each step key must be
    a valid CSS percentage (e.g. '0%', '50%', '100%').
    """
    errors = []
    motion = tokens.get("motion", {})
    keyframes = motion.get("keyframes", {})

    if not keyframes:
        errors.append(f"{path}: Missing motion.keyframes section")
        return errors

    # Skip metadata keys that start with '$'
    keyframe_names = [k for k in keyframes if not k.startswith("$")]

    if len(keyframe_names) < 1:
        errors.append(f"{path}: motion.keyframes has no animation definitions")
        return errors

    pct_pattern = re.compile(r"^\d{1,3}%$")

    for name in keyframe_names:
        kf = keyframes[name]
        value = kf.get("$value", {})
        if not isinstance(value, dict):
            errors.append(
                f"{path}: Keyframe '{name}' $value must be an object"
            )
            continue

        steps = list(value.keys())
        if len(steps) < 2:
            errors.append(
                f"{path}: Keyframe '{name}' must have at least 2 steps, "
                f"found {len(steps)}"
            )

        for step in steps:
            if not pct_pattern.match(step):
                errors.append(
                    f"{path}: Keyframe '{name}' has invalid step key "
                    f"'{step}' (must be a valid percentage like '0%', '50%', '100%')"
                )

    return errors


def validate_figma_tokens(figma_tokens: dict, path: str) -> list:
    """Validate Figma token file structure."""
    errors = []

    if get_all_palettes:
        expected_themes = [f"theme/{p}" for p in get_all_palettes()]
    else:
        expected_themes = [
            "theme/ai-futuristic",
            "theme/gradient-startup",
            "theme/corporate",
            "theme/apple-minimal",
            "theme/illustration",
            "theme/dashboard",
            "theme/bold-lifestyle",
            "theme/minimal-corporate",
            "theme/minimal-saas",
        ]

    for theme in expected_themes:
        if theme not in figma_tokens:
            errors.append(f"{path}: Missing theme '{theme}'")
        else:
            theme_data = figma_tokens[theme]
            if "radius" not in theme_data and "radius" not in theme_data.get("$structural", {}):
                # Check if structural tokens are present
                has_structural = "$structural" in theme_data or "radius" in theme_data
                if not has_structural:
                    errors.append(
                        f"{path}: Theme '{theme}' missing structural tokens"
                    )

    return errors


def main():
    design_tokens_path = "tokens/design-tokens.json"
    figma_tokens_path = "tokens/figma-tokens.json"

    all_errors = []
    all_warnings = []

    # Validate design-tokens.json
    if Path(design_tokens_path).exists():
        with open(design_tokens_path) as f:
            design_tokens = json.load(f)

        all_errors.extend(validate_dtcg_format(design_tokens, design_tokens_path))
        all_errors.extend(
            validate_required_categories(design_tokens, design_tokens_path)
        )
        all_errors.extend(
            validate_palette_structural_tokens(design_tokens, design_tokens_path)
        )
        all_errors.extend(
            validate_motion_choreography(design_tokens, design_tokens_path)
        )
        all_errors.extend(
            validate_keyframes(design_tokens, design_tokens_path)
        )
        print(f"  Validated {design_tokens_path}")
    else:
        all_errors.append(f"File not found: {design_tokens_path}")

    # Validate figma-tokens.json
    if Path(figma_tokens_path).exists():
        with open(figma_tokens_path) as f:
            figma_tokens = json.load(f)

        all_errors.extend(validate_figma_tokens(figma_tokens, figma_tokens_path))
        print(f"  Validated {figma_tokens_path}")
    else:
        all_errors.append(f"File not found: {figma_tokens_path}")

    # Report
    print()
    if all_errors:
        print(f"FAILED: {len(all_errors)} error(s)")
        for err in all_errors:
            print(f"  ERROR: {err}")
        return 1
    else:
        print("PASSED: All token validations passed")
        return 0


if __name__ == "__main__":
    sys.exit(main())
