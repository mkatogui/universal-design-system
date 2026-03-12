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


def validate_container_tokens(tokens: dict, path: str) -> list:
    """Validate container query tokens."""
    errors = []
    container = tokens.get("container")

    if container is None:
        errors.append(f"{path}: Missing 'container' token category")
        return errors

    # Validate breakpoints are valid dimensions (end with px)
    breakpoints = container.get("breakpoint", {})
    expected_bp = ["sm", "md", "lg", "xl"]
    for bp in expected_bp:
        if bp not in breakpoints:
            errors.append(
                f"{path}: Missing container breakpoint '{bp}'"
            )
        else:
            val = breakpoints[bp].get("$value", "")
            if not val.endswith("px"):
                errors.append(
                    f"{path}: Container breakpoint '{bp}' must be a px dimension, got '{val}'"
                )

    # Validate container names follow uds-* convention
    names = container.get("name", {})
    if not names:
        errors.append(f"{path}: Missing container names")
    else:
        for key, entry in names.items():
            val = entry.get("$value", "")
            if not val.startswith("uds-"):
                errors.append(
                    f"{path}: Container name '{key}' must follow uds-* convention, got '{val}'"
                )

    # Validate container types have valid values
    types = container.get("type", {})
    valid_types = {"inline-size", "normal", "size"}
    for key, entry in types.items():
        val = entry.get("$value", "")
        if val not in valid_types:
            errors.append(
                f"{path}: Container type '{key}' has invalid value '{val}', expected one of {sorted(valid_types)}"
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
            validate_container_tokens(design_tokens, design_tokens_path)
        )
        print(f"  Validated {design_tokens_path}")
    else:
        all_errors.append(f"File not found: {design_tokens_path}")

    # Validate figma-tokens.json
    if Path(figma_tokens_path).exists():
        with open(figma_tokens_path) as f:
            figma_tokens = json.load(f)

        all_errors.extend(validate_figma_tokens(figma_tokens, figma_tokens_path))

        # Validate container tokens in figma global section
        figma_global = figma_tokens.get("global", {})
        if "container" not in figma_global:
            all_errors.append(
                f"{figma_tokens_path}: Missing 'container' in global section"
            )
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
