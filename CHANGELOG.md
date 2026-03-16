# Changelog

## 0.6.0

### Added

- **SOLID refactor (Python scripts)** — Single-responsibility split: `tokens.py` (token resolution), `checklist.py` (pre-delivery checklist), `formatters/` package (markdown, box, JSON, Tailwind, CSS-in-JS, framework, unstyled). Dependency inversion in `core.py`: `SearchIndexProtocol` and `DomainDetectorProtocol`; `ReasoningEngine` accepts optional `index` and `detector`. Formatter registry (OCP): new formats can be added without editing `main()`. Backward compatibility preserved via re-exports from `design_system`.
- **ThemeCheck and theme warning** — React `ThemeCheck` component and `warnIfNoTheme()` utility; dev-only warning when `data-theme` is missing on document root. Exported from `@mkatogui/uds-react`.
- **CLI `--persist` and `--page`** — `uds generate "query" --persist` writes `design-system/MASTER.md`; `--page <name>` adds `design-system/pages/<name>.md`. Box format added to `--format` options.
- **Contract tests** — `test_design_system.py`, `test_tokens.py`, `test_validate_datasets.py` for design system output, token resolution, and dataset validation.
- **FormSection** — New React component for form field groups (title + optional description + grouped fields). Exported from `@mkatogui/uds-react`.
- **Input `type` and `multiline`** — Native input kind via `type` ('text' | 'email' | 'password' | 'number' | 'search'); use `multiline` for `<textarea>`. The old `variant` prop has been removed; use `type` and `multiline` only.
- **Input `optional` and `optionalLabel`** — First-class optional field semantics; component can show "Optional" (or custom `optionalLabel`) in the helper area.
- **FileUpload `error`** — Public prop to show an error message below the zone (e.g. from parent validation).
- **FileUpload placeholder props** — `placeholderTitle`, `placeholderDescription`, `acceptLabel` to customize dropzone/button text.
- **Form patterns doc** — `docs/FORM_PATTERNS.md`. **Adoption feedback doc** — `docs/ADOPTION_FEEDBACK.md`. **Playground** — Form Section in interactive playground.

### Changed

- **Input** — When `optional` is true, asterisk is not shown and helper shows optional label.
- **FileUpload** — Placeholder uses `uds-file-upload__text` and optional `uds-file-upload__sub` for description.

---

## 0.5.0

### Added

- **29 new React components** — Box, Stack, Grid, Divider, Container, Typography, Link, NumberInput, Slider, Form, TimePicker, Rating, ColorPicker, List, Empty, Image, Chip, Descriptions, Statistic, Timeline, AspectRatio, ContextMenu, Popconfirm, Notification, Collapsible, Icon, FloatButton, Menu, Anchor (43 → 72 total)
- **Vue/Svelte parity (Phase 1–2)** — 13 components added to Vue and Svelte packages
- **Component roadmap** — `docs/COMPONENT-ROADMAP.md` with inventory and phase tracking
- **Storybook for React** — `.storybook-react/` and stories for new components

### Changed

- **Token validation** — Theme palette `$type` in design-tokens.json; `validate-tokens.py` oklch exemption for theme.* color tokens
- **Tests** — SideNav jsdom navigation message fix; CodeBlock act() wrap; controlled input handlers for NumberInput/Slider
- **CI / tooling** — `.gitignore` includes `test-results/`

## 0.4.0

### Added

- **OKLCH Color Pipeline** — Reverse OKLCH→hex conversion, P3 gamut mapping, tonal palette curves (Material You-style 13-stop scales)
- **Semantic Color Tokens** — 11 intent-named aliases (action-primary, feedback-success, surface-elevated, text-link, border-focus)
- **WCAG 2.2 Compliance** — Upgraded from 2.1; added SC 2.4.11, 2.5.7, 2.5.8 to conformance checklist
- **APCA Dual-Reporting** — WCAG audit now includes APCA Lc values alongside traditional contrast ratios
- **APG Pattern Library** — All 43 components mapped to WAI-ARIA APG patterns with keyboard interactions and ARIA specs
- **Headless/Unstyled Output** — `--unstyled` flag for behavior-only specs (ARIA, keyboard, states, focus management)
- **Web Components Output** — `--framework web-components` with Lit-based Custom Element templates for 8 core components
- **11 New Components** — Drawer, Popover, Combobox, Alert Dialog, Carousel, Chip Input, Stepper, Segmented Control, Toolbar, Tree View, OTP Input (32→43 total)
- **Compound Component Slots** — `component-slots.csv` decomposing 8 components into atomic parts
- **Layout Primitives** — Box, Stack, Inline, Grid, Center, Container, Spacer, Divider with container query tokens
- **Animation & Motion Expansion** — Spring easing, 14 micro-animation presets, scroll-driven animation tokens, @starting-style patterns
- **Multi-Brand Architecture** — Brand override system with deep-merge resolver and Style Dictionary integration
- **RTL & Logical Properties** — Physical-to-logical CSS mapping (30 properties) with automatic converter
- **Figma Integration** — Code Connect mappings for 43 components, Tokens Studio bidirectional sync, Figma MCP server config
- **Visual Regression CI** — Playwright visual comparison (9 palettes × 2 modes × 8 pages = 144 screenshots)
- **Bundle Size Analysis** — Per-component size budgets via esbuild with CI reporting
- **Governance Model** — Component lifecycle stages (Proposal→Alpha→Beta→Stable→Deprecated), RFC template, token coverage scanner

## 0.3.1

### Patch Changes

- Fix number inconsistencies across docs and config files, add 274 component tests covering all 23 previously untested React components, add Husky pre-commit hooks with lint-staged, and add Changesets for release automation.

All notable changes to the Universal Design System.

## [0.3.0] - 2026-03-12

### Added

- **BM25 Fuzzy Search** — Porter stemmer, synonym expansion (ecommerce/e-commerce, ai/artificial-intelligence), and hyphen-aware tokenization for cross-form matching
- **15 New Sectors** — sustainability, proptech, automotive, regtech, legaltech, agritech, govtech, cleantech, insurtech, sporttech, fashiontech, foodtech, musictech, pettech, spacetech (42 -> 57 sectors)
- **MCP Server Enhancements** — `resources/list`, `resources/read`, `prompts/list`, `prompts/get` handlers; `get_anti_patterns` and `get_foundation_tokens` tools
- **TypeScript Type Generation** — `TokenNames` union type, `PaletteTokens` interfaces, `isPalette()` type guard, Tailwind-compatible `ThemeConfig` type
- **Compound Reasoning Conditions** — AND/OR boolean logic in `ui-reasoning.csv` for multi-field rules (e.g., sector=finance AND product_type=dashboard)
- **Expanded Framework Templates** — 10 components per framework (Button, Card, Input, Modal, Alert, Badge, Tabs, DataTable, Select, Accordion) for React/TypeScript/cva, Vue 3/script setup, Svelte 5 runes
- **oklch() Color Extensions** — `$extensions.com.tokens.oklch` on all semantic and palette color tokens; `color.utility` section with color-mix() patterns (hover-tint, disabled-overlay)
- **Container Query Tokens** — breakpoints (sm:320px -> xl:800px), type presets, name conventions; `container_query` column in components.csv
- **Animation Keyframe Library** — 12 named keyframes (fade-in/out, slide-up/down/left/right, scale-in/out, spin, pulse, bounce, shake) with motion-style reasoning rules and `prefers-reduced-motion` awareness
- **CSS-in-JS Output Format** — `--format css-in-js` generates ES module theme objects compatible with styled-components/Emotion ThemeProvider
- **Products Database Expansion** — ~60 new CSV rows covering all 15 new sectors across products, styles, colors, and typography databases
- **Client-Side Documentation Search** — trigram/prefix search widget on docs.html, component-library.html, and reference.html with WCAG combobox pattern
- **Playwright Visual Regression Scaffolding** — screenshot comparison config for 8 doc pages x 2 modes x 3 viewports
- **@starting-style + View Transitions** — view-transition-name conventions, @starting-style presets for modal/dropdown/toast/popover entry animations
- **@layer CSS Cascade Control** — all CSS output wrapped in `@layer uds.tokens, uds.components, uds.utilities` for explicit cascade ordering

### Changed

- **DTCG v1 Alignment** — `$version` updated to 1.0.0, mandatory `$type` on all leaf tokens, spacing converted to `dimension` type, `{reference}` paths validated
- Style Dictionary config migrated from JSON to ESM (`style-dictionary.config.mjs`) with v4 hooks system
- Object-type tokens (keyframes, @starting-style) excluded from JS/TS/CSS variable output to prevent build crashes
- Anti-patterns database expanded to 84 rows covering new sectors
- Contract test suite expanded to 59 tests (palette, taxonomy, BM25, stemmer, tokenization, full-index integration)

## [0.2.1] - 2026-03-12

### Fixed

- Improved domain detection scoring and tiebreaking for niche queries
- Design token refinements for semantic color accuracy
- Install CLI dependencies before TypeScript build in CI

### Added

- GitHub Actions CI pipeline with token validation, WCAG audit, and contract tests
- SECURITY.md with vulnerability reporting guidelines
- Contract test suite (test_taxonomy.py, test_palettes.py, test_tokens.py)

## [0.2.0] - 2026-03-11

### Added

- Custom palette injection tool (`npm run inject-palettes`)
- React component package (`@mkatogui/uds-react`)
- Visual framework guide (`docs/visual-framework.html`)
- Case studies page with 5 real-world examples (`docs/case-studies.html`)
- Interactive playground (`docs/playground.html`)
- WCAG conformance documentation (`docs/conformance.html`)
- Theming, palettes, and dark mode documentation in docs.html
- Navigation links across all 8 documentation pages
- Claude Code Review and PR Assistant GitHub Actions workflows

## [0.1.0] - 2026-03-11

### Added

- 9 structural palettes (minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal, illustration, dashboard, bold-lifestyle, minimal-corporate)
- ~600 W3C DTCG design tokens with 3-tier architecture (primitive > semantic > palette-overrides)
- 43 BEM components with CVA variant API, full ARIA support, keyboard navigation
- BM25 reasoning engine across 20 CSV databases (1,600+ rows)
- 190 industry-specific design rules and 84 anti-pattern warnings
- Automated WCAG 2.1 AA contrast validation (108 checks across 9 palettes x 2 modes)
- Tailwind CSS config generation from tokens
- React, Vue, Svelte framework output
- 20 AI platform support (Claude, Cursor, Copilot, Windsurf, Kiro, etc.)
- 200 Google Fonts catalog with mood/pairing metadata
- 200 icons catalog across 15+ libraries
- 75 typography pairings with mood classification
- Interactive landing page with live palette playground
- Interactive documentation with component sandbox
- Component library with copy-paste code reference
- Visual token reference with palette switching
- TypeScript CLI (install, search, generate, init commands)
- 5 Claude Code skills (universal-design-system, brand-identity, design-audit, slides-design, ui-styling)
- GitHub Pages deployment with automatic version injection from package.json
