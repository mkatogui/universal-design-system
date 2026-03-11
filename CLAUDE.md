# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Universal Design System v0.1.0 — an AI-native design system with a BM25 reasoning engine that recommends palettes, components, patterns, and anti-patterns based on product domain. 9 structural palettes, 31 components, 496 tokens, 17 CSV databases (1500+ rows), Tailwind CSS generation, React/Vue/Svelte output, 20 AI platform support.

## Key Commands

```bash
# Full validation suite (tokens + WCAG + docs)
npm run check

# Individual validators
npm run validate          # W3C DTCG token format
npm run audit             # WCAG 2.1 AA contrast (108 checks across 9 palettes × 2 modes)
npm run verify            # HTML docs integrity (no hardcoded values, nav links, palette defs)

# CSV cross-reference validation
npm run sync-data         # or: python src/data/_sync_all.py

# Search the reasoning engine
python src/scripts/search.py "fintech dashboard"
python src/scripts/search.py "kids education app" --verbose --json

# Generate a full design system specification
python src/scripts/design_system.py "saas landing page"
python src/scripts/design_system.py "healthcare portal" --format json

# Generate with Tailwind CSS config
python src/scripts/design_system.py "saas landing page" --format tailwind

# Generate with framework-specific components
python src/scripts/design_system.py "fintech dashboard" --framework react
python src/scripts/design_system.py "ecommerce store" --framework vue
python src/scripts/design_system.py "education app" --framework svelte

# Build tokens for all platforms (CSS, JS, iOS Swift, Android XML)
npm run build             # runs style-dictionary build

# CLI installer (for other AI coding platforms)
npx @mkatogui/universal-design-system install --platform cursor
```

## Architecture

### 3-Layer Reasoning Pipeline

```
User Query → DomainDetector → BM25 Search → Rule Application → Token Resolution → Output
              (21 sectors,     (17 CSVs)     (165 rules from     (design-tokens.json
               8 product types)               ui-reasoning.csv)   palette overrides)
```

**Layer 1 — Domain Detection** (`src/scripts/core.py: DomainDetector`): Regex keyword matching against 21 sectors (finance, healthcare, etc.) and 8 product types (dashboard, landing-page, etc.). Returns sector + product_type with confidence scores.

**Layer 2 — BM25 Search** (`src/scripts/core.py: BM25Index`): Okapi BM25 ranking (k1=1.5, b=0.75) across all CSV databases. Tokenizes text (lowercase, non-alphanumeric removal, min length 2). Exact token matching only — no fuzzy/typo correction.

**Layer 3 — Rule Engine** (`src/scripts/core.py: ReasoningEngine`): Evaluates conditional rules from `ui-reasoning.csv` (IF sector=finance THEN palette=corporate). Rules sorted by priority (higher first); first match wins for palette.

**Palette Fallback Chain:** Rules match → top product search result's palette → default "minimal-saas".

### Directory Structure

- **tokens/** — W3C DTCG design tokens (source of truth). 3-tier: primitive (raw color scales) → semantic (functional names) → palette-overrides (per-palette customizations)
- **src/data/** — 17 CSV databases (1500+ rows). `products.csv` references `components.csv` and `patterns.csv` via slug. Includes mobile-native databases (`app-interface.csv`, `react-performance.csv`, `stacks/react-native.csv`)
- **src/scripts/** — Python: `core.py` (BM25 engine + domain detector + reasoning), `search.py` (CLI search), `design_system.py` (full spec generator with Tailwind/React/Vue/Svelte output)
- **cli/** — TypeScript CLI (Commander.js). Commands: `install` (20 platforms), `search`, `init`, `generate`. Auto-detects platform by checking for `.claude/`, `.cursor/`, etc. directories
- **docs/** — Self-contained HTML docs: `index.html` (landing/showcase), `docs.html` (interactive documentation), `component-library.html` (sandbox), `reference.html` (token reference)
- **scripts/** — Python validators (tokens, WCAG, docs)
- **.claude/skills/** — Claude Code skills: `universal-design-system/`, `brand-identity/`, `design-audit/`, `slides-design/`, `ui-styling/`
- **.claude-plugin/** — Claude Marketplace plugin configuration

## Token Architecture

**Foundation tokens (LOCKED across all palettes):** body typography (Inter), spacing (4px base, 12-step scale), motion durations/easing, z-index (dropdown=10→system=100), opacity.

**Palette tokens (VARY per palette):** color (brand, text, bg, border, status), shadow (elevation), border-radius (shape identity), display font (h1–h3 only).

Dark mode is CSS variable override — same `--color-*` tokens redefined under `[data-theme="X"].docs-dark` selector.

## 9 Palettes

Apply with `data-theme`: minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal, illustration, dashboard, bold-lifestyle, minimal-corporate.

One palette per surface. No mixing.

## Conventions

- Tokens use CSS custom properties (`--color-*`, `--space-*`, `--font-size-*`)
- Components use BEM naming: `.uds-{component}`, `.uds-{component}--{variant}`
- All palettes must pass WCAG 2.1 AA (4.5:1 body text, 3:1 large text/UI)
- Components must use `var(--token-name)`, never hardcoded values
- All animations must be wrapped in `@media (prefers-reduced-motion: no-preference)`
- CSV validation is permissive — only required columns are checked, extra columns allowed

## Adding to the System

**New palette:** Add overrides in `tokens/design-tokens.json` (color, shadow, radius, font-display) + `tokens/figma-tokens.json` → add to valid palette lists in `_sync_all.py`, `validate-tokens.py`, `wcag-audit.py` → add CSS defs (light + dark) to `docs/docs.html` → add rules to `ui-reasoning.csv` → run `npm run check`.

**New component:** Add row to `src/data/components.csv` (id, name, slug, category, variants, use_when, accessibility, states) → reference slug in `products.csv` key_components → add CSS to docs using `var()` references → test across all 9 palettes + light/dark → run `npm run check`.

**New reasoning rule:** Add row to `src/data/ui-reasoning.csv` (id, condition, field, operator, value, then_field, then_value, priority, reasoning, category) → higher priority = evaluated first → run `npm run sync-data`.
