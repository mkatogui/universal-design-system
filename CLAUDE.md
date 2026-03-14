# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Universal Design System v0.4.0 — a deterministic UI recommendation engine powered by retrieval and rule evaluation that recommends palettes, components, patterns, and anti-patterns based on product domain. 9 structural palettes, 43 components, ~600 tokens, 20 CSV databases (1,676+ rows), 84 anti-pattern rules, Tailwind CSS generation, React/Vue/Svelte/Web Components output, WCAG 2.2 AA + APCA dual reporting, 20 AI platform support.

## Key Commands

```bash
# Full validation suite (tokens + WCAG + docs)
npm run check

# Individual validators
npm run validate          # W3C DTCG token format
npm run audit             # WCAG 2.2 AA contrast (108 checks across 9 palettes × 2 modes)
npm run audit:apca        # APCA/WCAG 3.0 contrast analysis
npm run verify            # HTML docs integrity (no hardcoded values, nav links, palette defs)

# CSV cross-reference validation
npm run sync-data         # or: python src/data/_sync_all.py

# Accessibility testing (Playwright + axe-core)
npx playwright test --config=playwright.a11y.config.ts                    # full suite (144 axe + ARIA + keyboard)
npx playwright test --config=playwright.a11y.config.ts -g "docs / minimal-saas / dark"  # single test
npm run test:a11y                                                         # alias for axe audit
AXE_BASE_URL=http://localhost:3000 npx playwright test --config=playwright.a11y.config.ts  # against live server

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

# Custom palette management
npm run palette           # or: python src/scripts/palette.py
python src/scripts/palette.py create "my-palette" --base corporate
python src/scripts/palette.py list
python src/scripts/palette.py preview "my-palette"

# Build tokens for all platforms (CSS, JS, iOS Swift, Android XML)
npm run build             # runs style-dictionary build

# Bundle size budget
npm run size              # check React package size (limits: 100KB JS, 30KB CSS)

# CLI installer (for other AI coding platforms)
npx @mkatogui/universal-design-system install --platform cursor
```

## Architecture

### 3-Layer Reasoning Pipeline

```
User Query → DomainDetector → BM25 Search → Rule Application → Token Resolution → Output
              (55 sectors,     (20 CSVs)     (190 rules from     (design-tokens.json
               21 product types)              ui-reasoning.csv)   palette overrides)
```

**Layer 1 — Domain Detection** (`src/scripts/core.py: DomainDetector`): Regex keyword matching against 55 sectors (finance, fintech, healthcare, etc.) and 21 product types (dashboard, landing-page, etc.). Returns sector + product_type with confidence scores.

**Layer 2 — BM25 Search** (`src/scripts/core.py: BM25Index`): Okapi BM25 ranking (k1=1.5, b=0.75) across all CSV databases. Tokenizes text (lowercase, non-alphanumeric removal, min length 2). Exact token matching only — no fuzzy/typo correction.

**Layer 3 — Rule Engine** (`src/scripts/core.py: ReasoningEngine`): Evaluates conditional rules from `ui-reasoning.csv` (IF sector=finance THEN palette=corporate). Rules sorted by priority (higher first); first match wins for palette.

**Palette Fallback Chain:** Rules match → top product search result's palette → default "minimal-saas".

### Directory Structure

- **tokens/** — W3C DTCG design tokens (source of truth). 3-tier: primitive (raw color scales) → semantic (functional names) → palette-overrides (per-palette customizations). 20 categories: color, spacing, typography, motion, shadow, radius, opacity, z-index, etc.
- **src/data/** — 20 CSV databases (1,676+ rows). `products.csv` references `components.csv` and `patterns.csv` via slug. Includes mobile-native databases (`app-interface.csv`, `react-performance.csv`, `stacks/react-native.csv`)
- **src/scripts/** — Python: `core.py` (BM25 engine + domain detector + reasoning), `search.py` (CLI search), `design_system.py` (full spec generator with Tailwind/React/Vue/Svelte output), `palette.py` (custom palette CLI)
- **src/mcp/** — MCP server (Node.js) exposing 6 tools: `search_design_system`, `get_palette`, `get_component`, `generate_tokens`, `list_palettes`, `list_components`. Config examples in `src/mcp/README.md`
- **cli/** — TypeScript CLI (Commander.js). Commands: `install` (20 platforms), `search`, `init`, `generate`. Auto-detects platform by checking for `.claude/`, `.cursor/`, etc. directories
- **packages/react/** — React component library (`@mkatogui/uds-react`). 8 accessible components, bundled with tsup, size-limited (100KB JS, 30KB CSS)
- **docs/** — 8 self-contained HTML docs pages (see Docs Structure below)
- **scripts/** — Python validators (tokens, WCAG, docs)
- **tests/accessibility/** — Playwright + axe-core: `axe-ci.spec.ts` (144 tests: 8 pages × 9 palettes × 2 modes), `aria-attributes.spec.ts`, `keyboard-nav.spec.ts`
- **.claude/skills/** — Claude Code skills: `universal-design-system/`, `brand-identity/`, `design-audit/`, `slides-design/`, `ui-styling/`, `pre-pr-review/`
- **.claude/agents/** — Claude Code agents: `pre-pr-reviewer.md` (CI simulation), `palette-sync.md` (token→docs sync), `a11y-remediator.md` (WCAG fix), `metrics-aligner.md` (count sync), `component-scaffold.md` (React scaffolding), `docs-sync.md` (cross-page consistency)
- **.claude/commands/** — Slash commands: `/pre-pr-review`, `/palette-sync`, `/a11y-fix`, `/align-metrics`, `/new-component`, `/docs-sync`

### Docs Structure (8 Pages)

All pages are self-contained HTML with inline CSS. They share an identical `site-topnav` nav bar (each marks itself `class="active"`). Version uses `__VERSION__` placeholder injected by CI via `sed`.

| File | Purpose |
|------|---------|
| `docs/index.html` | Landing/showcase — GitHub Pages entry point |
| `docs/docs.html` | Interactive documentation (heaviest page, sidebar + demos) |
| `docs/component-library.html` | Component code reference with copy buttons |
| `docs/reference.html` | Visual token reference (colors, spacing, typography) |
| `docs/visual-framework.html` | Visual framework guide with palette cards |
| `docs/case-studies.html` | 5 real-world design system case studies |
| `docs/playground.html` | Interactive component playground |
| `docs/conformance.html` | WCAG 2.2 AA conformance documentation |

**CSS format groups:** docs.html, component-library.html, playground.html, reference.html use expanded CSS (spaces after colons). visual-framework.html, case-studies.html, conformance.html use minified CSS (no spaces after colons).

## Token Architecture

**Foundation tokens (LOCKED across all palettes):** body typography (Inter), spacing (4px base, 12-step scale), motion durations/easing, z-index (dropdown=10→system=100), opacity.

**Palette tokens (VARY per palette):** color (brand, text, bg, border, status), shadow (elevation), border-radius (shape identity), display font (h1–h3 only).

Dark mode is CSS variable override — same `--color-*` tokens redefined under `[data-theme="X"].docs-dark` selector. Source of truth is `tokens/design-tokens.json`; docs pages have inline CSS that must be kept in sync.

**Token structure in design-tokens.json:** Newer palettes (minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal) use nested keys like `theme.{palette}.dark.{token}`. Older palettes (bold-lifestyle, minimal-corporate, illustration, dashboard) use flat keys with underscore+suffix like `theme.{palette}.text_secondary_dark`.

## 9 Palettes

Apply with `data-theme`: minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal, illustration, dashboard, bold-lifestyle, minimal-corporate.

One palette per surface. No mixing.

**Palette-specific contrast gotchas:** illustration has orange brand-primary (#E8590C) that fails 4.5:1 on white/light backgrounds. ai-futuristic has inherently dark backgrounds even in "light" mode. corporate and minimal-corporate have bright brand-primary in dark mode (#79B8FF, #FBBF24) that fail with white text-on-brand. bold-lifestyle lacks gradient support in some contexts.

## Conventions

- Tokens use CSS custom properties (`--color-*`, `--space-*`, `--font-size-*`)
- Components use BEM naming: `.uds-{component}`, `.uds-{component}--{variant}`
- All palettes must pass WCAG 2.2 AA (4.5:1 body text, 3:1 large text/UI). Large text = ≥24px normal or ≥18.66px bold
- Components must use `var(--token-name)`, never hardcoded values
- All animations must be wrapped in `@media (prefers-reduced-motion: no-preference)`
- CSV validation is permissive — only required columns are checked, extra columns allowed
- HTML docs use `__VERSION__` placeholder — never hardcode version numbers

## Code Quality

```bash
# Lint (Biome — covers ESLint + Prettier in one tool)
npm run lint              # check for lint issues
npm run lint:fix          # auto-fix lint issues
npm run format:check      # check formatting
npm run format            # auto-fix formatting

# Tests
npm run test:react        # run React component tests (Vitest)
npm run test:react:coverage  # run with V8 coverage (outputs to coverage/)
npm run test:primitives   # run primitives tests (Node.js test runner)
npm run test:contracts    # contract testing with Python unittest

# Type-checking
cd cli && npx tsc --noEmit        # CLI type-check
cd packages/react && npx tsc --noEmit  # React type-check
```

**CI pipelines:** `ci.yml` (validation matrix on Node 20+22, then accessibility tests) runs in parallel with `quality.yml` (Biome lint + Vitest coverage + SonarCloud scan) and `codeql.yml` (security scanning).

**SonarCloud:** Requires `SONAR_TOKEN` GitHub secret. Config in `sonar-project.properties`. Coverage uploaded from `coverage/lcov.info`.

**Dependabot:** Configured in `.github/dependabot.yml` for npm (root, cli, packages/react, src/mcp) and GitHub Actions. Weekly schedule, minor/patch grouped.

## Adding to the System

**New palette:** Add overrides in `tokens/design-tokens.json` (color, shadow, radius, font-display) + `tokens/figma-tokens.json` → add to valid palette lists in `_sync_all.py`, `validate-tokens.py`, `wcag-audit.py` → add CSS defs (light + dark) to ALL 8 docs pages (match each file's CSS format) → add rules to `ui-reasoning.csv` → run `npm run check`.

**New component:** Add row to `src/data/components.csv` (id, name, slug, category, variants, use_when, accessibility, states) → reference slug in `products.csv` key_components → add CSS to docs using `var()` references → test across all 9 palettes + light/dark → run `npm run check`.

**New reasoning rule:** Add row to `src/data/ui-reasoning.csv` (id, condition, field, operator, value, then_field, then_value, priority, reasoning, category) → higher priority = evaluated first → run `npm run sync-data`.

**Changing dark mode tokens:** Update `tokens/design-tokens.json` first, then sync the inline CSS in ALL 7 docs pages (index.html has no dark mode blocks). Each page has per-palette dark mode blocks — update all 9 palettes in each file.
