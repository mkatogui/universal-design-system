#!/usr/bin/env python3
"""
Token loading and resolution for Universal Design System.

Single responsibility: load design-tokens.json and resolve foundation/palette
tokens. No dependency on ReasoningEngine or core.
"""

import json
from pathlib import Path

TOKENS_PATH = Path(__file__).resolve().parent.parent.parent / "tokens" / "design-tokens.json"


def load_tokens() -> dict:
    """Load the design tokens JSON file."""
    if TOKENS_PATH.exists():
        with open(TOKENS_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _resolve_reference(tokens: dict, ref: str) -> str:
    """Resolve a DTCG token reference like {color.primitive.blue.600}."""
    if not ref.startswith("{") or not ref.endswith("}"):
        return ref
    path = ref[1:-1].split(".")
    current = tokens
    for part in path:
        if isinstance(current, dict):
            current = current.get(part, {})
        else:
            return ref
    if isinstance(current, dict) and "$value" in current:
        return current["$value"]
    return ref


def _format_shadow_value(layers) -> str:
    """Convert DTCG shadow token (list of layer dicts) to CSS box-shadow string.

    Each layer: {"color": "rgba(...)", "offsetX": "0px", "offsetY": "2px",
                 "blur": "4px", "spread": "0px"}
    Multi-layer shadows are joined with ', '.
    If the value is already a plain string, return it as-is.
    """
    if isinstance(layers, str):
        return layers
    if not isinstance(layers, list):
        return str(layers)
    parts = []
    for layer in layers:
        if isinstance(layer, dict):
            parts.append(
                f"{layer.get('offsetX', '0px')} {layer.get('offsetY', '0px')} "
                f"{layer.get('blur', '0px')} {layer.get('spread', '0px')} "
                f"{layer.get('color', 'rgba(0,0,0,0.1)')}"
            )
        elif isinstance(layer, str):
            parts.append(layer)
    return ", ".join(parts) if parts else "none"


def resolve_foundation_tokens(tokens: dict) -> dict:
    """Extract all foundation (non-palette) tokens from design-tokens.json.

    Returns a dict with keys: spacing, shadow, radius, motion_duration,
    motion_easing, font_family, font_size, font_weight, opacity, z_index.
    """
    result = {}

    # --- spacing (13 values) ---
    spacing_raw = tokens.get("spacing", {})
    result["spacing"] = {
        k: v["$value"]
        for k, v in spacing_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- shadow (6 levels) — convert DTCG arrays to CSS strings ---
    shadow_raw = tokens.get("shadow", {})
    result["shadow"] = {}
    for k, v in shadow_raw.items():
        if k.startswith("$") or k == "palette-overrides":
            continue
        if isinstance(v, dict) and "$value" in v:
            result["shadow"][k] = _format_shadow_value(v["$value"])

    # --- radius (foundation defaults) ---
    radius_raw = tokens.get("radius", {})
    result["radius"] = {
        k: v["$value"]
        for k, v in radius_raw.items()
        if not k.startswith("$") and k != "palette-overrides"
        and isinstance(v, dict) and "$value" in v
    }

    # --- motion.duration ---
    motion = tokens.get("motion", {})
    dur_raw = motion.get("duration", {})
    result["motion_duration"] = {
        k: v["$value"]
        for k, v in dur_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- motion.easing (cubicBezier → CSS string) ---
    ease_raw = motion.get("easing", {})
    result["motion_easing"] = {}
    for k, v in ease_raw.items():
        if k.startswith("$"):
            continue
        if isinstance(v, dict) and "$value" in v:
            vals = v["$value"]
            if isinstance(vals, list) and len(vals) == 4:
                result["motion_easing"][k] = (
                    f"cubic-bezier({vals[0]}, {vals[1]}, {vals[2]}, {vals[3]})"
                )

    # --- typography.fontFamily (4 stacks) ---
    typo = tokens.get("typography", {})
    ff_raw = typo.get("fontFamily", {})
    result["font_family"] = {}
    for k, v in ff_raw.items():
        if k.startswith("$") or k == "palette-overrides":
            continue
        if isinstance(v, dict) and "$value" in v:
            val = v["$value"]
            if isinstance(val, list):
                result["font_family"][k] = ", ".join(val)
            else:
                result["font_family"][k] = str(val)

    # --- typography.fontSize (10 values) ---
    fs_raw = typo.get("fontSize", {})
    result["font_size"] = {
        k: v["$value"]
        for k, v in fs_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- typography.fontWeight (5 values) ---
    fw_raw = typo.get("fontWeight", {})
    result["font_weight"] = {
        k: str(v["$value"])
        for k, v in fw_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- opacity (4 values) ---
    op_raw = tokens.get("opacity", {})
    result["opacity"] = {
        k: str(v["$value"])
        for k, v in op_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    # --- zIndex (7 values) ---
    zi_raw = tokens.get("zIndex", {})
    result["z_index"] = {
        k: str(v["$value"])
        for k, v in zi_raw.items()
        if not k.startswith("$") and isinstance(v, dict) and "$value" in v
    }

    return result


def resolve_palette_tokens(tokens: dict, palette: str) -> dict:
    """Extract token values for a specific palette from design-tokens.json."""
    theme_data = tokens.get("theme", {}).get(palette, {})
    if not theme_data:
        return {}

    resolved = {}

    def _categorize(key: str, raw):
        """Map a token key to the correct CSS custom property."""
        if key.startswith(("bg", "text", "brand", "border", "status", "error", "success", "warning", "info")):
            css_key = key.replace("_", "-")
            resolved[f"--color-{css_key}"] = raw
        elif key.startswith("shadow"):
            resolved[f"--shadow-{key.replace('_', '-')}"] = raw
        elif key.startswith("radius"):
            resolved[f"--radius-{key.replace('_', '-')}"] = raw
        elif key.startswith("font"):
            resolved[f"--{key.replace('_', '-')}"] = raw
        else:
            css_key = key.replace("_", "-")
            resolved[f"--color-{css_key}"] = raw

    # Detect format: newer palettes have "light"/"dark" sub-dicts
    if "light" in theme_data and isinstance(theme_data["light"], dict):
        # Newer format: light/dark sub-objects with hyphenated keys
        light = theme_data.get("light", {})
        for key, val in light.items():
            if isinstance(val, dict) and "$value" in val:
                raw = val["$value"]
                if isinstance(raw, str) and raw.startswith("{"):
                    raw = _resolve_reference(tokens, raw)
                _categorize(key, raw)

        # Process structural tokens (radius, shadow, font-display)
        structural = theme_data.get("$structural", {})
        for key, val in structural.items():
            if isinstance(val, dict) and "$value" in val:
                raw = val["$value"]
            elif isinstance(val, str):
                raw = val
            else:
                continue
            if isinstance(raw, str) and raw.startswith("{"):
                raw = _resolve_reference(tokens, raw)
            if key != "shape":
                _categorize(key, raw)
    else:
        # Older format: flat underscore keys (bg_primary, text_primary_dark, etc.)
        for key, val in theme_data.items():
            if key.startswith("$"):
                continue
            # Skip dark-mode tokens (use light only for output)
            if key.endswith("_dark"):
                continue
            if isinstance(val, dict) and "$value" in val:
                raw = val["$value"]
            elif isinstance(val, str):
                raw = val
            else:
                continue
            if isinstance(raw, str) and raw.startswith("{"):
                raw = _resolve_reference(tokens, raw)
            _categorize(key, raw)

    return resolved


def _to_camel(kebab: str) -> str:
    """Convert a kebab-case string to camelCase."""
    parts = kebab.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def classify_palette_tokens(palette_tokens: dict) -> dict:
    """Classify palette tokens into colors, shadows, radii, and font_display.

    Returns a dict with keys: colors, shadows, radii, font_display.
    Colors is a dict of group -> {name: value}, where value is the raw
    resolved value from palette_tokens.
    """
    colors: dict = {}
    shadows: dict = {}
    radii: dict = {}
    font_display = ""

    for token, value in palette_tokens.items():
        if token.startswith("--color-"):
            parts = token.replace("--color-", "").split("-")
            if len(parts) >= 2:
                group = parts[0]
                name = "-".join(parts[1:])
                if group not in colors:
                    colors[group] = {}
                colors[group][name] = value
            else:
                colors[parts[0]] = value
        elif token.startswith("--shadow-"):
            shadows[token.replace("--shadow-", "")] = value
        elif token.startswith("--radius-"):
            radii[token.replace("--radius-", "")] = value
        elif token == "--font-display":
            font_display = value

    return {
        "colors": colors,
        "shadows": shadows,
        "radii": radii,
        "font_display": font_display,
    }
