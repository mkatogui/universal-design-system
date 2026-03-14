# Reasoning Architecture

## Deterministic UI Recommendation Engine Powered by Retrieval and Rule Evaluation

The Universal Design System includes a deterministic UI recommendation engine that takes a plain-text query (e.g., "fintech dashboard for mobile banking") and returns palette, component, pattern, typography, and anti-pattern recommendations.

**Key properties:**

- **Deterministic** -- the same input always produces the same output, with no randomness or stochastic behavior.
- **No machine learning, neural networks, or LLMs** are involved in the recommendation pipeline. The engine uses keyword matching, BM25 information retrieval, and conditional rule evaluation.
- **AI-native** refers to the fact that the system is designed to be consumed by AI coding assistants (Claude, Cursor, Copilot, etc.), not that the engine itself uses AI.

The pipeline has three layers executed in sequence:

```
User Query --> DomainDetector --> BM25 Search --> Rule Application --> Token Resolution --> Output
               (55 sectors,      (20 CSVs,       (190 rules from      (design-tokens.json,
                21 product types)  1,600+ rows)    ui-reasoning.csv)    palette overrides)
```

---

## Layer 1: Domain Detection

**Class:** `DomainDetector` in `src/scripts/core.py`

The first layer classifies the user's query into an industry sector and a product type using regex keyword matching.

### Sectors

The engine recognizes **55 industry sectors**, each defined by a list of keywords:

| Sector | Example Keywords |
|--------|-----------------|
| finance | financial, investment, trading, mortgage, payment |
| fintech | fintech, neobank, digital-banking, mobile-banking |
| healthcare | health, medical, hospital, telehealth, patient |
| ecommerce | ecommerce, shop, store, retail, marketplace |
| saas | saas, software, platform, tool, subscription |
| ai | ai, artificial-intelligence, machine-learning, llm |
| crypto | crypto, blockchain, bitcoin, ethereum, wallet |
| ... | *(55 sectors total)* |

### Product Types

The engine recognizes **21 product types**:

| Product Type | Keywords |
|-------------|----------|
| dashboard | dashboard, admin, panel, analytics, metrics |
| landing-page | landing, homepage, marketing, launch, conversion |
| mobile-app | mobile, app, ios, android, phone |
| ecommerce | shop, store, cart, checkout, product-listing |
| saas-app | saas, platform, tool, software, web-app |
| documentation | docs, documentation, api-docs, guide |
| blog | blog, article, editorial, content, magazine |
| portfolio | portfolio, showcase, gallery, work, projects |
| admin-panel | admin, admin-panel, backoffice, cms, management |
| community | community, forum, social, discussion, members |
| data-table | data-table, spreadsheet, grid, table, tabular |
| marketplace | marketplace, listing, vendor, seller, buyer |
| streaming | streaming, video, audio, live, player |
| telehealth | telehealth, telemedicine, virtual-care, patient-portal |

### Scoring Algorithm

1. For each sector (and product type), count how many of its keywords appear in the query (via regex token match or substring match).
2. On a tie, prefer the sector/product type with higher **keyword specificity** -- the sum of matched keyword lengths. Longer keyword matches indicate a more precise match.
3. **Confidence scores:**
   - `sector_confidence = min(matched_keywords / 3, 1.0)`
   - `product_confidence = min(matched_keywords / 2, 1.0)`
4. If no sector matches, defaults to `"general"`. If no product type matches, defaults to `"general"`.

### Output

```python
{
    "sector": "fintech",
    "sector_confidence": 0.67,
    "product_type": "dashboard",
    "product_confidence": 1.0,
    "all_sectors": {"fintech": 2, "finance": 1, "dashboard": 1},
    "all_products": {"dashboard": 2}
}
```

---

## Layer 2: BM25 Search

**Class:** `BM25Index` in `src/scripts/core.py`

The second layer searches across all CSV databases using the Okapi BM25 ranking function to find relevant products, components, styles, typography, patterns, and guidelines.

### BM25 Parameters

- **k1 = 1.5** -- term frequency saturation parameter
- **b = 0.75** -- document length normalization parameter

### Tokenization Pipeline

1. Convert to lowercase
2. Replace non-alphanumeric characters (except hyphens and slashes) with spaces
3. Remove tokens shorter than 2 characters
4. **Hyphen-aware expansion:** `"e-commerce"` produces `["e-commerce", "ecommerce", "commerce"]`
5. **Porter stemming:** A custom Porter stemmer implementation (no external dependencies) strips common English suffixes (e.g., "financial" becomes "financ", "payments" becomes "payment")
6. **Synonym expansion** (query-time only): 33 synonym entries covering common abbreviations and alternate forms:
   - `"saas"` expands to include `"software-as-a-service"`, `"cloud-software"`
   - `"ai"` expands to include `"artificial-intelligence"`, `"machine-learning"`
   - `"fintech"` expands to include `"financial-technology"`
   - `"iot"` expands to include `"internet-of-things"`, `"connected-device"`
   - *(and 29 more entries)*

### IDF Calculation

Standard BM25 inverse document frequency:

```
IDF(term) = log((N - df(term) + 0.5) / (df(term) + 0.5) + 1)
```

Where `N` is the total number of indexed documents and `df(term)` is the count of documents containing the term.

### BM25 Score

For each document, the score is the sum across query terms:

```
score = SUM over query terms: IDF(t) * (tf(t) * (k1 + 1)) / (tf(t) + k1 * (1 - b + b * dl / avgdl))
```

Where `tf(t)` is the term frequency in the document, `dl` is the document length in tokens, and `avgdl` is the average document length across the corpus.

### Indexed Databases

The BM25 index is built from **20 CSV databases** containing a total of **1,600+ data rows**:

| CSV File | Rows | Indexed Fields | Role |
|----------|------|---------------|------|
| `products.csv` | 195 | name, sector, sub_sector, palette, style, color_mood, key_components, key_patterns, audience | Product templates linking sectors to palettes, components, and patterns |
| `components.csv` | 43 | name, slug, category, variants, use_when | UI component definitions with variants and usage guidance |
| `ui-reasoning.csv` | 170 | *(not BM25-indexed -- used by Rule Engine)* | Conditional rules for palette and design recommendations |
| `anti-patterns.csv` | 84 | sector, anti_pattern, description | Sector-specific design anti-patterns to avoid |
| `typography.csv` | 85 | heading_font, body_font, mood, best_for, palette_match | Font pairings matched to moods and palettes |
| `styles.csv` | 69 | name, category, description, palette, best_for | Visual style definitions |
| `colors.csv` | 180 | name, industry, mood, palette_match | Color definitions with industry and mood associations |
| `patterns.csv` | 15 | name, slug, category, description, best_for | UI/UX design patterns |
| `google-fonts.csv` | 200 | name, category, mood, best_for | Google Fonts catalog with mood metadata |
| `icons.csv` | 200 | name, library, style, best_for | Icon reference with library and style info |
| `landing.csv` | 35 | name, category, description, palette_match, best_for | Landing page layout patterns |
| `charts.csv` | 25 | name, type, description, best_for | Chart and data visualization types |
| `ux-guidelines.csv` | 114 | category, guideline, applies_to | UX best-practice guidelines |
| `app-interface.csv` | 30 | category, issue, keywords, description | Mobile interface patterns and issues |
| `react-performance.csv` | 44 | category, issue, keywords, description | React performance guidelines |
| `stacks/react-native.csv` | 50 | category, issue, keywords, description | React Native platform patterns |

### Search Execution

The `reason()` method runs multiple filtered searches in sequence:

- **Products**: top 5 from `products.csv`
- **Styles**: top 3 from `styles.csv`
- **Colors**: top 3 from `colors.csv`
- **Typography**: top 3 from `typography.csv`
- **Components**: top 10 from `components.csv`
- **Patterns**: top 5 from `patterns.csv`
- **Guidelines**: top 5 from `ux-guidelines.csv`

---

## Layer 3: Rule Engine

**Class:** `ReasoningEngine` in `src/scripts/core.py`

The third layer evaluates conditional rules to determine the recommended palette and accumulate design guidance.

### Rule Format

Rules are stored in `src/data/ui-reasoning.csv` (190 rules). Each rule has the structure:

```
IF condition(field operator value) THEN then_field = then_value
```

**Fields:**
- `id` -- unique rule identifier
- `condition` -- rule category (sector, product, anti_pattern, component, pattern, etc.)
- `field` -- the domain field to evaluate (sector, product_type, audience, palette, etc.)
- `operator` -- comparison operator (equals, contains)
- `value` -- the value to match against
- `then_field` -- the output field to set (palette, component, pattern, etc.)
- `then_value` -- the recommended value
- `priority` -- numeric priority (higher = evaluated first)
- `reasoning` -- human-readable explanation
- `category` -- rule classification

### Compound Conditions

Rules can have a `compound_condition` column supporting AND/OR boolean operators:

```
sector=finance AND product_type=dashboard
sector=healthcare OR sector=wellness
```

AND has higher precedence than OR. The condition string is split on ` OR ` first (producing OR-groups), then each group is split on ` AND `. All sub-conditions in an AND-group must match; any true OR-group satisfies the expression.

### Evaluation Order

1. Rules are sorted by **priority descending** (higher priority first).
2. For **palette selection**: the first matching rule wins. If no rule matches palette, the top product search result's palette is used. If no products matched either, the default palette is `"minimal-saas"`.
3. For **all other fields** (components, patterns, typography, etc.): all matching rules accumulate.

### Palette Fallback Chain

```
Rule match (first matching palette rule)
    --> Top product search result's palette
        --> Default: "minimal-saas"
```

### Anti-Pattern Lookup

Anti-patterns are retrieved separately by exact sector match against `anti-patterns.csv`. These are not scored by BM25 but filtered directly by the detected sector.

---

## Datasets

All data files live in `src/data/`. The 20 CSV databases serve distinct roles in the pipeline:

1. **products.csv** (195 rows) -- Product templates that map sectors, sub-sectors, and audiences to palettes, styles, components, and patterns. This is the primary database for palette fallback.
2. **components.csv** (43 rows) -- UI component definitions including name, slug, category, variants, usage guidance, accessibility notes, and states.
3. **ui-reasoning.csv** (190 rows) -- Conditional rules evaluated by the Rule Engine. Not indexed in BM25.
4. **anti-patterns.csv** (84 rows) -- Sector-specific anti-patterns with severity, description, and recommended alternatives.
5. **typography.csv** (85 rows) -- Font pairings (heading + body) with mood, palette match, and usage guidance.
6. **styles.csv** (69 rows) -- Visual style definitions mapping to palettes and use cases.
7. **colors.csv** (180 rows) -- Color definitions with industry associations, mood descriptors, and palette matches.
8. **patterns.csv** (15 rows) -- UI/UX design patterns (e.g., progressive disclosure, skeleton loading).
9. **google-fonts.csv** (200 rows) -- Google Fonts catalog with category, mood, and best-for metadata.
10. **icons.csv** (200 rows) -- Icon reference covering multiple libraries (Lucide, Heroicons, etc.) with style and usage info.
11. **landing.csv** (35 rows) -- Landing page layout patterns and section types.
12. **charts.csv** (25 rows) -- Chart and data visualization types with usage guidance.
13. **ux-guidelines.csv** (114 rows) -- UX best-practice guidelines organized by category.
14. **app-interface.csv** (30 rows) -- Mobile app interface patterns and common issues.
15. **react-performance.csv** (44 rows) -- React performance optimization guidelines.
16. **stacks/react-native.csv** (50 rows) -- React Native platform-specific patterns and best practices.

---

## Guarantees

- **Deterministic**: The same query always produces the same output. There is no randomness, sampling, or probabilistic behavior anywhere in the pipeline.
- **No external network calls**: The engine operates entirely offline. All data is bundled as local CSV files.
- **No external dependencies**: The Python implementation uses only the standard library (csv, math, re, collections, pathlib). The Porter stemmer is a custom implementation.
- **Reproducible**: Results depend only on the query string and the CSV data files. Updating a CSV changes recommendations; the query string alone determines the output for a given dataset.

---

## Limitations

- **Exact token matching only**: BM25 scores rely on exact token overlap after stemming. There is no fuzzy matching or typo correction. A query for "fintch" will not match "fintech" (though the Porter stemmer helps with morphological variants like "financial" matching "finance").
- **No semantic understanding**: The engine relies entirely on keyword overlap. It cannot understand that "money transfer app" relates to "fintech" unless those keywords appear in the sector keyword list or CSV data.
- **Sector detection uses simple regex**: Ambiguous queries may be misclassified. For example, "digital platform" could match multiple sectors, and the winner depends on keyword count and specificity tiebreaker.
- **No learning or adaptation**: The engine does not learn from usage. Recommendations change only when CSV data or rules are manually updated.
- **Single-palette output**: The engine recommends one palette per query. It does not support multi-palette or gradient recommendations across sections.
- **First-match palette selection**: Only the highest-priority matching rule determines the palette. Lower-priority palette rules are ignored even if they might be more contextually appropriate.

---

## API

### Python

```python
from core import ReasoningEngine

engine = ReasoningEngine()
result = engine.reason("fintech dashboard")
```

### Return Value

```python
{
    "query": "fintech dashboard",
    "domain": {
        "sector": "fintech",
        "sector_confidence": 0.33,
        "product_type": "dashboard",
        "product_confidence": 0.5,
        "all_sectors": {"fintech": 1, "dashboard": 1, "saas": 1},
        "all_products": {"dashboard": 1}
    },
    "recommended_palette": "corporate",
    "rules_applied": [
        {
            "rule_id": "2",
            "category": "sector-palette",
            "then_field": "palette",
            "then_value": "corporate",
            "priority": 8,
            "reasoning": "Fintech needs trust signals despite being tech-forward"
        }
    ],
    "anti_patterns": [
        {
            "anti_pattern": "Overly playful UI",
            "severity": "high",
            "description": "...",
            "alternative": "..."
        }
    ],
    "search_results": {
        "products": [...],    # top 5 from products.csv
        "styles": [...],      # top 3 from styles.csv
        "colors": [...],      # top 3 from colors.csv
        "typography": [...],  # top 3 from typography.csv
        "components": [...],  # top 10 from components.csv
        "patterns": [...],    # top 5 from patterns.csv
        "guidelines": [...]   # top 5 from ux-guidelines.csv
    }
}
```

### CLI

```bash
# Search the engine
python src/scripts/search.py "fintech dashboard"
python src/scripts/search.py "kids education app" --verbose --json

# Generate a full design system specification
python src/scripts/design_system.py "saas landing page"
python src/scripts/design_system.py "healthcare portal" --format json
```

---

## Source Files

| File | Description |
|------|-------------|
| `src/scripts/core.py` | BM25Index, DomainDetector, ReasoningEngine, PorterStemmer |
| `src/scripts/search.py` | CLI search interface |
| `src/scripts/design_system.py` | Full specification generator (Tailwind, React, Vue, Svelte output) |
| `src/data/*.csv` | 15 CSV databases |
| `src/data/stacks/*.csv` | Stack-specific CSV databases (React Native) |
| `tokens/design-tokens.json` | W3C DTCG design tokens resolved by palette |
