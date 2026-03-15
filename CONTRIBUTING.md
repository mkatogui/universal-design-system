# Contributing to Universal Design System

Thank you for your interest in contributing! This is an AI-native design system with a BM25 reasoning engine, 9 structural palettes, 43 components, and ~600 tokens. Whether you're adding a product entry, a new palette, or fixing a contrast ratio — every contribution matters.

**Live docs:** [mkatogui.github.io/universal-design-system](https://mkatogui.github.io/universal-design-system/)
**Repository:** [github.com/mkatogui/universal-design-system](https://github.com/mkatogui/universal-design-system)

---

## Development Environment Setup

**Prerequisites:** Node.js 18+, Python 3.8+, npm 9+. No `pip install` needed — all Python scripts use only the standard library (`csv`, `json`, `re`, `math`, `argparse`).

```bash
git clone https://github.com/mkatogui/universal-design-system.git
cd universal-design-system
npm install
npm run check   # verify setup — all 3 validators must pass
```

Expected `npm run check` output:
1. **Token validation** — W3C DTCG format, palette sync between `design-tokens.json` and `figma-tokens.json`
2. **WCAG audit** — 108/108 contrast checks pass (9 palettes x 2 modes x 6 combinations)
3. **Docs verification** — no hardcoded values, valid nav links, palette definitions present

---

## Running the Validation Suite

| Command | What it does |
|---------|-------------|
| `npm run check` | Runs all 3 validators (token + WCAG + docs) |
| `npm run validate` | W3C DTCG token format and palette sync |
| `npm run audit` | WCAG 2.2 AA contrast — 108 checks across 9 palettes x 2 modes |
| `npm run verify` | HTML docs integrity — no hardcoded values, valid nav links |
| `npm run sync-data` | CSV cross-reference validation across 20 databases |
| **`npm run test:accessibility`** | **Playwright + axe-core (same as CI)** — run locally before pushing to avoid accessibility failures in the pipeline. First time: `npx playwright install chromium`. |

You can also run the reasoning engine directly:

```bash
python3 src/scripts/search.py "fintech dashboard"
python3 src/scripts/design_system.py "healthcare portal" --format json
```

---

## Your First Contribution

New here? Start with one of these — no deep architecture knowledge required:

1. **Add a product to `src/data/products.csv`** — describe a real-world product (e.g., a banking app). Columns: `id`, `name`, `sector`, `sub_sector`, `palette`, `style`, `color_mood`, `typography_mood`, `key_components`, `key_patterns`, `audience`, `complexity`, `anti_patterns`.
2. **Add a reasoning rule to `src/data/ui-reasoning.csv`** — e.g., "IF sector=education THEN palette=illustration".
3. **Improve anti-patterns** — find a product row with a weak `anti_patterns` field and make it more specific.
4. **Look for [`good first issue`](https://github.com/mkatogui/universal-design-system/labels/good%20first%20issue) labels.**

### Workflow

```bash
# Fork, clone, and install
git clone https://github.com/<your-username>/universal-design-system.git
cd universal-design-system && npm install

# Branch, change, validate, push
git checkout -b add-banking-product
# ... make your changes ...
npm run check
# If you changed docs or styles, run the same a11y tests as CI to avoid pipeline failures:
npm run test:accessibility
git add -A && git commit -m "Add retail banking product to products.csv"
git push origin add-banking-product
# Open a Pull Request on GitHub
```

---

## How to Add a New Palette

The 9 built-in palettes: `minimal-saas`, `ai-futuristic`, `gradient-startup`, `corporate`, `apple-minimal`, `illustration`, `dashboard`, `bold-lifestyle`, `minimal-corporate`. To add a new one:

1. **Define token overrides** in `tokens/design-tokens.json` — add a key under `palette-overrides` with `color`, `shadow`, `border-radius`, and `font-display` values.
2. **Mirror to Figma** — add the same structure in `tokens/figma-tokens.json`.
3. **Register in validators** — add palette name to valid lists in `scripts/validate-tokens.py`, `scripts/wcag-audit.py`, and `src/data/_sync_all.py`.
4. **Add CSS definitions** in `docs/docs.html` — both `[data-theme="your-palette"]` and `[data-theme="your-palette"].docs-dark` selectors.
5. **Add reasoning rules** in `src/data/ui-reasoning.csv` mapping sectors/product types to your palette.
6. **Validate** — `npm run check`. Must pass all WCAG 2.2 AA checks (4.5:1 body text, 3:1 large text/UI).

---

## How to Add a New Component

1. **Add a row to `src/data/components.csv`** — columns: `id`, `name`, `slug`, `category`, `variants`, `sizes`, `states`, `props`, `accessibility`, `use_when`, `dont_use_when`, `css_class`. Example:
   ```
   32,Date Picker,date-picker,input,"inline,dropdown,range","sm,md,lg","default,focused,disabled,error","value,min,max,format","role=dialog, aria-label, keyboard nav",User needs to select a date,Free-form entry is acceptable,uds-date-picker
   ```
2. **Reference the slug** in `src/data/products.csv` — add it to the `key_components` field (comma-separated).
3. **Add CSS** in `docs/docs.html` or `docs/component-library.html` using `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`. Never hardcode values.
4. **Test across all 9 palettes** in both light and dark mode.
5. **Run `npm run check`** to verify docs integrity.

---

## How to Add a New Reasoning Rule

Rules in `src/data/ui-reasoning.csv` drive recommendations. Columns: `id`, `condition`, `field`, `operator`, `value`, `then_field`, `then_value`, `priority`, `reasoning`, `category`. Example:

```
166,sector is gaming,sector,equals,gaming,palette,bold-lifestyle,80,Gaming products need bold high-energy visuals,palette
```

Higher `priority` = evaluated first. First match wins for palette selection. Validate with `npm run sync-data`.

---

## Architecture Overview

```
User Query --> DomainDetector --> BM25 Search --> Rule Engine --> Token Resolution --> Output
               (55 sectors,      (20 CSVs,       (190 rules,     (design-tokens.json,
                21 product types) 1,600+ rows)     priority-sorted) palette overrides)
```

- **Layer 1 — Domain Detection** (`src/scripts/core.py: DomainDetector`): Regex matching against 21 sectors and 8 product types. Returns sector + product_type with confidence.
- **Layer 2 — BM25 Search** (`src/scripts/core.py: BM25Index`): Okapi BM25 ranking (k1=1.5, b=0.75) across all CSV databases. Exact token matching only.
- **Layer 3 — Rule Engine** (`src/scripts/core.py: ReasoningEngine`): Evaluates rules from `ui-reasoning.csv`. Higher priority first; first match wins.

**Palette fallback chain:** rule match --> top search result's palette --> default `minimal-saas`.

See also: [`docs/assets/architecture.svg`](docs/assets/architecture.svg) | [`src/data/README.md`](src/data/README.md)

---

## Internationalization (i18n)

The design system is **English-only** (`lang="en"` on all HTML pages). All token names, component labels, documentation, and reasoning engine data use English. There are no current plans for multi-language support — contributions should maintain English throughout.

---

## Governance Rules

### Foundation-locked tokens (same across ALL palettes)

- Body typography — Inter, font sizes, line heights
- Spacing scale — 4px base, 12-step scale
- Motion durations and easing curves
- Z-index layers (dropdown=10 through system=100)
- Opacity values

### Palette-variable tokens (VARY per palette)

- Colors — brand, text, background, border, status
- Shadows — elevation scale
- Border radius — shape scale
- Display font — h1 through h3 typeface only

---

## Token Changes

All tokens live in `tokens/design-tokens.json` (source of truth) and `tokens/figma-tokens.json` (Figma sync):

1. Edit `tokens/design-tokens.json` first — this is the canonical source
2. Mirror structural changes to `tokens/figma-tokens.json`
3. Run `npm run validate` to verify format and sync
4. Run `npm run audit` to check contrast ratios
5. Update `docs/docs.html` if the change affects component rendering

---

## Component Changes

Components are in `docs/docs.html` and `docs/component-library.html`:

1. Use `var()` references — never hardcode colors, radii, or shadows
2. Ensure the component works across all 9 palettes and both light/dark modes
3. Add a CVA-style variant table documenting props, sizes, and states
4. Run `npm run verify` to catch hardcoded values or broken links

---

## Documentation Changes

The interactive docs (`docs/docs.html`) are a self-contained HTML file with inline CSS/JS:

1. Preserve the section structure and sidebar navigation
2. Add new sidebar links when adding new sections
3. Maintain existing code-block styling (`.code-block` class with `<code>` tag)
4. Test palette switching across all 9 palettes after changes
5. Version numbers use `__VERSION__` placeholder — never hardcode them

---

## Pull Request Process

1. Run `npm run check` and ensure **all** validations pass
2. Include a description of what changed and why
3. If adding a new palette, paste the WCAG audit output showing all checks pass
4. If adding CSV rows, run `npm run sync-data` to verify cross-references
5. Reviewer will check WCAG compliance and cross-palette rendering

---

## Versioning and publishing

**Published packages:** `@mkatogui/universal-design-system` (root), `@mkatogui/uds-react`, `@mkatogui/uds-tokens`. Vue, Svelte, and primitives may be published separately.

**Version policy:** Keep root and `@mkatogui/uds-react` in sync (e.g. both at `0.4.x`). Bump `@mkatogui/uds-tokens` and other packages when cutting a release or when their contents change. Use a single source of truth (e.g. root `package.json` version) and align the rest before publishing.

**Before publishing:**

- Run `npm run check` (validate + audit + verify).
- Root publish runs `prepublishOnly: npm run build:cli` (CLI is built; tokens are shipped as source). For built CSS/JS tokens, consumers use `@mkatogui/uds-tokens`.
- If publishing React or tokens, run `npm run build:react` and/or `npm run build:tokens` and publish from the corresponding package directory (or via your CI).
- Use **Changesets** for release notes: add a changeset with `npm run changeset`, then `npm run changeset:version` and `npm run changeset:publish` when releasing.

**Publish commands (from repo root):**

Ensure you're logged in: `npm whoami` (if not, run `npm login`). Then:

```bash
# 1. Build everything
npm run build:cli && npm run build:react && npm run build:tokens

# 2. Publish packages (scoped packages require --access public)
npm publish --access public
cd packages/tokens && npm publish --access public && cd ../..
cd packages/react && npm publish --access public && cd ../..
```

See `docs/LIBRARY-IMPROVEMENTS.md` for a full checklist and consumer-facing notes.

---

## Code Style

- **CSS:** Use custom properties (`var(--token-name)`) for all themeable values
- **HTML:** Semantic elements, ARIA attributes where needed
- **Python:** Follow PEP 8, include docstrings
- **JSON:** 2-space indentation
- **Components:** BEM naming — `.uds-{component}`, `.uds-{component}--{variant}`
- **Animations:** Wrap in `@media (prefers-reduced-motion: no-preference)`

---

## Reporting Issues

When reporting bugs, please include:

- Which palette and mode (light/dark) you're using
- Browser and version
- A screenshot if it's a visual issue
- Steps to reproduce
- If it's a reasoning issue: the query you ran and the unexpected output
