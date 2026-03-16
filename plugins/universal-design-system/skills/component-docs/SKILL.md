---
name: Component Docs
description: Component documentation and Storybook: stories, MDX, props tables, usage guidelines from UDS component specs.
version: 0.6.0
triggers:
  - storybook
  - component documentation
  - document a component
  - usage guidelines
  - props table
  - design system docs
  - component catalog
  - MDX
  - component story
  - document component
---

# Component Docs — UDS Skill

Use this skill when the user needs **component documentation**, **Storybook stories**, or **usage guidelines** for the Universal Design System components. UDS has a canonical component database and APG pattern links; use them to generate consistent docs, props tables, and MDX.

## When to Use

- User wants to document a component (usage, props, variants, accessibility).
- User is setting up or writing Storybook stories or MDX for the design system.
- User needs a props table or API reference derived from UDS specs.
- User wants a component catalog or design system documentation site content.

## Core Data

- **Component specs:** `src/data/components.csv` — canonical list. Columns include: `id`, `name`, `slug`, `category`, `variants`, `sizes`, `states`, `props`, `accessibility`, `use_when`, `dont_use_when`, `css_class`, `lifecycle_stage`. Use slug as stable key (e.g. `button`, `modal`, `input`).
- **APG patterns:** `src/data/apg-patterns.csv` — maps `component_slug` to WAI-ARIA Authoring Practices: `apg_pattern`, `apg_url`, `keyboard_interactions`, `required_aria`, `focus_management`, `live_region`. Link to `apg_url` in docs for accessibility reference.
- **Roadmap / structure:** `docs/COMPONENT-ROADMAP.md` — component count by layer (React, Vue, Svelte), categories, and peer comparison. Use for high-level doc structure.

## Documentation Structure per Component

For each component, include:

1. **Name and purpose** — from `name` and a short summary (e.g. from `use_when`).
2. **Variants and sizes** — from `variants` and `sizes` (e.g. primary;secondary;ghost and sm;md;lg).
3. **States** — from `states` (default, hover, focus, disabled, etc.).
4. **Props / API** — from `props` (comma-separated); format as a table (Prop | Type | Default | Description) for Storybook ArgsTable.
5. **Accessibility** — from `accessibility`; add link to APG when present in `apg-patterns.csv` (`apg_url`). Include keyboard and ARIA notes from that CSV.
6. **When to use / when not** — from `use_when` and `dont_use_when`.
7. **CSS class** — from `css_class` (BEM: `.uds-{component}` or class name used in docs).
8. **Lifecycle** — from `lifecycle_stage` (e.g. stable, beta) if you expose it in docs.

## Storybook Integration

- **DocsPage / MDX:** Use Doc Blocks: Canvas for live examples, ArgsTable for props, and Markdown for usage guidelines. Pull variant/size/state lists from components.csv so stories cover the same matrix.
- **Stories:** One story per variant or a single story with controls for variant, size, and state. Name stories after the component slug or display name for consistency.
- **Links:** In the docs block, add "Accessibility" section with link to the APG pattern URL from apg-patterns.csv when the component_slug matches.
- **Design asset links:** If Figma or design docs exist, link them in the same doc block or in a "Design" section.

## MCP / Scripts

If the project exposes MCP: `get_component` (by slug) returns component details; use it to fill props tables or generate doc stubs. Otherwise, read `src/data/components.csv` and `src/data/apg-patterns.csv` directly.

## Quick Reference

| Source | Use for |
|--------|---------|
| `src/data/components.csv` | Name, slug, category, variants, sizes, states, props, accessibility, use_when, dont_use_when, css_class |
| `src/data/apg-patterns.csv` | APG pattern name, URL, keyboard, ARIA, focus, live region per component_slug |
| `docs/COMPONENT-ROADMAP.md` | Counts, categories, React/Vue/Svelte parity, Storybook references |

Keep documentation aligned with the CSV specs so code and docs stay in sync when components change.
