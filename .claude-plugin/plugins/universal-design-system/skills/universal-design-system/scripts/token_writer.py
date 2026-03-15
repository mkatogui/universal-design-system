"""
Token File Writer — generates CSS, JSON, and Figma token files for custom palettes.

Outputs match the existing format in design-tokens.json, figma-tokens.json,
and docs/docs.html.
"""

import json
from pathlib import Path

from src.scripts.color_engine import hex_to_oklch, oklch_to_css

TOKENS_DIR = Path(__file__).parent.parent.parent / "tokens"
CUSTOM_DIR = TOKENS_DIR / "custom"


def hex_to_oklch_css(hex_color: str) -> str:
    """Convert a hex color string to a CSS oklch() string.

    Args:
        hex_color: Hex color like '#RRGGBB' or '#RGB'.

    Returns:
        CSS oklch string like 'oklch(54.1% 0.2074 262.9)'.

    Example:
        >>> hex_to_oklch_css('#2563EB')
        'oklch(54.1% 0.2074 262.9)'
    """
    oklch_dict = hex_to_oklch(hex_color)
    return oklch_to_css(oklch_dict)


def _css_var_name(token_key: str) -> str:
    """Convert underscore token key to CSS custom property name.
    e.g. 'bg_primary' -> '--color-bg-primary'
         'success' -> '--color-success'
    """
    name = token_key.replace("_", "-")
    # brand_primary_rgb -> --color-brand-primary-rgb (already handled by replace)
    return f"--color-{name}"


def generate_css(name: str, palette: dict) -> str:
    """Generate CSS custom properties for a palette (light + dark modes).

    Args:
        name: palette slug (e.g. 'my-brand')
        palette: dict from PaletteDeriver.derive()

    Returns:
        CSS string with [data-theme="name"] selectors
    """
    light = palette["light"]
    dark = palette["dark"]
    radius = palette.get("radius", {})
    shadows_light = palette.get("shadows_light", {})
    shadows_dark = palette.get("shadows_dark", {})
    structural = palette.get("structural", {})

    lines = []
    lines.append(f'/* Custom palette: {name} */')
    lines.append(f'[data-theme="{name}"] {{')

    # Color tokens
    for key, value in light.items():
        lines.append(f"  {_css_var_name(key)}: {value};")

    # Shadows
    for key, value in shadows_light.items():
        lines.append(f"  --shadow-{key}: {value};")

    # Gradients
    if "gradient_light" in palette:
        lines.append(f"  --gradient-hero: {palette['gradient_light']};")
        lines.append(f"  --gradient-cta: {palette['gradient_light']};")

    # Radius
    for key, value in radius.items():
        if key.startswith("radius_"):
            css_key = key.replace("radius_", "--radius-")
            lines.append(f"  {css_key}: {value};")

    # Font display
    font = structural.get("font-display", "Inter")
    lines.append(f"  --font-display: '{font}', system-ui, sans-serif;")

    lines.append("}")
    lines.append("")

    # Dark mode
    lines.append(f'html.docs-dark[data-theme="{name}"] {{')
    for key, value in dark.items():
        lines.append(f"  {_css_var_name(key)}: {value};")

    for key, value in shadows_dark.items():
        lines.append(f"  --shadow-{key}: {value};")

    if "gradient_dark" in palette:
        lines.append(f"  --gradient-hero: {palette['gradient_dark']};")
        lines.append(f"  --gradient-cta: {palette['gradient_dark']};")

    lines.append("}")

    return "\n".join(lines)


def generate_dtcg_json(name: str, palette: dict) -> dict:
    """Generate W3C DTCG JSON entry matching design-tokens.json theme format.

    Returns dict to be placed at tokens["theme"][name].
    Uses underscore-separated flat keys with _dark suffix.
    """
    light = palette["light"]
    dark = palette["dark"]
    structural = palette.get("structural", {})

    entry = {
        "$description": f"Custom palette: {name}",
    }

    # Light mode tokens
    for key, value in light.items():
        entry[key] = {"$value": value, "$description": "Light mode"}

    # Dark mode tokens (with _dark suffix)
    for key, value in dark.items():
        entry[f"{key}_dark"] = {"$value": value, "$description": "Dark mode"}

    # Structural
    entry["$structural"] = dict(structural)

    return entry


def generate_figma_json(name: str, palette: dict) -> dict:
    """Generate Figma token entry matching figma-tokens.json format.

    Returns dict to be placed at tokens[f"theme/{name}"].
    Uses hyphen-separated keys under "color" sub-key.
    """
    light = palette["light"]
    radius = palette.get("radius", {})
    structural = palette.get("structural", {})
    radius_desc = palette.get("radius_description", "custom identity")

    # Color tokens (subset matching existing format)
    color_keys = [
        "bg_primary", "bg_secondary", "text_primary", "text_secondary",
        "brand_primary", "brand_secondary",
    ]
    color_section = {}
    for key in color_keys:
        if key in light:
            figma_key = key.replace("_", "-")
            color_section[figma_key] = {"$value": light[key], "$type": "color"}

    # Radius tokens
    radius_section = {}
    radius_mapping = {
        "radius_sm": "sm", "radius_md": "md", "radius_lg": "lg",
        "radius_xl": "xl", "radius_2xl": "2xl", "radius_full": "full",
    }
    for src_key, figma_key in radius_mapping.items():
        if src_key in radius:
            radius_section[figma_key] = {
                "value": radius[src_key],
                "type": "borderRadius",
                "description": radius_desc,
            }

    # Typography
    font = structural.get("font-display", "Inter")
    typography_section = {
        "fontDisplay": {"value": font, "type": "fontFamilies"}
    }

    return {
        "color": color_section,
        "radius": radius_section,
        "typography": typography_section,
        "$structural": {"shape": structural.get("shape", "balanced")},
    }


def write_custom_css(name: str, palette: dict) -> Path:
    """Write standalone CSS file to tokens/custom/<name>.css."""
    CUSTOM_DIR.mkdir(parents=True, exist_ok=True)
    css = generate_css(name, palette)
    path = CUSTOM_DIR / f"{name}.css"
    path.write_text(css + "\n")
    return path


def write_custom_json(name: str, palette: dict) -> Path:
    """Write standalone JSON token file to tokens/custom/<name>.json."""
    CUSTOM_DIR.mkdir(parents=True, exist_ok=True)
    data = {
        "name": name,
        "light": palette["light"],
        "dark": palette["dark"],
        "structural": palette.get("structural", {}),
        "radius": palette.get("radius", {}),
    }
    path = CUSTOM_DIR / f"{name}.json"
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    return path


def merge_into_design_tokens(name: str, palette: dict) -> None:
    """Add/update a custom palette entry in tokens/design-tokens.json."""
    dt_path = TOKENS_DIR / "design-tokens.json"
    with open(dt_path, "r") as f:
        tokens = json.load(f)

    tokens.setdefault("theme", {})[name] = generate_dtcg_json(name, palette)
    with open(dt_path, "w") as f:
        json.dump(tokens, f, indent=2)
        f.write("\n")


def merge_into_figma_tokens(name: str, palette: dict) -> None:
    """Add/update a custom palette entry in tokens/figma-tokens.json."""
    ft_path = TOKENS_DIR / "figma-tokens.json"
    with open(ft_path, "r") as f:
        tokens = json.load(f)

    theme_key = f"theme/{name}"

    # Add to tokenSetOrder if not present
    order = tokens.get("$metadata", {}).get("tokenSetOrder", [])
    if theme_key not in order:
        order.append(theme_key)
        tokens.setdefault("$metadata", {})["tokenSetOrder"] = order

    # Add theme entry
    tokens[theme_key] = generate_figma_json(name, palette)

    with open(ft_path, "w") as f:
        json.dump(tokens, f, indent=2)
        f.write("\n")


def remove_from_design_tokens(name: str) -> None:
    """Remove a custom palette from design-tokens.json."""
    dt_path = TOKENS_DIR / "design-tokens.json"
    with open(dt_path, "r") as f:
        tokens = json.load(f)

    if "theme" in tokens and name in tokens["theme"]:
        del tokens["theme"][name]
        with open(dt_path, "w") as f:
            json.dump(tokens, f, indent=2)
            f.write("\n")


def remove_from_figma_tokens(name: str) -> None:
    """Remove a custom palette from figma-tokens.json."""
    ft_path = TOKENS_DIR / "figma-tokens.json"
    with open(ft_path, "r") as f:
        tokens = json.load(f)

    theme_key = f"theme/{name}"

    # Remove from tokenSetOrder
    order = tokens.get("$metadata", {}).get("tokenSetOrder", [])
    if theme_key in order:
        order.remove(theme_key)

    # Remove theme entry
    if theme_key in tokens:
        del tokens[theme_key]

    with open(ft_path, "w") as f:
        json.dump(tokens, f, indent=2)
        f.write("\n")


def remove_custom_files(name: str) -> None:
    """Remove standalone CSS/JSON files for a custom palette."""
    for ext in ["css", "json"]:
        path = CUSTOM_DIR / f"{name}.{ext}"
        if path.exists():
            path.unlink()
