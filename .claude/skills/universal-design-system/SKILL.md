---
name: Universal Design System
description: Production-grade AI-native design system with 9 structural palettes, 600 W3C DTCG tokens, 43 BEM components, BM25 reasoning engine, WCAG 2.2 AA compliance, Tailwind CSS generation, React/Vue/Svelte output, and industry-specific design rules across 1,600+ data rows. Reverse-engineered from 100 modern websites.
version: 0.4.0
triggers:
  - design system
  - ui design
  - ux design
  - component library
  - design tokens
  - color palette
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

# Universal Design System — Claude Code Skill

> Other tools tell AI what colors to use. We give it a complete, accessible, WCAG-validated design system it can ship.

A production-grade AI-native design system analyzed from 100 modern websites, distilled into one governed brand foundation with 9 structural palettes, 43 components, 8 patterns, and automated WCAG 2.2 AA compliance.

**Key stats:** 600 tokens | 43 components | 9 palettes | 100% WCAG AA | 1,600+ data rows across 20 databases | BM25 reasoning engine | 190 product rules | 75 font pairings | 200+ icon libraries | Tailwind config generation | React/Vue/Svelte output | 20 AI platform support

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
# Generate markdown specification
python src/scripts/design_system.py "fintech dashboard"

# Generate with Tailwind config
python src/scripts/design_system.py "saas landing page" --format tailwind

# Generate with React components
python src/scripts/design_system.py "healthcare portal" --framework react

# Generate with Vue components
python src/scripts/design_system.py "ecommerce store" --framework vue

# Generate with Svelte components
python src/scripts/design_system.py "education app" --framework svelte
```

### Step 5: Deliver with Checklist
Validate against the pre-delivery checklist before presenting to user.

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

Each palette controls: color tokens, shadow tokens, border-radius tokens, and display font.
Foundation tokens (typography scale, spacing, motion, z-index, opacity) are locked and shared.

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

| Context | Default Palette | Override Condition |
|---------|----------------|-------------------|
| SaaS / Product UI | `minimal-saas` | General default |
| Marketing / Landing | `gradient-startup` | Marketing surface |
| Dashboards / Admin | `dashboard` | Data-dense needs |
| AI / Dev Tools | `ai-futuristic` | Developer audience |
| Enterprise / Gov | `corporate` | Regulated industry |
| Consumer Premium | `apple-minimal` | Premium positioning |
| Education / Kids | `illustration` | Friendly audience |
| Fashion / Lifestyle | `bold-lifestyle` | Bold brand identity |
| Professional / Legal | `minimal-corporate` | Conservative sector |

### CSS Usage

```html
<html lang="en" data-theme="minimal-saas">
```

Switch at runtime:
```js
document.documentElement.setAttribute('data-theme', 'corporate');
```

---

## Token Reference

### Foundation Tokens (Locked — Same Across All Palettes)

#### Typography Scale

| Token | Mobile | Desktop | Line Height | Usage |
|-------|--------|---------|-------------|-------|
| `--text-display-xl` | 40px | 72px | 1.05 | Hero headline |
| `--text-display-lg` | 36px | 60px | 1.1 | Page headline |
| `--text-display-md` | 30px | 48px | 1.15 | Section headline |
| `--text-heading-lg` | 24px | 36px | 1.2 | Subsection |
| `--text-heading-md` | 20px | 28px | 1.3 | Card titles |
| `--text-heading-sm` | 18px | 22px | 1.3 | Minor headings |
| `--text-body-lg` | 18px | 20px | 1.6 | Lead paragraphs |
| `--text-body-md` | 16px | 16px | 1.6 | Default body |
| `--text-body-sm` | 14px | 14px | 1.5 | Captions |
| `--text-label` | 12px | 12px | 1.4 | Overlines, badges |

#### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight icon gaps |
| `--space-2` | 8px | Inline gaps |
| `--space-3` | 12px | Form padding |
| `--space-4` | 16px | Component padding |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Group spacing |
| `--space-12` | 48px | Mobile section |
| `--space-16` | 64px | Tablet section |
| `--space-20` | 80px | Desktop compact |
| `--space-24` | 96px | Desktop standard |

#### Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Hover color |
| `--duration-fast` | 150ms | Button state |
| `--duration-normal` | 250ms | Card transitions |
| `--duration-slow` | 400ms | Section reveals |
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | General |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Entering |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exiting |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful |

#### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 10 | Dropdowns |
| `--z-sticky` | 20 | Sticky headers |
| `--z-overlay` | 30 | Overlays |
| `--z-modal` | 40 | Modal dialogs |
| `--z-toast` | 50 | Toasts |
| `--z-system` | 100 | System UI |

---

## Component Library (43 Components)

### Component Quick Reference

| Component | CSS Class | Variants | Sizes |
|-----------|-----------|----------|-------|
| Button | `.btn` | primary, secondary, ghost, gradient, destructive, icon-only | sm, md, lg, xl |
| Navigation Bar | `.navbar` | standard, minimal, dark, transparent | desktop, mobile |
| Hero Section | `.hero` | centered, product-screenshot, video-bg, gradient-mesh, search-forward, split | full, compact |
| Feature Card | `.card` | icon-top, image-top, horizontal, stat-card, dashboard-preview | sm, md, lg |
| Pricing Table | `.pricing` | 2-column, 3-column, 4-column, toggle | standard, compact |
| Social Proof | `.social-proof` | logo-strip, stats-counter, testimonial-mini, combined | standard, compact |
| Testimonial | `.testimonial` | quote-card, video, metric, carousel | sm, md, lg |
| Footer | `.footer` | simple, multi-column, newsletter, mega-footer | standard, compact |
| Code Block | `.code-block` | syntax-highlighted, terminal, multi-tab | sm, md, lg |
| Modal | `.modal` | confirmation, task, alert | sm, md, lg |
| Form Input | `.input` | text, email, password, number, search, textarea | sm, md, lg |
| Select | `.select` | native, custom | sm, md, lg |
| Checkbox | `.checkbox` | standard, indeterminate | md |
| Radio | `.radio` | standard, card | md |
| Toggle Switch | `.toggle` | standard, with-label | md |
| Alert | `.alert` | success, warning, error, info | sm, md, lg |
| Badge | `.badge` | status, count, tag | sm, md |
| Tabs | `.tabs` | line, pill, segmented | sm, md, lg |
| Accordion | `.accordion` | single, multi, flush | standard |
| Breadcrumb | `.breadcrumb` | standard, truncated | standard |
| Tooltip | `.tooltip` | simple, rich | sm, md |
| Dropdown Menu | `.dropdown` | action, context, nav-sub | sm, md, lg |
| Avatar | `.avatar` | image, initials, icon, group | xs, sm, md, lg, xl |
| Skeleton | `.skeleton` | text, card, avatar, table | sm, md, lg |
| Toast | `.toast` | success, error, warning, info, neutral | sm, md, lg |
| Pagination | `.pagination` | numbered, simple, load-more, infinite-scroll | sm, md |
| Data Table | `.data-table` | basic, sortable, selectable, expandable | compact, default, comfortable |
| Date Picker | `.date-picker` | single, range, with-time | md, lg |
| Command Palette | `.command-palette` | standard | md, lg |
| Progress Indicator | `.progress` | bar, circular, stepper | sm, md, lg |
| Side Navigation | `.side-nav` | default, collapsed, with-sections | default, collapsed |
| File Upload | `.file-upload` | dropzone, button, avatar-upload | sm, md, lg |
| Drawer | `.drawer` | left, right, top, bottom | sm, md, lg |
| Popover | `.popover` | top, bottom, left, right, auto | sm, md |
| Combobox | `.combobox` | autocomplete, multiselect, creatable | sm, md, lg |
| Alert Dialog | `.alert-dialog` | info, warning, destructive | sm, md |
| Carousel | `.carousel` | slide, fade, auto-play | sm, md, lg |
| Chip Input | `.chip-input` | single, multi, removable | sm, md, lg |
| Stepper | `.stepper` | horizontal, vertical, linear, non-linear | sm, md, lg |
| Segmented Control | `.segmented-control` | default, icon-only, icon-label | sm, md, lg |
| Toolbar | `.toolbar` | horizontal, vertical, with-overflow | sm, md, lg |
| Tree View | `.tree-view` | single-select, multi-select, checkbox | sm, md, lg |
| OTP Input | `.otp-input` | 4-digit, 6-digit, alphanumeric | md, lg |

### Component API Pattern (CVA-Style)

All components follow a Class Variance Authority (CVA) pattern:

```html
<!-- Button: variant + size -->
<button class="btn btn--primary btn--md">Get Started</button>
<button class="btn btn--secondary btn--sm">Cancel</button>
<button class="btn btn--ghost btn--lg">Learn More</button>

<!-- Alert: variant + dismissible -->
<div class="alert alert--error" role="alert">
  <span class="alert__icon">!</span>
  <div class="alert__content">
    <strong class="alert__title">Error</strong>
    <p class="alert__body">Something went wrong.</p>
  </div>
</div>

<!-- Badge: variant + size -->
<span class="badge badge--success badge--sm">Active</span>

<!-- Card: variant -->
<div class="card card--compact">
  <div class="card__header">...</div>
  <div class="card__body">...</div>
</div>

<!-- Toast: variant + position -->
<div class="toast toast--success" role="status">
  <span class="toast__icon">✓</span>
  <p class="toast__message">Saved successfully</p>
</div>
```

### Component States

All interactive components support these states:
- **Default** — Resting state
- **Hover** — Mouse over (+2% brightness, translateY(-1px))
- **Active** — Pressed (scale(0.98))
- **Focus** — Keyboard focus (2px ring, 2px offset, brand color)
- **Disabled** — Non-interactive (opacity: 0.5, cursor: not-allowed)
- **Loading** — Processing (spinner replaces content)

---

## Pattern Library (8 Patterns + 15 Landing Templates)

### Page Patterns

| Pattern | Description | Key Components |
|---------|-------------|----------------|
| Homepage | Full marketing homepage (hero-to-footer) | navigation, hero, social-proof, feature-card, testimonial, pricing-table, footer |
| Dashboard | Side nav + header + content area | side-navigation, data-table, tabs, badge, breadcrumb |
| Form | Vertical labeled inputs with validation | input, select, checkbox, radio, toggle, button, alert |
| Authentication | Centered card login/signup flow | input, button, toggle, modal |
| Settings | Sidebar sub-nav + form content | toggle, input, select, button, alert, tabs |
| Empty State | Centered illustration + action CTA | button, avatar, badge |
| Pricing Page | Pricing tiers + comparison + FAQ | pricing-table, button, toggle, accordion |
| Blog Layout | Narrow content + optional sidebar | navigation, breadcrumb, footer |

### Homepage Section Order (Proven by 100-site analysis)

1. **Navigation** — Sticky, 64px, logo + links + CTA
2. **Hero** — 85vh, headline + subheadline + CTA(s) + visual
3. **Social Proof** — Logo strip or stat counters
4. **Feature Grid** — 3-4 column cards, scroll-revealed
5. **Product Showcase** — Screenshot or interactive demo
6. **How It Works** — 3-step horizontal flow
7. **Testimonials** — Carousel or grid
8. **Pricing** — 3-tier comparison
9. **CTA Section** — Dark/brand block + centered headline + button
10. **Footer** — Multi-column links + newsletter

### Responsive Grid System

```
Desktop (≥1280px):  12-column grid, 24px gutter, 1280px max
Laptop  (≥1024px):  12-column grid, 20px gutter, 100% width
Tablet  (≥768px):   8-column grid, 16px gutter, 100% width
Mobile  (<768px):   4-column grid, 16px gutter, 100% width
```

---

## Industry Anti-Patterns

### Finance / Banking
- **CRITICAL:** No playful animations — erodes trust
- **CRITICAL:** No neon colors — signals unprofessionalism
- **HIGH:** No dark themes for traditional banking
- **HIGH:** No experimental layouts — confuses high-stakes tasks
- **HIGH:** No casual typography — use professional sans or serif

### Healthcare
- **CRITICAL:** No aggressive red/orange colors — causes anxiety
- **HIGH:** No dark themes — feels clinical and unwelcoming
- **HIGH:** No complex animations — can disorient patients
- **CRITICAL:** No small text — accessibility is paramount

### Education / Kids
- **CRITICAL (kids):** No small text — children need large legible text
- **CRITICAL (kids):** No dark themes — inappropriate for children
- **CRITICAL (kids):** No complex navigation — children need simple paths
- **MODERATE:** No angular sharp designs — feel cold for learning

### Government
- **CRITICAL:** No trendy designs — prioritize accessibility over trends
- **CRITICAL:** Target WCAG AAA for maximum accessibility
- **HIGH:** No neon colors or playful animations

### Luxury
- **CRITICAL:** No busy layouts — destroy sense of exclusivity
- **CRITICAL:** No discount badges — destroy luxury brand perception
- **HIGH:** No bright gradients — feel cheap and commercial

### Fashion
- **HIGH:** No corporate styling — kills fashion brand identity
- **MODERATE:** No pastel colors or rounded corners
- **HIGH:** No data-dense layouts — lead with imagery

---

## Platform-Specific Guidance

### React

```jsx
// Theme switching with React context
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('minimal-saas');

  const switchTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Button component with CVA
function Button({ variant = 'primary', size = 'md', children, ...props }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Vue

```vue
<script setup>
import { ref, onMounted } from 'vue'

const theme = ref('minimal-saas')

function switchTheme(newTheme) {
  document.documentElement.setAttribute('data-theme', newTheme)
  theme.value = newTheme
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})
</script>

<template>
  <button :class="`btn btn--${variant} btn--${size}`">
    <slot />
  </button>
</template>
```

### Svelte

```svelte
<script>
  export let variant = 'primary';
  export let size = 'md';

  import { onMount } from 'svelte';
  let theme = 'minimal-saas';

  onMount(() => {
    document.documentElement.setAttribute('data-theme', theme);
  });

  function switchTheme(newTheme) {
    document.documentElement.setAttribute('data-theme', newTheme);
    theme = newTheme;
  }
</script>

<button class="btn btn--{variant} btn--{size}">
  <slot />
</button>
```

### SwiftUI (Token Reference)

```swift
struct DesignTokens {
    struct Color {
        static let brandPrimary = Color(hex: "#2563EB") // minimal-saas
        static let bgPrimary = Color(hex: "#FFFFFF")
        static let textPrimary = Color(hex: "#111827")
    }

    struct Spacing {
        static let space1: CGFloat = 4
        static let space2: CGFloat = 8
        static let space4: CGFloat = 16
        static let space6: CGFloat = 24
        static let space8: CGFloat = 32
    }

    struct Radius {
        static let sm: CGFloat = 6
        static let md: CGFloat = 8
        static let lg: CGFloat = 12
        static let xl: CGFloat = 16
    }
}
```

### Flutter (Token Reference)

```dart
class DesignTokens {
  static const brandPrimary = Color(0xFF2563EB);
  static const bgPrimary = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF111827);

  static const space1 = 4.0;
  static const space2 = 8.0;
  static const space4 = 16.0;
  static const space6 = 24.0;

  static const radiusSm = 6.0;
  static const radiusMd = 8.0;
  static const radiusLg = 12.0;
}
```

### Tailwind CSS Integration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          accent: 'var(--color-brand-accent)',
          muted: 'var(--color-brand-muted)',
        },
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
}
```

---

## Motion Choreography

### 13 Motion Presets

#### Enter Presets
| Preset | CSS | Duration | Easing |
|--------|-----|----------|--------|
| fade-in | `opacity: 0 → 1` | 250ms | ease-out |
| slide-up | `translateY(24px) → 0` | 400ms | ease-out |
| scale-in | `scale(0.95) → 1` + opacity | 250ms | ease-out |
| expand | `max-height: 0 → auto` | 400ms | ease-default |

#### Exit Presets
| Preset | CSS | Duration | Easing |
|--------|-----|----------|--------|
| fade-out | `opacity: 1 → 0` | 200ms | ease-in |
| slide-down | `translateY(0) → 24px` | 200ms | ease-in |
| scale-out | `scale(1) → 0.95` + opacity | 200ms | ease-in |

#### Stagger Presets
| Preset | Delay | Max Items |
|--------|-------|-----------|
| children-fast | 40ms per child | 6 |
| children-normal | 60ms per child | 6 |
| grid | 80ms per child | 12 |

#### Interaction Presets
| Preset | CSS | Duration |
|--------|-----|----------|
| hover-lift | `translateY(-2px)` + shadow-md | 150ms |
| press-down | `scale(0.98)` | 100ms |
| focus-ring | `box-shadow: 0 0 0 3px brand-15%` | 150ms |

### Reduced Motion

All motion must respect `prefers-reduced-motion: reduce`:
- Replace all transitions with `opacity: 0 → 1` (instant)
- Remove all transform animations
- Keep `transition: opacity 0ms`

---

## Accessibility Requirements

### WCAG 2.2 AA Checklist

- [ ] Text contrast ≥ 4.5:1 against backgrounds
- [ ] UI component contrast ≥ 3:1 (borders, buttons, inputs)
- [ ] Focus indicators: 2px solid ring, 2px offset, visible on all themes
- [ ] Keyboard navigation: full tab order, Enter/Space activation, Escape dismiss
- [ ] Screen reader labels: aria-label on icon buttons, alt on images
- [ ] Reduced motion: `@media (prefers-reduced-motion: reduce)` disables animations
- [ ] Touch targets: minimum 44x44px on mobile
- [ ] Color independence: never convey information by color alone
- [ ] Semantic HTML: `<main>`, `<nav>`, `<section>`, `<footer>`
- [ ] Skip navigation link as first focusable element
- [ ] Heading hierarchy: h1 > h2 > h3 (no skipped levels)
- [ ] Focus Not Obscured (SC 2.4.11): focused elements not hidden by sticky/fixed elements
- [ ] Dragging Movements (SC 2.5.7): single-pointer alternative for all drag operations
- [ ] Target Size Minimum (SC 2.5.8): interactive targets at least 24×24 CSS pixels

### Automated WCAG Audit

Run the contrast audit across all 18 palette × mode combinations:
```bash
python scripts/wcag-audit.py
```
Result: 108/108 checks pass (100% compliance).

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

## File Reference

### Databases (src/data/)
| File | Rows | Description |
|------|------|-------------|
| products.csv | 165 | Product categories with design prescriptions |
| styles.csv | 60 | UI styles mapped to palettes |
| colors.csv | 165 | Industry color palettes with hex values |
| typography.csv | 75 | Font pairings with mood and usage |
| ui-reasoning.csv | 165 | Conditional design rules |
| ux-guidelines.csv | 80 | UX best practices by category |
| components.csv | 43 | Component specs from SPECIFICATION.md |
| patterns.csv | 15 | UI patterns and page templates |
| landing.csv | 25 | Landing page templates |
| charts.csv | 25 | Chart type recommendations |
| icons.csv | 105+ | Icon library references |
| anti-patterns.csv | 55 | Industry-specific design mistakes |
| google-fonts.csv | 50+ | Curated Google Fonts catalog |
| app-interface.csv | 30 | Mobile app interface patterns |
| react-performance.csv | 44 | React performance best practices |
| stacks/react-native.csv | 50 | React Native component patterns |

### Scripts (src/scripts/)
| File | Description |
|------|-------------|
| core.py | BM25 search engine + domain detector + reasoning engine |
| search.py | CLI search interface |
| design_system.py | Full design system generator (Markdown, JSON, Tailwind, React/Vue/Svelte) |

### Tokens
| File | Description |
|------|-------------|
| tokens/design-tokens.json | W3C DTCG format (source of truth, 600 tokens) |
| tokens/figma-tokens.json | Figma Tokens Studio compatible |

### Validation
| File | Description |
|------|-------------|
| scripts/validate-tokens.py | Token format and cross-file sync validator |
| scripts/wcag-audit.py | Automated WCAG contrast checker (108 checks) |
| scripts/verify-docs.py | HTML docs integrity checker |
| src/data/_sync_all.py | CSV cross-reference validator |

---

## Example Queries

### "Build a fintech dashboard"
- **Sector:** finance → **Palette:** corporate
- **Product:** dashboard → **Components:** data-table, tabs, badge, side-navigation, pagination, toast
- **Anti-patterns:** No playful animations, no neon colors, no dark themes
- **Typography:** Inter/Inter (clean-professional) or Manrope/Inter (geometric-modern)
- **Layout:** sidebar-content pattern, dense layout, collapse-sidebar mobile

### "Design a kids education app"
- **Sector:** education → **Palette:** illustration
- **Product:** mobile-app → **Components:** button, avatar, progress-indicator, badge, tabs, modal
- **Anti-patterns:** No small text, no dark themes, no complex navigation, no angular designs
- **Typography:** Nunito/Inter (soft-approachable) or Poppins/Inter (rounded-friendly)
- **Layout:** simple navigation, large touch targets, playful rounded corners

### "Create a SaaS landing page"
- **Sector:** saas → **Palette:** gradient-startup (marketing surface)
- **Product:** landing-page → **Components:** hero, navigation, feature-card, social-proof, pricing-table, footer
- **Pattern:** Homepage pattern (hero → social-proof → features → pricing → CTA → footer)
- **Typography:** DM Sans/Inter (modern-friendly) or Plus Jakarta Sans/Inter (contemporary-rounded)
- **Motion:** scroll-reveal, staggered children, hover-lift

### "Design a luxury brand website"
- **Sector:** luxury → **Palette:** apple-minimal
- **Anti-patterns:** No busy layouts, no discount badges, no bright gradients, no playful elements
- **Typography:** Playfair Display/Inter (elegant-dramatic) or DM Serif Display/DM Sans (contrast-elegant)
- **Layout:** spacious, generous whitespace, minimal elements per viewport

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

## Token Format (W3C DTCG)

Tokens follow the [W3C Design Token Community Group](https://design-tokens.github.io/community-group/format/) specification:

```json
{
  "color": {
    "brand-primary": {
      "$value": "#2563EB",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

Build for all platforms:
```bash
npx style-dictionary build --config style-dictionary.config.json
```

Output formats: CSS custom properties, JavaScript constants, iOS Swift, Android Kotlin.

---

## Search Engine Usage

### CLI Search
```bash
python src/scripts/search.py "saas dashboard"
python src/scripts/search.py "fintech mobile app" --verbose
python src/scripts/search.py "kids education" --json
```

### Design System Generator
```bash
python src/scripts/design_system.py "fintech dashboard"
python src/scripts/design_system.py "luxury brand website" --format json
```

### CSV Data Validation
```bash
python src/data/_sync_all.py
```

---

## Color Palette Details

### Minimal SaaS
- Brand: `#2563EB` (blue)
- Background: `#FFFFFF` / `#FAFAFA`
- Text: `#111827`
- Style: Restrained, no gradients, minimal shadow

### AI Futuristic
- Brand: `#00FF88` (neon green) + `#00D4FF` (cyan)
- Background: `#0A0A0F` (near-black)
- Text: `#E0E0EE`
- Style: Rich gradients, glow effects, neon accents
- Shadows: Glow-border technique (white rim + dark shadow)

### Gradient Startup
- Brand: `#7C3AED` (violet) + `#EC4899` (pink)
- Background: `#FFFFFF`
- Gradient Hero: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Style: Bold gradients, animated backgrounds, bold CTAs

### Corporate
- Brand: `#1A365D` (navy)
- Background: `#FFFFFF` / `#F7F8FA`
- Text: `#1A202C`
- Style: Conservative, squared corners, no gradients

### Apple Minimal
- Brand: `#0071E3` (Apple blue)
- Background: `#FFFFFF` / `#FBFBFD` / `#F5F5F7`
- Text: `#1D1D1F`
- Style: Smooth, refined, diffused shadows

### Illustration
- Brand: `#E8590C` (burnt orange) + `#7048E8` (purple)
- Background: `#FFFFFF` / `#FFF8F0`
- Text: `#1A1523`
- Style: Friendly, rounded, warm tones

### Dashboard
- Brand: `#4F46E5` (indigo) + `#0EA5E9` (sky)
- Chart colors: 8-color distinguishable scale
- Style: Compact, data-dense, chart-optimized

### Bold Lifestyle
- Brand: `#111111` (black) + `#FF4500` (red-orange)
- Background: `#FFFFFF`
- Text: `#111111`
- Style: Brutalist, 0px radius, no decorative shadows

### Minimal Corporate
- Brand: `#B45309` (warm stone)
- Background: `#FDFCFB` / `#F7F5F2`
- Text: `#1C1917`
- Style: Subtle, understated, serif display font

---

## UX Guidelines Quick Reference

### Navigation
- Limit primary nav to 5-7 items
- Place primary CTA in top-right
- Use sticky nav on long-scroll pages
- Use breadcrumbs for 3+ level hierarchies

### Forms
- Validate on blur first, then on change
- Labels above inputs (not inline)
- Single-column layout
- Scroll to first error on submit

### Buttons
- Minimum 44x44px touch targets
- Use verbs for labels ("Save Changes" not "Changes")
- Primary on right, secondary on left
- Limit to 2 visible actions per context

### Feedback
- Toast for non-critical success (auto-dismiss 5s)
- Inline alerts for errors requiring action
- Skeleton screens over spinners for loading
- Max 3 concurrent toasts

### Dark Mode
- Override shadows with glow-border technique
- Use elevated surface colors for depth
- Ensure glow-borders are visible on near-black backgrounds

### Performance
- Sub-2.5s LCP target
- Lazy-load below-fold images
- Limit to 2 Google Fonts
- Inline critical CSS

---

*Built by analyzing 100 modern websites into one universal system.*
*Version 0.4.0 | MIT License | 20 AI Platform Support*

---

## APG Pattern Reference

Every component maps to a WAI-ARIA APG pattern. See `src/data/apg-patterns.csv` for keyboard interactions, required ARIA attributes, and focus management specs.

### Coverage

All 43 components are mapped to their closest official WAI-ARIA Authoring Practices Guide (APG) pattern from https://www.w3.org/WAI/ARIA/apg/patterns/

### CSV Columns

| Column | Description |
|--------|-------------|
| `component_slug` | Matches slug in `components.csv` (cross-referenced by `_sync_all.py`) |
| `apg_pattern` | Official WAI-ARIA APG pattern name |
| `apg_url` | Direct URL to the APG pattern documentation |
| `keyboard_interactions` | Required keyboard behavior (Enter, Space, Arrow keys, Escape, Tab) |
| `required_aria` | ARIA roles and attributes that must be present |
| `optional_aria` | Additional ARIA attributes for enhanced accessibility |
| `focus_management` | How focus should move when the component opens, closes, or changes state |
| `live_region` | Whether and how live region announcements should be made (no / polite / assertive) |

### Key Patterns by Component Type

| Pattern | Components |
|---------|-----------|
| Button | button |
| Dialog (Modal) | modal, date-picker |
| Tabs | tabs |
| Accordion | accordion |
| Tooltip | tooltip |
| Disclosure Navigation | navigation, dropdown, side-nav |
| Listbox | select |
| Combobox | command-palette |
| Checkbox | checkbox |
| Radio Group | radio |
| Switch | toggle |
| Alert / Status | alert, toast |
| Carousel | testimonial |
| Table | pricing-table, data-table |
| Progressbar | progress-indicator |
| Textbox | input |
| Breadcrumb | breadcrumb |
| Landmark Regions | hero, footer, social-proof |

---

### RTL & Logical Properties
Use logical CSS properties (margin-inline-start, padding-block-end) instead of physical (margin-left, padding-bottom). See `src/data/localization.csv` for the full physical→logical mapping. Use `rtl_mapper.py` to automatically convert.
