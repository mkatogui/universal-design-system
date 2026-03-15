---
name: design-system
description: >
  This skill should be used when the user asks to "design a UI", "recommend a palette",
  "pick components for my app", "create a design system", "build a landing page",
  "style a dashboard", "choose typography", "set up dark mode", or needs guidance on
  UI/UX design, color palettes, component selection, design tokens, Tailwind config,
  accessibility compliance, or framework-specific component output (React, Vue, Svelte).
  Also triggers on "wcag", "contrast", "spacing", "layout", "hero section", "pricing table",
  "card design", "modal", "form design", "anti-pattern", "figma tokens", "shadcn", "radix",
  "fintech", "healthcare", "ecommerce", "startup", "enterprise", "crypto", "luxury brand",
  "education app", "mobile app design", "react native", or "app interface".
metadata:
  version: "0.4.2"
  author: "Marcelo Katogui"
---

# Universal Design System

A production-grade AI-native design system analyzed from 100 modern websites, distilled into one governed brand foundation with 9 structural palettes, 43 components, 8 patterns, and automated WCAG 2.2 AA compliance.

**Key stats:** 600 tokens | 43 components | 9 palettes | 100% WCAG AA | 1,600+ data rows across 20 databases | BM25 reasoning engine | 190 product rules | 75 font pairings | 200+ icon libraries | Tailwind config generation | React/Vue/Svelte output

## 5-Step Workflow

When a user asks for UI/UX design help, follow this workflow:

### Step 1: Detect Domain

Classify the request into sector and product type.

**Sectors:** finance, healthcare, education, ecommerce, saas, technology, crypto, government, legal, nonprofit, media, creative, hospitality, gaming, entertainment, social, logistics, real-estate, professional, productivity, startup

**Product types:** dashboard, landing-page, mobile-app, documentation, ecommerce, blog, saas-app, portfolio

### Step 2: Search Databases

If the MCP server `universal-design-system` is available, call `search_design_system` with the user's query. Otherwise, use the built-in knowledge from this skill and the references.

The BM25 reasoning engine searches across 20 CSV databases to find: product category matches (165 products), style recommendations (60 styles), color palettes (165 industry palettes), typography pairings (75 font pairs), components needed (43 components), patterns (15 patterns), UX guidelines (80 guidelines), anti-patterns (55 anti-patterns), icon libraries (200+), Google Fonts (200+), mobile/app interface patterns (30), React performance rules (44), React Native patterns (50).

### Step 3: Apply Rules

Apply conditional design rules (190 rules): sector → palette mapping, product type → layout/component requirements, audience → accessibility constraints, anti-pattern enforcement, mobile-responsive rules, framework-specific best practices.

### Step 4: Generate Design System

Produce a complete specification:

- Palette with CSS custom properties
- Component list with variants
- Pattern templates
- Typography recommendations
- Token values
- Tailwind CSS config (if requested)
- Framework-specific components: React, Vue, or Svelte (if requested)

If the MCP server is available, call `generate_tokens` for a full specification.

### Step 5: Deliver with Checklist

Before presenting, verify:

1. Palette selected — one of 9 structural palettes based on sector rules
2. Tokens resolved — all CSS uses `var()`, no hardcoded values
3. Components listed — only from the 43-component library
4. Patterns applied — layout follows one of 8 pattern templates
5. Typography paired — font pairing matches palette mood
6. Accessibility checked — WCAG AA contrast ratios verified
7. Anti-patterns avoided — industry-specific violations prevented
8. Motion specified — presets with reduced-motion fallback
9. Responsive planned — grid breakpoints and mobile strategy defined
10. Dark mode included — both light and dark modes configured

## Palette Selection

| Context | Palette | Best For |
|---------|---------|----------|
| SaaS / Product UI | `minimal-saas` | General default |
| Marketing / Landing | `gradient-startup` | Bold CTAs, gradients |
| Dashboards / Admin | `dashboard` | Data-dense, compact |
| AI / Dev Tools | `ai-futuristic` | Dark-native, glow effects |
| Enterprise / Gov | `corporate` | Conservative, regulated |
| Consumer Premium | `apple-minimal` | Smooth, refined |
| Education / Kids | `illustration` | Friendly, rounded |
| Fashion / Lifestyle | `bold-lifestyle` | Brutalist, 0px radius |
| Professional / Legal | `minimal-corporate` | Subtle, serif display |

Apply with `data-theme` attribute: `<html data-theme="minimal-saas">`. One palette per surface. No mixing.

## Governance Rules

1. **Foundation is locked.** Typography scale, spacing, motion, z-index, opacity never change per palette.
2. **Palettes control:** color, shadow, border-radius, and display font only.
3. **One palette per surface.** Each product or page selects exactly one palette.
4. **Default to Minimal SaaS.** If no context matches, use `minimal-saas`.
5. **All components use `var()`.** No hardcoded pixel or hex values.
6. **WCAG AA minimum.** Every palette × mode combination must pass 4.5:1 text contrast.
7. **Reduced motion required.** All animations wrapped in `@media (prefers-reduced-motion: no-preference)`.

## Quick Examples

### "Build a fintech dashboard"
- **Sector:** finance → **Palette:** corporate
- **Components:** data-table, tabs, badge, side-navigation, pagination, toast
- **Anti-patterns:** No playful animations, no neon colors, no dark themes
- **Typography:** Inter/Inter or Manrope/Inter

### "Design a kids education app"
- **Sector:** education → **Palette:** illustration
- **Components:** button, avatar, progress-indicator, badge, tabs, modal
- **Anti-patterns:** No small text, no dark themes, no complex navigation
- **Typography:** Nunito/Inter or Poppins/Inter

### "Create a SaaS landing page"
- **Sector:** saas → **Palette:** gradient-startup
- **Pattern:** Homepage (hero → social-proof → features → pricing → CTA → footer)
- **Typography:** DM Sans/Inter or Plus Jakarta Sans/Inter

### "Design a luxury brand website"
- **Sector:** luxury → **Palette:** apple-minimal
- **Anti-patterns:** No busy layouts, no discount badges, no bright gradients
- **Typography:** Playfair Display/Inter or DM Serif Display/DM Sans

## Reference Files

For detailed component specs, token tables, motion presets, anti-patterns by industry, platform-specific code (React/Vue/Svelte/SwiftUI/Flutter/Tailwind), typography scale, spacing scale, z-index scale, and WCAG checklist, read the files in the `references/` directory:

- `references/components.md` — 43-component library with CSS classes, variants, sizes, states, and CVA API pattern
- `references/tokens-and-motion.md` — Foundation tokens (typography, spacing, motion, z-index), color palette details for all 9 palettes
- `references/patterns-and-guidelines.md` — 8 page patterns, homepage section order, responsive grid, industry anti-patterns, UX guidelines
- `references/platform-code.md` — React, Vue, Svelte, SwiftUI, Flutter, Tailwind CSS integration code
