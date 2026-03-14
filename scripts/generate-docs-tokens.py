#!/usr/bin/env python3
"""
Generate docs CSS from design-tokens.json — single source of truth for semantic colors.

Emits CSS custom properties for :root (semantic defaults) so docs can link to
generated-tokens.css and avoid hardcoding hex. Run as part of build or before deploy.

Usage:
    python scripts/generate-docs-tokens.py
    python scripts/generate-docs-tokens.py --out docs/generated-tokens.css
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_TOKENS = ROOT / "tokens" / "design-tokens.json"
DEFAULT_OUT = ROOT / "docs" / "generated-tokens.css"


def get_value(node):
    """Extract $value from a token node."""
    if not isinstance(node, dict):
        return None
    return node.get("$value")


def resolve_ref(tokens_root: dict, ref: str) -> Optional[str]:
    """Resolve a reference like '{color.primitive.neutral.0}' to hex or value."""
    if not ref or not isinstance(ref, str) or not ref.strip().startswith("{"):
        return ref
    path = ref.strip().strip("{}").split(".")
    node = tokens_root
    for key in path:
        node = node.get(key) if isinstance(node, dict) else None
        if node is None:
            return None
    val = get_value(node)
    if val and isinstance(val, str) and val.strip().startswith("{"):
        return resolve_ref(tokens_root, val)
    return val


def collect_primitive_hex(tokens_root: dict) -> dict:
    """Build a map of token path string -> resolved hex (e.g. 'color.primitive.neutral.0' -> '#FFFFFF')."""
    result = {}

    def walk(node, path_prefix: list):
        if not isinstance(node, dict):
            return
        for key, child in node.items():
            if key.startswith("$"):
                continue
            path = path_prefix + [key]
            if "$value" in child:
                val = child["$value"]
                if isinstance(val, str) and re.match(r"^#[0-9A-Fa-f]{6}$", val):
                    result[".".join(path)] = val
                elif isinstance(val, str) and val.strip().startswith("{"):
                    resolved = resolve_ref(tokens_root, val)
                    if resolved and re.match(r"^#[0-9A-Fa-f]{6}$", resolved):
                        result[".".join(path)] = resolved
            else:
                walk(child, path)

    walk(tokens_root, [])
    return result


def emit_semantic_root(tokens_root: dict, primitives: dict) -> str:
    """Emit :root { --color-*: value; } for semantic tokens used in docs (no hardcoding)."""
    lines = [
        "/* Auto-generated from tokens/design-tokens.json — do not edit. Run: python scripts/generate-docs-tokens.py */",
        ":root {",
    ]
    # Map semantic token paths to CSS var names and resolve
    semantic_vars = [
        ("color.primitive.neutral.0", "--color-neutral-0"),
        ("color.semantic.text-on-error", "--color-text-on-error"),
        ("color.semantic.warning-on-bg", "--color-warning-on-bg"),
        ("color.semantic.success-on-bg", "--color-success-on-bg"),
    ]
    color_node = tokens_root.get("color", {})
    for path, css_name in semantic_vars:
        parts = path.split(".")
        node = color_node
        for p in parts[1:]:
            node = node.get(p) if isinstance(node, dict) else None
        if not isinstance(node, dict):
            continue
        val = node.get("$value")
        if isinstance(val, str) and val.strip().startswith("{"):
            val = resolve_ref(tokens_root, val)
        if val and isinstance(val, str) and (val.startswith("#") or re.match(r"^[\d,\s]+$", val)):
            lines.append(f"  {css_name}: {val};")
        elif path in primitives:
            lines.append(f"  {css_name}: {primitives[path]};")
    # Resolve semantic refs that point to primitives
    def resolve_semantic(key_path: str) -> str | None:
        parts = key_path.split(".")
        node = tokens_root
        for p in parts:
            node = node.get(p) if isinstance(node, dict) else None
        if not isinstance(node, dict):
            return None
        v = node.get("$value")
        if isinstance(v, str) and v.strip().startswith("{"):
            ref_path = v.strip().strip("{}")
            return primitives.get(ref_path) or resolve_ref(tokens_root, v)
        return v

    for path, css_name in semantic_vars:
        if any(css_name in ln for ln in lines):
            continue
        v = resolve_semantic(path)
        if v and (v.startswith("#") or (isinstance(v, str) and re.match(r"^[\d,\s]+$", v))):
            lines.append(f"  {css_name}: {v};")
    lines.append("}")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Generate docs CSS from design-tokens.json")
    parser.add_argument("--tokens", default=str(DEFAULT_TOKENS), help="Path to design-tokens.json")
    parser.add_argument("--out", default=str(DEFAULT_OUT), help="Output CSS path")
    args = parser.parse_args()

    tokens_path = Path(args.tokens)
    out_path = Path(args.out)
    if not tokens_path.exists():
        print(f"  Error: {tokens_path} not found")
        return 1

    with open(tokens_path, encoding="utf-8") as f:
        tokens = json.load(f)

    primitives = collect_primitive_hex(tokens)
    css = emit_semantic_root(tokens, primitives)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(css, encoding="utf-8")
    print(f"  Written: {out_path}")
    return 0


if __name__ == "__main__":
    exit(main())
