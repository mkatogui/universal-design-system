---
name: universal-design-system
description: MAIN skill — Intelligent design system generation. Domain detection, BM25 search, rule engine, palette selection, token resolution, Tailwind/React/Vue/Svelte output. Use when the user wants to build, design, or implement any UI (landing page, dashboard, app, component set, style guide).
version: 0.6.0
triggers:
  - build a landing page
  - build a dashboard
  - build an app
  - create a landing page
  - create a dashboard
  - create a design system
  - design a ui
  - design a landing page
  - design a dashboard
  - design system
  - implement a ui
  - style a dashboard
  - style a landing page
  - ui design
  - ux design
  - component library
  - design tokens
  - color palette
  - custom colors
  - my brand colors
  - palette from hex
  - typography
  - landing page design
  - dashboard design
  - saas design
  - mobile app design
  - web design
  - ui components
  - style guide
  - brand design
  - dark mode
  - light mode
  - accessibility
  - wcag
  - responsive design
  - motion design
  - animation
  - gradient
  - shadow
  - border radius
  - spacing
  - layout
  - hero section
  - pricing table
  - navigation
  - footer
  - form design
  - card design
  - modal design
  - toast notification
  - data table
  - chart design
  - icon system
  - font pairing
  - google fonts
  - figma tokens
  - style dictionary
  - css custom properties
  - tailwind
  - tailwind config
  - shadcn
  - radix
  - theme switching
  - palette
  - design critique
  - design audit
  - anti-pattern
  - ux guideline
  - conversion optimization
  - user interface
  - wireframe
  - prototype
  - react component
  - vue component
  - svelte component
  - framework output
  - mobile design
  - react native
  - app interface
  - fintech
  - healthcare
  - ecommerce
  - startup
  - enterprise
  - crypto
  - luxury brand
  - education app
---

# Universal Design System — MAIN Skill (Design System Generator)

> Other tools tell AI what colors to use. We give it a complete, accessible, WCAG-validated design system it can ship.

**This is the MAIN skill.** Use it whenever the user wants to **build**, **design**, or **implement** a UI: landing page, dashboard, app, component set, or style guide. One flow produces palette, components, patterns, typography, anti-patterns to avoid, and a pre-delivery checklist — in seconds.

A production-grade AI-native design system analyzed from 100 modern websites: 9 structural palettes, 43 components, 8 patterns, automated WCAG 2.2 AA compliance.

**Key stats:** 600 tokens | 43 components | 9 palettes | 100% WCAG AA | 1,600+ data rows across 20 databases | BM25 reasoning engine | 190 product rules | 75 font pairings | 200+ icon libraries | Tailwind config generation | React/Vue/Svelte output | 20 AI platform support

---

## Design System Generation Flow

```
User request → Domain detection (sector + product type)
            → BM25 search (20 CSV databases)
            → Rule engine (190 rules, palette + overrides)
            → Token resolution (design-tokens.json)
            → Output: Pattern | Palette | Components | Typography | Avoid (anti-patterns) | Pre-delivery checklist
```

For a **one-shot ASCII summary** (pattern, palette, components, typography, avoid, checklist), run:

```bash
python src/scripts/design_system.py "fintech dashboard" --format box
```

For full specs: `--format markdown` (default), `--format tailwind`, `--format json`, or `--framework react|vue|svelte`.

### Customize Colors (Palette from User Input)

Users can **generate a palette from their own colors** (e.g. brand hex values). UDS derives a full token set (primary, secondary, accent, neutrals) with WCAG-aware guidance and merges it into the design system. Use the **multi-brand-theming** skill when the user says "use my brand colors", "custom colors", or "palette from hex". Quick command:

```bash
python src/scripts/palette.py create --name my-brand --colors "#3B82F6"
python src/scripts/palette.py preview --colors "#E8590C,#7048E8"   # preview before creating
```

Then apply with `data-theme="my-brand"`. See **multi-brand-theming** for full options (--shape, multiple colors, list, export).

---

## How This Skill Works

When a user asks for UI/UX design help, follow this 5-step workflow:

### Step 1: Detect Domain
Classify the user's request into sector and product type using keyword detection.

**Sectors:** finance, healthcare, education, ecommerce, saas, technology, crypto, government, legal, nonprofit, media, creative, hospitality, gaming, entertainment, social, logistics, real-estate, professional, productivity, startup

**Product types:** dashboard, landing-page, mobile-app, documentation, ecommerce, blog, saas-app, portfolio

### Step 2: Search Databases
Use the BM25 reasoning engine (`src/scripts/core.py`) to search across 20 CSV databases and find relevant:
- Product category matches (165 products)
- Style recommendations (60 styles)
- Color palettes (165 industry palettes)
- Typography pairings (75 font pairs)
- Components needed (43 components)
- Patterns to follow (15 patterns)
- UX guidelines (80 guidelines)
- Anti-patterns to avoid (55 anti-patterns)
- Icon library recommendations (200+ libraries)
- Google Fonts catalog (200+ fonts)
- Mobile/app interface patterns (30 patterns)
- React performance best practices (44 rules)
- React Native component patterns (50 patterns)

### Step 3: Apply Rules
Apply conditional design rules from `src/data/ui-reasoning.csv` (190 rules):
- Sector → palette mapping
- Product type → layout/component requirements
- Audience → accessibility constraints
- Anti-pattern enforcement
- Mobile-specific responsive rules
- Framework-specific best practices

### Step 4: Generate Design System
Produce a complete design system specification using `src/scripts/design_system.py`:
- Palette with CSS custom properties
- Component list with variants
- Pattern templates
- Typography recommendations
- Token values from `tokens/design-tokens.json`
- **Tailwind CSS config** (`--format tailwind`)
- **Framework-specific components** (`--framework react|vue|svelte`)

```bash
# One-shot summary (pattern, palette, components, typography, avoid, checklist)
python src/scripts/design_system.py "fintech dashboard" --format box

# Full markdown specification (default)
python src/scripts/design_system.py "fintech dashboard"

# Tailwind config
python src/scripts/design_system.py "saas landing page" --format tailwind

# Framework-specific components
python src/scripts/design_system.py "healthcare portal" --framework react
python src/scripts/design_system.py "ecommerce store" --framework vue
python src/scripts/design_system.py "education app" --framework svelte
```

### Step 5: Deliver with Checklist
Validate against the pre-delivery checklist before presenting to user.

---

## Reference files

Detailed reference material is in sibling files (one level deep). Load only when needed.

- **Palettes, tokens, components, patterns, anti-patterns, file reference, UX guidelines, APG/RTL:** See [reference.md](reference.md)
- **React, Vue, Svelte, SwiftUI, Flutter, Tailwind, motion, accessibility, example queries:** See [platforms.md](platforms.md)

---

## Pre-Delivery Checklist

Before presenting a design system to the user, verify:

1. **Palette selected** — One of the 9 structural palettes chosen based on sector rules
2. **Tokens resolved** — All CSS custom properties use `var()` (no hardcoded values)
3. **Components listed** — Only components from the 43 in the library are referenced
4. **Patterns applied** — Page layout follows one of the 8 pattern templates
5. **Typography paired** — Font pairing matches palette mood from typography database
6. **Accessibility checked** — WCAG AA contrast ratios verified for all color pairs
7. **Anti-patterns avoided** — Industry-specific anti-patterns from database are not present
8. **Motion specified** — Animation uses choreography presets with reduced-motion fallback
9. **Responsive planned** — Grid breakpoints and mobile strategy defined
10. **Dark mode included** — Both light and dark appearance modes configured

---

## Governance Rules

1. **Foundation is locked.** Typography scale, spacing, motion, z-index, opacity never change per palette.
2. **Palettes control:** color, shadow, border-radius, and display font only.
3. **One palette per surface.** Each product or page selects exactly one palette.
4. **Default to Minimal SaaS.** If no context matches, use `minimal-saas`.
5. **All components use `var()`.** No hardcoded pixel or hex values in component CSS.
6. **WCAG AA minimum.** Every palette × mode combination must pass 4.5:1 text contrast.
7. **Reduced motion required.** All animations wrapped in `@media (prefers-reduced-motion: no-preference)`.

---

## Token Reference (summary)

Foundation tokens (typography, spacing, motion, z-index) are locked. Palette tokens (color, shadow, radius, display font) vary per palette. Full tables and component list: see [reference.md](reference.md).

