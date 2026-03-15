# Knowledge Base — CSV Databases

The Universal Design System is powered by **20 CSV databases** containing 1,600+ rows of structured design knowledge. These databases feed the **BM25 reasoning engine** (`src/scripts/core.py`), which ranks and retrieves relevant design recommendations based on natural-language queries.

Together, the databases cover product templates, conditional design rules, color palettes, typography pairings, icon libraries, UX guidelines, component definitions, layout patterns, anti-patterns, chart types, landing page templates, visual styles, and platform-specific performance rules.

---

## How It Works

The reasoning engine operates in three layers:

1. **Domain Detection** — A regex-based classifier maps the user query to one of 21 industry sectors (finance, healthcare, education, etc.) and 8 product types (dashboard, landing-page, mobile-app, etc.).

2. **BM25 Search** — An Okapi BM25 index (k1=1.5, b=0.75) tokenizes all CSV content at startup. When a query arrives, it is tokenized (lowercase, non-alphanumeric removal, minimum token length 2) and scored against the entire corpus. Results are ranked by relevance and grouped by source file.

3. **Rule Engine** — Conditional IF/THEN rules from `ui-reasoning.csv` are evaluated against the detected domain. Rules are sorted by priority (highest first); the first match wins for palette selection. If no rule matches, the top product search result's palette is used, falling back to `minimal-saas`.

Each CSV file is indexed with specific text fields (listed below) so the BM25 engine searches the most relevant columns per database.

---

## Database Reference

| File | Rows | Key Columns | Purpose |
|------|------|-------------|---------|
| `products.csv` | 165 | id, name, sector, sub_sector, palette, style, color_mood, typography_mood, key_components, key_patterns, audience, complexity, anti_patterns | Product templates mapping product types to palettes, components, patterns, and anti-patterns |
| `ui-reasoning.csv` | 165 | id, condition, field, operator, value, then_field, then_value, priority, reasoning, category | Conditional IF/THEN rules that drive palette and component selection |
| `colors.csv` | 165 | id, name, industry, primary, secondary, accent, bg_primary, bg_secondary, text_primary, mood, wcag_aa, palette_match | Industry color palettes with WCAG AA compliance data |
| `google-fonts.csv` | 200 | id, name, category, weights, style, mood, best_for, variable, url | Google Fonts catalog with style metadata for typography recommendation |
| `icons.csv` | 200 | id, name, library, license, style, sizes, tree_shakeable, default_color, best_for, url | Icon library index mapping libraries to use cases |
| `ux-guidelines.csv` | 114 | id, category, guideline, priority, applies_to, rationale | UX best practices with priority ratings and rationale |
| `typography.csv` | 75 | id, heading_font, body_font, mood, category, heading_weight, body_weight, best_for, google_fonts_url, palette_match | Font pairing recommendations by mood and palette |
| `styles.csv` | 60 | id, name, category, description, palette, bg_treatment, border_treatment, shadow_treatment, typography_treatment, animation_treatment, best_for, avoid_for | Visual style definitions mapping to palettes |
| `anti-patterns.csv` | 55 | id, sector, anti_pattern, severity, description, alternative, example | Industry anti-patterns with severity ratings and alternatives |
| `react-performance.csv` | 44 | id, category, issue, keywords, platform, description, do, dont, severity | React performance optimization rules |
| `landing.csv` | 35 | id, name, category, description, sections, hero_variant, cta_style, palette_match, best_for | Landing page templates with section ordering |
| `components.csv` | 32 | id, name, slug, category, variants, sizes, states, props, accessibility, use_when, dont_use_when, css_class | Component definitions with accessibility and usage guidance |
| `app-interface.csv` | 30 | id, category, issue, keywords, platform, description, do, dont, severity | Mobile app interface patterns and rules |
| `charts.csv` | 25 | id, name, type, description, best_for, data_type, min_data_points, max_data_points, palette_tokens, accessibility_notes | Chart type recommendations with data constraints |
| `patterns.csv` | 15 | id, name, slug, category, description, section_order, key_components, responsive_strategy, best_for, dont_use_for | Page layout patterns with responsive strategies |
| `stacks/react-native.csv` | 50 | id, category, issue, keywords, platform, description, do, dont, severity | React Native platform-specific optimization rules |

> Row counts are approximate (headers excluded).

---

## Database Details

### products.csv

The central product template database. Each row represents a product archetype (e.g., "SaaS Dashboard", "Healthcare Portal") and maps it to a palette, visual style, color mood, typography mood, key components, layout patterns, target audience, complexity level, and anti-patterns to avoid. This is the primary database the BM25 engine queries when determining what to recommend.

**Indexed fields:** name, sector, sub_sector, palette, style, color_mood, key_components, key_patterns, audience

**Pipeline layer:** Layer 2 (BM25 Search) — provides product-level matches. Also used in Layer 3 as fallback palette source.

### ui-reasoning.csv

The conditional rule engine database. Each row is an IF/THEN rule: "IF sector equals finance, THEN palette = corporate." Rules have a priority (1-9, higher = evaluated first) and a human-readable reasoning field explaining why the rule exists. The rule engine evaluates these in priority order; the first palette match wins.

**Used directly by:** Layer 3 (Rule Engine) — not BM25-indexed. Loaded separately and evaluated procedurally.

**Pipeline layer:** Layer 3 (Rule Application)

### colors.csv

Industry-specific color palette definitions. Each row provides a complete color set (primary, secondary, accent, backgrounds, text) for a given industry, with mood descriptors and WCAG AA compliance status. The `palette_match` column links each color set to one of the 9 structural palettes.

**Indexed fields:** name, industry, mood, palette_match

**Pipeline layer:** Layer 2 (BM25 Search) — returns color recommendations ranked by query relevance.

### google-fonts.csv

A curated catalog of Google Fonts with metadata for recommendation. Includes font category (sans-serif, serif, display, monospace), available weights, mood descriptors, and best-use scenarios. The `variable` column indicates variable font support.

**Indexed fields:** name, category, mood, best_for

**Pipeline layer:** Layer 2 (BM25 Search) — supports typography recommendation queries.

### icons.csv

An index of icon libraries (Lucide, Heroicons, Phosphor, etc.) with metadata about license, style (line, outline, solid, filled), available sizes, tree-shakeability, and best-use scenarios. Used to recommend the right icon library for a given project type.

**Indexed fields:** name, library, style, best_for

**Pipeline layer:** Layer 2 (BM25 Search) — returns icon library recommendations.

### ux-guidelines.csv

A collection of UX best practices organized by category (navigation, forms, accessibility, feedback, etc.). Each guideline has a priority rating (1-9) indicating importance, an `applies_to` field specifying which product types it targets, and a rationale explaining the cognitive or usability science behind it.

**Indexed fields:** category, guideline, applies_to

**Pipeline layer:** Layer 2 (BM25 Search) — returns relevant UX guidelines for the query context.

### typography.csv

Font pairing recommendations. Each row pairs a heading font with a body font and describes the resulting mood (clean-professional, modern-friendly, elegant-editorial, etc.). The `palette_match` column links each pairing to a structural palette, ensuring typographic consistency with the visual system.

**Indexed fields:** heading_font, body_font, mood, best_for, palette_match

**Pipeline layer:** Layer 2 (BM25 Search) — returns typography pairing recommendations.

### styles.csv

Visual style definitions that describe how design treatments (backgrounds, borders, shadows, typography, animation) combine to create a cohesive look. Each style maps to a palette and includes `best_for` and `avoid_for` fields to guide appropriate usage. Styles include "Clean Minimal", "Flat Design", "Gradient Bold", etc.

**Indexed fields:** name, category, description, palette, best_for

**Pipeline layer:** Layer 2 (BM25 Search) — returns visual style recommendations.

### anti-patterns.csv

A catalog of design anti-patterns organized by industry sector. Each entry identifies a specific anti-pattern (e.g., "playful-animations" in finance), its severity (critical, high, medium, low), a description of why it is harmful, and an alternative approach. The engine loads these separately to produce warnings alongside recommendations.

**Indexed fields:** sector, anti_pattern, description

**Pipeline layer:** Layer 2 (BM25 Search) + direct lookup by sector in the reasoning pipeline.

### react-performance.csv

React-specific performance optimization rules. Each row describes a performance issue (waterfall requests, unnecessary re-renders, bundle size), the keywords that trigger it, a "do" recommendation, a "don't" anti-pattern, and a severity rating. Targeted at React web applications.

**Indexed fields:** category, issue, keywords, description

**Pipeline layer:** Layer 2 (BM25 Search) — returned when queries mention React or performance topics.

### landing.csv

Landing page template definitions. Each row describes a complete landing page structure with section ordering (hero, social-proof, features, testimonials, pricing, CTA, footer), hero variant, CTA style, and palette match. Used when the query involves marketing pages or product launches.

**Indexed fields:** name, category, description, palette_match, best_for

**Pipeline layer:** Layer 2 (BM25 Search) — returns landing page template recommendations.

### components.csv

The component registry. Each row defines a UI component (Button, Navigation Bar, Data Table, Modal, etc.) with its variants, sizes, states, props, accessibility requirements, and usage guidance (use_when / dont_use_when). Component slugs are referenced by `products.csv` via the `key_components` column.

**Indexed fields:** name, slug, category, variants, use_when

**Pipeline layer:** Layer 2 (BM25 Search) — returns component recommendations. Also used as a reference table for cross-validation.

### app-interface.csv

Mobile app interface patterns and rules. Similar structure to `react-performance.csv` but focused on general mobile concerns: touch target sizing, screen reader support, gesture handling, safe area insets, etc. Platform-agnostic mobile guidance.

**Indexed fields:** category, issue, keywords, description

**Pipeline layer:** Layer 2 (BM25 Search) — returned when queries involve mobile apps.

### charts.csv

Chart and data visualization type recommendations. Each row describes a chart type (line, bar, pie, scatter, etc.) with data type requirements, minimum/maximum data point constraints, palette token references, and accessibility notes. Used to recommend appropriate visualizations for data-heavy products.

**Indexed fields:** name, type, description, best_for

**Pipeline layer:** Layer 2 (BM25 Search) — returns chart type recommendations.

### patterns.csv

Page layout pattern definitions. Each row describes a reusable page-level pattern (Homepage, Dashboard Layout, Settings Page, etc.) with section ordering, key components, and responsive strategy. Pattern slugs are referenced by `products.csv` via the `key_patterns` column.

**Indexed fields:** name, slug, category, description, best_for

**Pipeline layer:** Layer 2 (BM25 Search) — returns layout pattern recommendations. Also used as a reference table for cross-validation.

### stacks/react-native.csv

React Native platform-specific optimization rules. Covers FlatList optimization, ScrollView patterns, image caching, native module bridging, navigation performance, and other React Native concerns. Located in the `stacks/` subdirectory, which is designed to hold framework-specific databases.

**Indexed fields:** category, issue, keywords, description

**Pipeline layer:** Layer 2 (BM25 Search) — returned when queries involve React Native.

---

## Adding Data

To add a new row to any database:

1. Open the CSV file and add a new row with a unique `id` value.
2. Ensure all required columns are populated. Required columns per file are defined in `_sync_all.py` (the `FILE_SCHEMAS` dictionary).
3. If the file has a `palette` or `palette_match` column, the value must be one of the 9 valid palettes: `minimal-saas`, `ai-futuristic`, `gradient-startup`, `corporate`, `apple-minimal`, `illustration`, `dashboard`, `bold-lifestyle`, `minimal-corporate`.
4. If referencing components (in `key_components`), use slugs from `components.csv`. If referencing patterns (in `key_patterns`), use slugs from `patterns.csv`. Separate multiple values with semicolons.
5. Run validation:

```bash
npm run sync-data
```

This executes `python src/data/_sync_all.py`, which checks:
- All required columns are present
- No duplicate IDs within any file
- All palette references match valid palette names
- All component slug references exist in `components.csv`
- All pattern slug references exist in `patterns.csv`

---

## Validation

Run the full validation suite:

```bash
npm run sync-data         # CSV cross-reference validation
npm run check             # Full suite: tokens + WCAG + docs + CSV
```

The `_sync_all.py` validator currently covers 13 of the 20 databases (the 3 platform-specific files in the `stacks/` directory and the additional performance/interface CSVs are indexed by the BM25 engine but not yet cross-validated). Validation is permissive: extra columns beyond the required set are allowed, so databases can evolve without breaking existing checks.
