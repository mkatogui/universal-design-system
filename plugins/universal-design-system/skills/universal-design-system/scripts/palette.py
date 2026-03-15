#!/usr/bin/env python3
"""
Custom Palette CLI — create, preview, list, remove, and export custom palettes.

Usage:
    python src/scripts/palette.py create --name my-brand --colors "#3B82F6"
    python src/scripts/palette.py create --name duo-tone --colors "#E8590C,#7048E8" --shape round
    python src/scripts/palette.py preview --colors "#3B82F6"
    python src/scripts/palette.py list
    python src/scripts/palette.py remove --name my-brand
    python src/scripts/palette.py export --name my-brand --format css
    python src/scripts/palette.py export --name my-brand --format json
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from color_engine import (
    PaletteDeriver,
    TonalPalette,
    contrast_ratio,
    derive_harmony,
    recommend_primary,
    HARMONY_OPTIONS,
)
from registry import (
    get_all_palettes,
    get_builtin_palettes,
    get_custom_palettes,
    get_custom_palette_names,
    add_custom_palette,
    remove_custom_palette,
)
from token_writer import (
    generate_css,
    write_custom_css,
    write_custom_json,
    merge_into_design_tokens,
    merge_into_figma_tokens,
    remove_from_design_tokens,
    remove_from_figma_tokens,
    remove_custom_files,
)

CUSTOM_DIR = Path(__file__).parent.parent.parent / "tokens" / "custom"


def _parse_colors(colors_str: str) -> list:
    """Parse comma-separated hex colors."""
    colors = [c.strip() for c in colors_str.split(",")]
    for c in colors:
        c_clean = c.lstrip("#")
        if len(c_clean) not in (3, 6) or not all(ch in "0123456789abcdefABCDEF" for ch in c_clean):
            print(f"  Error: Invalid hex color '{c}'")
            sys.exit(1)
    return colors


def cmd_create(args):
    """Create a new custom palette."""
    name = args.name.lower().strip()
    colors = _parse_colors(args.colors)
    shape = args.shape or "balanced"
    harmony = getattr(args, "harmony", None) or "balanced"

    print(f"\n  Creating custom palette: {name}")
    print(f"  Source colors: {', '.join(colors)}")
    print(f"  Shape: {shape}")
    if len(colors) == 1:
        print(f"  Harmony: {harmony} (deriving secondary/accent from primary)")

    # Professional recommendation when user supplies a single primary
    if len(colors) == 1:
        rec = recommend_primary(colors[0], on_white=True)
        print(f"\n  Recommendation: {rec['message']}")
        print(f"  Contrast on white: {rec['contrast_ratio']}:1 (WCAG AA normal: {rec['wcag_aa_normal']})")

    # Derive palette (single primary uses harmony engine)
    deriver = PaletteDeriver(colors, shape=shape, harmony=harmony)
    palette = deriver.derive()

    # WCAG validation
    print(f"\n  WCAG 2.1 AA Contrast Validation:")
    wcag = deriver.validate_wcag()
    all_pass = True
    for pair, ratio, passed in wcag:
        status = "PASS" if passed else "FAIL"
        if not passed:
            all_pass = False
        print(f"    [{status}] {pair}: {ratio:.2f}")

    if not all_pass:
        print(f"\n  Warning: Some contrast pairs don't meet WCAG AA minimums.")
        print(f"  The palette was auto-adjusted but some pairs remain below threshold.")

    # Write files
    css_path = write_custom_css(name, palette)
    json_path = write_custom_json(name, palette)
    print(f"\n  Written: {css_path}")
    print(f"  Written: {json_path}")

    # Merge into token files
    merge_into_design_tokens(name, palette)
    print(f"  Updated: tokens/design-tokens.json")

    merge_into_figma_tokens(name, palette)
    print(f"  Updated: tokens/figma-tokens.json")

    # Register
    add_custom_palette(name, colors, shape)
    print(f"  Updated: tokens/palette-registry.json")

    print(f"\n  Palette '{name}' created successfully!")
    print(f"  Use: data-theme=\"{name}\"")
    print()


def cmd_preview(args):
    """Preview palette CSS without saving."""
    colors = _parse_colors(args.colors)
    shape = args.shape or "balanced"
    name = args.name or "preview"

    # Tonal palette mode
    if getattr(args, "tonal", False):
        seed = colors[0]
        tp = TonalPalette(seed)
        scale = tp.generate()
        roles = tp.get_color_roles()

        print(f"\n  Tonal Palette (seed: {seed})")
        print(f"  {'=' * 50}")
        print(f"\n  13-Stop Tonal Scale:")
        for stop, hex_val in sorted(scale.items()):
            print(f"    Tone {stop:>3}: {hex_val}")
        print(f"\n  Material You Color Roles:")
        for role, hex_val in roles.items():
            print(f"    {role:<32}: {hex_val}")
        print()
        return

    harmony = getattr(args, "harmony", None) or "balanced"
    if len(colors) == 1:
        rec = recommend_primary(colors[0], on_white=True)
        print(f"\n  Recommendation: {rec['message']}")
        print(f"  Contrast on white: {rec['contrast_ratio']}:1 (WCAG AA: {rec['wcag_aa_normal']})")
        print(f"  Harmony: {harmony} → secondary/accent derived from primary\n")

    deriver = PaletteDeriver(colors, shape=shape, harmony=harmony)
    palette = deriver.derive()

    css = generate_css(name, palette)
    print(css)

    # Print WCAG summary
    print()
    print("/* WCAG 2.1 AA Validation */")
    wcag = deriver.validate_wcag()
    for pair, ratio, passed in wcag:
        status = "PASS" if passed else "FAIL"
        print(f"/* [{status}] {pair}: {ratio:.2f} */")


def cmd_list(args):
    """List all palettes."""
    builtin = get_builtin_palettes()
    custom = get_custom_palettes()

    print(f"\n  Built-in palettes ({len(builtin)}):")
    for p in builtin:
        print(f"    - {p}")

    if custom:
        print(f"\n  Custom palettes ({len(custom)}):")
        for p in custom:
            colors = ", ".join(p.get("source_colors", []))
            print(f"    - {p['name']} ({p.get('shape', 'balanced')}) [{colors}]")
    else:
        print(f"\n  Custom palettes: none")

    print(f"\n  Total: {len(builtin) + len(custom)} palettes")
    print()


def cmd_remove(args):
    """Remove a custom palette."""
    name = args.name.lower().strip()

    print(f"\n  Removing custom palette: {name}")

    # Remove from token files
    remove_from_design_tokens(name)
    print(f"  Cleaned: tokens/design-tokens.json")

    remove_from_figma_tokens(name)
    print(f"  Cleaned: tokens/figma-tokens.json")

    # Remove standalone files
    remove_custom_files(name)
    print(f"  Cleaned: tokens/custom/{name}.css")
    print(f"  Cleaned: tokens/custom/{name}.json")

    # Unregister
    remove_custom_palette(name)
    print(f"  Cleaned: tokens/palette-registry.json")

    print(f"\n  Palette '{name}' removed successfully!")
    print()


def cmd_export(args):
    """Export a custom palette."""
    name = args.name.lower().strip()
    fmt = args.format or "css"

    if fmt == "css":
        path = CUSTOM_DIR / f"{name}.css"
        if path.exists():
            print(path.read_text())
        else:
            print(f"  Error: No CSS file found for palette '{name}'")
            print(f"  Run: python src/scripts/palette.py create --name {name} --colors ...")
            sys.exit(1)
    elif fmt == "json":
        path = CUSTOM_DIR / f"{name}.json"
        if path.exists():
            print(path.read_text())
        else:
            print(f"  Error: No JSON file found for palette '{name}'")
            sys.exit(1)
    else:
        print(f"  Error: Unknown format '{fmt}'. Use 'css' or 'json'.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Custom Palette Manager — Universal Design System",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # create
    p_create = subparsers.add_parser("create", help="Create a new custom palette")
    p_create.add_argument("--name", required=True, help="Palette name (slug, e.g. 'my-brand')")
    p_create.add_argument("--colors", required=True, help="Comma-separated hex colors (1-5)")
    p_create.add_argument("--shape", default="balanced", choices=["sharp", "balanced", "round", "brutalist"],
                          help="Shape preset (default: balanced)")
    p_create.add_argument("--harmony", default="balanced", choices=HARMONY_OPTIONS,
                          help="When one color: harmony mode for secondary/accent (default: balanced)")

    # preview
    p_preview = subparsers.add_parser("preview", help="Preview palette CSS without saving")
    p_preview.add_argument("--colors", required=True, help="Comma-separated hex colors (1-5); one color = full palette from primary")
    p_preview.add_argument("--shape", default="balanced", choices=["sharp", "balanced", "round", "brutalist"])
    p_preview.add_argument("--harmony", default="balanced", choices=HARMONY_OPTIONS,
                           help="When one color: complementary, analogous, triadic, split_complementary, tetradic, monochromatic, balanced")
    p_preview.add_argument("--name", default="preview", help="Preview name (default: preview)")
    p_preview.add_argument("--tonal", action="store_true",
                           help="Use OKLCH tonal palette (Material You style) instead of regular generation")

    # list
    subparsers.add_parser("list", help="List all palettes")

    # remove
    p_remove = subparsers.add_parser("remove", help="Remove a custom palette")
    p_remove.add_argument("--name", required=True, help="Palette name to remove")

    # export
    p_export = subparsers.add_parser("export", help="Export a custom palette")
    p_export.add_argument("--name", required=True, help="Palette name to export")
    p_export.add_argument("--format", default="css", choices=["css", "json"],
                          help="Export format (default: css)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    commands = {
        "create": cmd_create,
        "preview": cmd_preview,
        "list": cmd_list,
        "remove": cmd_remove,
        "export": cmd_export,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
