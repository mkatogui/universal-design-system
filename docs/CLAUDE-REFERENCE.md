## CLAUDE.md Reference Appendix

This file contains detailed reference tables and step-by-step workflows that the main `CLAUDE.md` summarizes at a high level.

### Directory structure (detailed)

- **tokens/** — W3C DTCG design tokens (source of truth). 3-tier: primitive (raw color scales) → semantic (functional names) → palette-overrides (per-palette customizations). 20 categories: color, spacing, typography, motion, shadow, radius, opacity, z-index, etc.
- **src/data/** — 20 CSV databases (1,676+ rows). `products.csv` references `components.csv` and `patterns.csv` via slug. Includes mobile-native databases (`app-interface.csv`, `react-performance.csv`, `stacks/react-native.csv`).
- **src/scripts/** — Python: `core.py` (BM25 engine + domain detector + reasoning), `search.py` (CLI search), `design_system.py` (full spec generator with Tailwind/Vue/Svelte output), `palette.py` (custom palette CLI).
- **src/mcp/** — MCP server (Node.js) exposing 6 tools: `search_design_system`, `get_palette`, `get_component`, `generate_tokens`, `list_palettes`, `list_components`. Config examples in `src/mcp/README.md`.
- **cli/** — TypeScript CLI (Commander.js). Commands: `install` (20 platforms), `search`, `init`, `generate`. Auto-detects platform by checking for `.claude/`, `.cursor/`, etc. directories.
- **packages/react/** — React component library (`@mkatogui/uds-react`). 72 components (aligned with `components.csv`; Vue/Svelte have Phase 1–2 parity), bundled with tsup, size-limited (100KB JS, 30KB CSS).
- **docs/** — 8 self-contained HTML docs pages plus markdown guides (see below).
- **scripts/** — Python validators (tokens, WCAG, docs).
- **tests/accessibility/** — Playwright + axe-core: `axe-ci.spec.ts` (144 tests: 8 pages × 9 palettes × 2 modes), `aria-attributes.spec.ts`, `keyboard-nav.spec.ts`.
- **.claude/skills/** — Claude Code skills: `uds-getting-started/`, `universal-design-system/`, `brand-identity/`, `design-audit/`, `slides-design/`, `ui-styling/`, `pre-pr-review/`.
- **.claude/agents/** — Claude Code agents: `pre-pr-reviewer.md` (CI simulation), `palette-sync.md` (token→docs sync), `a11y-remediator.md` (WCAG fix), `metrics-aligner.md` (count sync), `component-scaffold.md` (React scaffolding), `docs-sync.md` (cross-page consistency).
- **.claude/commands/** — Slash commands: `/pre-pr-review`, `/palette-sync`, `/a11y-fix`, `/align-metrics`, `/new-component`, `/docs-sync`.

### Docs structure (detailed)

All docs pages are self-contained HTML with inline CSS. They share an identical `site-topnav` nav bar (each marks itself `class="active"`). Version uses `__VERSION__` placeholder injected by CI via `sed`.

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
| `docs/ADOPTION_FEEDBACK.md` | Adoption feedback and improvement suggestions from real app usage |
| `docs/FORM_PATTERNS.md` | Form patterns: required/optional, validation, FormSection, public BEM for form components |
| `docs/REACT_GUIDE.md` | Getting started guide for the UDS React component library |

**CSS format groups:** `docs.html`, `component-library.html`, `playground.html`, `reference.html` use expanded CSS (spaces after colons). `visual-framework.html`, `case-studies.html`, `conformance.html` use minified CSS (no spaces after colons).

## Workflows and procedures

These workflows are referenced from `CLAUDE.md` and expanded here for full detail.

### New palette

- Add overrides in `tokens/design-tokens.json` (color, shadow, radius, font-display) + `tokens/figma-tokens.json`.
- Add the new palette id to valid palette lists in `_sync_all.py`, `validate-tokens.py`, `wcag-audit.py`.
- Add CSS definitions (light + dark) to **all 8** docs pages (match each file's CSS formatting style).
- Add rules to `src/data/ui-reasoning.csv` so the reasoning engine can select the new palette.
- Run `npm run check` to validate tokens, WCAG contrast, and docs.

### New component

- Add a row to `src/data/components.csv` (id, name, slug, category, variants, use_when, accessibility, states).
- Reference the component slug in `src/data/products.csv` `key_components`.
- Add CSS to docs using `var()` token references only.
- Test across all 9 palettes and both light/dark modes.
- Run `npm run check` to ensure consistency.

### New reasoning rule

- Add a row to `src/data/ui-reasoning.csv` (id, condition, field, operator, value, then_field, then_value, priority, reasoning, category).
- Remember: higher priority is evaluated first.
- Run `npm run sync-data` to regenerate CSV-derived artifacts.

### Changing dark mode tokens

- Update `tokens/design-tokens.json` first.
- Sync the inline CSS in **all 7** docs pages with dark mode (index.html has no dark mode blocks).
- In each page, update per-palette dark mode blocks for all 9 palettes.

