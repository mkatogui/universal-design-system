"""
Palette Registry — single source of truth for all palette names.

Reads from tokens/palette-registry.json. Provides helpers for listing,
adding, and removing custom palettes.
"""

import json
from pathlib import Path

REGISTRY_PATH = Path(__file__).parent.parent.parent / "tokens" / "palette-registry.json"

# Fallback if registry file doesn't exist yet
_BUILTIN_FALLBACK = [
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


def _read_registry() -> dict:
    """Read the registry JSON. Returns fallback structure if file missing."""
    if not REGISTRY_PATH.exists():
        return {"builtin": list(_BUILTIN_FALLBACK), "custom": []}
    with open(REGISTRY_PATH, "r") as f:
        return json.load(f)


def _write_registry(data: dict) -> None:
    """Write registry JSON with consistent formatting."""
    with open(REGISTRY_PATH, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def get_builtin_palettes() -> list:
    """Return list of built-in palette slug strings."""
    return list(_read_registry().get("builtin", _BUILTIN_FALLBACK))


def get_custom_palettes() -> list:
    """Return list of custom palette dicts (name, source_colors, shape)."""
    return list(_read_registry().get("custom", []))


def get_custom_palette_names() -> list:
    """Return just the names of custom palettes."""
    return [p["name"] for p in get_custom_palettes()]


def get_all_palettes() -> list:
    """Return combined list of all palette slug strings (builtin + custom names)."""
    registry = _read_registry()
    builtin = registry.get("builtin", _BUILTIN_FALLBACK)
    custom_names = [p["name"] for p in registry.get("custom", [])]
    return list(builtin) + custom_names


def add_custom_palette(name: str, source_colors: list, shape: str = "balanced") -> None:
    """Register a new custom palette. Raises ValueError if name conflicts."""
    registry = _read_registry()

    # Check for conflicts
    all_names = registry.get("builtin", []) + [p["name"] for p in registry.get("custom", [])]
    if name in all_names:
        raise ValueError(f"Palette '{name}' already exists")

    # Validate name format
    if not name.replace("-", "").replace("_", "").isalnum():
        raise ValueError(f"Palette name must be alphanumeric with hyphens/underscores: '{name}'")

    registry.setdefault("custom", []).append({
        "name": name,
        "source_colors": source_colors,
        "shape": shape,
    })
    _write_registry(registry)


def remove_custom_palette(name: str) -> None:
    """Remove a custom palette by name. Raises ValueError if not found."""
    registry = _read_registry()

    if name in registry.get("builtin", []):
        raise ValueError(f"Cannot remove built-in palette '{name}'")

    custom = registry.get("custom", [])
    new_custom = [p for p in custom if p["name"] != name]
    if len(new_custom) == len(custom):
        raise ValueError(f"Custom palette '{name}' not found")

    registry["custom"] = new_custom
    _write_registry(registry)


if __name__ == "__main__":
    print("Palette Registry")
    print("=" * 40)
    print(f"Built-in: {get_builtin_palettes()}")
    print(f"Custom:   {get_custom_palette_names()}")
    print(f"All:      {get_all_palettes()}")
