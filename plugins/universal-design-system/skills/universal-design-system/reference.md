# Universal Design System — Reference

## Contents

- [Priority Categories](#priority-categories)
- [Palette Reference](#palette-reference)
- [Token Reference](#token-reference)
- [Component Library](#component-library)
- [Pattern Library](#pattern-library)
- [Industry Anti-Patterns](#industry-anti-patterns)
- [File Reference](#file-reference)
- [Color Palette Details](#color-palette-details)
- [UX Guidelines](#ux-guidelines)
- [Token Format and Search](#token-format-w3c-dtcg)
- [APG and RTL](#apg-pattern-reference)

---

## Priority Categories

When generating a design system, evaluate and score each category (1-10):

| Priority | Category | Weight | Description |
|----------|----------|--------|-------------|
| 1 | Palette Selection | 10 | The single most impactful decision. Determines color, shadow, radius, display font. |
| 2 | Component Selection | 9 | Which of the 43 components are needed for this product. |
| 3 | Accessibility | 9 | WCAG 2.2 AA minimum. Color contrast, keyboard nav, screen readers. |
| 4 | Typography | 8 | Font pairing, scale, weights. Must match palette mood. |
| 5 | Layout & Spacing | 8 | Grid system, container widths, section spacing. |
| 6 | Pattern Selection | 7 | Page templates and layout patterns. |
| 7 | Color Customization | 7 | Brand color overrides within the palette framework. |
| 8 | Motion & Animation | 6 | Duration, easing, choreography presets. |
| 9 | Dark Mode | 6 | Light/dark appearance mode configuration. |
| 10 | Anti-Pattern Avoidance | 8 | Industry-specific design mistakes to prevent. |

---

## Palette Reference

### 9 Structural Palettes

| Palette | Identity | Radius | Shadow | Display Font | Best For |
|---------|----------|--------|--------|-------------|----------|
| `minimal-saas` | Balanced, neutral | 6-24px | Standard | Inter 600-800 | Product UI, SaaS apps |
| `gradient-startup` | High-energy gradients | 8-28px | Soft + glow | DM Sans 700 | Marketing, landing pages |
| `ai-futuristic` | Sharp, dark-native | 2-12px | Glow-border | DM Sans 700 | Dev tools, AI products |
| `corporate` | Conservative, squared | 4-12px | Conservative | Inter 600-700 | Enterprise, regulated |
| `apple-minimal` | Smooth, refined | 10-24px | Smooth diffused | SF-style sans | Premium consumer |
| `illustration` | Friendly, rounded | 12-32px | Soft warm | Poppins/Nunito | Education, creative |
| `dashboard` | Compact, data-dense | 4-12px | Tight | Inter 500-700 | Analytics, admin panels |
| `bold-lifestyle` | Brutalist, 0px radius | 0px | None or hard offset | Oswald/Bebas | Fashion, media |
| `minimal-corporate` | Subtle, understated | 4-8px | None/subtle | Source Serif 4 | Professional services |

### Palette Selection Rules

| Context | Default Palette |
|---------|-----------------|
| SaaS / Product UI | `minimal-saas` |
| Marketing / Landing | `gradient-startup` |
| Dashboards / Admin | `dashboard` |
| AI / Dev Tools | `ai-futuristic` |
| Enterprise / Gov | `corporate` |
| Consumer Premium | `apple-minimal` |
| Education / Kids | `illustration` |
| Fashion / Lifestyle | `bold-lifestyle` |
| Professional / Legal | `minimal-corporate` |

### CSS Usage

```html
<html lang="en" data-theme="minimal-saas">
```

```js
document.documentElement.setAttribute('data-theme', 'corporate');
```

---

## Token Reference

### Foundation Tokens (Locked)

Typography scale, spacing (4px base), motion durations/easing, z-index scale, opacity. See project `tokens/design-tokens.json`. Typography: `--text-display-xl` through `--text-label`. Spacing: `--space-1` (4px) through `--space-24` (96px). Motion: `--duration-instant` (100ms) through `--duration-slow` (400ms). Z-Index: `--z-dropdown` (10) through `--z-system` (100).

---

## Component Library

43 components with CSS classes (e.g. `.btn`, `.navbar`, `.hero`), variants, and sizes. All follow CVA-style: `btn btn--primary btn--md`. States: Default, Hover, Active, Focus, Disabled, Loading. Full component table and API examples are in the project `src/data/components.csv` and docs.

---

## Pattern Library

8 page patterns: Homepage, Dashboard, Form, Authentication, Settings, Empty State, Pricing Page, Blog Layout. Homepage section order: Navigation → Hero → Social Proof → Feature Grid → Product Showcase → How It Works → Testimonials → Pricing → CTA → Footer. Responsive grid: Desktop 12-col, Laptop 12-col, Tablet 8-col, Mobile 4-col.

---

## Industry Anti-Patterns

**Finance/Banking:** No playful animations, no neon colors, no dark themes (traditional), no experimental layouts, no casual typography.

**Healthcare:** No aggressive red/orange, no dark themes, no complex animations, no small text.

**Education/Kids:** No small text, no dark themes (kids), no complex navigation, no angular sharp designs.

**Government:** No trendy designs, target WCAG AAA, no neon or playful animations.

**Luxury:** No busy layouts, no discount badges, no bright gradients.

**Fashion:** No corporate styling, no pastel/rounded (moderate), no data-dense layouts.

---

## File Reference

### Databases (src/data/)

products.csv, styles.csv, colors.csv, typography.csv, ui-reasoning.csv, ux-guidelines.csv, components.csv, patterns.csv, landing.csv, charts.csv, icons.csv, anti-patterns.csv, google-fonts.csv, app-interface.csv, react-performance.csv, stacks/react-native.csv.

### Scripts (src/scripts/)

core.py (BM25 + domain detector + reasoning), search.py (CLI search), design_system.py (full generator).

### Tokens

tokens/design-tokens.json (W3C DTCG, source of truth), tokens/figma-tokens.json.

### Validation

scripts/validate-tokens.py, scripts/wcag-audit.py, scripts/verify-docs.py, src/data/_sync_all.py.

---

## Color Palette Details

**Minimal SaaS:** Brand #2563EB, bg #FFFFFF/#FAFAFA, text #111827. **AI Futuristic:** Brand #00FF88/#00D4FF, bg #0A0A0F, text #E0E0EE. **Gradient Startup:** #7C3AED/#EC4899, gradient hero. **Corporate:** #1A365D. **Apple Minimal:** #0071E3. **Illustration:** #E8590C/#7048E8. **Dashboard:** #4F46E5/#0EA5E9. **Bold Lifestyle:** #111111/#FF4500. **Minimal Corporate:** #B45309.

---

## UX Guidelines

**Navigation:** 5-7 primary items, primary CTA top-right, sticky nav, breadcrumbs for 3+ levels. **Forms:** Validate on blur then change, labels above, single-column, scroll to first error. **Buttons:** 44x44px min touch, verb labels, primary right. **Feedback:** Toast auto-dismiss 5s, inline alerts for errors, skeleton over spinner, max 3 toasts. **Dark mode:** Glow-border technique, elevated surfaces. **Performance:** Sub-2.5s LCP, lazy-load images, max 2 Google Fonts.

---

## Token Format (W3C DTCG)

Tokens follow W3C DTCG format. Build: `npx style-dictionary build --config style-dictionary.config.json`. Outputs: CSS variables, JS, iOS Swift, Android Kotlin.

### Search and generator

```bash
python src/scripts/search.py "saas dashboard"
python src/scripts/design_system.py "fintech dashboard"
python src/data/_sync_all.py
```

---

## APG Pattern Reference

All 43 components map to WAI-ARIA APG patterns. See `src/data/apg-patterns.csv` for keyboard interactions, required ARIA, focus management. Use logical CSS properties (margin-inline-start, padding-block-end); see `src/data/localization.csv` and `rtl_mapper.py` for RTL.
