#!/usr/bin/env python3
"""
Shared utility functions for WCAG and APCA contrast audits.

Centralises color extraction, token alias resolution, and hex parsing
so that wcag-audit.py and apca-audit.py can share a single implementation.
"""

import sys
from pathlib import Path

# Dynamic palette registry
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "scripts"))
try:
    from registry import get_all_palettes
except ImportError:
    get_all_palettes = None

# Default palette list (fallback when registry is unavailable)
DEFAULT_PALETTES = [
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


def parse_hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color string to (R, G, B) tuple.

    Accepts '#RRGGBB', 'RRGGBB', '#RGB', or 'RGB' formats.
    """
    hex_color = hex_color.strip().lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


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

    Returns a dict like::

        {
            "corporate": {
                "light": {"text-primary": "#1A202C", ...},
                "dark":  {"text-primary": "#E2E8F0", ...}
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
        palette_names = list(DEFAULT_PALETTES)

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
    l1 = relative_luminance(*parse_hex_to_rgb(hex1))
    l2 = relative_luminance(*parse_hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
