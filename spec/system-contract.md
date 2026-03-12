# Universal Design System -- System Contract

> Canonical specification for Universal Design System v0.1.0.
> This document is the single source of truth for system behavior, metrics, and architecture.

## 1. System Overview

Universal Design System is a **deterministic UI recommendation engine** powered by retrieval and rule evaluation. Given a natural-language product description (e.g., "fintech dashboard for mobile banking"), the system returns a complete design specification: palette, components, patterns, typography, anti-patterns, and token values.

There is no neural network, no LLM inference, and no probabilistic output. The pipeline is fully reproducible: the same query always produces the same result.

## 2. Ground Truth Metrics

| Metric | Value | Source |
|---|---|---|
| Design tokens | ~530 | `tokens/design-tokens.json` (`$value` count) |
| Components | 32 | `src/data/components.csv` (data rows) |
| CSV databases | 16 | 15 in `src/data/` + 1 in `src/data/stacks/` |
| Total CSV rows | ~1,528 | Sum of all CSV data rows (excluding headers) |
| Sectors | 55 | `SECTOR_KEYWORDS` in `src/scripts/core.py` |
| Product types | 14 | `PRODUCT_KEYWORDS` in `src/scripts/core.py` |
| Reasoning rules | ~170 | `src/data/ui-reasoning.csv` (data rows) |
| Anti-patterns | 84 | `src/data/anti-patterns.csv` (data rows) |
| Palettes | 9 | Theme section of `tokens/design-tokens.json` |
| Synonym pairs | 32 | `SYNONYMS` dict in `src/scripts/core.py` |

## 3. Three-Layer Reasoning Pipeline

```
User Query
    |
    v
[Layer 1] DomainDetector  (55 sectors, 14 product types)
    |       - Regex keyword matching against SECTOR_KEYWORDS and PRODUCT_KEYWORDS
    |       - Specificity-based tiebreaking (longer keyword matches win)
    |       - Returns: sector, product_type, confidence scores
    |
    v
[Layer 2] BM25Index  (k1=1.5, b=0.75, Porter stemmer, synonym expansion)
    |       - Okapi BM25 ranking across 16 CSV databases (~1,528 rows)
    |       - Tokenization: lowercase, non-alphanumeric removal, min length 2
    |       - Hyphen-aware: "e-commerce" -> ["e-commerce", "ecommerce", "commerce"]
    |       - Porter stemmer applied to all tokens
    |       - Synonym expansion on query tokens (32 synonym pairs)
    |       - Returns: ranked results per database with BM25 scores
    |
    v
[Layer 3] ReasoningEngine  (~170 rules, priority sorting)
    |       - Evaluates conditional rules from ui-reasoning.csv
    |       - Rule format: IF field=value THEN field=value (with priority)
    |       - Supports compound conditions (AND/OR boolean operators)
    |       - Higher priority rules evaluated first; first match wins for palette
    |       - Palette fallback chain: rule match -> top product result's palette -> "minimal-saas"
    |
    v
Design Specification Output
    - Palette + light/dark tokens
    - Components (matched from components.csv)
    - Patterns (matched from patterns.csv)
    - Typography pairing
    - Anti-patterns (sector-specific warnings)
    - Token values resolved from design-tokens.json
```

### 3.1 Layer 1 -- Domain Detection

**Class:** `DomainDetector` in `src/scripts/core.py`

The detector classifies queries into one of 55 sectors and 14 product types using keyword matching. Each sector has a list of associated keywords (e.g., `fintech: ["fintech", "financial-technology", "neobank", "digital-banking", "mobile-banking", "paytech"]`). Matching is case-insensitive against both the full query string and individual word tokens.

**Tiebreaking:** When two sectors have the same keyword match count, the one with higher "specificity" (sum of matched keyword character lengths) wins. This favors precise matches like "insurtech" over broad ones like "tech."

**Confidence scores:** Sector confidence = min(match_count / 3.0, 1.0). Product confidence = min(match_count / 2.0, 1.0).

**55 sectors:** finance, fintech, banking, insurance, healthcare, wellness, education, kids, ecommerce, saas, ai, tech, devtools, crypto, web3, defi, iot, government, legal, nonprofit, media, editorial, creative, fashion, luxury, hospitality, food, gaming, esports, entertainment, social, social-media, analytics, marketing, dashboard, logistics, real-estate, professional, productivity, startup, sustainability, proptech, automotive, regtech, legaltech, agritech, govtech, cleantech, insurtech, sporttech, fashiontech, foodtech, musictech, pettech, spacetech.

**14 product types:** dashboard, landing-page, mobile-app, documentation, ecommerce, blog, saas-app, portfolio, admin-panel, community, data-table, marketplace, streaming, telehealth.

### 3.2 Layer 2 -- BM25 Search

**Class:** `BM25Index` in `src/scripts/core.py`

Implements the Okapi BM25 ranking function with parameters k1=1.5 and b=0.75. The index is built from all 16 CSV databases at initialization.

**Tokenization pipeline:**
1. Lowercase the input
2. Replace non-alphanumeric characters (except hyphens and slashes) with spaces
3. Filter tokens shorter than 2 characters
4. For hyphenated tokens: add the joined form and all sub-parts (e.g., "e-commerce" produces "e-commerce", "ecommerce", "commerce")
5. Apply Porter stemmer to each token (stem form added alongside original)
6. On query expansion: look up each token in the SYNONYMS dictionary and append all synonym forms

**Scoring formula:**

```
score(D, Q) = SUM over q in Q of:
    IDF(q) * (tf(q,D) * (k1 + 1)) / (tf(q,D) + k1 * (1 - b + b * |D| / avgdl))

where IDF(q) = log((N - df(q) + 0.5) / (df(q) + 0.5) + 1)
```

### 3.3 Layer 3 -- Rule Engine

**Class:** `ReasoningEngine` in `src/scripts/core.py`

Evaluates ~170 conditional rules from `ui-reasoning.csv`. Each rule has:
- **Condition:** Single-field (`sector=finance`) or compound (`sector=finance AND product_type=dashboard`)
- **Then clause:** `then_field=then_value` (e.g., `palette=corporate`)
- **Priority:** Integer 1-10. Higher priority rules are evaluated first.
- **Category:** Groups rules for organization (e.g., `sector-palette`, `product-component`)

**Compound condition evaluation:** Supports AND/OR with standard precedence (AND before OR). Each sub-expression is `field=value`.

**Palette fallback chain:**
1. First matching rule with `then_field=palette` (highest priority first)
2. Palette from the top BM25 result in `products.csv`
3. Default: `"minimal-saas"`

## 4. Nine Structural Palettes

Applied via `data-theme` attribute. One palette per surface. No mixing.

| Palette | Shape Identity | Display Font | Description |
|---|---|---|---|
| `minimal-saas` | default (8px md) | Inter | Clean, content-first SaaS aesthetic |
| `ai-futuristic` | sharp (4px md) | DM Sans | Dark futuristic with neon accents |
| `gradient-startup` | round (12px md) | Inter | Vibrant gradients, energetic startup feel |
| `corporate` | squared (6px md) | Source Serif 4 | Conservative, trust-building professional |
| `apple-minimal` | smooth (10px md) | Inter | Refined, Apple-inspired minimalism |
| `illustration` | soft (16px md) | Inter | Friendly, illustration-forward design |
| `dashboard` | compact (6px md) | Inter | Dense, data-focused interface |
| `bold-lifestyle` | brutalist (0px md) | Oswald | High-energy editorial, campaign-driven |
| `minimal-corporate` | subtle (6px md) | Source Serif 4 | Research-forward editorial, quiet authority |

Each palette defines light and dark mode tokens, plus a `$structural` metadata block containing shape identity, radius-md, and display font.

Dark mode is implemented as CSS variable override: the same `--color-*` tokens are redefined under `[data-theme="X"].docs-dark` selector.

## 5. Token Architecture

### 5.1 Three-Tier Hierarchy

```
Tier 1: Primitive tokens (raw values)
    tokens/design-tokens.json -> color.primitive.blue.500 = "#3B82F6"
    |
    v
Tier 2: Semantic tokens (functional names)
    tokens/design-tokens.json -> color.semantic.brand-primary = {color.primitive.blue.500}
    |
    v
Tier 3: Palette overrides (per-palette customizations)
    tokens/design-tokens.json -> theme.corporate.brand_primary = "#1A365D"
```

### 5.2 Foundation Tokens (LOCKED across all palettes)

These tokens do not change between palettes:
- **Typography (body):** Inter font family, font-size scale (xs through 5xl), font-weight scale (400-800), line-height scale (1.2-1.8)
- **Spacing:** 4px base grid, 13-step scale (4px to 128px)
- **Motion:** 6 durations (100ms to 1000ms), 4 easing curves (default, in, out, spring)
- **Z-index:** 7-level scale (dropdown=100 to system=9999)
- **Opacity:** 4 levels (disabled=0.4, muted=0.6, subtle=0.8, overlay=0.5)
- **Breakpoints:** 5 breakpoints (640px to 1536px)
- **Border widths:** thin=1px, medium=2px, thick=4px
- **Icon sizes:** sm=16px, md=20px, lg=24px, xl=32px

### 5.3 Palette Tokens (VARY per palette)

These tokens change per palette:
- **Color:** brand (primary, secondary, accent, muted), text (primary, secondary, tertiary, on-brand), background (primary, secondary, tertiary, inverse), border (default, input, subtle), plus dark mode variants of all
- **Shadow:** Elevation scale (xs through 2xl), with dark themes using glow-border variants
- **Border radius:** Shape identity (sm through full), defined per palette in `radius.palette-overrides`
- **Display font:** Only h1-h3 headings; body font (Inter) remains locked

### 5.4 Current Token Naming Convention

Tokens are consumed as CSS custom properties:
- `--color-*` (brand, text, background, border, status colors)
- `--space-*` (spacing scale)
- `--font-size-*` (typography scale)
- `--radius-*` (border radius)
- `--shadow-*` (elevation)
- `--motion-*` (duration and easing)
- `--opacity-*` (opacity levels)
- `--z-index-*` (layering)

**Note:** A future `--uds-*` prefix migration is documented in `spec/token-consumption-contract.md`.

## 6. Component System

**32 components** defined in `src/data/components.csv`.

### 6.1 BEM Naming Convention

```
.uds-{component}              /* Block */
.uds-{component}--{variant}   /* Variant modifier */
```

Examples: `.uds-button`, `.uds-button--primary`, `.uds-button--ghost`, `.uds-hero--gradient-mesh`.

### 6.2 Component Schema

Each component row in `components.csv` contains:
- `id` -- Unique integer identifier
- `name` -- Human-readable name
- `slug` -- URL/CSS-safe identifier (used in BEM class and cross-references)
- `category` -- Functional group (action, navigation, layout, content, feedback, form, data)
- `variants` -- Semicolon-separated list of style variants
- `sizes` -- Semicolon-separated list of size options with pixel values
- `states` -- Semicolon-separated list of interaction states
- `props` -- Semicolon-separated list of configurable properties
- `accessibility` -- ARIA requirements and a11y notes
- `use_when` -- When to use this component
- `dont_use_when` -- When NOT to use this component
- `css_class` -- BEM block name
- `container_query` -- Whether the component uses CSS container queries (yes/no)

### 6.3 Cross-References

`products.csv` references components via `key_components` (semicolon-separated slugs from `components.csv`). Similarly, `key_patterns` references slugs from `patterns.csv`.

## 7. WCAG 2.1 AA Compliance

All palettes must pass WCAG 2.1 AA across both light and dark modes:
- **Body text:** 4.5:1 minimum contrast ratio
- **Large text (18px+ or 14px+ bold):** 3:1 minimum contrast ratio
- **UI components:** 3:1 minimum contrast ratio against adjacent colors
- **Focus indicators:** 2px offset focus ring using `--color-focus-ring`

Validation: `npm run audit` runs 108 checks (9 palettes x 2 modes x 6 contrast pairs).

All animations must be wrapped in `@media (prefers-reduced-motion: no-preference)`.

## 8. CSV Database Schemas

The 16 CSV databases serve as the knowledge base for BM25 retrieval. Full schema details are in `spec/data-inventory.md`.

### 8.1 Indexed Databases (loaded into BM25)

The following 14 databases (plus stacks subdirectory) are indexed at engine initialization:

| Database | Indexed Fields |
|---|---|
| products.csv | name, sector, sub_sector, palette, style, color_mood, key_components, key_patterns, audience |
| styles.csv | name, category, description, palette, best_for |
| colors.csv | name, industry, mood, palette_match |
| typography.csv | heading_font, body_font, mood, best_for, palette_match |
| landing.csv | name, category, description, palette_match, best_for |
| charts.csv | name, type, description, best_for |
| components.csv | name, slug, category, variants, use_when |
| patterns.csv | name, slug, category, description, best_for |
| ux-guidelines.csv | category, guideline, applies_to |
| anti-patterns.csv | sector, anti_pattern, description |
| google-fonts.csv | name, category, mood, best_for |
| icons.csv | name, library, style, best_for |
| app-interface.csv | category, issue, keywords, description |
| react-performance.csv | category, issue, keywords, description |
| stacks/react-native.csv | category, issue, keywords, description |

### 8.2 Rule Database (loaded separately)

- `ui-reasoning.csv` -- Loaded directly by `ReasoningEngine.__init__()` and evaluated via `apply_rules()`, not via BM25.

## 9. Output Formats

The system supports multiple output formats via `src/scripts/design_system.py`:

- **Default (text):** Human-readable specification
- **JSON:** Machine-readable structured output (`--format json`)
- **Tailwind CSS:** Tailwind config with resolved token values (`--format tailwind`)
- **React/Vue/Svelte:** Framework-specific component code (`--framework react|vue|svelte`)

## 10. Build Targets

Style Dictionary builds tokens for multiple platforms:
- **CSS:** Custom properties (`--color-*`, `--space-*`, etc.)
- **JavaScript:** ES module exports
- **iOS Swift:** Swift constants
- **Android XML:** Resource values

Run: `npm run build`
