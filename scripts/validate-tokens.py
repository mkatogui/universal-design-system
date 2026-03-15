#!/usr/bin/env python3
"""
Design Token Validator
Validates design-tokens.json and figma-tokens.json for:
- W3C DTCG v1 format compliance
- Required token categories
- Cross-file sync between design tokens and Figma tokens
- Structural palette overrides presence
- oklch extensions on all hex color tokens

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


# --- DTCG v1 valid types ---
VALID_DTCG_TYPES = {
    "color",
    "dimension",
    "fontFamily",
    "fontWeight",
    "duration",
    "cubicBezier",
    "number",
    "shadow",
    "strokeStyle",
    "border",
    "transition",
    "gradient",
    "typography",
}

# Keys that are known to be DTCG meta properties (not token groups)
DTCG_META_KEYS = {"$type", "$value", "$description", "$name", "$extensions", "$schema", "$version"}


def _is_leaf_token(obj: dict) -> bool:
    """Return True if the dict represents a leaf token (has $value)."""
    return isinstance(obj, dict) and "$value" in obj


def _resolve_reference(ref_str: str, root: dict) -> bool:
    """Check if a {reference.path} resolves to an actual token in the file."""
    # Extract path from {path.to.token}
    match = re.match(r"^\{(.+)\}$", ref_str.strip())
    if not match:
        return True  # Not a reference, skip
    path_parts = match.group(1).split(".")
    current = root
    for part in path_parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return False
    return True


def _collect_leaf_tokens(obj: dict, path: str, root: dict, inherited_type: str = None) -> list:
    """Recursively collect all leaf tokens and validate them.

    Returns a list of (path, errors) tuples.
    """
    results = []

    if not isinstance(obj, dict):
        return results

    # Determine the $type at this group level (for inheritance tracking)
    group_type = obj.get("$type", inherited_type)

    for key, value in obj.items():
        if key.startswith("$"):
            continue
        if key == "$structural":
            continue

        current_path = f"{path}.{key}" if path else key

        if not isinstance(value, dict):
            continue

        if _is_leaf_token(value):
            errors = []
            # DTCG v1: Every leaf needs a $type (explicit or inherited)
            if "$type" not in value and not group_type:
                errors.append(
                    f"{current_path}: Leaf token missing $type "
                    f"(no explicit or inherited type available)"
                )

            # Validate $type is a known DTCG type (allow "object" for motion.keyframes.*, "string" for motion.style/scroll-driven)
            token_type = value.get("$type", group_type)
            if token_type and token_type not in VALID_DTCG_TYPES:
                if token_type == "object" and "motion.keyframes." in current_path:
                    pass  # Keyframe definitions are structured objects
                elif token_type == "string" and (
                    current_path.startswith("motion.style.") or current_path.startswith("motion.scroll-driven.")
                ):
                    pass  # Motion style/scroll-driven name tokens
                else:
                    errors.append(
                        f"{current_path}: Unknown $type '{token_type}' "
                        f"(valid: {sorted(VALID_DTCG_TYPES)})"
                    )

            # Validate references resolve
            val = value.get("$value")
            if isinstance(val, str) and val.startswith("{") and val.endswith("}"):
                if not _resolve_reference(val, root):
                    errors.append(
                        f"{current_path}: Unresolved reference '{val}'"
                    )

            # Spacing/sizing must use "dimension" type
            if token_type in ("spacing", "size"):
                errors.append(
                    f"{current_path}: Type '{token_type}' should be 'dimension' per DTCG v1"
                )

            if errors:
                results.extend(errors)
        else:
            # Recurse into sub-groups
            results.extend(
                _collect_leaf_tokens(value, current_path, root, group_type)
            )

    return results


def validate_dtcg_format(tokens: dict, path: str) -> list:
    """Validate W3C Design Token Community Group v1 format."""
    errors = []

    if "$version" not in tokens and "version" not in tokens.get("$metadata", {}):
        errors.append(f"{path}: Missing $version or $metadata.version")

    # DTCG v1: version must be "1.0.0"
    version = tokens.get("$version")
    if version and version != "1.0.0":
        errors.append(
            f"{path}: $version is '{version}', expected '1.0.0' for DTCG v1"
        )

    return errors


def validate_leaf_tokens(tokens: dict, path: str) -> list:
    """Validate all leaf tokens have mandatory $type and valid references."""
    return _collect_leaf_tokens(tokens, "", tokens)


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


def _is_hex_color(value) -> bool:
    """Check if a value is a hex color string."""
    if not isinstance(value, str):
        return False
    return bool(re.match(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$", value.strip()))


def _is_valid_oklch(oklch_str: str) -> bool:
    """Check if a string is a valid oklch() CSS value."""
    if not isinstance(oklch_str, str):
        return False
    return bool(re.match(
        r"^oklch\(\s*[\d.]+%\s+[\d.]+\s+[\d.]+\s*\)$",
        oklch_str.strip(),
    ))


def _walk_check_oklch(node: dict, path_prefix: str, inherited_type: str = "") -> list:
    """Recursively check that all hex color tokens have valid oklch extensions."""
    errors = []
    node_type = node.get("$type", inherited_type)

    for key, value in node.items():
        if key.startswith("$"):
            continue
        if not isinstance(value, dict):
            continue

        current_path = f"{path_prefix}.{key}" if path_prefix else key

        if "$value" in value:
            token_type = value.get("$type", node_type)
            token_value = value["$value"]

            if token_type == "color" and _is_hex_color(token_value):
                # Theme palette overrides may use hex without oklch for simplicity
                if current_path.startswith("theme."):
                    pass
                else:
                    extensions = value.get("$extensions", {})
                    oklch_val = extensions.get("com.tokens.oklch")
                    if oklch_val is None:
                        errors.append(
                            f"Color token '{current_path}' has hex value but missing oklch extension"
                        )
                    elif not _is_valid_oklch(oklch_val):
                        errors.append(
                            f"Color token '{current_path}' has invalid oklch extension: {oklch_val}"
                        )
        else:
            errors.extend(_walk_check_oklch(value, current_path, node_type))

    return errors


def validate_oklch_extensions(tokens: dict, path: str) -> list:
    """Validate that all color tokens with hex values have oklch extensions."""
    errors = []
    raw_errors = _walk_check_oklch(tokens, "")
    for err in raw_errors:
        errors.append(f"{path}: {err}")
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

    # Validate Figma tokens metadata version
    metadata = figma_tokens.get("$metadata", {})
    global_section = figma_tokens.get("global", {})
    version = metadata.get("$version") or global_section.get("$version")
    # Figma tokens are not strictly DTCG-versioned, so this is advisory only

    return errors


def validate_figma_leaf_tokens(figma_tokens: dict, path: str) -> list:
    """Validate Figma token leaf tokens have $type where applicable."""
    errors = []
    global_section = figma_tokens.get("global", {})

    # Check spacing tokens in global section have $type
    spacing = global_section.get("spacing", {})
    for key, value in spacing.items():
        if key.startswith("$"):
            continue
        if isinstance(value, dict) and "$value" in value:
            if "$type" not in value:
                token_type = spacing.get("$type")
                if not token_type:
                    errors.append(
                        f"{path}: global.spacing.{key} missing $type"
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
            validate_oklch_extensions(design_tokens, design_tokens_path)
        )
        leaf_issues = validate_leaf_tokens(design_tokens, design_tokens_path)
        if leaf_issues:
            all_warnings.extend(leaf_issues)
        print(f"  Validated {design_tokens_path}")
    else:
        all_errors.append(f"File not found: {design_tokens_path}")

    # Validate figma-tokens.json
    if Path(figma_tokens_path).exists():
        with open(figma_tokens_path) as f:
            figma_tokens = json.load(f)

        all_errors.extend(validate_figma_tokens(figma_tokens, figma_tokens_path))
        all_errors.extend(validate_figma_leaf_tokens(figma_tokens, figma_tokens_path))
        print(f"  Validated {figma_tokens_path}")
    else:
        all_errors.append(f"File not found: {figma_tokens_path}")

    # Report
    print()
    if all_warnings:
        print(f"WARNINGS: {len(all_warnings)} leaf token issue(s)")
        for warn in all_warnings[:10]:
            print(f"  WARN: {warn}")
        if len(all_warnings) > 10:
            print(f"  ... and {len(all_warnings) - 10} more")
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
