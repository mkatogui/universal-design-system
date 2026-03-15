# CSV Dataset Schema Reference

Formal schema documentation for all 20 CSV databases in the Universal Design System.

**Validation:** Run `python3 scripts/validate-datasets.py` to validate all datasets against these schemas. Add `--json` for machine-readable output.

**Convention:** Only required columns are validated. Extra columns are allowed (permissive mode). Semicolons (`;`) are used as delimiters within multi-value fields.

**Palette Registry (9 valid palettes):** `minimal-saas`, `ai-futuristic`, `gradient-startup`, `corporate`, `apple-minimal`, `illustration`, `dashboard`, `bold-lifestyle`, `minimal-corporate`

---

## 1. products.csv

**Path:** `src/data/products.csv`
**Purpose:** Master product database mapping sectors, palettes, components, and patterns to specific product types. Primary input for the BM25 reasoning engine.
**Rows:** ~100

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Product name (e.g. "SaaS Dashboard") |
| `sector` | Yes | string | | Industry sector (e.g. "saas", "finance") |
| `sub_sector` | Yes | string | | Sub-sector (e.g. "analytics", "marketing") |
| `palette` | Yes | palette-ref | Must be one of 9 valid palettes | Recommended palette |
| `style` | Yes | string | | Style name (e.g. "Clean Minimal") |
| `color_mood` | Yes | string | | Color mood descriptor |
| `typography_mood` | Yes | string | | Typography mood descriptor |
| `key_components` | Yes | slug-list | Semicolon-delimited; each slug must exist in `components.csv` | Required component slugs |
| `key_patterns` | Yes | slug-list | Semicolon-delimited; each slug must exist in `patterns.csv` | Required pattern slugs |
| `audience` | Yes | string | Semicolon-delimited | Target audience segments |
| `complexity` | Yes | enum | `low`, `medium`, `high` | Product complexity level |
| `anti_patterns` | Yes | string | Semicolon-delimited | Anti-patterns to avoid |

**Foreign Keys:**
- `palette` -> 9 valid palettes
- `key_components` -> `components.csv.slug`
- `key_patterns` -> `patterns.csv.slug`

---

## 2. components.csv

**Path:** `src/data/components.csv`
**Purpose:** Component registry defining all 43 UI components with variants, sizing, states, props, and accessibility requirements.
**Rows:** ~32

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Human-readable component name |
| `slug` | Yes | slug | Unique; lowercase, hyphens | Canonical slug for cross-referencing |
| `category` | Yes | string | | Component category (action, navigation, form, etc.) |
| `variants` | Yes | string | Semicolon-delimited | Available variants |
| `sizes` | Yes | string | Semicolon-delimited | Available sizes with pixel values |
| `states` | Yes | string | Semicolon-delimited | Interactive states |
| `props` | Yes | string | Semicolon-delimited | Component props/API |
| `accessibility` | Yes | string | | ARIA and accessibility requirements |
| `use_when` | Yes | string | | When to use this component |
| `dont_use_when` | Yes | string | | When not to use this component |
| `css_class` | Yes | slug | | BEM CSS class name (without `.uds-` prefix) |
| `container_query` | Yes | enum | `yes`, `no` | Whether component uses container queries |

**Referenced By:** `products.csv.key_components`, `patterns.csv.key_components`

---

## 3. ui-reasoning.csv

**Path:** `src/data/ui-reasoning.csv`
**Purpose:** Conditional rule engine (190 rules) that maps domain attributes to design decisions. Rules are evaluated by priority (higher first); first match wins for palette selection.
**Rows:** 190

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Rule identifier |
| `condition` | Yes | string | | Condition type (sector, product, audience, etc.) |
| `field` | Yes | string | | Field to evaluate (sector, product_type, audience, etc.) |
| `operator` | Yes | string | `equals`, `contains`, etc. | Comparison operator |
| `value` | Yes | string | | Value to match against |
| `then_field` | Yes | string | | Field to set when rule matches |
| `then_value` | Yes | string | | Value to apply when rule matches |
| `priority` | Yes | integer | Higher = evaluated first | Rule priority (1-9) |
| `reasoning` | Yes | string | | Human-readable explanation |
| `category` | Yes | string | | Rule category (sector-palette, product-component, etc.) |

---

## 4. anti-patterns.csv

**Path:** `src/data/anti-patterns.csv`
**Purpose:** Design anti-pattern database documenting sector-specific UI mistakes to avoid, with alternatives and examples.
**Rows:** ~85

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `sector` | Yes | string | | Industry sector this applies to |
| `anti_pattern` | Yes | slug | | Anti-pattern identifier |
| `severity` | Yes | enum | `critical`, `high`, `moderate`, `low` | Severity level |
| `description` | Yes | string | | What the anti-pattern is |
| `alternative` | Yes | string | | What to do instead |
| `example` | Yes | string | | Concrete example |

---

## 5. typography.csv

**Path:** `src/data/typography.csv`
**Purpose:** Typography pairing database mapping heading + body font combinations to moods, categories, and palette matches.
**Rows:** ~85

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `heading_font` | Yes | string | | Heading font family name |
| `body_font` | Yes | string | | Body font family name |
| `mood` | Yes | string | | Typography mood (e.g. "clean-professional") |
| `category` | Yes | string | | Pairing category (sans-sans, serif-sans, mono-sans, etc.) |
| `heading_weight` | Yes | integer | | Heading font weight (e.g. 700) |
| `body_weight` | Yes | integer | | Body font weight (e.g. 400) |
| `best_for` | Yes | string | Semicolon-delimited | Sectors/use cases this pairing suits |
| `google_fonts_url` | Yes | url | | Google Fonts URL |
| `palette_match` | Yes | palette-ref | Must be one of 9 valid palettes | Best matching palette |

**Foreign Keys:**
- `palette_match` -> 9 valid palettes

---

## 6. styles.csv

**Path:** `src/data/styles.csv`
**Purpose:** Visual style database (69 styles) defining complete aesthetic treatments including background, border, shadow, typography, and animation approaches per palette.
**Rows:** ~69

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Style name (e.g. "Clean Minimal") |
| `category` | Yes | string | | Style category (minimal, modern, dark, etc.) |
| `description` | Yes | string | | Style description |
| `palette` | Yes | palette-ref | Must be one of 9 valid palettes | Associated palette |
| `bg_treatment` | Yes | string | | Background treatment approach |
| `border_treatment` | Yes | string | | Border treatment approach |
| `shadow_treatment` | Yes | string | | Shadow/elevation treatment |
| `typography_treatment` | Yes | string | | Typography style treatment |
| `animation_treatment` | Yes | string | | Animation/motion treatment |
| `best_for` | Yes | string | Semicolon-delimited | Sectors/use cases |
| `avoid_for` | Yes | string | Semicolon-delimited | Sectors/use cases to avoid |

**Foreign Keys:**
- `palette` -> 9 valid palettes

---

## 7. colors.csv

**Path:** `src/data/colors.csv`
**Purpose:** Industry color scheme database (180+ schemes) with hex values for primary, secondary, accent, background, and text colors, all validated for WCAG AA compliance.
**Rows:** ~180

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Color scheme name |
| `industry` | Yes | string | | Target industry |
| `primary` | Yes | hex-color | `#RRGGBB` format | Primary brand color |
| `secondary` | Yes | hex-color | `#RRGGBB` format | Secondary color |
| `accent` | Yes | hex-color | `#RRGGBB` format | Accent color |
| `bg_primary` | Yes | hex-color | `#RRGGBB` format | Primary background color |
| `bg_secondary` | Yes | hex-color | `#RRGGBB` format | Secondary background color |
| `text_primary` | Yes | hex-color | `#RRGGBB` format | Primary text color |
| `mood` | Yes | string | | Color mood descriptor |
| `wcag_aa` | Yes | enum | `yes`, `no` | WCAG AA compliance |
| `palette_match` | Yes | palette-ref | Must be one of 9 valid palettes | Best matching palette |

**Foreign Keys:**
- `palette_match` -> 9 valid palettes

---

## 8. patterns.csv

**Path:** `src/data/patterns.csv`
**Purpose:** Page pattern and layout template database defining section composition, component requirements, and responsive strategies.
**Rows:** ~16

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Pattern name |
| `slug` | Yes | slug | Unique; lowercase, hyphens | Canonical slug for cross-referencing |
| `category` | Yes | string | | Pattern category (page-template, layout, interaction, etc.) |
| `description` | Yes | string | | Pattern description |
| `section_order` | Yes | string | Semicolon-delimited | Ordered section list |
| `key_components` | Yes | slug-list | Semicolon-delimited; each slug must exist in `components.csv` | Required components |
| `responsive_strategy` | Yes | string | | Responsive behavior description |
| `best_for` | Yes | string | | Ideal use cases |
| `dont_use_for` | Yes | string | | Use cases to avoid |

**Foreign Keys:**
- `key_components` -> `components.csv.slug`

**Referenced By:** `products.csv.key_patterns`

---

## 9. google-fonts.csv

**Path:** `src/data/google-fonts.csv`
**Purpose:** Comprehensive Google Fonts database (200 fonts) with weights, styles, moods, variable font support, and recommended use cases.
**Rows:** ~200

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Font family name |
| `category` | Yes | string | | Font category (sans-serif, serif, monospace, display) |
| `weights` | Yes | string | Semicolon-delimited integers | Available font weights |
| `style` | Yes | string | | Style descriptor slug |
| `mood` | Yes | string | Semicolon-delimited | Mood keywords |
| `best_for` | Yes | string | Semicolon-delimited | Recommended use cases |
| `variable` | Yes | enum | `yes`, `no` | Variable font support |
| `url` | Yes | url | | Google Fonts specimen URL |

---

## 10. icons.csv

**Path:** `src/data/icons.csv`
**Purpose:** Icon library database (200+ entries) covering libraries, individual icons, licenses, styles, sizes, and framework compatibility.
**Rows:** ~200

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Icon or library name |
| `library` | Yes | string | | npm package name |
| `license` | Yes | string | | License (MIT, Apache-2.0, etc.) |
| `style` | Yes | string | | Icon style (line, solid, outline+solid, etc.) |
| `sizes` | Yes | string | Semicolon-delimited | Available sizes in px |
| `tree_shakeable` | Yes | enum | `yes`, `no` | Supports tree shaking |
| `default_color` | Yes | string | | Default color (currentColor, native, brand-color) |
| `best_for` | Yes | string | Semicolon-delimited | Recommended use cases |
| `url` | Yes | string | | Library/icon URL |

---

## 11. landing.csv

**Path:** `src/data/landing.csv`
**Purpose:** Landing page template database mapping industry-specific landing page designs with section composition, hero variants, and CTA styles.
**Rows:** ~35

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Template name |
| `category` | Yes | string | | Industry category (saas, ai, startup, etc.) |
| `description` | Yes | string | | Template description |
| `sections` | Yes | string | Semicolon-delimited | Ordered section list |
| `hero_variant` | Yes | string | | Hero section variant type |
| `cta_style` | Yes | string | | CTA button style |
| `palette_match` | Yes | palette-ref | Must be one of 9 valid palettes | Recommended palette |
| `best_for` | Yes | string | Semicolon-delimited | Target product types |

**Foreign Keys:**
- `palette_match` -> 9 valid palettes

---

## 12. charts.csv

**Path:** `src/data/charts.csv`
**Purpose:** Data visualization chart type database with data requirements, palette token references, and accessibility considerations.
**Rows:** ~25

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `name` | Yes | string | | Chart type name |
| `type` | Yes | string | | Chart category (trend, comparison, composition, etc.) |
| `description` | Yes | string | | Chart description |
| `best_for` | Yes | string | Semicolon-delimited | Best use cases |
| `data_type` | Yes | string | | Data type (continuous, categorical, proportional, etc.) |
| `min_data_points` | Yes | integer | | Minimum recommended data points |
| `max_data_points` | Yes | integer | | Maximum recommended data points |
| `palette_tokens` | Yes | string | | Palette token references for chart colors |
| `accessibility_notes` | Yes | string | | Accessibility guidance |

---

## 13. ux-guidelines.csv

**Path:** `src/data/ux-guidelines.csv`
**Purpose:** UX best practices and guidelines database (114 guidelines) organized by category with priority levels and rationale.
**Rows:** ~114

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `category` | Yes | string | | Guideline category (navigation, forms, buttons, etc.) |
| `guideline` | Yes | string | | The guideline text |
| `priority` | Yes | integer | 1-9 scale | Priority/importance level |
| `applies_to` | Yes | string | Semicolon-delimited | Product types this applies to |
| `rationale` | Yes | string | | Evidence or reasoning behind guideline |

---

## 14. app-interface.csv

**Path:** `src/data/app-interface.csv`
**Purpose:** Mobile app interface guidelines database covering accessibility, touch interactions, navigation, forms, performance, typography, layout, and UI patterns.
**Rows:** ~32

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `category` | Yes | string | | Category (accessibility, touch, navigation, etc.) |
| `issue` | Yes | string | | Issue title |
| `keywords` | Yes | string | Semicolon-delimited | Search keywords |
| `platform` | Yes | string | | Target platform (mobile, ios, android) |
| `description` | Yes | string | | Issue description |
| `do` | Yes | string | | Recommended approach |
| `dont` | Yes | string | | What to avoid |
| `severity` | Yes | enum | `critical`, `high`, `medium`, `low` | Issue severity |

---

## 15. react-performance.csv

**Path:** `src/data/react-performance.csv`
**Purpose:** React performance optimization database covering async patterns, bundle optimization, server components, client-side rendering, rerender prevention, and testing.
**Rows:** ~45

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `category` | Yes | string | | Category (async, bundle, server, client, rerender, testing) |
| `issue` | Yes | string | | Issue title |
| `keywords` | Yes | string | Semicolon-delimited | Search keywords |
| `platform` | Yes | string | | Platform (react) |
| `description` | Yes | string | | Issue description |
| `do` | Yes | string | | Recommended approach |
| `dont` | Yes | string | | What to avoid |
| `severity` | Yes | enum | `critical`, `high`, `medium`, `low` | Issue severity |

---

## 16. stacks/react-native.csv

**Path:** `src/data/stacks/react-native.csv`
**Purpose:** React Native development guidelines covering components, styling, navigation, state management, performance, animations, platform-specific patterns, and accessibility.
**Rows:** ~51

| Column | Required | Type | Constraints | Description |
|--------|----------|------|-------------|-------------|
| `id` | Yes | integer | Unique | Row identifier |
| `category` | Yes | string | | Category (components, styling, navigation, state, etc.) |
| `issue` | Yes | string | | Issue title |
| `keywords` | Yes | string | Semicolon-delimited | Search keywords |
| `platform` | Yes | string | | Platform (react-native, ios, android) |
| `description` | Yes | string | | Issue description |
| `do` | Yes | string | | Recommended approach |
| `dont` | Yes | string | | What to avoid |
| `severity` | Yes | enum | `critical`, `high`, `medium`, `low` | Issue severity |

---

## Cross-File Relationships

```
products.csv
  |-- palette         -> 9 valid palettes
  |-- key_components  -> components.csv.slug
  |-- key_patterns    -> patterns.csv.slug

patterns.csv
  |-- key_components  -> components.csv.slug

typography.csv
  |-- palette_match   -> 9 valid palettes

styles.csv
  |-- palette         -> 9 valid palettes

colors.csv
  |-- palette_match   -> 9 valid palettes

landing.csv
  |-- palette_match   -> 9 valid palettes
```

## Data Types Reference

| Type | Description | Example |
|------|-------------|---------|
| `integer` | Numeric integer | `1`, `42`, `100` |
| `string` | Free-form text | `"SaaS Dashboard"` |
| `slug` | Lowercase, alphanumeric, hyphens | `data-table`, `hero` |
| `slug-list` | Semicolon-delimited slugs | `button;hero;footer` |
| `palette-ref` | One of 9 valid palette names | `minimal-saas` |
| `hex-color` | Hex color value | `#1A365D`, `#FFFFFF` |
| `url` | HTTP/HTTPS URL | `https://fonts.google.com/...` |
| `enum` | One of a fixed set of values | `yes`/`no`, `critical`/`high`/`medium`/`low` |
