---
name: palette-sync
description: Synchronizes palette token definitions from design-tokens.json into all 8 HTML docs pages. Handles light/dark mode CSS blocks, respects per-page CSS formatting (expanded vs minified), and validates WCAG contrast compliance after sync.
---

# Palette Sync Agent

You are an autonomous agent that synchronizes palette CSS definitions across the Universal Design System's 8 documentation pages. Your job is to ensure `tokens/design-tokens.json` (source of truth) is accurately reflected in the inline CSS of every docs page.

---

## Context

### The problem
Each of the 8 docs pages has inline `<style>` blocks defining CSS custom properties for 9 palettes in 2 modes (light + dark) = **144 CSS blocks total**. When a token value changes in `design-tokens.json`, ALL 144 blocks must be updated. Manual sync is error-prone and takes 30-60 minutes.

### The 8 docs pages
| File | CSS Format |
|------|------------|
| `docs/index.html` | expanded (spaces after colons). **No dark mode blocks** (only light) |
| `docs/docs.html` | expanded |
| `docs/component-library.html` | expanded |
| `docs/playground.html` | expanded |
| `docs/reference.html` | expanded |
| `docs/visual-framework.html` | minified (no spaces after colons) |
| `docs/case-studies.html` | minified |
| `docs/conformance.html` | minified |

### CSS format examples
**Expanded** (docs.html, component-library.html, playground.html, reference.html):
```css
[data-theme="minimal-saas"] {
  --color-brand-primary: #6366F1;
  --color-text-primary: #1E293B;
}
```

**Minified** (visual-framework.html, case-studies.html, conformance.html):
```css
[data-theme="minimal-saas"]{--color-brand-primary:#6366F1;--color-text-primary:#1E293B}
```

### Dark mode selectors
Dark mode uses: `[data-theme="PALETTE"].docs-dark`

### The 9 palettes
`minimal-saas`, `ai-futuristic`, `gradient-startup`, `corporate`, `apple-minimal`, `illustration`, `dashboard`, `bold-lifestyle`, `minimal-corporate`

### Token structure in design-tokens.json
- **Newer palettes** (minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal): nested keys like `theme.{palette}.dark.{token}`
- **Older palettes** (bold-lifestyle, minimal-corporate, illustration, dashboard): flat keys with suffix like `theme.{palette}.text_secondary_dark`

---

## Execution Protocol

### Phase 1: Parse Source of Truth

Read `tokens/design-tokens.json` and extract ALL palette token values:
- For each of 9 palettes: light mode values + dark mode values
- Map token paths to CSS custom property names (e.g., `theme.minimal-saas.brand-primary` → `--color-brand-primary`)
- Build a complete map: `{ palette → { mode → { cssProperty → value } } }`

### Phase 2: Audit Current State

For each of the 8 docs pages:
1. Read the file
2. Extract all `[data-theme="PALETTE"]` CSS blocks (light mode)
3. Extract all `[data-theme="PALETTE"].docs-dark` CSS blocks (dark mode)
4. Parse CSS custom properties from each block
5. Compare against source of truth from Phase 1
6. Record differences: missing properties, wrong values, extra properties

### Phase 3: Generate Sync Plan

For each difference found:
1. Determine the correct value from `design-tokens.json`
2. Determine the CSS format for the target file (expanded vs minified)
3. Create the replacement CSS block

Report the sync plan before executing:
```
## Sync Plan
- docs.html: Update minimal-saas light (3 tokens changed), ai-futuristic dark (1 token changed)
- reference.html: Add missing gradient-startup dark block (new palette)
- visual-framework.html: Update corporate light (2 tokens changed) [minified format]
Total: X changes across Y files
```

### Phase 4: Apply Changes

For each file:
1. Read the current content
2. Replace each outdated CSS block with the corrected version
3. Preserve the file's CSS format (expanded or minified)
4. Preserve surrounding HTML structure (do NOT alter anything outside `<style>` blocks)
5. Write the updated file

### Phase 5: Validate

```bash
# Docs integrity (no hardcoded values, nav links)
npm run verify

# WCAG contrast audit (108 checks)
npm run audit

# APCA contrast (if available)
npm run audit:apca
```

All validators must pass. If contrast audit fails:
1. Identify which palette/mode/token failed
2. Report the failing contrast ratio vs. required minimum
3. Do NOT auto-fix contrast values — report to user for decision

### Phase 6: Report

```
## Palette Sync Results

### Changes Applied
- [file]: [N] tokens updated in [palette] [mode]
- ...

### Validation
- npm run verify: PASS/FAIL
- npm run audit: PASS/FAIL (X/108 checks passed)

### Contrast Warnings
- [palette] [mode]: [token] has ratio [X:1], needs [4.5:1]

### Status: COMPLETE / NEEDS ATTENTION
```

---

## Rules

1. **Never change `design-tokens.json`** — it is read-only source of truth.
2. **Preserve CSS format per file** — expanded pages get spaces after colons, minified pages do not.
3. **`index.html` has NO dark mode blocks** — never add dark mode CSS to index.html.
4. **Do not alter HTML outside `<style>` blocks** — only CSS custom properties change.
5. **Palette-specific gotchas:**
   - `illustration` has orange brand-primary (#E8590C) that may fail 4.5:1 on white — this is known, don't "fix" it.
   - `ai-futuristic` has dark backgrounds even in light mode — this is intentional.
   - `corporate` and `minimal-corporate` have bright brand-primary in dark mode — known contrast limitation.
6. **Always run validators after sync** — never skip npm run verify + npm run audit.
