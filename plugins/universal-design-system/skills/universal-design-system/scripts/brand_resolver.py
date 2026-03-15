#!/usr/bin/env python3
"""Brand override resolver — merges brand tokens with base palette.

Usage:
    from brand_resolver import resolve, list_brands

    # Merge a brand's overrides with the base design tokens
    merged = resolve("acme-corp")

    # List all available brand names (excludes _template)
    brands = list_brands()

Can also be invoked as a package import:
    from src.scripts.brand_resolver import resolve
"""

import json
from pathlib import Path

BRANDS_DIR = Path(__file__).parent.parent.parent / "tokens" / "brands"
BASE_TOKENS = Path(__file__).parent.parent.parent / "tokens" / "design-tokens.json"


def resolve(brand_name: str) -> dict:
    """Load brand overrides and deep-merge with base tokens.

    Args:
        brand_name: The brand identifier (matches the JSON filename stem
                    inside tokens/brands/).

    Returns:
        A dict containing the full token tree with brand overrides applied.

    Raises:
        FileNotFoundError: If the brand file or base tokens file is missing.
    """
    base = _load_json(BASE_TOKENS)
    brand_path = BRANDS_DIR / f"{brand_name}.json"
    brand = _load_json(brand_path)
    return _deep_merge(base, brand)


def list_brands() -> list:
    """List available brand names (excludes _template).

    Returns:
        Sorted list of brand name strings.
    """
    return sorted(
        f.stem for f in BRANDS_DIR.glob("*.json") if f.stem != "_template"
    )


def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge *override* into *base*.

    Values in *override* take precedence. Both dicts are left unmodified;
    a new dict is returned.
    """
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def _load_json(path: Path) -> dict:
    """Read and parse a JSON file."""
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python brand_resolver.py <brand-name>")
        print(f"Available brands: {list_brands()}")
        sys.exit(1)

    name = sys.argv[1]
    merged = resolve(name)
    print(json.dumps(merged, indent=2))
