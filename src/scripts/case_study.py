#!/usr/bin/env python3
"""
Universal Design System -- Case Study Generator

Runs the reasoning engine for 5 real-world scenarios and generates
formatted output as text, JSON, or self-contained HTML.

Usage:
    python src/scripts/case_study.py
    python src/scripts/case_study.py --format json
    python src/scripts/case_study.py --format html
    python src/scripts/case_study.py --format html > docs/case-studies-data.html
"""

import json
import sys
import argparse
from pathlib import Path

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from core import ReasoningEngine

TOKENS_PATH = Path(__file__).parent.parent.parent / "tokens" / "design-tokens.json"

SCENARIOS = [
    {
        "query": "fintech dashboard",
        "title": "Fintech Dashboard",
        "description": (
            "A data-rich analytics dashboard for a financial technology platform. "
            "Users track portfolio performance, monitor transactions, and analyze "
            "market trends. Trust, precision, and information density are paramount."
        ),
    },
    {
        "query": "healthcare portal",
        "title": "Healthcare Portal",
        "description": (
            "A patient-facing portal for a healthcare organization. Users schedule "
            "appointments, view medical records, and communicate with providers. "
            "Accessibility, calm aesthetics, and clear information hierarchy are critical."
        ),
    },
    {
        "query": "saas landing page",
        "title": "SaaS Landing Page",
        "description": (
            "A conversion-focused landing page for a B2B software-as-a-service product. "
            "The page must communicate value propositions quickly, build credibility, "
            "and drive sign-ups with clear calls to action."
        ),
    },
    {
        "query": "education app",
        "title": "Education App",
        "description": (
            "An interactive learning application for students and educators. The platform "
            "hosts courses, quizzes, and progress tracking. Engagement, approachability, "
            "and readability across age groups are key design goals."
        ),
    },
    {
        "query": "ecommerce store",
        "title": "E-commerce Store",
        "description": (
            "A modern online retail storefront with product listings, search, cart, "
            "and checkout flows. Visual appeal, fast scanning of products, and a "
            "frictionless purchase experience drive the design decisions."
        ),
    },
]

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
    light = theme_data.get("light", {})
    structural = theme_data.get("$structural", {})

    for key, val in light.items():
        if isinstance(val, dict) and "$value" in val:
            raw = val["$value"]
            if isinstance(raw, str) and raw.startswith("{"):
                raw = _resolve_reference(tokens, raw)
            if key.startswith(("bg-", "text-", "brand-", "border-", "status-",
                               "error", "success", "warning", "info")):
                resolved[f"--color-{key}"] = raw
            elif key.startswith("shadow"):
                resolved[f"--shadow-{key}"] = raw
            elif key.startswith("radius"):
                resolved[f"--radius-{key}"] = raw
            elif key.startswith("font"):
                resolved[f"--{key}"] = raw
            else:
                resolved[f"--color-{key}"] = raw

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
        elif key != "shape":
            resolved[f"--{key}"] = raw

    return resolved


def run_all_scenarios(engine: ReasoningEngine, tokens: dict) -> list:
    """Run the reasoning engine for every scenario and collect results."""
    studies = []
    for scenario in SCENARIOS:
        result = engine.reason(scenario["query"])
        palette = result["recommended_palette"]
        palette_tokens = resolve_palette_tokens(tokens, palette)

        # Extract color tokens only
        color_tokens = {
            k: v for k, v in sorted(palette_tokens.items())
            if k.startswith("--color-")
        }

        study = {
            "title": scenario["title"],
            "description": scenario["description"],
            "query": scenario["query"],
            "sector": result["domain"]["sector"],
            "sector_confidence": result["domain"]["sector_confidence"],
            "product_type": result["domain"]["product_type"],
            "product_confidence": result["domain"]["product_confidence"],
            "palette": palette,
            "palette_display": PALETTE_DISPLAY_NAMES.get(palette, palette),
            "color_tokens": color_tokens,
            "all_tokens": palette_tokens,
            "components": [
                {
                    "name": c.get("name", ""),
                    "category": c.get("category", ""),
                    "slug": c.get("slug", ""),
                }
                for c in result["search_results"]["components"][:8]
            ],
            "patterns": [
                {
                    "name": p.get("name", ""),
                    "description": p.get("description", ""),
                }
                for p in result["search_results"]["patterns"][:5]
            ],
            "anti_patterns": [
                {
                    "name": ap.get("anti_pattern", ""),
                    "severity": ap.get("severity", ""),
                    "description": ap.get("description", ""),
                    "alternative": ap.get("alternative", ""),
                }
                for ap in result["anti_patterns"][:6]
            ],
            "rules_applied": [
                {
                    "category": r.get("category", ""),
                    "reasoning": r.get("reasoning", ""),
                    "priority": r.get("priority", 0),
                }
                for r in result["rules_applied"][:8]
            ],
            "typography": [
                {
                    "heading": t.get("heading_font", ""),
                    "body": t.get("body_font", ""),
                    "mood": t.get("mood", ""),
                }
                for t in result["search_results"]["typography"][:3]
            ],
        }
        studies.append(study)
    return studies


# ---------------------------------------------------------------------------
# Text output
# ---------------------------------------------------------------------------

def format_text(studies: list) -> str:
    """Generate a formatted plain-text report."""
    lines = []
    lines.append("=" * 72)
    lines.append("UNIVERSAL DESIGN SYSTEM -- CASE STUDIES")
    lines.append("=" * 72)
    lines.append("")

    for i, s in enumerate(studies, 1):
        lines.append(f"{'=' * 72}")
        lines.append(f"  CASE STUDY {i}: {s['title'].upper()}")
        lines.append(f"{'=' * 72}")
        lines.append(f"  Query:        {s['query']}")
        lines.append(f"  Sector:       {s['sector']} (confidence: {s['sector_confidence']})")
        lines.append(f"  Product Type: {s['product_type']} (confidence: {s['product_confidence']})")
        lines.append(f"  Palette:      {s['palette_display']} (data-theme=\"{s['palette']}\")")
        lines.append("")
        lines.append(f"  {s['description']}")
        lines.append("")

        # Color tokens
        lines.append("  COLOR TOKENS:")
        for token, value in s["color_tokens"].items():
            lines.append(f"    {token}: {value}")
        lines.append("")

        # Components
        if s["components"]:
            lines.append("  KEY COMPONENTS:")
            for c in s["components"]:
                lines.append(f"    - {c['name']} ({c['category']})")
            lines.append("")

        # Patterns
        if s["patterns"]:
            lines.append("  PATTERNS:")
            for p in s["patterns"]:
                desc = f" -- {p['description']}" if p["description"] else ""
                lines.append(f"    - {p['name']}{desc}")
            lines.append("")

        # Anti-patterns
        if s["anti_patterns"]:
            lines.append("  ANTI-PATTERNS (AVOID):")
            for ap in s["anti_patterns"]:
                lines.append(f"    [{ap['severity'].upper()}] {ap['name']}")
                lines.append(f"      {ap['description']}")
                if ap["alternative"]:
                    lines.append(f"      Instead: {ap['alternative']}")
            lines.append("")

        # Rules
        if s["rules_applied"]:
            lines.append("  DESIGN RULES APPLIED:")
            for r in s["rules_applied"]:
                lines.append(f"    [{r['category']}] {r['reasoning']}")
            lines.append("")

        # Typography
        if s["typography"]:
            lines.append("  TYPOGRAPHY SUGGESTIONS:")
            for t in s["typography"]:
                mood = f" ({t['mood']})" if t["mood"] else ""
                lines.append(f"    Heading: {t['heading']} / Body: {t['body']}{mood}")
            lines.append("")

        lines.append("")

    lines.append("=" * 72)
    lines.append("Generated by: python src/scripts/case_study.py")
    lines.append("=" * 72)
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# JSON output
# ---------------------------------------------------------------------------

def format_json(studies: list) -> str:
    """Generate JSON output."""
    return json.dumps({"case_studies": studies}, indent=2)


# ---------------------------------------------------------------------------
# HTML output
# ---------------------------------------------------------------------------

def format_html(studies: list) -> str:
    """Generate a self-contained HTML report."""
    cards_html = []
    for i, s in enumerate(studies, 1):
        # Color swatches
        swatch_items = []
        swatch_keys = [
            ("--color-brand-primary", "brand"),
            ("--color-brand-secondary", "secondary"),
            ("--color-brand-accent", "accent"),
            ("--color-bg-primary", "bg"),
            ("--color-bg-secondary", "bg-sec"),
            ("--color-text-primary", "text"),
            ("--color-text-secondary", "text-sec"),
            ("--color-border-default", "border"),
        ]
        for token_key, label in swatch_keys:
            value = s["color_tokens"].get(token_key, "")
            if value:
                swatch_items.append(
                    f'<div class="cs-swatch" style="background:{value}" '
                    f'title="{token_key}: {value}">'
                    f'<span class="cs-swatch__label">{label}</span>'
                    f'<span class="cs-swatch__value">{value}</span></div>'
                )

        swatches_html = "\n".join(swatch_items)

        # Components list
        comp_items = "".join(
            f'<li><span class="cs-comp__name">{c["name"]}</span>'
            f'<span class="cs-comp__cat">{c["category"]}</span></li>'
            for c in s["components"]
        ) if s["components"] else '<li class="cs-empty">No specific components matched</li>'

        # Patterns list
        pattern_items = "".join(
            f'<li><strong>{p["name"]}</strong>'
            f'{" -- " + p["description"] if p["description"] else ""}</li>'
            for p in s["patterns"]
        ) if s["patterns"] else '<li class="cs-empty">No specific patterns matched</li>'

        # Anti-patterns
        ap_parts = []
        for ap in s["anti_patterns"]:
            alt_html = ""
            if ap["alternative"]:
                alt_html = '<p class="cs-antipattern__alt">Instead: ' + ap["alternative"] + "</p>"
            ap_parts.append(
                '<div class="cs-antipattern">'
                '<span class="cs-antipattern__sev cs-antipattern__sev--' + ap["severity"].lower() + '">'
                + ap["severity"].upper() + "</span>"
                '<div class="cs-antipattern__body">'
                "<strong>" + ap["name"] + "</strong>"
                "<p>" + ap["description"] + "</p>"
                + alt_html
                + "</div></div>"
            )
        ap_items = "".join(ap_parts) if ap_parts else '<p class="cs-empty">No anti-patterns for this sector</p>'

        # Rules
        rule_items = "".join(
            f'<li><span class="cs-rule__cat">{r["category"]}</span> {r["reasoning"]}</li>'
            for r in s["rules_applied"]
        ) if s["rules_applied"] else '<li class="cs-empty">No specific rules matched</li>'

        # Typography
        typo_parts = []
        for t in s["typography"]:
            mood_html = ""
            if t["mood"]:
                mood_html = '<span class="cs-typo-pair__mood">' + t["mood"] + "</span>"
            typo_parts.append(
                '<div class="cs-typo-pair">'
                '<span class="cs-typo-pair__heading">' + t["heading"] + "</span>"
                '<span class="cs-typo-pair__sep">/</span>'
                '<span class="cs-typo-pair__body">' + t["body"] + "</span>"
                + mood_html
                + "</div>"
            )
        typo_items = "".join(typo_parts) if typo_parts else '<p class="cs-empty">No typography suggestions</p>'

        card = f'''
<section class="cs-card" id="case-{i}" aria-labelledby="cs-title-{i}">
  <div class="cs-card__header">
    <span class="cs-card__number">Case Study {i}</span>
    <h2 class="cs-card__title" id="cs-title-{i}">{s["title"]}</h2>
    <p class="cs-card__desc">{s["description"]}</p>
    <div class="cs-card__meta">
      <span class="cs-meta__item">Sector: <strong>{s["sector"]}</strong></span>
      <span class="cs-meta__item">Product: <strong>{s["product_type"]}</strong></span>
      <span class="cs-meta__item">Query: <code>{s["query"]}</code></span>
    </div>
  </div>

  <div class="cs-card__section">
    <h3>Recommended Palette: {s["palette_display"]}</h3>
    <p class="cs-code-hint"><code>data-theme="{s["palette"]}"</code></p>
    <div class="cs-swatches">{swatches_html}</div>
  </div>

  <div class="cs-card__columns">
    <div class="cs-card__section">
      <h3>Key Components</h3>
      <ul class="cs-comp-list">{comp_items}</ul>
    </div>

    <div class="cs-card__section">
      <h3>Patterns</h3>
      <ul class="cs-pattern-list">{pattern_items}</ul>
    </div>
  </div>

  <div class="cs-card__section">
    <h3>Anti-Patterns to Avoid</h3>
    <div class="cs-antipatterns">{ap_items}</div>
  </div>

  <div class="cs-card__columns">
    <div class="cs-card__section">
      <h3>Design Rules Applied</h3>
      <ul class="cs-rule-list">{rule_items}</ul>
    </div>

    <div class="cs-card__section">
      <h3>Typography Suggestions</h3>
      <div class="cs-typo-pairs">{typo_items}</div>
    </div>
  </div>
</section>'''
        cards_html.append(card)

    all_cards = "\n".join(cards_html)

    # Build the embedded JSON data for potential JS consumption
    json_data = json.dumps(studies, indent=None)

    return f'''<!DOCTYPE html>
<html lang="en" data-theme="minimal-saas">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Case Studies -- Universal Design System v__VERSION__</title>
<meta name="description" content="5 real-world case studies generated by the Universal Design System reasoning engine. Explore recommended palettes, components, anti-patterns, and design rules.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+4:wght@600;700&family=DM+Sans:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
/* ==============================================================
   FOUNDATION TOKENS
   ============================================================== */
:root {{
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Menlo, Consolas, monospace;
  --font-serif: 'Source Serif 4', Georgia, serif;
  --text-display-xl: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  --text-display-lg: clamp(2.25rem, 4vw + 1rem, 3.75rem);
  --text-display-md: clamp(1.875rem, 3vw + 0.75rem, 3rem);
  --text-heading-lg: clamp(1.5rem, 2vw + 0.5rem, 2.25rem);
  --text-heading-md: clamp(1.25rem, 1.5vw + 0.5rem, 1.75rem);
  --text-heading-sm: clamp(1.125rem, 1vw + 0.5rem, 1.375rem);
  --text-body-lg: clamp(1.125rem, 0.5vw + 0.875rem, 1.25rem);
  --text-body-md: 1rem;
  --text-body-sm: 0.875rem;
  --text-label: 0.75rem;
  --space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;
  --space-6:24px;--space-8:32px;--space-10:40px;--space-12:48px;--space-16:64px;
  --space-20:80px;--space-24:96px;
  --radius-sm:6px;--radius-md:8px;--radius-lg:12px;--radius-xl:16px;--radius-2xl:24px;--radius-full:9999px;
  --duration-instant:100ms;--duration-fast:150ms;--duration-normal:250ms;
  --duration-slow:400ms;--duration-slower:600ms;
  --ease-default:cubic-bezier(0.4,0,0.2,1);--ease-out:cubic-bezier(0,0,0.2,1);
  --ease-spring:cubic-bezier(0.34,1.56,0.64,1);
  --opacity-disabled:0.4;--opacity-muted:0.6;--opacity-subtle:0.8;
  --z-dropdown:100;--z-sticky:200;--z-overlay:300;--z-modal:400;--z-toast:500;--z-tooltip:600;--z-system:9999;
  /* Default palette (Minimal SaaS) */
  --color-bg-primary:#FFFFFF;--color-bg-secondary:#F8F8FA;--color-bg-tertiary:#F0F0F5;
  --color-bg-inverse:#111118;--color-text-primary:#111118;--color-text-secondary:#555566;
  --color-text-tertiary:#6B6B7B;--color-text-on-brand:#FFFFFF;
  --color-border-default:#C8C8D4;--color-border-input:#8E8E9E;--color-border-subtle:#E8E8F0;
  --color-brand-primary:#2563EB;--color-brand-primary-rgb:37,99,235;
  --color-brand-secondary:#3B82F6;--color-brand-accent:#60A5FA;--color-brand-muted:#DBEAFE;
  --color-success:#059669;--color-success-bg:#ECFDF5;
  --color-warning:#D97706;--color-warning-bg:#FFFBEB;
  --color-error:#DC2626;--color-error-bg:#FEF2F2;
  --color-info:#2563EB;--color-info-bg:#EFF6FF;
  --shadow-xs:0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm:0 2px 4px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:0 4px 12px rgba(0,0,0,0.08),0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.12),0 4px 8px rgba(0,0,0,0.06);
  --shadow-xl:0 24px 64px rgba(0,0,0,0.16);
  --shadow-glow:0 0 40px rgba(37,99,235,0.2);
}}

/* PALETTE OVERRIDES */
[data-theme="ai-futuristic"]{{--color-bg-primary:#0A0A0F;--color-bg-secondary:#111118;--color-bg-tertiary:#1A1A24;--color-bg-inverse:#FFFFFF;--color-text-primary:#E0E0EE;--color-text-secondary:#9999AA;--color-text-tertiary:#7A7A8C;--color-text-on-brand:#0A0A0F;--color-border-default:#2A2A36;--color-border-input:#4A4A58;--color-border-subtle:#1E1E28;--color-brand-primary:#00FF88;--color-brand-primary-rgb:0,255,136;--color-brand-secondary:#00D4FF;--color-brand-accent:#8B5CF6;--color-brand-muted:#0A2A1A;--shadow-xs:0 0 1px rgba(255,255,255,0.06),0 1px 2px rgba(0,0,0,0.3);--shadow-sm:0 0 1px rgba(255,255,255,0.08),0 2px 6px rgba(0,0,0,0.4);--shadow-md:0 0 1px rgba(255,255,255,0.1),0 4px 16px rgba(0,0,0,0.5);--shadow-lg:0 0 1px rgba(255,255,255,0.1),0 12px 40px rgba(0,0,0,0.6);--shadow-xl:0 0 2px rgba(255,255,255,0.1),0 24px 64px rgba(0,0,0,0.7);--shadow-glow:0 0 40px rgba(0,255,136,0.15);--font-display:'Inter',system-ui,sans-serif;--radius-md:12px;}}
[data-theme="minimal-saas"]{{--color-bg-primary:#FFFFFF;--color-bg-secondary:#F8F8FA;--color-bg-tertiary:#F0F0F5;--color-bg-inverse:#111118;--color-text-primary:#111118;--color-text-secondary:#555566;--color-text-tertiary:#6B6B7B;--color-text-on-brand:#FFFFFF;--color-border-default:#C8C8D4;--color-border-input:#8E8E9E;--color-border-subtle:#E8E8F0;--color-brand-primary:#2563EB;--color-brand-primary-rgb:37,99,235;--color-brand-secondary:#3B82F6;--color-brand-accent:#60A5FA;--color-brand-muted:#DBEAFE;--shadow-glow:0 0 40px rgba(37,99,235,0.2);--font-display:'Inter',system-ui,sans-serif;--radius-md:8px;}}
[data-theme="gradient-startup"]{{--color-bg-primary:#FFFFFF;--color-bg-secondary:#FAF5FF;--color-bg-tertiary:#F3E8FF;--color-bg-inverse:#2E1065;--color-text-primary:#111118;--color-text-secondary:#555566;--color-text-tertiary:#6B6B7B;--color-text-on-brand:#FFFFFF;--color-border-default:#C8C8D4;--color-border-input:#8E8E9E;--color-border-subtle:#E8E8F0;--color-brand-primary:#7C3AED;--color-brand-primary-rgb:124,58,237;--color-brand-secondary:#EC4899;--color-brand-accent:#F59E0B;--color-brand-muted:#F3E8FF;--shadow-glow:0 0 40px rgba(124,58,237,0.2);--font-display:'Inter',system-ui,sans-serif;--radius-md:12px;--radius-lg:16px;--radius-xl:20px;}}
[data-theme="corporate"]{{--color-bg-primary:#FFFFFF;--color-bg-secondary:#F7F8FA;--color-bg-tertiary:#EDF0F5;--color-bg-inverse:#1A202C;--color-text-primary:#1A202C;--color-text-secondary:#4A5568;--color-text-tertiary:#636B78;--color-text-on-brand:#FFFFFF;--color-border-default:#CBD5E0;--color-border-input:#8E9AAE;--color-border-subtle:#E2E8F0;--color-brand-primary:#1A365D;--color-brand-primary-rgb:26,54,93;--color-brand-secondary:#2B6CB0;--color-brand-accent:#4299E1;--color-brand-muted:#EBF4FF;--shadow-glow:0 0 40px rgba(26,54,93,0.15);--font-display:'Source Serif 4',Georgia,serif;--radius-sm:4px;--radius-md:4px;--radius-lg:6px;--radius-xl:8px;--radius-2xl:12px;}}
[data-theme="apple-minimal"]{{--color-bg-primary:#FFFFFF;--color-bg-secondary:#FBFBFD;--color-bg-tertiary:#F5F5F7;--color-bg-inverse:#000000;--color-text-primary:#1D1D1F;--color-text-secondary:#515154;--color-text-tertiary:#6E6E73;--color-text-on-brand:#FFFFFF;--color-border-default:#D2D2D7;--color-border-input:#A1A1A6;--color-border-subtle:#E5E5EA;--color-brand-primary:#0071E3;--color-brand-primary-rgb:0,113,227;--color-brand-secondary:#147CE5;--color-brand-accent:#5AC8FA;--color-brand-muted:#E8F0FE;--shadow-glow:0 0 40px rgba(0,113,227,0.15);--font-display:-apple-system,'SF Pro Display',system-ui,sans-serif;--font-sans:-apple-system,'SF Pro Text',system-ui,sans-serif;--radius-md:12px;--radius-lg:18px;--radius-xl:22px;}}
[data-theme="illustration"]{{--color-bg-primary:#FFFFFF;--color-bg-secondary:#FFF8F0;--color-bg-tertiary:#FFF0E6;--color-bg-inverse:#1A1523;--color-text-primary:#1A1523;--color-text-secondary:#5C5470;--color-text-tertiary:#7A7189;--color-text-on-brand:#FFFFFF;--color-border-default:#C4B5A4;--color-border-input:#9E8E7E;--color-border-subtle:#E8DDD0;--color-brand-primary:#E8590C;--color-brand-primary-rgb:232,89,12;--color-brand-secondary:#7048E8;--color-brand-accent:#12B886;--color-brand-muted:#FFF4E6;--shadow-glow:0 0 40px rgba(232,89,12,0.15);--font-display:'Inter',system-ui,sans-serif;--radius-sm:10px;--radius-md:14px;--radius-lg:18px;--radius-xl:24px;--radius-2xl:32px;}}
[data-theme="dashboard"]{{--color-bg-primary:#FFFFFF;--color-bg-secondary:#F7F8FC;--color-bg-tertiary:#EEF0F8;--color-bg-inverse:#0F1117;--color-text-primary:#0F1117;--color-text-secondary:#525866;--color-text-tertiary:#6E7585;--color-text-on-brand:#FFFFFF;--color-border-default:#C5CAD4;--color-border-input:#8B92A0;--color-border-subtle:#E0E3EB;--color-brand-primary:#4F46E5;--color-brand-primary-rgb:79,70,229;--color-brand-secondary:#0EA5E9;--color-brand-accent:#06B6D4;--color-brand-muted:#EEF2FF;--shadow-glow:0 0 40px rgba(79,70,229,0.15);--font-display:'Inter',system-ui,sans-serif;--radius-sm:4px;--radius-md:6px;--radius-lg:8px;--radius-xl:12px;--radius-2xl:16px;}}
[data-theme="bold-lifestyle"]{{--color-bg-primary:#FFFFFF;--color-bg-secondary:#F5F5F5;--color-bg-tertiary:#EBEBEB;--color-bg-inverse:#111111;--color-text-primary:#111111;--color-text-secondary:#525252;--color-text-tertiary:#6B6B6B;--color-text-on-brand:#FFFFFF;--color-border-default:#BFBFBF;--color-border-input:#8C8C8C;--color-border-subtle:#D9D9D9;--color-brand-primary:#111111;--color-brand-primary-rgb:17,17,17;--color-brand-secondary:#FF4500;--color-brand-accent:#FFD700;--color-brand-muted:#F5F5F5;--shadow-sm:none;--shadow-md:2px 2px 0 rgba(0,0,0,0.15);--shadow-lg:4px 4px 0 rgba(0,0,0,0.2);--shadow-glow:none;--font-display:'Inter',system-ui,sans-serif;--radius-sm:0;--radius-md:0;--radius-lg:0;--radius-xl:0;--radius-2xl:0;--radius-full:0;}}
[data-theme="minimal-corporate"]{{--color-bg-primary:#FDFCFB;--color-bg-secondary:#F7F5F2;--color-bg-tertiary:#EFECE8;--color-bg-inverse:#1C1917;--color-text-primary:#1C1917;--color-text-secondary:#57534E;--color-text-tertiary:#78716C;--color-text-on-brand:#FFFFFF;--color-border-default:#D6D3CD;--color-border-input:#A8A29E;--color-border-subtle:#E7E5E4;--color-brand-primary:#B45309;--color-brand-primary-rgb:180,83,9;--color-brand-secondary:#92400E;--color-brand-accent:#D97706;--color-brand-muted:#FEF3C7;--shadow-glow:0 0 40px rgba(180,83,9,0.12);--font-display:'Source Serif 4',Georgia,serif;--radius-sm:4px;--radius-md:6px;--radius-lg:8px;--radius-xl:12px;--radius-2xl:16px;}}

/* ==============================================================
   DARK MODE PALETTE OVERRIDES
   ============================================================== */
html.docs-dark[data-theme="ai-futuristic"] {{
  --color-bg-primary:#08080D;--color-bg-secondary:#0F0F16;--color-bg-tertiary:#16161F;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#E0E0EE;--color-text-secondary:#9999AA;--color-text-tertiary:#7A7A8C;
  --color-text-on-brand:#0A0A0F;--color-brand-primary:#00FF88;--color-brand-primary-rgb:0,255,136;
  --color-brand-secondary:#00D4FF;--color-brand-accent:#8B5CF6;--color-brand-muted:#0A2A1A;
  --color-border-default:#2A2A36;--color-border-input:#4A4A58;--color-border-subtle:#1E1E28;
  --shadow-sm:0 0 0 1px rgba(255,255,255,0.06),0 2px 4px rgba(0,0,0,0.3);
  --shadow-md:0 0 0 1px rgba(255,255,255,0.06),0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:0 0 0 1px rgba(255,255,255,0.08),0 12px 32px rgba(0,0,0,0.5);
  --shadow-glow:0 0 40px rgba(0,255,136,0.15);
  --radius-sm:2px;--radius-md:4px;--radius-lg:6px;--radius-xl:8px;--radius-2xl:12px;
  --font-display:'DM Sans',system-ui,sans-serif;
}}
html.docs-dark[data-theme="minimal-saas"] {{
  --color-bg-primary:#0F0F14;--color-bg-secondary:#161620;--color-bg-tertiary:#1E1E2A;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#E4E4EE;--color-text-secondary:#A0A0B4;--color-text-tertiary:#7A7A8E;
  --color-border-default:#2C2C3A;--color-border-input:#4A4A5A;--color-border-subtle:#222230;
  --color-success-bg:#0A2618;--color-warning-bg:#261E0A;--color-error-bg:#260A0A;--color-info-bg:#0A1426;
  --shadow-sm:0 2px 4px rgba(0,0,0,0.3);--shadow-md:0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.5);--shadow-xl:0 24px 64px rgba(0,0,0,0.6);
}}
html.docs-dark[data-theme="gradient-startup"] {{
  --color-bg-primary:#0E0A14;--color-bg-secondary:#16101E;--color-bg-tertiary:#1E1628;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#E8E0F4;--color-text-secondary:#B0A4C4;--color-text-tertiary:#8A7EA0;
  --color-border-default:#2E2840;--color-border-input:#4E4660;--color-border-subtle:#241E34;
  --color-brand-muted:#1E0A3A;
  --shadow-sm:0 2px 4px rgba(0,0,0,0.3);--shadow-md:0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.5);--shadow-glow:0 0 40px rgba(124,58,237,0.2);
  --radius-sm:8px;--radius-md:12px;--radius-lg:16px;--radius-xl:24px;--radius-2xl:32px;
}}
html.docs-dark[data-theme="corporate"] {{
  --color-bg-primary:#0C0E12;--color-bg-secondary:#141820;--color-bg-tertiary:#1C2230;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#D8DCE8;--color-text-secondary:#8E96A8;--color-text-tertiary:#6E7688;
  --color-brand-primary:#4A7CC8;--color-brand-primary-rgb:74,124,200;
  --color-brand-secondary:#5A8ED8;--color-brand-muted:#0E1A30;
  --color-border-default:#283040;--color-border-input:#3E4858;--color-border-subtle:#1E2636;
  --shadow-sm:0 2px 4px rgba(0,0,0,0.3);--shadow-md:0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.5);
  --radius-sm:2px;--radius-md:4px;--radius-lg:6px;--radius-xl:8px;--radius-2xl:12px;
  --font-display:'Source Serif 4',Georgia,serif;
}}
html.docs-dark[data-theme="apple-minimal"] {{
  --color-bg-primary:#000000;--color-bg-secondary:#0E0E0E;--color-bg-tertiary:#1A1A1A;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#F5F5F7;--color-text-secondary:#A1A1A6;--color-text-tertiary:#6E6E73;
  --color-border-default:#2C2C2E;--color-border-input:#48484A;--color-border-subtle:#1C1C1E;
  --shadow-sm:0 2px 4px rgba(0,0,0,0.3);--shadow-md:0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.5);
  --radius-sm:8px;--radius-md:10px;--radius-lg:14px;--radius-xl:20px;--radius-2xl:28px;
}}
html.docs-dark[data-theme="illustration"] {{
  --color-bg-primary:#12100E;--color-bg-secondary:#1C1816;--color-bg-tertiary:#262018;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#F0E8DC;--color-text-secondary:#B0A494;--color-text-tertiary:#8A7E6E;
  --color-brand-muted:#2A1A0A;
  --color-border-default:#342E24;--color-border-input:#544A3A;--color-border-subtle:#242018;
  --shadow-sm:0 2px 4px rgba(0,0,0,0.3);--shadow-md:0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.5);--shadow-glow:0 0 40px rgba(232,89,12,0.15);
  --radius-sm:10px;--radius-md:14px;--radius-lg:18px;--radius-xl:24px;--radius-2xl:32px;
}}
html.docs-dark[data-theme="dashboard"] {{
  --color-bg-primary:#0A0B10;--color-bg-secondary:#12141C;--color-bg-tertiary:#1A1C26;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#DEE0EC;--color-text-secondary:#8E92A4;--color-text-tertiary:#6E7284;
  --color-brand-muted:#14124A;
  --color-border-default:#282C3A;--color-border-input:#3E4254;--color-border-subtle:#1E2030;
  --shadow-sm:0 2px 4px rgba(0,0,0,0.3);--shadow-md:0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.5);
  --radius-sm:4px;--radius-md:6px;--radius-lg:8px;--radius-xl:12px;--radius-2xl:16px;
}}
html.docs-dark[data-theme="bold-lifestyle"] {{
  --color-bg-primary:#0A0A0A;--color-bg-secondary:#141414;--color-bg-tertiary:#1E1E1E;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#EEEEEE;--color-text-secondary:#999999;--color-text-tertiary:#6B6B6B;
  --color-brand-primary:#FFFFFF;--color-brand-primary-rgb:255,255,255;
  --color-brand-secondary:#FF4500;--color-text-on-brand:#000000;
  --color-border-default:#2A2A2A;--color-border-input:#4A4A4A;--color-border-subtle:#1A1A1A;
  --shadow-sm:0 2px 4px rgba(0,0,0,0.4);--shadow-md:0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.6);
  --radius-sm:0;--radius-md:0;--radius-lg:0;--radius-xl:0;--radius-2xl:0;--radius-full:0;
  --font-display:'Oswald',sans-serif;
}}
html.docs-dark[data-theme="minimal-corporate"] {{
  --color-bg-primary:#0E0D0C;--color-bg-secondary:#18160E;--color-bg-tertiary:#221E16;
  --color-bg-inverse:#FFFFFF;--color-text-primary:#EDE8E0;--color-text-secondary:#A89E90;--color-text-tertiary:#78706A;
  --color-brand-primary:#D4870A;--color-brand-primary-rgb:212,135,10;
  --color-brand-secondary:#B8720E;--color-brand-muted:#2A1E0A;
  --color-border-default:#342E24;--color-border-input:#4E4438;--color-border-subtle:#241E16;
  --shadow-sm:0 2px 4px rgba(0,0,0,0.3);--shadow-md:0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:0 12px 32px rgba(0,0,0,0.5);--shadow-glow:0 0 40px rgba(212,135,10,0.12);
  --radius-sm:4px;--radius-md:6px;--radius-lg:8px;--radius-xl:12px;--radius-2xl:16px;
  --font-display:'Source Serif 4',Georgia,serif;
}}

/* ==============================================================
   DARK MODE OVERRIDES
   ============================================================== */
html.docs-dark body {{ background: var(--color-bg-primary); color: var(--color-text-primary); }}
html.docs-dark .page-header {{ color: var(--color-text-primary); }}
html.docs-dark .page-header p {{ color: var(--color-text-secondary); }}
html.docs-dark .section {{ border-color: var(--color-border-subtle); }}
html.docs-dark .palette-switcher {{ background: var(--color-bg-secondary); border-color: var(--color-border-subtle); }}
html.docs-dark .palette-pill {{ background: var(--color-bg-primary); border-color: var(--color-border-default); color: var(--color-text-secondary); }}
html.docs-dark .palette-pill:hover {{ color: var(--color-text-primary); border-color: var(--color-brand-primary); }}
html.docs-dark .palette-pill.active {{ background: var(--color-brand-primary); color: var(--color-text-on-brand); border-color: var(--color-brand-primary); }}
html.docs-dark .dark-mode-toggle {{ background: var(--color-bg-primary); border-color: var(--color-border-default); color: var(--color-text-secondary); }}
html.docs-dark .dark-mode-toggle:hover {{ background: var(--color-bg-tertiary); color: var(--color-text-primary); }}
html.docs-dark .site-topnav {{ background: var(--color-bg-inverse); }}
html.docs-dark .page-footer {{ border-color: var(--color-border-default); color: var(--color-text-tertiary); }}
html.docs-dark .cs-card {{ background: var(--color-bg-secondary); border-color: var(--color-border-default); }}
html.docs-dark .cs-card__header {{ border-color: var(--color-border-subtle); }}
html.docs-dark .cs-card__number {{ color: var(--color-brand-primary); }}
html.docs-dark .cs-card__title {{ color: var(--color-text-primary); }}
html.docs-dark .cs-card__desc {{ color: var(--color-text-secondary); }}
html.docs-dark .cs-card__section {{ border-color: var(--color-border-subtle); }}
html.docs-dark .cs-card__section h3 {{ color: var(--color-text-primary); }}
html.docs-dark .cs-meta__item {{ color: var(--color-text-secondary); }}
html.docs-dark .cs-comp__cat {{ color: var(--color-text-tertiary); background: var(--color-bg-tertiary); }}
html.docs-dark .cs-antipattern {{ background: var(--color-bg-tertiary); border-color: var(--color-border-subtle); }}
html.docs-dark .cs-antipattern__body p {{ color: var(--color-text-secondary); }}
html.docs-dark .cs-rule__cat {{ color: var(--color-brand-primary); }}
html.docs-dark .cs-typo-pair {{ background: var(--color-bg-tertiary); }}
html.docs-dark .cs-typo-pair__mood {{ color: var(--color-text-tertiary); }}
html.docs-dark .cs-swatch__label {{ background: rgba(0,0,0,0.6); }}
html.docs-dark .cs-code-hint code {{ background: var(--color-bg-tertiary); color: var(--color-brand-primary); }}

/* ==============================================================
   ACCESSIBILITY
   ============================================================== */
@media (prefers-reduced-motion: reduce) {{
  *, *::before, *::after {{
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }}
}}
@media (forced-colors: active) {{
  .cs-card, .cs-swatch, .cs-antipattern {{ border: 2px solid CanvasText; }}
  .palette-pill {{ border: 2px solid ButtonText; }}
}}

/* ==============================================================
   NAV
   ============================================================== */
.site-topnav {{
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-6);
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-subtle);
  font-family: var(--font-sans);
  font-size: var(--text-body-sm);
  position: sticky;
  top: 0;
  z-index: 9999;
}}
.site-topnav .nav-brand {{
  font-weight: 700;
  color: var(--color-text-primary);
  margin-right: 32px;
}}
.site-topnav a {{
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}}
.site-topnav a:hover {{ color: var(--color-text-primary); }}
.site-topnav a.active {{
  color: var(--color-brand-primary);
  font-weight: 600;
}}

/* ==============================================================
   PAGE LAYOUT
   ============================================================== */
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
  font-family: var(--font-sans);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  line-height: 1.6;
}}
.page-header {{
  text-align: center;
  padding: var(--space-16) var(--space-6) var(--space-12);
}}
.page-header h1 {{
  font-family: var(--font-display);
  font-size: var(--text-display-md);
  font-weight: 800;
  margin-bottom: var(--space-3);
}}
.page-header p {{
  color: var(--color-text-secondary);
  font-size: var(--text-body-lg);
  max-width: 680px;
  margin: 0 auto;
}}
.section {{
  padding: var(--space-8) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}}

/* ==============================================================
   PALETTE SWITCHER
   ============================================================== */
.palette-switcher {{
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
}}
.palette-pill {{
  font-family: var(--font-sans);
  font-size: var(--text-body-sm);
  font-weight: 500;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}}
.palette-pill:hover {{ color: var(--color-text-primary); border-color: var(--color-brand-primary); }}
.palette-pill.active {{
  background: var(--color-brand-primary);
  color: var(--color-text-on-brand);
  border-color: var(--color-brand-primary);
}}

/* ==============================================================
   CASE STUDY CARDS
   ============================================================== */
.cs-card {{
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-8);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}}
.cs-card__header {{
  padding: var(--space-8) var(--space-6);
  border-bottom: 1px solid var(--color-border-subtle);
}}
.cs-card__number {{
  font-family: var(--font-mono);
  font-size: var(--text-label);
  font-weight: 600;
  color: var(--color-brand-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: var(--space-2);
}}
.cs-card__title {{
  font-family: var(--font-display);
  font-size: var(--text-heading-lg);
  font-weight: 700;
  margin-bottom: var(--space-3);
  color: var(--color-text-primary);
}}
.cs-card__desc {{
  color: var(--color-text-secondary);
  font-size: var(--text-body-md);
  line-height: 1.6;
  max-width: 720px;
}}
.cs-card__meta {{
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-4);
}}
.cs-meta__item {{
  font-size: var(--text-body-sm);
  color: var(--color-text-tertiary);
}}
.cs-meta__item strong {{
  color: var(--color-text-primary);
}}
.cs-meta__item code {{
  font-family: var(--font-mono);
  font-size: var(--text-label);
  background: var(--color-bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}}

/* Card sections */
.cs-card__section {{
  padding: var(--space-6);
  border-top: 1px solid var(--color-border-subtle);
}}
.cs-card__section h3 {{
  font-family: var(--font-display);
  font-size: var(--text-heading-sm);
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
}}
.cs-card__columns {{
  display: grid;
  grid-template-columns: 1fr 1fr;
}}
.cs-card__columns > .cs-card__section + .cs-card__section {{
  border-left: 1px solid var(--color-border-subtle);
}}
@media (max-width: 768px) {{
  .cs-card__columns {{ grid-template-columns: 1fr; }}
  .cs-card__columns > .cs-card__section + .cs-card__section {{ border-left: none; }}
}}

/* Code hint */
.cs-code-hint {{
  margin-bottom: var(--space-4);
}}
.cs-code-hint code {{
  font-family: var(--font-mono);
  font-size: var(--text-body-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-brand-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}}

/* Swatches */
.cs-swatches {{
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}}
.cs-swatch {{
  width: 80px;
  height: 64px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}}
.cs-swatch__label {{
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  background: rgba(0,0,0,0.45);
  padding: 2px 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1;
}}
.cs-swatch__value {{
  font-family: var(--font-mono);
  font-size: 8px;
  color: #fff;
  background: rgba(0,0,0,0.45);
  padding: 1px 4px 3px;
  line-height: 1;
}}

/* Components list */
.cs-comp-list {{
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}}
.cs-comp-list li {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: var(--text-body-sm);
}}
.cs-comp-list li:last-child {{ border-bottom: none; }}
.cs-comp__name {{ font-weight: 500; color: var(--color-text-primary); }}
.cs-comp__cat {{
  font-size: var(--text-label);
  color: var(--color-text-tertiary);
  background: var(--color-bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}}

/* Pattern list */
.cs-pattern-list {{
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}}
.cs-pattern-list li {{
  font-size: var(--text-body-sm);
  color: var(--color-text-secondary);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-subtle);
  line-height: 1.5;
}}
.cs-pattern-list li:last-child {{ border-bottom: none; }}
.cs-pattern-list li strong {{ color: var(--color-text-primary); }}

/* Anti-patterns */
.cs-antipatterns {{
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}}
.cs-antipattern {{
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  font-size: var(--text-body-sm);
}}
.cs-antipattern__sev {{
  font-family: var(--font-mono);
  font-size: var(--text-label);
  font-weight: 700;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  align-self: flex-start;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.3;
}}
.cs-antipattern__sev--critical {{ background: var(--color-error-bg); color: var(--color-error); }}
.cs-antipattern__sev--high {{ background: var(--color-warning-bg); color: var(--color-warning); }}
.cs-antipattern__sev--medium {{ background: var(--color-info-bg); color: var(--color-info); }}
.cs-antipattern__sev--low {{ background: var(--color-success-bg); color: var(--color-success); }}
.cs-antipattern__body strong {{
  display: block;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}}
.cs-antipattern__body p {{
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}}
.cs-antipattern__alt {{
  font-style: italic;
  color: var(--color-success);
  margin-top: var(--space-1);
}}

/* Rules list */
.cs-rule-list {{
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}}
.cs-rule-list li {{
  font-size: var(--text-body-sm);
  color: var(--color-text-secondary);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-subtle);
  line-height: 1.5;
}}
.cs-rule-list li:last-child {{ border-bottom: none; }}
.cs-rule__cat {{
  font-family: var(--font-mono);
  font-size: var(--text-label);
  font-weight: 600;
  color: var(--color-brand-primary);
  margin-right: var(--space-2);
}}

/* Typography pairs */
.cs-typo-pairs {{
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}}
.cs-typo-pair {{
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--text-body-sm);
}}
.cs-typo-pair__heading {{ font-weight: 600; color: var(--color-text-primary); }}
.cs-typo-pair__sep {{ color: var(--color-text-tertiary); }}
.cs-typo-pair__body {{ color: var(--color-text-secondary); }}
.cs-typo-pair__mood {{
  font-size: var(--text-label);
  color: var(--color-text-tertiary);
  margin-left: auto;
  font-style: italic;
}}

/* Empty state */
.cs-empty {{
  color: var(--color-text-tertiary);
  font-style: italic;
}}

/* ==============================================================
   FOOTER
   ============================================================== */
.page-footer {{
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--color-text-tertiary);
  font-size: var(--text-body-sm);
  border-top: 1px solid var(--color-border-subtle);
}}
.page-footer a {{ color: var(--color-brand-primary); text-decoration: none; }}
.page-footer a:hover {{ text-decoration: underline; }}

/* ==============================================================
   SKIP LINK
   ============================================================== */
.skip-link {{ position: absolute; top: -100%; left: 16px; padding: 8px 16px; background: var(--color-brand-primary); color: var(--color-text-on-brand); border-radius: var(--radius-md); z-index: 9999; text-decoration: none; font-weight: 600; }}
.skip-link:focus {{ top: 16px; }}

/* ==============================================================
   DARK MODE TOGGLE
   ============================================================== */
.dark-mode-toggle {{ padding: var(--space-2) var(--space-3); font-family: var(--font-sans); font-size: var(--text-body-sm); font-weight: 500; border: 1px solid var(--color-border-default); border-radius: var(--radius-full); background: var(--color-bg-primary); color: var(--color-text-secondary); cursor: pointer; display: flex; align-items: center; gap: 8px; margin-left: auto; transition: all var(--duration-fast); white-space: nowrap; }}
.dark-mode-toggle svg {{ width: 16px; height: 16px; flex-shrink: 0; }}
.dark-mode-toggle:hover {{ color: var(--color-text-primary); border-color: var(--color-brand-primary); }}
.dark-mode-toggle:focus-visible {{ outline: 2px solid var(--color-brand-primary); outline-offset: 2px; }}

@media (max-width: 640px) {{
  .cs-card__meta {{ flex-direction: column; gap: var(--space-2); }}
  .cs-swatches {{ gap: var(--space-1); }}
  .cs-swatch {{ width: 64px; height: 52px; }}
}}
</style>
</head>
<body>

<!-- NAV -->
<nav class="site-topnav" aria-label="Site navigation">
  <a href="index.html" class="nav-brand">UDS v__VERSION__</a>
  <a href="docs.html">Docs</a>
  <a href="component-library.html">Components</a>
  <a href="visual-framework.html">Visual Framework</a>
  <a href="reference.html">Reference</a>
  <a href="case-studies.html" class="active">Case Studies</a>
</nav>
<a href="#main-content" class="skip-link">Skip to content</a>

<!-- HEADER -->
<header class="page-header" id="main-content">
  <h1>Case Studies</h1>
  <p>5 real-world scenarios processed by the Universal Design System reasoning engine. Each case study shows the recommended palette, components, anti-patterns, and design rules.</p>
</header>

<!-- PALETTE SWITCHER -->
<div class="section" style="padding-top: 0;">
  <div class="palette-switcher" role="radiogroup" aria-label="Select palette">
    <button class="palette-pill active" data-palette="minimal-saas" role="radio" aria-checked="true">Minimal SaaS</button>
    <button class="palette-pill" data-palette="ai-futuristic" role="radio" aria-checked="false">AI Futuristic</button>
    <button class="palette-pill" data-palette="gradient-startup" role="radio" aria-checked="false">Gradient Startup</button>
    <button class="palette-pill" data-palette="corporate" role="radio" aria-checked="false">Corporate</button>
    <button class="palette-pill" data-palette="apple-minimal" role="radio" aria-checked="false">Apple Minimal</button>
    <button class="palette-pill" data-palette="illustration" role="radio" aria-checked="false">Illustration</button>
    <button class="palette-pill" data-palette="dashboard" role="radio" aria-checked="false">Dashboard</button>
    <button class="palette-pill" data-palette="bold-lifestyle" role="radio" aria-checked="false">Bold Lifestyle</button>
    <button class="palette-pill" data-palette="minimal-corporate" role="radio" aria-checked="false">Minimal Corporate</button>
    <button id="dark-mode-toggle" class="dark-mode-toggle" aria-label="Toggle appearance mode" title="Appearance">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <span>Dark</span>
    </button>
  </div>
</div>

<!-- CASE STUDIES -->
<div class="section">
{all_cards}
</div>

<!-- FOOTER -->
<footer class="page-footer">
  <p>Universal Design System v__VERSION__ &middot; <a href="https://github.com/mkatogui/universal-design-system">GitHub</a> &middot; MIT License</p>
</footer>

<script>
/* Palette Switcher */
document.querySelectorAll('.palette-pill').forEach(function(pill) {{
  pill.addEventListener('click', function() {{
    document.querySelectorAll('.palette-pill').forEach(function(p) {{
      p.classList.remove('active');
      p.setAttribute('aria-checked', 'false');
    }});
    pill.classList.add('active');
    pill.setAttribute('aria-checked', 'true');
    document.documentElement.setAttribute('data-theme', pill.dataset.palette);
  }});
}});

/* Dark mode toggle */
(function() {{
  var darkModeToggle = document.getElementById('dark-mode-toggle');
  var darkModeKey = 'docs-appearance';
  var sunSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var moonSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function updateBtn(isDark) {{
    if (!darkModeToggle) return;
    darkModeToggle.innerHTML = isDark
      ? sunSvg + '<span>Light</span>'
      : moonSvg + '<span>Dark</span>';
  }}

  if (darkModeToggle) {{
    var isDark = localStorage.getItem(darkModeKey) === 'dark';
    if (isDark) document.documentElement.classList.add('docs-dark');
    updateBtn(isDark);

    darkModeToggle.addEventListener('click', function() {{
      var isNowDark = document.documentElement.classList.toggle('docs-dark');
      localStorage.setItem(darkModeKey, isNowDark ? 'dark' : 'light');
      updateBtn(isNowDark);
    }});
  }}
}})();
</script>
<!-- Case study data (for programmatic access) -->
<script type="application/json" id="case-study-data">{json_data}</script>
</body>
</html>'''


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate case studies from the Universal Design System reasoning engine",
    )
    parser.add_argument(
        "--format", "-f",
        choices=["text", "json", "html"],
        default="text",
        help="Output format (default: text)",
    )
    args = parser.parse_args()

    engine = ReasoningEngine()
    tokens = load_tokens()
    studies = run_all_scenarios(engine, tokens)

    if args.format == "json":
        print(format_json(studies))
    elif args.format == "html":
        print(format_html(studies))
    else:
        print(format_text(studies))


if __name__ == "__main__":
    main()
