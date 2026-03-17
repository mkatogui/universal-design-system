# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Universal Design System v0.6.1 — a deterministic UI recommendation engine powered by retrieval and rule evaluation that recommends palettes, components, patterns, and anti-patterns based on product domain. 9 structural palettes, 72 components (43 core + 29 from roadmap), ~600 tokens, 20 CSV databases (1,676+ rows), 84 anti-pattern rules, Tailwind CSS generation, React/Vue/Svelte/Web Components output, WCAG 2.2 AA + APCA dual reporting, 20 AI platform support.

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

# Accessibility testing (Playwright + axe-core) — run locally before pushing to avoid CI failures
npm run test:accessibility                                                # same as CI: full suite (8 pages × 9 palettes × 2 modes)
npx playwright test --config=playwright.a11y.config.ts -g "docs / minimal-saas / dark"   # single combo
npm run test:a11y                                                        # Puppeteer axe audit (5 docs pages)
# First-time: npx playwright install chromium
AXE_BASE_URL=http://localhost:3000 npm run test:accessibility             # against live server

# Search the reasoning engine
python src/scripts/search.py "fintech dashboard"
python src/scripts/search.py "kids education app" --verbose --json

# Generate a full design system specification
python src/scripts/design_system.py "saas landing page"
python src/scripts/design_system.py "healthcare portal" --format json

# Generate and persist a design system so your AI assistant can read it when building specific pages
python src/scripts/design_system.py "saas landing" --persist
python src/scripts/design_system.py "saas dashboard" --persist --page dashboard
# Creates design-system/MASTER.md and optionally design-system/pages/<name>.md. Page files override master for hierarchical retrieval.
# From CLI: uds generate "saas landing" --persist --page dashboard. Run uds generate --help for full options (--format box, --framework, etc.).

# Generate with Tailwind CSS config
python src/scripts/design_system.py "saas landing page" --format tailwind

# Generate with framework-specific components
python src/scripts/design_system.py "fintech dashboard" --framework react
python src/scripts/design_system.py "ecommerce store" --framework vue
python src/scripts/design_system.py "education app" --framework svelte

# Custom palette management (single primary → full palette via color harmony)
npm run palette           # or: python src/scripts/palette.py
python src/scripts/palette.py create my-brand --colors "#3B82F6" --harmony analogous
python src/scripts/palette.py preview --colors "#E8590C" --harmony complementary   # recommendation + CSS
python src/scripts/palette.py list
python src/scripts/palette.py create my-palette --colors "#3B82F6,#7048E8"        # 2+ colors = explicit

# Generate docs CSS from design-tokens.json (semantic colors — single source, no hardcoding)
npm run generate-docs-tokens   # writes docs/generated-tokens.css; run after editing tokens

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

- For a full directory table and docs listing, see `docs/CLAUDE-REFERENCE.md`.
- High-signal anchors:
  - **tokens/** — design tokens source of truth (W3C DTCG).
  - **src/data/** — CSV databases powering the reasoning engine.
  - **src/scripts/** — Python BM25 engine, design-system generator, palette CLI.
  - **packages/react/** — `@mkatogui/uds-react` component library.
  - **docs/** — static docs pages used in accessibility and visual regression tests.
  - **tests/accessibility/** — Playwright + axe-core test suite.

### Docs Structure (8 Pages)

Docs pages live under `docs/` and share a common `site-topnav` plus a `__VERSION__` placeholder injected by CI. See `docs/CLAUDE-REFERENCE.md` for the full table and CSS format groups.

## Token Architecture

**Foundation tokens (LOCKED across all palettes):** body typography (Inter), spacing (4px base, 12-step scale), motion durations/easing, z-index (dropdown=10→system=100), opacity.

**Palette tokens (VARY per palette):** color (brand, text, bg, border, status), shadow (elevation), border-radius (shape identity), display font (h1–h3 only).

Dark mode is CSS variable override — same `--color-*` tokens redefined under `[data-theme="X"].docs-dark` selector. Source of truth is `tokens/design-tokens.json`; docs pages have inline CSS that must be kept in sync.

**Token structure in design-tokens.json:** Newer palettes (minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal) use nested keys like `theme.{palette}.dark.{token}`. Older palettes (bold-lifestyle, minimal-corporate, illustration, dashboard) use flat keys with underscore+suffix like `theme.{palette}.text_secondary_dark`.

## 9 Palettes

Apply with `data-theme`: minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal, illustration, dashboard, bold-lifestyle, minimal-corporate.

One palette per surface — no mixing. This preserves identity and keeps contrast assumptions valid.

**Palette-specific contrast gotchas:** illustration has orange brand-primary (#E8590C) that fails 4.5:1 on white/light backgrounds. ai-futuristic has inherently dark backgrounds even in "light" mode. corporate and minimal-corporate have bright brand-primary in dark mode (#79B8FF, #FBBF24) that fail with white text-on-brand. bold-lifestyle lacks gradient support in some contexts.

## Conventions

- **No hardcoded colors:** Do not hardcode hex/rgb in docs or components — prevents palette drift and keeps WCAG contrast checks valid. Semantic colors (e.g. `text-on-brand`, `text-on-error`, `warning-on-bg`, `neutral.0`) are defined once in `tokens/design-tokens.json` or generated by the palette deriver (`src/scripts/color_engine.py`). Docs and components must use `var(--color-*)` (or equivalent) so values come from the token source or from palette generation — never paste literal hex in CSS.
- **Single primary → full palette:** The system generates a complete palette from one user-supplied primary via the Python palette CLI and the color harmony engine (complementary, analogous, triadic, split-complementary, tetradic, monochromatic, balanced). Use `palette.py create --colors "#HEX" --harmony <mode>` or `preview --colors "#HEX" --harmony <mode>`; the CLI prints a professional recommendation (WCAG contrast, recommended-as-primary) so new palettes stay accessible.
- Tokens use CSS custom properties (`--color-*`, `--space-*`, `--font-size-*`) — keeps theming consistent across frameworks and surfaces.
- Components use BEM naming: `.uds-{component}`, `.uds-{component}--{variant}` — avoids selector collisions and makes states easy to target.
- All palettes must pass WCAG 2.2 AA (4.5:1 body text, 3:1 large text/UI). Large text = ≥24px normal or ≥18.66px bold — ensures text and UI controls remain readable.
- Components must use `var(--token-name)`, never hardcoded values — keeps components aligned with tokens and lets palette changes propagate automatically.
- Doc and playground CSS must use design tokens only; `npm run verify` checks for hardcoded color (and radius) in component/utility rules — prevents undocumented visual differences between docs and runtime components.
- All animations must be wrapped in `@media (prefers-reduced-motion: no-preference)` — respects user motion sensitivity preferences.
- CSV validation is permissive — only required columns are checked, extra columns allowed — enables iterative extension of CSVs without breaking validators.
- HTML docs use `__VERSION__` placeholder — never hardcode version numbers, so docs stay aligned with releases.

## Boundaries

- Do not hardcode visual values (colors, radius) directly in components or docs — always go through design tokens to keep palettes, contrast checks, and docs in sync.
- Use exactly one `data-theme` palette per surface — mixing palettes on the same surface breaks the visual system and weakens contrast guarantees.
- Treat docs generated assets (for example, `docs/generated-tokens.css`) as read-only — update `tokens/design-tokens.json` and regenerate instead of editing outputs.
- Keep CLAUDE guidance in `CLAUDE.md` focused on high-signal rules and move long tables/procedures into `docs/CLAUDE-REFERENCE.md` — improves agent compliance by keeping this file scannable.

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

## Testing

- `npm run check` — full validation suite (tokens, WCAG, docs); run before pushing to catch most integration issues early.
- `npm run test:accessibility` — Playwright + axe-core against docs; CI runs the same suite, so run locally for fast feedback.
- `npm run test:a11y` — Puppeteer axe audit of key docs pages; complements the Playwright suite.
- `npm run test:react` / `npm run test:react:coverage` — React component tests and coverage; keeps `@mkatogui/uds-react` stable.
- `npm run test:primitives` / `npm run test:contracts` — validate token primitives and cross-language contracts.
- `npm run audit` / `npm run audit:apca` — verify WCAG 2.2 AA and APCA contrast across palettes.

## Adding to the System

High-level patterns for extending the system. See `docs/CLAUDE-REFERENCE.md` for full step-by-step workflows.

- **New palette:** Update design/palette tokens, sync validator allowlists, add docs CSS (light + dark) for all palettes, add reasoning rules, then run `npm run check` — keeps the engine, tokens, and docs aligned.
- **New component:** Add a row in `components.csv`, reference it from `products.csv`, implement with token-based CSS, test across all palettes + light/dark, then run `npm run check` — ensures new components respect tokens and accessibility rules.
- **New reasoning rule:** Add a row in `ui-reasoning.csv` with clear conditions and reasoning, then run `npm run sync-data` — keeps the rule engine deterministic and explainable.
- **Changing dark mode tokens:** Update `design-tokens.json` first, then update dark-mode CSS blocks in all docs pages, for all palettes — prevents drift between token definitions and docs.

