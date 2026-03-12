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

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from core import ReasoningEngine, load_csv

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


def resolve_palette_tokens(tokens: dict, palette: str) -> dict:
    """Extract token values for a specific palette from design-tokens.json."""
    theme_data = tokens.get("theme", {}).get(palette, {})
    if not theme_data:
        return {}

    resolved = {}

    # Tokens are flat under light/dark mode, not nested by category
    light = theme_data.get("light", {})
    structural = theme_data.get("$structural", {})

    # Process light mode tokens (flat: bg-primary, text-primary, brand-primary, etc.)
    for key, val in light.items():
        if isinstance(val, dict) and "$value" in val:
            raw = val["$value"]
            token_type = val.get("$type", "")
            # Resolve DTCG references
            if isinstance(raw, str) and raw.startswith("{"):
                raw = _resolve_reference(tokens, raw)
            # Categorize by key name
            if key.startswith(("bg-", "text-", "brand-", "border-", "status-", "error", "success", "warning", "info")):
                resolved[f"--color-{key}"] = raw
            elif key.startswith("shadow"):
                resolved[f"--shadow-{key}"] = raw
            elif key.startswith("radius"):
                resolved[f"--radius-{key}"] = raw
            elif key.startswith("font"):
                resolved[f"--{key}"] = raw
            else:
                resolved[f"--color-{key}"] = raw

    # Process structural tokens (radius, shadow, font-display)
    # These may be plain values or DTCG formatted
    for key, val in structural.items():
        if isinstance(val, dict) and "$value" in val:
            raw = val["$value"]
        elif isinstance(val, str):
            raw = val
        else:
            continue
        if isinstance(raw, str) and raw.startswith("{"):
            raw = _resolve_reference(tokens, raw)
        if key.startswith("radius"):
            resolved[f"--{key}"] = raw
        elif key.startswith("shadow"):
            resolved[f"--{key}"] = raw
        elif key.startswith("font"):
            resolved[f"--{key}"] = raw
        elif key != "shape":  # skip non-CSS values
            resolved[f"--{key}"] = raw

    return resolved


def generate_tailwind_config(palette_tokens: dict, palette: str) -> str:
    """Generate a Tailwind CSS config preset from palette tokens."""
    colors = {}
    shadows = {}
    radii = {}
    font_display = ""

    for token, value in palette_tokens.items():
        if token.startswith("--color-"):
            key = token.replace("--color-", "").replace("-", ".")
            # Convert nested keys: brand.primary, text.primary, etc.
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
            key = token.replace("--shadow-", "")
            shadows[key] = value
        elif token.startswith("--radius-"):
            key = token.replace("--radius-", "")
            radii[key] = value
        elif token == "--font-display":
            font_display = value

    config = {
        "theme": {
            "extend": {
                "colors": colors,
                "boxShadow": shadows,
                "borderRadius": radii,
            }
        }
    }

    if font_display:
        config["theme"]["extend"]["fontFamily"] = {
            "display": [font_display, "sans-serif"]
        }

    lines = []
    lines.append(f"// Universal Design System — Tailwind Preset")
    lines.append(f"// Palette: {PALETTE_DISPLAY_NAMES.get(palette, palette)}")
    lines.append(f"// Generated by: python src/scripts/design_system.py")
    lines.append(f"")
    lines.append(f"/** @type {{import('tailwindcss').Config}} */")
    lines.append(f"export default {{")
    lines.append(f"  theme: {{")
    lines.append(f"    extend: {{")

    # Colors
    lines.append(f"      colors: {{")
    for group, values in sorted(colors.items()):
        if isinstance(values, dict):
            lines.append(f"        '{group}': {{")
            for name, hex_val in sorted(values.items()):
                lines.append(f"          '{name}': '{hex_val}',")
            lines.append(f"        }},")
        else:
            lines.append(f"        '{group}': '{values}',")
    lines.append(f"      }},")

    # Shadows
    if shadows:
        lines.append(f"      boxShadow: {{")
        for name, val in sorted(shadows.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append(f"      }},")

    # Radii
    if radii:
        lines.append(f"      borderRadius: {{")
        for name, val in sorted(radii.items()):
            lines.append(f"        '{name}': '{val}',")
        lines.append(f"      }},")

    # Font
    if font_display:
        lines.append(f"      fontFamily: {{")
        lines.append(f"        display: ['{font_display}', 'sans-serif'],")
        lines.append(f"      }},")

    lines.append(f"    }},")
    lines.append(f"  }},")
    lines.append(f"}};")

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

    if args.format == "tailwind":
        print(generate_tailwind_config(palette_tokens, result["recommended_palette"]))
    elif args.framework:
        print(generate_framework_output(result, palette_tokens, args.framework))
    elif args.format == "json":
        output = {
            "query": result["query"],
            "palette": result["recommended_palette"],
            "palette_display": PALETTE_DISPLAY_NAMES.get(result["recommended_palette"], result["recommended_palette"]),
            "domain": result["domain"],
            "tokens": palette_tokens,
            "components": [c.get("name") for c in result["search_results"]["components"]],
            "patterns": [p.get("name") for p in result["search_results"]["patterns"]],
            "typography": [
                {"heading": t.get("heading_font"), "body": t.get("body_font")}
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
