---
name: ui-spec-prd
description: UI spec and PRD: product type, sector, key components, palette, anti-patterns; plan before building; design_system.py --persist.
version: 0.6.0
triggers:
  - product requirements
  - ui spec
  - prd for ui
  - plan a landing page
  - spec the dashboard
  - requirements for design
  - before building
  - ui requirements
  - spec before build
  - design requirements
---

# UI Spec and PRD — UDS Skill

Use this skill when the user wants to **plan**, **spec**, or **write requirements** before building a UI. Output a short UI spec or PRD aligned with the Universal Design System: product type, sector, recommended palette, key components, and anti-patterns to avoid. Optionally generate a persisted design system (MASTER.md and page files) so the MAIN skill or follow-up builds have a single reference.

## When to Use

- User describes an app or page and wants to "spec it" or "plan before building."
- User asks for product requirements, UI spec, or PRD for a landing page, dashboard, or app.
- User wants to lock in palette, components, and anti-patterns so that implementation stays consistent.

## What to Produce

A minimal **UI spec / PRD** that includes:

1. **Product type** — e.g. landing-page, dashboard, saas-app, mobile-app, documentation (from UDS product types).
2. **Sector** — e.g. fintech, healthcare, ecommerce, startup (from UDS sectors) so palette and rules apply.
3. **Recommended palette** — One of the 9 UDS palettes (or custom) with brief rationale (e.g. "corporate for regulated fintech").
4. **Key components** — Top 5–10 components from the UDS set (e.g. hero, navbar, pricing-table, footer, button, card, modal) so implementers know what to use.
5. **Anti-patterns to avoid** — From UDS anti-patterns by sector (e.g. "avoid dense data tables for consumer landing pages"). Reference `src/data/anti-patterns.csv` or MCP `get_anti_patterns` if available.
6. **Optional: Typography and patterns** — Font pairing and one primary layout pattern (e.g. hero + features + pricing + footer) if the user cares.

Keep the spec short (one page or a few bullets). The goal is to give the MAIN skill (or a developer) a clear target so generated UIs are consistent and on-brand.

## Persisting the Spec for Follow-up Builds

So that an AI or developer can "read the spec" when building specific pages:

```bash
# Generate and persist a design system (creates design-system/MASTER.md)
python src/scripts/design_system.py "saas landing" --persist

# Persist with a specific page (creates design-system/pages/dashboard.md)
python src/scripts/design_system.py "saas dashboard" --persist --page dashboard
```

- **MASTER.md** — Contains the full design system summary (palette, components, patterns, typography, avoid, pre-delivery checklist). Use it as the single source when building any page.
- **design-system/pages/<name>.md** — Page-specific overrides (e.g. dashboard.md for the dashboard page). Hierarchical retrieval: read MASTER first, then the page file if present.

From the CLI: `uds generate "saas landing" --persist` or `uds generate "saas dashboard" --persist --page dashboard`. Run `uds generate --help` for options (e.g. `--format box`, `--framework react`).

## How This Fits With the MAIN Skill

- **MAIN skill (universal-design-system):** "Build/design/implement a UI" — runs domain detection, BM25 search, rules, and outputs full spec or code. Use it when the user says "build a landing page" or "create a dashboard."
- **This skill (ui-spec-prd):** "Plan/spec/requirements before building" — output a concise spec and optionally call `design_system.py --persist` so that when the user (or MAIN skill) builds pages later, they can read MASTER.md and pages/*.md for consistency.

If the user first asks for a spec and then says "now build the landing page," use the persisted MASTER (and any page file) as context when generating the implementation.

## Quick Reference

| Goal | Action |
|------|--------|
| Write UI spec / PRD | Output product type, sector, palette, key components, anti-patterns (and optionally typography/pattern). |
| Persist for later | `python src/scripts/design_system.py "<query>" --persist [--page <name>]` or `uds generate "<query>" --persist [--page <name>]`. |
| Search for context | `python src/scripts/search.py "<query>"` or MCP `search_design_system` to pull products, components, anti-patterns. |
| One-shot summary | `python src/scripts/design_system.py "<query>" --format box` for a compact ASCII summary (pattern, palette, components, typography, avoid, checklist). |

Use design_system.py and search (or MCP) so the spec is grounded in UDS data, not invented from scratch.
