# System Guarantees

> Universal Design System v__VERSION__

This document defines the formal guarantees of the Universal Design System. Each guarantee states **what is promised**, **how it is tested**, **which CI step enforces it**, and **what to do if broken**. Every guarantee listed here is enforced on every push to `main` and on every pull request via the CI pipeline defined in `.github/workflows/ci.yml`.

---

## 1. WCAG 2.1 AA Color Contrast

| Field | Detail |
|-------|--------|
| **What is promised** | All 9 palettes pass WCAG 2.1 AA contrast ratios in both light and dark mode: 4.5:1 minimum for body text, 3:1 minimum for large text and UI elements. |
| **How it is tested** | `scripts/wcag-audit.py` tests 108 color pairs (9 palettes x 2 modes x 6 pairs each). Each pair is evaluated against the WCAG 2.1 AA thresholds. Results are written to `audits/a11y-audit.json`. |
| **CI step** | `npm run audit` (see `.github/workflows/ci.yml`, step "WCAG contrast audit") |
| **If broken** | Fix the failing token values in `tokens/design-tokens.json` for the affected palette and mode. Re-run `npm run audit` locally to confirm the fix before pushing. |

---

## 2. W3C DTCG Token Format

| Field | Detail |
|-------|--------|
| **What is promised** | All tokens in `tokens/design-tokens.json` conform to the W3C Design Token Community Group (DTCG) format specification. Every token has a valid `$type` and `$value`. |
| **How it is tested** | `scripts/validate-tokens.py` validates the structure, `$type` declarations, and `$value` entries of every token in the file. |
| **CI step** | `npm run validate` (see `.github/workflows/ci.yml`, step "Validate tokens (W3C DTCG format)") |
| **If broken** | Fix the token structure in `tokens/design-tokens.json`. Ensure all tokens have a valid `$type` and `$value` field. Re-run `npm run validate` locally to confirm. |

---

## 3. Palette Completeness

| Field | Detail |
|-------|--------|
| **What is promised** | All 9 palettes define the full set of required tokens: brand colors, background colors, text colors, border colors, status colors (success, warning, error, info), shadow elevations, border-radius values, and display font. |
| **How it is tested** | Token validation (`scripts/validate-tokens.py`) checks for the presence of all required keys in each palette override within `tokens/design-tokens.json`. |
| **CI step** | `npm run validate` (see `.github/workflows/ci.yml`, step "Validate tokens (W3C DTCG format)") |
| **If broken** | Add the missing tokens to the affected palette in `tokens/design-tokens.json`. Reference existing palettes for the complete set of required keys. Re-run `npm run validate` locally. |

---

## 4. CSV Cross-Reference Integrity

| Field | Detail |
|-------|--------|
| **What is promised** | All slug references between the 20 CSV databases resolve correctly. For example, `key_components` in `src/data/products.csv` must reference valid slugs in `src/data/components.csv`. No dangling references. |
| **How it is tested** | `src/data/_sync_all.py` validates all cross-references between CSV files. Only required columns are checked; extra columns are allowed. |
| **CI step** | `npm run sync-data` (see `.github/workflows/ci.yml`, step "CSV cross-reference validation") |
| **If broken** | Fix broken slug references in the source CSV file, or add the missing entry to the target CSV file. Re-run `npm run sync-data` locally to confirm. |

---

## 5. Documentation Integrity

| Field | Detail |
|-------|--------|
| **What is promised** | HTML documentation files use only `var(--token-name)` references for colors and spacing — no hardcoded values. All navigation links are valid. Palette definitions are present and correct. |
| **How it is tested** | `scripts/verify-docs.py` scans the HTML documentation files for hardcoded color values, hardcoded spacing values, broken navigation links, and missing palette definitions. |
| **CI step** | `npm run verify` (see `.github/workflows/ci.yml`, step "Docs integrity check") |
| **If broken** | Replace any hardcoded color or spacing values with the corresponding `var()` token reference. Fix any broken navigation links. Re-run `npm run verify` locally. |

---

## 6. Build Reproducibility

| Field | Detail |
|-------|--------|
| **What is promised** | `npm run build` produces identical output from identical input tokens. The Style Dictionary build is fully deterministic — no timestamps, random IDs, or environment-dependent values appear in the output. |
| **How it is tested** | Style Dictionary performs a deterministic build from `tokens/design-tokens.json`, producing platform outputs for CSS, JS, iOS (Swift), and Android (XML). |
| **CI step** | `npm run build` (see `.github/workflows/ci.yml`, step "Style Dictionary build") |
| **If broken** | Check for non-deterministic values in the token source files or Style Dictionary configuration (timestamps, random IDs, environment variables). Ensure the build configuration does not inject non-reproducible data. |

---

## 7. Component Contracts

| Field | Detail |
|-------|--------|
| **What is promised** | All components follow BEM naming conventions (`.uds-{component}`, `.uds-{component}--{variant}`), use CSS custom properties (`var(--token-name)`) for all visual values, and never use hardcoded color or spacing values. |
| **How it is tested** | Manual review during development, supplemented by `scripts/verify-docs.py` which performs partial automated checks for hardcoded values and token usage in documented components. |
| **CI step** | `npm run verify` (see `.github/workflows/ci.yml`, step "Docs integrity check") |
| **If broken** | Refactor the component to replace all hardcoded values with `var()` token references. Ensure class names follow the `.uds-{component}--{variant}` BEM convention. Re-run `npm run verify` locally. |

---

## 8. Motion Safety

| Field | Detail |
|-------|--------|
| **What is promised** | All CSS animations and transitions are wrapped in `@media (prefers-reduced-motion: no-preference)`, ensuring that users who prefer reduced motion are not subjected to unwanted animations. |
| **How it is tested** | `scripts/verify-docs.py` checks for unguarded `animation` and `transition` declarations that are not wrapped in a `prefers-reduced-motion` media query. |
| **CI step** | `npm run verify` (see `.github/workflows/ci.yml`, step "Docs integrity check") |
| **If broken** | Wrap the offending animation or transition declaration inside `@media (prefers-reduced-motion: no-preference) { ... }`. Re-run `npm run verify` locally. |

---

## 9. Deterministic Recommendations

| Field | Detail |
|-------|--------|
| **What is promised** | The BM25 reasoning engine produces identical output for identical input queries. Given the same query string, the domain detection, BM25 ranking, rule evaluation, and final recommendations are fully deterministic. |
| **How it is tested** | Contract tests (`npm run test:contracts`) run a set of known queries and assert that the output matches expected results exactly. |
| **CI step** | `npm run test:contracts` (see `.github/workflows/ci.yml`, step "Contract tests") |
| **If broken** | Check for non-deterministic code paths in `src/scripts/core.py` — look for random sampling, unordered set iteration, or time-dependent logic. Fix and re-run `npm run test:contracts` locally. |

---

## 10. CLI TypeScript Compilation

| Field | Detail |
|-------|--------|
| **What is promised** | The CLI source code in `cli/src/` compiles without TypeScript errors. All type annotations are correct and all imports resolve. |
| **How it is tested** | `npx tsc` is run in the `cli/` directory, which performs a full TypeScript compilation check without emitting output (type-check only). |
| **CI step** | `cd cli && npm install && npx tsc` (see `.github/workflows/ci.yml`, step "CLI compilation check") |
| **If broken** | Fix the TypeScript errors reported by `tsc` in the `cli/src/` directory. Re-run `npx tsc` locally in the `cli/` directory to confirm. |

---

## Summary

| # | Guarantee | Command | Automated |
|---|-----------|---------|-----------|
| 1 | WCAG 2.1 AA Color Contrast | `npm run audit` | Yes |
| 2 | W3C DTCG Token Format | `npm run validate` | Yes |
| 3 | Palette Completeness | `npm run validate` | Yes |
| 4 | CSV Cross-Reference Integrity | `npm run sync-data` | Yes |
| 5 | Documentation Integrity | `npm run verify` | Yes |
| 6 | Build Reproducibility | `npm run build` | Yes |
| 7 | Component Contracts | `npm run verify` | Partial |
| 8 | Motion Safety | `npm run verify` | Yes |
| 9 | Deterministic Recommendations | `npm run test:contracts` | Yes |
| 10 | CLI TypeScript Compilation | `cd cli && npx tsc` | Yes |

All guarantees except Component Contracts (which relies partially on manual review) are fully enforced by CI on every push and pull request. The full validation suite can be run locally with `npm run check`.
