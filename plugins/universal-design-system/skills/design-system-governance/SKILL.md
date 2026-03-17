---
name: design-system-governance
description: Design system governance and scaling: centralized vs federated, lifecycle, contribution model, multi-team adoption.
version: 0.6.0
triggers:
  - design system governance
  - scaling design system
  - multi-team
  - federated
  - contribution model
  - design ops
  - design system adoption
  - multi-brand
  - governance model
  - design system scaling
  - design system contribution
---

# Design System Governance — UDS Skill

Use this skill when the user needs **governance**, **scaling**, or **adoption** guidance for a design system — including centralized vs federated models, lifecycle, contribution rules, and how the Universal Design System fits as a single source of truth with palette overrides for brands.

## When to Use

- User is deciding how to govern a design system (who decides, how contributions work).
- User is scaling across multiple teams or products.
- User is comparing centralized vs federated vs hybrid governance.
- User wants a contribution or adoption process (proposal → stable → deprecation).
- User is planning multi-brand or multi-product use of the same system.

## Governance Models

- **Centralized:** One team owns the system; other teams consume. Works well early and for single-product companies. Can become a bottleneck when many products or brands have conflicting needs (accessibility, brand, features).
- **Federated:** Representatives from different products/brands share decision-making. Better for diverse portfolios and different maturity levels. Requires clear decision frameworks and a mix of skills (design, eng, a11y, product).
- **Hybrid:** Core system is centralized (tokens, base components); product- or brand-specific extensions or separate surfaces are federated. UDS fits this: one token/component foundation, palette overrides and optional custom palettes per brand.

## UDS as Single Source of Truth

- **Tokens:** `tokens/design-tokens.json` — one file. Foundation tokens (spacing, motion, typography scale, z-index) are locked; palette tokens (color, shadow, radius, display font) vary per palette. Custom palettes can be added via `palette.py create` and merged into the same structure.
- **Components:** `src/data/components.csv` and implementation (React/Vue/Svelte) — one canonical set. Variants and states are defined once; products use the same components with different `data-theme` (palette).
- **Rules:** `src/data/ui-reasoning.csv` — sector/product-type rules (e.g. IF sector=finance THEN palette=corporate). Governance can extend this with org-specific overrides or leave it as-is for recommendation only.

## Component Lifecycle (UDS)

UDS uses a defined lifecycle for components. Reference `docs/governance/LIFECYCLE.md`:

| Stage | Meaning |
|-------|---------|
| Proposal | RFC, discussion, acceptance criteria |
| Alpha | Initial implementation; API may change; limited a11y |
| Beta | API stabilizing; a11y audit; documentation draft |
| Stable | API frozen; WCAG 2.2 AA; docs and examples complete; cross-palette tested |
| Deprecated | Migration guide; maintained 2 major versions; then removed |

Promotion: Proposal → Alpha (RFC + impl), Alpha → Beta (API review + basic a11y), Beta → Stable (full a11y, docs, 2+ palette tests), Stable → Deprecated (replacement + migration guide).

Use this lifecycle in your own governance: e.g. new components start as Proposal, reach Stable only after a11y and docs, and deprecation is time-bound.

## Contribution and Adoption

- **Contribution:** Define how proposals are submitted (RFC, issue template), who reviews (design + eng + a11y), and how changes land (PR to design-tokens.json, components.csv, code). UDS does not prescribe a specific tool (GitHub, Notion, etc.); use what fits your org.
- **Adoption:** Onboard teams with: (1) install/setup (e.g. `uds install`, tokens in repo), (2) palette choice per product (`data-theme`), (3) component usage from the canonical list, (4) docs/Storybook for usage. Design ops can track adoption (e.g. token usage, component usage) to find gaps and deprecations.

## Multi-Brand and Multi-Product

- **One system, brand layers:** Use one design system with multiple palettes (UDS has 9; add custom via `palette.py`). Each product or brand sets `data-theme` to its palette. Single documentation and one codebase.
- **Separate systems:** Only if teams need fully independent workflows, review processes, or branding. Heavier to maintain; consider hybrid first (core shared, surfaces or themes separate).

## Quick Reference

| Topic | Reference |
|-------|-----------|
| Component lifecycle | `docs/governance/LIFECYCLE.md` |
| Token architecture | CLAUDE.md or project Token Architecture section — foundation vs palette |
| Custom palettes | `python src/scripts/palette.py create/list` |
| Rules and reasoning | `src/data/ui-reasoning.csv` |

Governance should keep the design system predictable (lifecycle, tokens, components) while allowing controlled extension (palettes, rules) for multi-team and multi-brand use.
