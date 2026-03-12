# Universal Design System -- Data Inventory

> Complete inventory of all 16 CSV databases with schemas, row counts, and validation rules.

## Summary

| # | Database | Location | Data Rows | Purpose |
|---|---|---|---|---|
| 1 | products.csv | src/data/ | 195 | Product archetypes with palette/component mappings |
| 2 | components.csv | src/data/ | 32 | UI component definitions with variants and a11y |
| 3 | ui-reasoning.csv | src/data/ | 170 | Conditional design rules (IF/THEN with priority) |
| 4 | anti-patterns.csv | src/data/ | 84 | Sector-specific design anti-patterns |
| 5 | typography.csv | src/data/ | 85 | Font pairing recommendations |
| 6 | styles.csv | src/data/ | 69 | Visual style definitions |
| 7 | colors.csv | src/data/ | 180 | Industry-specific color palettes |
| 8 | patterns.csv | src/data/ | 15 | UI/UX pattern definitions |
| 9 | google-fonts.csv | src/data/ | 200 | Google Fonts catalog with mood tags |
| 10 | icons.csv | src/data/ | 200 | Icon library recommendations |
| 11 | landing.csv | src/data/ | 35 | Landing page template definitions |
| 12 | charts.csv | src/data/ | 25 | Chart/data-visualization types |
| 13 | ux-guidelines.csv | src/data/ | 114 | UX best practices by category |
| 14 | app-interface.csv | src/data/ | 30 | Mobile app interface guidelines |
| 15 | react-performance.csv | src/data/ | 44 | React performance patterns |
| 16 | stacks/react-native.csv | src/data/stacks/ | 50 | React Native best practices |
| | **Total** | | **~1,528** | |

> Row counts exclude the header row. Counts are approximate and may change as the database grows.

---

## 1. products.csv

**Purpose:** Product archetypes mapping sectors to palettes, styles, and component/pattern recommendations. This is the primary database for BM25 product matching.

**Row count:** 195

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Product archetype name (e.g., "SaaS Dashboard") |
| sector | yes | Primary sector (must match a SECTOR_KEYWORDS key) |
| sub_sector | yes | Sub-sector refinement (e.g., "analytics", "marketing") |
| palette | yes | Recommended palette (one of 9 valid palettes) |
| style | yes | Visual style name (references styles.csv) |
| color_mood | yes | Color mood descriptor (e.g., "cool-neutral", "vibrant-energetic") |
| typography_mood | yes | Typography mood descriptor |
| key_components | yes | Semicolon-separated component slugs (references components.csv) |
| key_patterns | yes | Semicolon-separated pattern slugs (references patterns.csv) |
| audience | yes | Target audience (semicolon-separated) |
| complexity | no | Complexity level (low, medium, high) |
| anti_patterns | no | Semicolon-separated anti-pattern slugs to avoid |

**Validation rules:**
- `palette` must be one of: minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal, illustration, dashboard, bold-lifestyle, minimal-corporate
- `key_components` slugs should exist in components.csv
- `key_patterns` slugs should exist in patterns.csv

---

## 2. components.csv

**Purpose:** Complete UI component catalog with variants, states, accessibility requirements, and usage guidance.

**Row count:** 32

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Human-readable component name |
| slug | yes | URL/CSS-safe identifier (used in BEM: `.uds-{slug}`) |
| category | yes | Functional group: action, navigation, layout, content, feedback, form, data |
| variants | yes | Semicolon-separated style variants |
| sizes | no | Semicolon-separated size options with pixel values |
| states | yes | Semicolon-separated interaction states |
| props | no | Semicolon-separated configurable properties |
| accessibility | yes | ARIA requirements and a11y notes |
| use_when | yes | When to use this component |
| dont_use_when | no | When NOT to use this component |
| css_class | yes | BEM block class name |
| container_query | no | Whether the component uses CSS container queries (yes/no) |

**Validation rules:**
- `slug` must be unique across all rows
- `category` must be one of the defined functional groups
- `accessibility` must not be empty (all components need a11y guidance)

---

## 3. ui-reasoning.csv

**Purpose:** Conditional design rules evaluated by the ReasoningEngine. Rules map domain detection results (sector, product type) to design recommendations (palette, components, patterns, typography).

**Row count:** 170

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| condition | yes | Condition type: "sector", "product", or "compound" |
| field | yes | Field to evaluate (e.g., "sector", "product_type") |
| operator | yes | Comparison operator (currently only "equals") |
| value | yes | Value to match against |
| then_field | yes | Output field to set (e.g., "palette", "component", "pattern") |
| then_value | yes | Value to assign to the output field |
| priority | yes | Integer 1-10 (higher = evaluated first) |
| reasoning | yes | Human-readable explanation of why this rule exists |
| category | yes | Rule category (e.g., "sector-palette", "product-component") |
| compound_condition | no | Compound boolean expression (e.g., "sector=finance AND product_type=dashboard") |

**Validation rules:**
- `priority` must be an integer between 1 and 10
- `operator` is currently always "equals"
- Rules are sorted by priority descending during evaluation
- First matching rule wins for single-valued fields like `palette`

---

## 4. anti-patterns.csv

**Purpose:** Sector-specific design anti-patterns with severity levels and recommended alternatives.

**Row count:** 84

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| sector | yes | Sector this anti-pattern applies to |
| anti_pattern | yes | Anti-pattern slug/name |
| severity | yes | Severity level: critical, high, medium, low |
| description | yes | Why this is an anti-pattern in this sector |
| alternative | yes | What to do instead |
| example | no | Concrete example of the anti-pattern |

**Validation rules:**
- `severity` must be one of: critical, high, medium, low
- `sector` should match a SECTOR_KEYWORDS key

---

## 5. typography.csv

**Purpose:** Font pairing recommendations mapping heading/body font combinations to moods and palette matches.

**Row count:** 85

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| heading_font | yes | Heading font family name |
| body_font | yes | Body font family name |
| mood | yes | Mood descriptor (e.g., "clean-professional", "modern-friendly") |
| category | yes | Pairing category (e.g., "sans-sans", "serif-sans") |
| heading_weight | yes | Heading font weight (numeric) |
| body_weight | yes | Body font weight (numeric) |
| best_for | yes | Semicolon-separated use cases |
| google_fonts_url | no | Google Fonts URL for the heading font |
| palette_match | yes | Recommended palette for this pairing |

---

## 6. styles.csv

**Purpose:** Visual style definitions mapping style names to palettes and treatment descriptors (bg, border, shadow, typography, animation).

**Row count:** 69

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Style name (e.g., "Clean Minimal", "Flat Design") |
| category | yes | Style category (e.g., "minimal", "bold", "gradient") |
| description | yes | Style description |
| palette | yes | Associated palette |
| bg_treatment | yes | Background treatment descriptor |
| border_treatment | yes | Border treatment descriptor |
| shadow_treatment | yes | Shadow treatment descriptor |
| typography_treatment | yes | Typography treatment descriptor |
| animation_treatment | yes | Animation treatment descriptor |
| best_for | yes | Semicolon-separated use cases |
| avoid_for | no | Semicolon-separated contexts to avoid |

---

## 7. colors.csv

**Purpose:** Industry-specific color palette recommendations with hex values, mood tags, and WCAG AA compliance status.

**Row count:** 180

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Color palette name (e.g., "Classic Blue Trust") |
| industry | yes | Target industry |
| primary | yes | Primary color hex value |
| secondary | yes | Secondary color hex value |
| accent | yes | Accent color hex value |
| bg_primary | yes | Primary background hex value |
| bg_secondary | yes | Secondary background hex value |
| text_primary | yes | Primary text color hex value |
| mood | yes | Mood descriptor |
| wcag_aa | yes | WCAG AA compliance (yes/no) |
| palette_match | yes | Recommended palette |

---

## 8. patterns.csv

**Purpose:** UI/UX pattern definitions (page templates and layout patterns) with component references and responsive strategies.

**Row count:** 15

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Pattern name (e.g., "Homepage", "Responsive Grid") |
| slug | yes | URL-safe identifier (referenced by products.csv key_patterns) |
| category | yes | Pattern category (e.g., "page-template", "layout") |
| description | yes | Pattern description |
| section_order | no | Semicolon-separated section ordering |
| key_components | no | Semicolon-separated component slugs used in this pattern |
| responsive_strategy | no | How the pattern adapts across breakpoints |
| best_for | yes | Semicolon-separated use cases |
| dont_use_for | no | Semicolon-separated contexts to avoid |

---

## 9. google-fonts.csv

**Purpose:** Google Fonts catalog with mood tags, weight availability, and use-case recommendations.

**Row count:** 200

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Font family name |
| category | yes | Font category (sans-serif, serif, display, monospace, handwriting) |
| weights | yes | Semicolon-separated available weights |
| style | yes | Style descriptor (e.g., "modern-neutral", "geometric-friendly") |
| mood | yes | Semicolon-separated mood tags |
| best_for | yes | Semicolon-separated use cases |
| variable | yes | Variable font support (yes/no) |
| url | yes | Google Fonts URL |

---

## 10. icons.csv

**Purpose:** Icon library recommendations with style, licensing, and tree-shaking information.

**Row count:** 200

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Icon library name |
| library | yes | NPM package name |
| license | yes | License type (e.g., MIT, Apache-2.0) |
| style | yes | Icon style (line, outline+solid, filled, etc.) |
| sizes | yes | Semicolon-separated available sizes |
| tree_shakeable | yes | Tree-shaking support (yes/no) |
| default_color | yes | Default color value (e.g., "currentColor") |
| best_for | yes | Semicolon-separated use cases |
| url | yes | Library homepage URL |

---

## 11. landing.csv

**Purpose:** Landing page template definitions with section ordering, hero variants, and CTA styles mapped to palettes.

**Row count:** 35

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Template name (e.g., "SaaS Product Launch") |
| category | yes | Template category (e.g., "saas", "ai", "ecommerce") |
| description | yes | Template description |
| sections | yes | Semicolon-separated section ordering |
| hero_variant | yes | Hero section variant |
| cta_style | yes | Call-to-action button style |
| palette_match | yes | Recommended palette |
| best_for | yes | Semicolon-separated use cases |

---

## 12. charts.csv

**Purpose:** Chart and data visualization type definitions with data requirements, accessibility notes, and palette token references.

**Row count:** 25

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| name | yes | Chart type name (e.g., "Line Chart", "Area Chart") |
| type | yes | Chart category (trend, comparison, composition, distribution) |
| description | yes | Chart description |
| best_for | yes | Semicolon-separated use cases |
| data_type | yes | Data type (continuous, discrete, categorical) |
| min_data_points | yes | Minimum recommended data points |
| max_data_points | yes | Maximum recommended data points |
| palette_tokens | yes | Semicolon-separated chart color tokens |
| accessibility_notes | yes | Accessibility guidance |

---

## 13. ux-guidelines.csv

**Purpose:** UX best practices organized by category (navigation, forms, feedback, etc.) with priority levels and rationale.

**Row count:** 114

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| category | yes | Guideline category (e.g., "navigation", "forms", "feedback") |
| guideline | yes | The guideline text |
| priority | yes | Priority level (1-10) |
| applies_to | yes | Semicolon-separated contexts (e.g., "all", "dashboard", "ecommerce") |
| rationale | yes | Why this guideline matters (with research/principle citations) |

---

## 14. app-interface.csv

**Purpose:** Mobile app interface guidelines covering accessibility, touch targets, gestures, and platform-specific patterns.

**Row count:** 30

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| category | yes | Guideline category (e.g., "accessibility", "navigation", "performance") |
| issue | yes | Issue/pattern name |
| keywords | yes | Semicolon-separated search keywords |
| platform | yes | Target platform (mobile, ios, android) |
| description | yes | Issue description |
| do | yes | Recommended approach |
| dont | yes | What to avoid |
| severity | yes | Severity level (critical, high, medium, low) |

---

## 15. react-performance.csv

**Purpose:** React performance patterns and anti-patterns covering rendering, data fetching, state management, and bundle optimization.

**Row count:** 44

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| category | yes | Performance category (e.g., "async", "rendering", "state") |
| issue | yes | Issue/pattern name |
| keywords | yes | Semicolon-separated search keywords |
| platform | yes | Target platform ("react") |
| description | yes | Issue description |
| do | yes | Recommended approach |
| dont | yes | What to avoid |
| severity | yes | Severity level (critical, high, medium, low) |

---

## 16. stacks/react-native.csv

**Purpose:** React Native best practices covering components, performance, navigation, and platform-specific patterns.

**Row count:** 50

**Schema:**

| Column | Required | Description |
|---|---|---|
| id | yes | Unique integer identifier |
| category | yes | Category (e.g., "components", "performance", "navigation") |
| issue | yes | Issue/pattern name |
| keywords | yes | Semicolon-separated search keywords |
| platform | yes | Target platform ("react-native") |
| description | yes | Issue description |
| do | yes | Recommended approach |
| dont | yes | What to avoid |
| severity | yes | Severity level (critical, high, medium, low) |

---

## Cross-Reference Integrity

The following cross-references exist between databases:

| Source | Field | References |
|---|---|---|
| products.csv | key_components | components.csv (slug) |
| products.csv | key_patterns | patterns.csv (slug) |
| products.csv | palette | 9 valid palette names |
| products.csv | style | styles.csv (name) |
| typography.csv | palette_match | 9 valid palette names |
| colors.csv | palette_match | 9 valid palette names |
| landing.csv | palette_match | 9 valid palette names |
| styles.csv | palette | 9 valid palette names |
| ui-reasoning.csv | value (sector rules) | SECTOR_KEYWORDS keys |
| ui-reasoning.csv | value (product rules) | PRODUCT_KEYWORDS keys |
| anti-patterns.csv | sector | SECTOR_KEYWORDS keys |

**Validation:** Run `npm run sync-data` (or `python src/data/_sync_all.py`) to validate cross-reference integrity. Validation is permissive: only required columns are checked, extra columns are allowed.
