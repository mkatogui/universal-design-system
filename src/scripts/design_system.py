#!/usr/bin/env python3
"""
Universal Design System — Design System Generator

Generates a complete design system specification from a query,
including palette, tokens, components, patterns, and guidelines.

Usage:
    python src/scripts/design_system.py "fintech dashboard"
    python src/scripts/design_system.py "kids education app" --format markdown
    python src/scripts/design_system.py "saas landing page" --format json
    python src/scripts/design_system.py "saas landing page" --format tailwind
    python src/scripts/design_system.py "fintech dashboard" --framework react
    python src/scripts/design_system.py "fintech dashboard" --framework vue
    python src/scripts/design_system.py "fintech dashboard" --framework svelte
"""

import json
import sys
import argparse
from pathlib import Path
from typing import Optional

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from core import ReasoningEngine, load_csv
try:
    from registry import get_all_palettes, get_custom_palette_names
except ImportError:
    get_all_palettes = None
    get_custom_palette_names = None

TOKENS_PATH = Path(__file__).parent.parent.parent / "tokens" / "design-tokens.json"

FRAMEWORK_TEMPLATES = {
    "react": {
        "button": '''import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-brand-primary)] text-[var(--color-text-on-brand)] hover:opacity-90',
        secondary: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]',
        ghost: 'hover:bg-[var(--color-bg-secondary)]',
        destructive: 'bg-[var(--color-error)] text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}''',
        "card": '''import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-6 shadow-[var(--shadow-md)] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h3 className={`text-xl font-semibold text-[var(--color-text-primary)] ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`text-[var(--color-text-secondary)] ${className}`}>{children}</div>;
}''',
        "input": '''import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-primary)]">{label}</label>}
      <input
        id={inputId}
        className={`w-full rounded-[var(--radius-md)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:opacity-50 ${error ? 'border-[var(--color-error)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}''',
    },
    "vue": {
        "button": '''<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}>();
</script>

<template>
  <button
    :class="[
      'uds-btn',
      `uds-btn--${variant || 'primary'}`,
      `uds-btn--${size || 'md'}`,
    ]"
  >
    <slot />
  </button>
</template>

<style scoped>
.uds-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--duration-fast) var(--ease-out);
}
.uds-btn--primary { background: var(--color-brand-primary); color: var(--color-text-on-brand); }
.uds-btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
.uds-btn--ghost { background: transparent; color: var(--color-text-primary); }
.uds-btn--destructive { background: var(--color-error); color: white; }
.uds-btn--sm { height: 36px; padding: 0 12px; font-size: 0.875rem; }
.uds-btn--md { height: 44px; padding: 0 16px; }
.uds-btn--lg { height: 48px; padding: 0 24px; font-size: 1.125rem; }
</style>''',
    },
    "svelte": {
        "button": '''<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' | 'destructive' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<button class="uds-btn uds-btn--{variant} uds-btn--{size}" on:click>
  <slot />
</button>

<style>
  .uds-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: all var(--duration-fast) var(--ease-out);
    cursor: pointer;
    border: none;
  }
  .uds-btn--primary { background: var(--color-brand-primary); color: var(--color-text-on-brand); }
  .uds-btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
  .uds-btn--ghost { background: transparent; color: var(--color-text-primary); }
  .uds-btn--destructive { background: var(--color-error); color: white; }
  .uds-btn--sm { height: 36px; padding: 0 12px; font-size: 0.875rem; }
  .uds-btn--md { height: 44px; padding: 0 16px; }
  .uds-btn--lg { height: 48px; padding: 0 24px; font-size: 1.125rem; }
</style>''',
    },
}

PALETTE_DISPLAY_NAMES = {
    "minimal-saas": "Minimal SaaS",
    "ai-futuristic": "AI Futuristic",
    "gradient-startup": "Gradient Startup",
    "corporate": "Corporate",
    "apple-minimal": "Apple Minimal",
    "illustration": "Illustration",
    "dashboard": "Dashboard",
    "bold-lifestyle": "Bold Lifestyle",
    "minimal-corporate": "Minimal Corporate",
}

# Add custom palettes from registry
if get_custom_palette_names:
    for name in get_custom_palette_names():
        if name not in PALETTE_DISPLAY_NAMES:
            display = " ".join(w.capitalize() for w in name.split("-"))
            PALETTE_DISPLAY_NAMES[name] = display


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


def generate_tailwind_config(palette_tokens: dict, palette: str,
                             foundation: Optional[dict] = None) -> str:
    """Generate a Tailwind CSS config preset from palette + foundation tokens."""
    foundation = foundation or {}
    colors = {}
    palette_shadows = {}
    palette_radii = {}
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
            palette_shadows[token.replace("--shadow-", "")] = value
        elif token.startswith("--radius-"):
            palette_radii[token.replace("--radius-", "")] = value
        elif token == "--font-display":
            font_display = value

    # Merge foundation + palette overrides
    shadows = {**foundation.get("shadow", {}), **palette_shadows}
    radii = {**foundation.get("radius", {}), **palette_radii}
    spacing = foundation.get("spacing", {})
    durations = foundation.get("motion_duration", {})
    easings = foundation.get("motion_easing", {})
    font_sizes = foundation.get("font_size", {})
    font_weights = foundation.get("font_weight", {})
    opacity = foundation.get("opacity", {})
    z_index = foundation.get("z_index", {})

    # Build font families: foundation stacks + palette display override
    font_families = {}
    for name, stack in foundation.get("font_family", {}).items():
        font_families[name] = [s.strip() for s in stack.split(",")]
    if font_display:
        font_families["display"] = [font_display, "sans-serif"]

    lines = []
    lines.append("// Universal Design System — Tailwind Preset")
    lines.append(f"// Palette: {PALETTE_DISPLAY_NAMES.get(palette, palette)}")
    lines.append("// Generated by: python src/scripts/design_system.py")
    lines.append("")
    lines.append(f"/** @type {{import('tailwindcss').Config}} */")
    lines.append("export default {")
    lines.append("  theme: {")
    lines.append("    extend: {")

    # Colors
    lines.append("      colors: {")
    for group, values in sorted(colors.items()):
        if isinstance(values, dict):
            lines.append(f"        '{group}': {{")
            for name, hex_val in sorted(values.items()):
                lines.append(f"          '{name}': '{hex_val}',")
            lines.append("        },")
        else:
            lines.append(f"        '{group}': '{values}',")
    lines.append("      },")

    # Spacing
    if spacing:
        lines.append("      spacing: {")
        for name, val in sorted(spacing.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 0):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Shadows
    if shadows:
        lines.append("      boxShadow: {")
        for name, val in sorted(shadows.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Radii
    if radii:
        lines.append("      borderRadius: {")
        for name, val in sorted(radii.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Transition duration
    if durations:
        lines.append("      transitionDuration: {")
        for name, val in sorted(durations.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Transition timing function
    if easings:
        lines.append("      transitionTimingFunction: {")
        for name, val in sorted(easings.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Font families
    if font_families:
        lines.append("      fontFamily: {")
        for name, stack in sorted(font_families.items()):
            formatted = ", ".join(f"'{s}'" for s in stack)
            lines.append(f"        '{name}': [{formatted}],")
        lines.append("      },")

    # Font sizes
    if font_sizes:
        lines.append("      fontSize: {")
        for name, val in sorted(font_sizes.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Font weights
    if font_weights:
        lines.append("      fontWeight: {")
        for name, val in sorted(font_weights.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Opacity
    if opacity:
        lines.append("      opacity: {")
        for name, val in sorted(opacity.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    # Z-index
    if z_index:
        lines.append("      zIndex: {")
        for name, val in sorted(z_index.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append("      },")

    lines.append("    },")
    lines.append("  },")
    lines.append("};")

    return "\n".join(lines)


def generate_framework_output(result: dict, palette_tokens: dict, framework: str) -> str:
    """Generate framework-specific component code."""
    lines = []
    palette = result["recommended_palette"]
    display_name = PALETTE_DISPLAY_NAMES.get(palette, palette)

    lines.append(f"// Universal Design System — {framework.title()} Components")
    lines.append(f"// Palette: {display_name}")
    lines.append(f"// Query: {result['query']}")
    lines.append("")

    if framework == "react":
        lines.append("// TIP: For production use, install the React package:")
        lines.append("//   npm install @mkatogui/uds-react")
        lines.append("//   import { Button, Card, Input } from '@mkatogui/uds-react';")
        lines.append("//   import '@mkatogui/uds-react/styles.css';")
        lines.append("")

    templates = FRAMEWORK_TEMPLATES.get(framework, FRAMEWORK_TEMPLATES.get("react", {}))

    # Output components that were recommended
    comp_names = [c.get("slug", c.get("name", "")).lower() for c in result["search_results"]["components"]]

    for comp_slug in ["button", "card", "input"]:
        if comp_slug in templates:
            lines.append(f"// --- {comp_slug.title()} Component ---")
            lines.append("")
            lines.append(templates[comp_slug])
            lines.append("")

    return "\n".join(lines)


def generate_markdown(result: dict, palette_tokens: dict) -> str:
    """Generate a Markdown design system specification."""
    lines = []
    domain = result["domain"]
    search = result["search_results"]
    palette = result["recommended_palette"]
    display_name = PALETTE_DISPLAY_NAMES.get(palette, palette)

    lines.append(f"# Design System: {result['query'].title()}")
    lines.append("")
    lines.append(f"**Palette:** {display_name} (`data-theme=\"{palette}\"`)")
    lines.append(f"**Sector:** {domain['sector']}")
    lines.append(f"**Product Type:** {domain['product_type']}")
    lines.append("")

    # Palette tokens
    if palette_tokens:
        lines.append("## Color Tokens")
        lines.append("")
        lines.append("```css")
        lines.append(f':root[data-theme="{palette}"] {{')
        for token, value in sorted(palette_tokens.items()):
            lines.append(f"  {token}: {value};")
        lines.append("}")
        lines.append("```")
        lines.append("")

    # Components
    if search["components"]:
        lines.append("## Components")
        lines.append("")
        lines.append("| Component | Category | Variants |")
        lines.append("|-----------|----------|----------|")
        for comp in search["components"]:
            name = comp.get("name", "?")
            cat = comp.get("category", "")
            variants = comp.get("variants", "")
            lines.append(f"| {name} | {cat} | {variants} |")
        lines.append("")

    # Patterns
    if search["patterns"]:
        lines.append("## Patterns")
        lines.append("")
        for pat in search["patterns"]:
            name = pat.get("name", "?")
            desc = pat.get("description", "")
            lines.append(f"### {name}")
            lines.append(f"{desc}")
            lines.append("")

    # Typography
    if search["typography"]:
        lines.append("## Typography")
        lines.append("")
        lines.append("| Heading Font | Body Font | Mood |")
        lines.append("|-------------|-----------|------|")
        for t in search["typography"][:3]:
            h = t.get("heading_font", "?")
            b = t.get("body_font", "?")
            m = t.get("mood", "")
            lines.append(f"| {h} | {b} | {m} |")
        lines.append("")

    # Anti-patterns
    if result["anti_patterns"]:
        lines.append("## Anti-Patterns (Avoid)")
        lines.append("")
        for ap in result["anti_patterns"]:
            sev = ap.get("severity", "").upper()
            name = ap.get("anti_pattern", "")
            desc = ap.get("description", "")
            alt = ap.get("alternative", "")
            lines.append(f"- **[{sev}] {name}**: {desc}")
            if alt:
                lines.append(f"  - *Instead:* {alt}")
        lines.append("")

    # Rules applied
    if result["rules_applied"]:
        lines.append("## Design Rules Applied")
        lines.append("")
        for rule in result["rules_applied"][:10]:
            reasoning = rule.get("reasoning", "")
            lines.append(f"- {reasoning}")
        lines.append("")

    # UX Guidelines
    if search["guidelines"]:
        lines.append("## UX Guidelines")
        lines.append("")
        for g in search["guidelines"][:5]:
            guideline = g.get("guideline", "")
            rationale = g.get("rationale", "")
            lines.append(f"- {guideline}")
            if rationale:
                lines.append(f"  - *Rationale:* {rationale}")
        lines.append("")

    # Quick start
    lines.append("## Quick Start")
    lines.append("")
    lines.append("```html")
    lines.append(f'<html lang="en" data-theme="{palette}">')
    lines.append("```")
    lines.append("")
    lines.append("Switch themes at runtime:")
    lines.append("```js")
    lines.append(f"document.documentElement.setAttribute('data-theme', '{palette}');")
    lines.append("```")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Generate a Design System Specification",
    )
    parser.add_argument("query", help="Design system query (e.g., 'fintech dashboard')")
    parser.add_argument("--format", "-f", choices=["markdown", "json", "tailwind"], default="markdown", help="Output format")
    parser.add_argument("--framework", choices=["react", "vue", "svelte", "html"], default=None, help="Generate framework-specific component code")
    args = parser.parse_args()

    engine = ReasoningEngine()
    result = engine.reason(args.query)
    tokens = load_tokens()
    palette_tokens = resolve_palette_tokens(tokens, result["recommended_palette"])
    foundation = resolve_foundation_tokens(tokens)

    if args.format == "tailwind":
        print(generate_tailwind_config(palette_tokens, result["recommended_palette"], foundation))
    elif args.framework:
        print(generate_framework_output(result, palette_tokens, args.framework))
    elif args.format == "json":
        # Determine palette source for explainability
        palette_source = "default"
        palette_rule_id = None
        for rule in result["rules_applied"]:
            if rule["then_field"] == "palette":
                palette_source = "rule"
                palette_rule_id = rule.get("rule_id")
                break
        if palette_source == "default" and result["search_results"]["products"]:
            top_product = result["search_results"]["products"][0]
            if top_product.get("palette") == result["recommended_palette"]:
                palette_source = "product_search"

        output = {
            "query": result["query"],
            "palette": result["recommended_palette"],
            "palette_display": PALETTE_DISPLAY_NAMES.get(result["recommended_palette"], result["recommended_palette"]),
            "palette_source": palette_source,
            "palette_rule_id": palette_rule_id,
            "domain": result["domain"],
            "tokens": palette_tokens,
            "components": [
                {"name": c.get("name"), "score": c.get("_score"), "source": c.get("_source")}
                for c in result["search_results"]["components"]
            ],
            "patterns": [
                {"name": p.get("name"), "score": p.get("_score"), "source": p.get("_source")}
                for p in result["search_results"]["patterns"]
            ],
            "products": [
                {"name": p.get("name"), "palette": p.get("palette"), "score": p.get("_score")}
                for p in result["search_results"]["products"]
            ],
            "typography": [
                {"heading": t.get("heading_font"), "body": t.get("body_font"), "score": t.get("_score")}
                for t in result["search_results"]["typography"]
            ],
            "anti_patterns": result["anti_patterns"],
            "rules": result["rules_applied"],
        }
        print(json.dumps(output, indent=2))
    else:
        print(generate_markdown(result, palette_tokens))


if __name__ == "__main__":
    main()
