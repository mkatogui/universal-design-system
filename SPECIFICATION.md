# Universal Design System Specification — v0.8.0

**Version:** 0.8.0 (March 2026)
**Architecture:** One governed brand system with 9 structural palettes (color + shape + display font), 2 appearance modes (light/dark), CVA-style variant contracts, motion choreography, and automated WCAG auditing.
**Purpose:** A single-foundation design system where body typography, spacing, and motion are fixed governance decisions. Color, shadow, border radius, and display font change per palette. Spacing, motion, z-index, body font, and opacity remain foundation-locked.
**Source of truth:** `design-tokens.json` (W3C Design Token Community Group format)
**Changelog:** v0.1.0 → v0.2.0: Fixed 7 critical WCAG issues, added form/alert components, 3-tier token architecture, theme-aware dark shadows, semantic HTML reference.
v0.2.0 → v0.3.0: Added 4 missing themes (all 9 style categories now covered), 10 new components (26 total), Storybook-style interactive docs, Shadcn-style component library, Figma token export, dark mode for all 9 themes.
v0.4.0 → v0.5.0: 5 new components (31 total), 5 new patterns (8 total), motion behavior guidelines, Do/Don't patterns, token JSON sync (42 tokens added).
v0.5.0 → v0.6.0: **Architectural restructuring** — themes become color palettes only; fonts/radii/spacing/motion locked to foundation; dark mode folded into palette system; removed reference-list framing; added layout foundation.
v0.6.0 → v0.7.0: **Structural palette identity** — palettes now override `--radius-*`, `--shadow-*`, and `--font-display` in addition to color. Each palette has a distinct shape identity. Dark mode rewritten to use CSS variables. All component CSS uses `var()` for border-radius. Google Fonts loaded for DM Sans, Oswald, Source Serif 4. Single-default palette governance per context.
v0.7.0 → v0.8.0: **State-of-the-art upgrade** — (1) Motion choreography specification with enter/exit/stagger/interaction presets, (2) Automated WCAG 2.1 AA contrast audit across all 18 palette×mode combos (100% pass rate, 62 checks), (3) CVA-style component variant API contracts for 9 components, (4) Interactive component sandbox with live prop controls, (5) design-tokens.json and figma-tokens.json synced with structural palette overrides, (6) a11y-audit.json artifact for CI integration.
v0.3.0 → v0.4.0: Getting Started guide, WCAG 2.2 AA compliance, DTCG token aliases, $type annotations, OKLCH colors, Style Dictionary pipeline, component usage guidance, interactive prop playground, docs search, framework tabs.

---

## 0. Getting Started

### 0.1 Quick Install

**Option A — CDN (fastest start):**
```html
<link rel="stylesheet" href="design-system/tokens/colors.css">
<link rel="stylesheet" href="design-system/tokens/typography.css">
<link rel="stylesheet" href="design-system/tokens/spacing.css">
<link rel="stylesheet" href="design-system/tokens/shadows.css">
<link rel="stylesheet" href="design-system/tokens/motion.css">
<link rel="stylesheet" href="design-system/tokens/themes/minimal-saas.css">
```

**Option B — NPM package:**
```bash
npm install @org/design-system-tokens
```
```js
import '@org/design-system-tokens/css/minimal-saas.css';
```

**Option C — JSON tokens + Style Dictionary:**
```bash
npx style-dictionary build --config style-dictionary.config.json
```

### 0.2 5-Minute Quickstart

1. **Add the token CSS** to your HTML `<head>` (see 0.1 above).
2. **Pick a theme** by setting `data-theme` on `<html>`:
   ```html
   <html lang="en" data-theme="minimal-saas">
   ```
3. **Use a component** — copy from the Component Library:
   ```html
   <button class="btn btn--primary btn--md">Get Started</button>
   ```
4. **Switch themes** at any time by changing the `data-theme` attribute. All tokens cascade automatically.

### 0.3 For Designers

1. Import `figma-tokens.json` into Tokens Studio (Figma plugin).
2. Select a theme token set (e.g., `theme/minimal-saas`) to apply.
3. Use the 9 theme modes to preview designs across all visual styles.
4. Refer to `Design_System_Docs.html` for live component previews and do/don't guidance.

### 0.4 For Developers

1. Install tokens via NPM or CDN (Section 0.1).
2. Copy component CSS + HTML from `Component_Library.html`.
3. Components use CSS custom properties — they adapt to any theme automatically.
4. Run `npx style-dictionary build` to generate platform-specific outputs (CSS, JS, iOS, Android).
5. Refer to the **Component API** section (Section 3) for props, states, and accessibility requirements.

### 0.5 Choosing a Palette

| Context | Default Palette | Rationale |
|---------|-----------------|-----------|
| Product UI (SaaS, apps) | Minimal SaaS | Highest readability, neutral brand, conversion-optimized |
| Marketing site | Gradient Startup | High visual energy for acquisition; default for all marketing surfaces |
| Internal dashboards | Dashboard | Chart-friendly 8-color scale |
| Developer tools / docs | AI Futuristic | Dark-native, low eye strain |
| Enterprise / regulated | Corporate | Conservative, stakeholder-safe |

**Rule:** Each product or surface selects exactly one palette — the default listed above. If no context matches, default to **Minimal SaaS**.

**Exceptions:** To use a non-default palette, file a design-system exception request with: (1) the surface name, (2) the requested palette, (3) rationale, and (4) sign-off from the design-system owner. Approved exceptions are logged in the governance registry.

---

## 1. Design Principles

1. **Clarity first** — Every element earns its space. Remove before you add.
2. **Systematic flexibility** — One token architecture, many visual expressions (themes).
3. **Motion with intent** — Animation serves comprehension, not decoration.
4. **Accessible by default** — WCAG 2.2 AA minimum. Color contrast, keyboard nav, screen readers.
5. **Performance as a feature** — Sub-2.5s LCP. Every byte justified.

---

## 2. Design Tokens

### 2.1 Color Tokens

#### Neutral Scale

| Token | Light Value | Dark Value | Usage |
|-------|------------|------------|-------|
| `--color-bg-primary` | `#FFFFFF` | `#0A0A0F` | Page background |
| `--color-bg-secondary` | `#F8F8FA` | `#111118` | Section alternation |
| `--color-bg-tertiary` | `#F0F0F5` | `#1A1A24` | Cards, elevated surfaces |
| `--color-bg-inverse` | `#111118` | `#FFFFFF` | Inverted sections |
| `--color-text-primary` | `#111118` | `#F0F0F5` | Headlines, body text |
| `--color-text-secondary` | `#555566` | `#9999AA` | Descriptions, captions |
| `--color-text-tertiary` | `#6B6B7B` | `#7A7A8C` | Placeholders, disabled (FIXED: passes 4.5:1) |
| `--color-text-on-brand` | `#FFFFFF` | `#0A0A0F` | Text on brand-colored backgrounds |
| `--color-border-default` | `#C8C8D4` | `#2A2A36` | Card borders, dividers (FIXED: improved contrast) |
| `--color-border-input` | `#8E8E9E` | `#4A4A58` | Form control borders (NEW: 3.22:1 passes SC 1.4.11) |
| `--color-border-subtle` | `#E8E8F0` | `#1E1E28` | Subtle separators |

#### Brand Color Scale (per-theme override)

| Token | Default | Gradient Startup | AI Futuristic | Corporate |
|-------|---------|-----------------|---------------|-----------|
| `--color-brand-primary` | `#2563EB` | `#7C3AED` | `#00FF88` | `#1A365D` |
| `--color-brand-primary-rgb` | `37, 99, 235` | `124, 58, 237` | `0, 255, 136` | `26, 54, 93` |
| `--color-brand-secondary` | `#3B82F6` | `#EC4899` | `#00D4FF` | `#2B6CB0` |
| `--color-brand-accent` | `#60A5FA` | `#F59E0B` | `#8B5CF6` | `#4299E1` |
| `--color-brand-muted` | `#DBEAFE` | `#F3E8FF` | `#0A2A1A` | `#EBF4FF` |

#### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#10B981` | Positive actions, confirmations |
| `--color-warning` | `#F59E0B` | Caution states |
| `--color-error` | `#EF4444` | Error states, destructive actions |
| `--color-info` | `#3B82F6` | Informational highlights |

#### Gradient Tokens (Gradient Startup / AI Futuristic themes)

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-hero` | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | Hero backgrounds |
| `--gradient-mesh` | `radial-gradient(at 40% 20%, #667eea 0%, transparent 50%), radial-gradient(at 80% 80%, #764ba2 0%, transparent 50%)` | Mesh backgrounds |
| `--gradient-cta` | `linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))` | Gradient buttons |
| ~~`--gradient-glow`~~ | REMOVED — was a box-shadow, not a gradient. Use `--shadow-glow` instead. |

### 2.2 Typography Tokens

#### Font Families

| Token | Value | Fallback | Usage |
|-------|-------|----------|-------|
| `--font-sans` | `Inter` | `system-ui, -apple-system, sans-serif` | Body text, UI elements |
| `--font-display` | `Inter` (weight 600-800) | `system-ui, sans-serif` | Headlines, hero text |
| `--font-mono` | `JetBrains Mono` | `Menlo, Consolas, monospace` | Code blocks, technical |
| `--font-serif` | `Source Serif 4` | `Georgia, serif` | Editorial callouts, blockquotes |

**Governance note:** Font families are foundation-locked and never change per palette. All palettes use the same type stack.

#### Type Scale (fluid, using clamp)

| Token | Mobile | Desktop | Line Height | Letter Spacing | Usage |
|-------|--------|---------|-------------|----------------|-------|
| `--text-display-xl` | 40px | 72px | 1.05 | -0.02em | Hero headline (Apple/AI style) |
| `--text-display-lg` | 36px | 60px | 1.1 | -0.02em | Primary page headline |
| `--text-display-md` | 30px | 48px | 1.15 | -0.01em | Section headlines |
| `--text-heading-lg` | 24px | 36px | 1.2 | -0.01em | Subsection headlines |
| `--text-heading-md` | 20px | 28px | 1.3 | 0 | Card titles, feature names |
| `--text-heading-sm` | 18px | 22px | 1.3 | 0 | Minor headings |
| `--text-body-lg` | 18px | 20px | 1.6 | 0 | Lead paragraphs |
| `--text-body-md` | 16px | 16px | 1.6 | 0 | Default body text |
| `--text-body-sm` | 14px | 14px | 1.5 | 0 | Captions, metadata |
| `--text-label` | 12px | 12px | 1.4 | 0.05em | Overlines, badges, tags |

#### CSS Implementation

```css
--text-display-xl: clamp(2.5rem, 5vw + 1rem, 4.5rem);
--text-display-lg: clamp(2.25rem, 4vw + 1rem, 3.75rem);
--text-display-md: clamp(1.875rem, 3vw + 0.75rem, 3rem);
--text-heading-lg: clamp(1.5rem, 2vw + 0.5rem, 2.25rem);
--text-heading-md: clamp(1.25rem, 1.5vw + 0.5rem, 1.75rem);
```

#### Font Weight Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-regular` | 400 | Body text |
| `--font-weight-medium` | 500 | UI labels, nav items |
| `--font-weight-semibold` | 600 | Subheadings, card titles |
| `--font-weight-bold` | 700 | Section headings |
| `--font-weight-extrabold` | 800 | Hero headlines, display text |

### 2.3 Spacing Tokens

#### Base Scale (4px grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight icon gaps |
| `--space-2` | 8px | Inline element gaps, small padding |
| `--space-3` | 12px | Form field padding, compact cards |
| `--space-4` | 16px | Default component padding |
| `--space-5` | 20px | Card padding, list item spacing |
| `--space-6` | 24px | Section inner padding |
| `--space-8` | 32px | Component group spacing |
| `--space-10` | 40px | Section subgroup spacing |
| `--space-12` | 48px | Mobile section padding |
| `--space-16` | 64px | Tablet section padding |
| `--space-20` | 80px | Desktop section spacing (compact) |
| `--space-24` | 96px | Desktop section spacing (standard) |
| `--space-32` | 128px | Desktop section spacing (generous) |

#### Layout-Specific Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--container-max` | 1280px | Max content width (standard) |
| `--container-narrow` | 768px | Blog/article content width |
| `--container-wide` | 1440px | Dashboard/wide layouts |
| `--container-padding` | clamp(16px, 5vw, 80px) | Responsive edge padding |
| `--section-gap` | clamp(48px, 8vw, 128px) | Vertical space between sections |

### 2.4 Border & Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small inputs, tags, badges |
| `--radius-md` | 8px | Buttons, cards (standard) |
| `--radius-lg` | 12px | Modal dialogs, feature cards |
| `--radius-xl` | 16px | Hero cards, large surfaces |
| `--radius-2xl` | 24px | Pill buttons, search bars |
| `--radius-full` | 9999px | Avatars, circular buttons |
| `--border-width` | 1px | Default border |
| `--border-color` | var(--color-border-default) | Default border color |

### 2.5 Shadow / Elevation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift (inputs) |
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Cards at rest |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | Elevated cards, dropdowns |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)` | Modals, popovers |
| `--shadow-xl` | `0 24px 64px rgba(0,0,0,0.16)` | Hero product screenshots |
| `--shadow-glow` | `0 0 40px rgba(var(--color-brand-primary-rgb), 0.2)` | AI Futuristic glow (FIXED: uses --color-brand-primary-rgb token) |

**Dark mode shadow overrides (AI Futuristic):**
Dark themes must override shadows with glow-border variants, since `rgba(0,0,0,...)` shadows are invisible on near-black backgrounds:

| Token | Dark Mode Value | Technique |
|-------|----------------|-----------|
| `--shadow-sm` | `0 0 1px rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.4)` | White glow-border + shadow |
| `--shadow-md` | `0 0 1px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.5)` | White glow-border + shadow |
| `--shadow-lg` | `0 0 1px rgba(255,255,255,0.1), 0 12px 40px rgba(0,0,0,0.6)` | White glow-border + shadow |

### 2.6 Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Hover color changes |
| `--duration-fast` | 150ms | Button state changes |
| `--duration-normal` | 250ms | Card transitions, fades |
| `--duration-slow` | 400ms | Page section reveals |
| `--duration-slower` | 600ms | Entrance animations |
| `--duration-slowest` | 1000ms | Hero load animations |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bouncy feel |


#### Motion Behavior Guidelines

**Interaction triggers and recommended durations:**

| Interaction | Duration | Easing | Example |
|---|---|---|---|
| Hover state change | `--duration-fast` (150ms) | `ease-default` | Button color, link underline |
| Focus ring appear | `--duration-fast` (150ms) | `ease-out` | Input focus, button focus |
| Dropdown open | `--duration-normal` (200ms) | `ease-out` | Menu reveal, select expand |
| Dropdown close | `--duration-fast` (150ms) | `ease-in` | Menu hide |
| Modal enter | `--duration-slow` (400ms) | `ease-out` | Scale 0.95→1 + fade in |
| Modal exit | `--duration-normal` (200ms) | `ease-in` | Fade out |
| Toast enter | `--duration-slow` (400ms) | `ease-bounce` | Slide up from bottom-right |
| Toast exit | `--duration-normal` (200ms) | `ease-in` | Fade out + slide down |
| Accordion expand | `--duration-slow` (400ms) | `ease-default` | Height auto transition |
| Page transition | `--duration-slower` (600ms) | `ease-default` | Cross-fade between views |
| Skeleton shimmer | 1.5s | `linear` | Continuous gradient sweep |

**Motion principles:**
1. **Enter slower, exit faster** — Users need time to see what appeared, but exits can be quick
2. **Nearby = fast, distant = slow** — Hover states are fast; modals arriving from off-screen are slow
3. **Match physicality** — `ease-bounce` for playful elements (toasts), `ease-default` for standard UI
4. **Respect user preferences** — All motion wrapped in `@media (prefers-reduced-motion: no-preference)`

**Reduced motion fallback:** Replace all transitions with instant opacity changes (0→1 for enter, 1→0 for exit). Remove all transform animations. Keep `transition: opacity 0ms`.

### 2.7 Breakpoint Tokens

| Token | Value | Description |
|-------|-------|-------------|
| `--bp-sm` | 640px | Mobile landscape |
| `--bp-md` | 768px | Tablet portrait |
| `--bp-lg` | 1024px | Tablet landscape / small desktop |
| `--bp-xl` | 1280px | Standard desktop |
| `--bp-2xl` | 1536px | Wide desktop |

> **Note:** CSS custom properties cannot be used inside `@media` rules. These tokens are documentation-only. Use PostCSS `@custom-media`, Sass variables, or Tailwind config for functional breakpoints.

### 2.8 Opacity Tokens (NEW)

| Token | Value | Usage |
|-------|-------|-------|
| `--opacity-disabled` | 0.5 | Disabled buttons, inputs |
| `--opacity-muted` | 0.6 | Logo bars, secondary visuals |
| `--opacity-subtle` | 0.4 | Background decorations |

### 2.9 Z-Index Tokens (NEW)

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 10 | Dropdown menus, select lists |
| `--z-sticky` | 20 | Sticky headers, sidebars |
| `--z-overlay` | 30 | Overlays, backdrops |
| `--z-modal` | 40 | Modal dialogs |
| `--z-toast` | 50 | Toast notifications |
| `--z-system` | 100 | System-level UI (dev tools bar) |

### 2.10 Icon Size Tokens (NEW)

| Token | Value | Usage |
|-------|-------|-------|
| `--icon-sm` | 16px | Inline icons, badges |
| `--icon-md` | 20px | Button icons, nav icons |
| `--icon-lg` | 24px | Feature card icons |
| `--icon-xl` | 32px | Hero icons, empty states |

Recommended icon library: Lucide (MIT license, tree-shakeable, 1000+ icons). Icons inherit `currentColor` by default.

---

## 3. Component Library

### 3.1 Button

> **When to use:** Primary actions (submit, save, confirm), secondary actions (cancel, learn more), navigation CTAs. Use for any clickable action that isn't a link to another page.
> **When not to use:** Navigation between pages (use links instead). Don't use ghost buttons for primary actions — users may miss them.

**Variants:** Primary, Secondary, Ghost, Gradient, Destructive, Icon-only

| Prop | Options | Default |
|------|---------|---------|
| `variant` | primary, secondary, ghost, gradient, destructive | primary |
| `size` | sm (36px visual/44px touch), md (44px), lg (48px), xl (56px) | md |
| `fullWidth` | boolean | false |
| `iconLeft` | element | — |
| `iconRight` | element | — |
| `loading` | boolean | false |
| `disabled` | boolean | false |

**States:** Default, Hover (+2% brightness, translate-y -1px, shadow-sm), Active (scale 0.98), Focus (2px ring offset), Disabled (opacity 0.5, cursor not-allowed), Loading (spinner replaces content)

**Specs (size md — FIXED: now 44px for WCAG touch targets):**
- Height: 44px
- Padding: 0 20px
- Border-radius: var(--radius-md)
- Font: var(--font-sans), var(--font-weight-medium), 14px
- Transition: all var(--duration-fast) var(--ease-default)

### 3.2 Navigation Bar

> **When to use:** Top-level site navigation on every page. Use the sticky variant for long-scroll pages, transparent for hero-heavy landing pages.
> **When not to use:** In-app navigation within a dashboard (use a sidebar instead). Don't use mega-menu on mobile.

**Variants:** Standard, Minimal, Dark, Transparent-to-solid

| Prop | Options | Default |
|------|---------|---------|
| `variant` | standard, minimal, dark, transparent | standard |
| `sticky` | boolean | true |
| `blurOnScroll` | boolean | true |
| `megaMenu` | boolean | false |
| `darkModeToggle` | boolean | false |
| `ctaButton` | element | — |

**Specs:**
- Height: 64px (desktop), 56px (mobile)
- Background: var(--color-bg-primary) with backdrop-filter: blur(12px) and 85% opacity on scroll
- Border-bottom: 1px solid var(--color-border-subtle)
- z-index: 50
- Max content width: var(--container-max) centered
- Logo area: left-aligned, 120-160px width
- Nav items: center-aligned, gap 32px, font-weight 500, 14px
- CTA: right-aligned

### 3.3 Hero Section

> **When to use:** Landing pages, marketing pages, product launch pages. Use as the first section below the nav to establish the page's value proposition.
> **When not to use:** Interior pages (about, blog post, documentation). Don't use on dashboard or settings pages.

**Variants:** Centered text, Product screenshot, Video background, Gradient mesh, Search-forward, Split (text + image)

**Common specs:**
- Min-height: 85vh (desktop), auto (mobile)
- Padding: var(--section-gap) var(--container-padding)
- Headline: var(--text-display-lg) or var(--text-display-xl), max-width 800px centered
- Subheadline: var(--text-body-lg), var(--color-text-secondary), max-width 600px
- CTA group: gap 12px, margin-top 32px
- Social proof: margin-top 48px, grayscale logos, 32px logo height

### 3.4 Feature Card

> **When to use:** Showcasing product features, benefits, or capabilities in a grid. Use icon-top for features, image-top for visual products, stat-card for metrics.
> **When not to use:** Long-form content (use prose sections). Don't use more than 6 cards in a single grid — it overwhelms users.

**Variants:** Icon-top, Image-top, Horizontal, Stat-card, Dashboard-preview

**Specs (standard icon-top):**
- Padding: 32px
- Border-radius: var(--radius-lg)
- Background: var(--color-bg-tertiary)
- Border: 1px solid var(--color-border-default)
- Icon: 40x40px, var(--color-brand-primary), margin-bottom 16px
- Title: var(--text-heading-md), var(--font-weight-semibold), margin-bottom 8px
- Description: var(--text-body-md), var(--color-text-secondary)
- Hover: translate-y -2px, shadow-md, transition var(--duration-normal)

### 3.5 Pricing Table

> **When to use:** SaaS pricing pages with 2-4 tiers. Use the toggle variant for monthly/annual pricing. Always highlight the recommended tier.
> **When not to use:** Enterprise-only products with custom pricing (use a CTA section instead). Don't use for feature comparison — use a comparison table.

**Variants:** 2-column, 3-column (recommended highlighted), 4-column, Toggle (monthly/annual)

**Specs (3-column):**
- Grid: 3 columns, gap 24px, max-width 1120px centered
- Card padding: 40px
- Recommended card: border 2px solid var(--color-brand-primary), shadow-lg, optional "Popular" badge
- Plan name: var(--text-heading-sm), var(--font-weight-semibold)
- Price: var(--text-display-md), var(--font-weight-extrabold)
- Period: var(--text-body-sm), var(--color-text-secondary)
- Feature list: checkmark icon + text, gap 12px, var(--text-body-sm)
- CTA: full-width button at bottom, margin-top 32px

### 3.6 Social Proof Bar

> **When to use:** Below the hero section to build trust. Use logo strips for B2B, stat counters for consumer products, testimonial minis for services.
> **When not to use:** If you have fewer than 4 recognizable logos. Don't mix logo sizes — normalize to a consistent height.

**Variants:** Logo strip (grayscale), Stats counter, Testimonial mini, Combined

**Specs (logo strip):**
- Layout: flex row, justify-center, align-center, gap 40-64px
- Logo height: 24-32px, grayscale filter, opacity 0.6
- Hover: full color, opacity 1 (transition var(--duration-normal))
- Responsive: horizontal scroll on mobile, or 2-row grid
- Optional: "Trusted by" overline label, var(--text-label), uppercase

### 3.7 Testimonial Card

> **When to use:** Building trust with user quotes, case study highlights, or video testimonials. Use in a grid (3 cards) or carousel for more than 4.
> **When not to use:** If quotes are generic or unverifiable. Don't use without real names/photos — anonymous quotes erode trust.

**Variants:** Quote card, Video testimonial, Metric testimonial, Carousel

**Specs (quote card):**
- Padding: 32px
- Border-radius: var(--radius-lg)
- Background: var(--color-bg-tertiary)
- Quote: var(--text-body-lg), italic, var(--color-text-primary)
- Avatar: 48x48px, border-radius full
- Name: var(--text-body-md), var(--font-weight-semibold)
- Title + Company: var(--text-body-sm), var(--color-text-secondary)
- Optional star rating: 5 stars, 16px, var(--color-warning)

### 3.8 Footer

> **When to use:** Every page. Use multi-column for marketing sites, simple for apps, mega-footer for large sites with deep navigation.
> **When not to use:** Full-screen modals or overlays. Don't hide critical legal links (privacy, terms) in collapsed sections on mobile.

**Variants:** Simple, Multi-column, Newsletter-integrated, Mega-footer

**Specs (multi-column):**
- Background: var(--color-bg-inverse) or var(--color-bg-secondary)
- Padding: 80px var(--container-padding) 40px
- Grid: 4-5 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Column title: var(--text-label), uppercase, var(--color-text-secondary), margin-bottom 16px
- Link items: var(--text-body-sm), var(--color-text-secondary), hover color-text-primary
- Bottom bar: border-top, padding-top 24px, copyright + legal links
- Newsletter CTA: email input + button, max-width 400px

### 3.9 Code Block (Developer/AI themes)

> **When to use:** Displaying code snippets, terminal commands, API responses, or configuration files. Use syntax highlighting for readability.
> **When not to use:** Short inline code (use `<code>` inline instead). Don't use for non-code content like log output — use a monospace pre block without syntax highlighting.

**Specs:**
- Background: #1E1E2E (dark) or #F5F5FA (light)
- Border-radius: var(--radius-lg)
- Padding: 24px
- Font: var(--font-mono), 14px, line-height 1.6
- Syntax highlighting: keyword (#C678DD), string (#98C379), comment (#5C6370), function (#61AFEF)
- Header: language tag + copy button, border-bottom 1px
- Optional: line numbers, tab switcher for multiple languages
- Scroll: horizontal overflow for long lines

### 3.10 Modal / Dialog

> **When to use:** Confirmations (delete, submit), focused tasks (edit profile), critical alerts requiring acknowledgment. Use when the action needs user attention before continuing.
> **When not to use:** Displaying long content (use a page instead). Don't stack modals. Don't use for non-blocking notifications (use Toast instead).

**Specs:**
- Backdrop: rgba(0,0,0,0.5), backdrop-filter blur(4px)
- Container: max-width 560px, padding 32px, border-radius var(--radius-xl)
- Entrance: scale(0.95) + opacity 0 → scale(1) + opacity 1, var(--duration-normal), var(--ease-out)
- Close button: top-right, 32x32px, icon-only ghost button
- Focus trap: keyboard tab cycles within modal
- Dismiss: Escape key, backdrop click, close button

### 3.11 Form Input (NEW)

> **When to use:** Any text entry — names, emails, passwords, searches, numbers. Use the appropriate `type` attribute for mobile keyboard optimization.
> **When not to use:** Selecting from a predefined list (use Select or Radio). Don't use textarea for single-line inputs.

**Variants:** Text, Email, Password, Number, Search; use `multiline` for textarea.

| Prop | Options | Default |
|------|---------|---------|
| `type` | text, email, password, number, search | text |
| `multiline` | boolean (when true, renders `<textarea>`) | false |
| `size` | sm (36px), md (44px), lg (52px) | md |
| `state` | default, focus, error, disabled, readonly | default |
| `label` | string | — |
| `helperText` | string | — |
| `errorText` | string | — |
| `required` | boolean | false |

**Specs (size md):**
- Height: 44px (textarea: auto, min-height 100px)
- Padding: 0 12px
- Border: 1px solid var(--color-border-input) (WCAG 3:1)
- Border-radius: var(--radius-md)
- Font: var(--font-sans), 16px
- Focus: border-color var(--color-brand-primary), box-shadow 0 0 0 3px rgba(var(--color-brand-primary-rgb), 0.15)
- Error: border-color var(--color-error)
- Disabled: opacity var(--opacity-disabled), cursor not-allowed
- Label: font-size var(--text-body-sm), font-weight 500, margin-bottom 4px
- Helper text: font-size var(--text-body-sm), color var(--color-text-tertiary)
- Error text: font-size var(--text-body-sm), color var(--color-error), role="alert"

**Accessibility:** Labels must use `for`/`id` association. Error inputs need `aria-invalid="true"` and `aria-describedby` linking to error message.

### 3.12 Select (NEW)

> **When to use:** Choosing one option from 5-15 predefined choices. Use native `<select>` for maximum accessibility and mobile optimization.
> **When not to use:** Fewer than 5 options (use Radio buttons instead). More than 15 options (use a Combobox/Autocomplete). Don't use for multi-select — use checkboxes.

Same sizing and states as Form Input. Uses native `<select>` element for maximum accessibility.

### 3.13 Checkbox & Radio (NEW)

> **When to use:** Checkboxes for multi-select (agree to terms, select features). Radios for single-select from 2-5 visible options.
> **When not to use:** More than 7 options (use Select or Combobox). Don't use checkboxes for binary toggles — use Toggle Switch instead.

- Size: 20x20px (within 44px touch target via padding)
- accent-color: var(--color-brand-primary)
- Labels: inline, clickable, font-size var(--text-body-md)
- Focus: 2px ring, 2px offset

### 3.14 Toggle Switch (NEW)

> **When to use:** Binary on/off settings that take effect immediately (dark mode, notifications, feature flags). The visual metaphor is a light switch.
> **When not to use:** Form fields that require a submit action (use Checkbox instead). Don't use for selecting between two unrelated options.

- Track: 48x28px, var(--color-border-default) off, var(--color-brand-primary) on
- Thumb: 22x22px, white, border-radius full
- Animation: thumb slides 20px on toggle, var(--duration-fast)
- Focus: 2px ring on track

### 3.15 Alert (NEW)

> **When to use:** Persistent, contextual messages within a page section — validation summaries, system status, important notices. Alerts stay visible until dismissed or resolved.
> **When not to use:** Transient feedback (use Toast instead). Don't use for success messages after form submission — use Toast. Don't use more than 2 alerts on a single page.

**Variants:** Success, Warning, Error, Info

| Prop | Options | Default |
|------|---------|---------|
| `variant` | success, warning, error, info | info |
| `title` | string | — |
| `dismissible` | boolean | false |

**Specs:**
- Padding: 16px
- Border-radius: var(--radius-md)
- Border-left: 4px solid [semantic color]
- Background: [semantic color]-bg token
- Icon: 24px, flex-shrink 0
- Title: font-weight 600, margin-bottom 4px
- Body: font-size var(--text-body-sm)
- role="alert" for error/warning, role="status" for success/info

### 3.16 Badge (NEW)

> **When to use:** Status indicators (active, pending, error), counts (notifications, unread), and categorization tags. Keep text under 2 words.
> **When not to use:** Long labels or descriptions (use text instead). Don't use more than 3 badge colors on a single view — it creates visual noise.

**Variants:** Status (dot + label), Count (number), Tag (removable)

**Specs:**
- Padding: 2px 10px
- Border-radius: var(--radius-full)
- Font: var(--text-label), font-weight 600
- Sizes: sm (20px height), md (24px height)
- Colors: brand, success, warning, error, neutral

### 3.17 Tabs (NEW)

> **When to use:** Switching between 2-6 related content panels without page navigation. Use Line tabs for content areas, Pill tabs for filters, Segmented for view toggles.
> **When not to use:** More than 6 tabs (use a dropdown or sidebar navigation). Don't use for sequential steps (use a Stepper). Don't use when all content should be visible at once (use sections).

**Variants:** Line (underline indicator), Pill (filled bg), Segmented (contained group)
- Container: `role="tablist"`, height 44px, border-bottom 1px solid var(--color-border-default)
- Active tab: border-bottom 2px solid var(--color-brand-primary), font-weight 600
- Keyboard: ArrowLeft/Right to move, Enter/Space to select, Home/End for first/last
- Panel: `role="tabpanel"`, linked via `aria-labelledby`/`aria-controls`

### 3.18 Accordion (NEW)

> **When to use:** FAQ pages, settings panels, or long forms where sections can be collapsed. Use Single mode for FAQs, Multi mode for settings.
> **When not to use:** Content that users need to compare across sections (use Tabs or visible sections). Don't hide critical information in collapsed panels — users may not expand them.

**Variants:** Single (one open), Multi (multiple open), Flush (no borders)
- Trigger: height 52px, chevron rotates 180° on expand, `aria-expanded` + `aria-controls`
- Content: overflow hidden, smooth max-height transition
- Keyboard: Enter/Space toggles, ArrowUp/Down between triggers

### 3.19 Breadcrumb (NEW)

> **When to use:** Hierarchical navigation with 3+ levels (e.g., Home > Products > Category > Item). Place below the navigation bar.
> **When not to use:** Flat site structures with only 1-2 levels. Don't use as the only navigation — always pair with primary nav.

- Container: `<nav aria-label="Breadcrumb">`, `<ol>`, separator "/" or chevron (`aria-hidden`)
- Current item: `aria-current="page"`, font-weight 500
- Truncation: 5+ items → first + "..." + last 2

### 3.20 Tooltip (NEW)

> **When to use:** Brief supplementary information on hover/focus — icon explanations, truncated text previews, abbreviation definitions. Keep under 80 characters.
> **When not to use:** Essential information users must see (use inline text or Alert). Don't use on mobile-primary interfaces — tooltips require hover. Don't put interactive content (links, buttons) inside tooltips.

**Variants:** Simple (text), Rich (title + body)
- Background: var(--color-bg-inverse), padding 6px 12px, radius var(--radius-sm), z-index var(--z-tooltip)
- ARIA: `role="tooltip"`, trigger has `aria-describedby`, show on hover + focus

### 3.21 Dropdown Menu (NEW)

> **When to use:** Action menus (more options), context menus, or navigation submenus. Use when there are 3+ actions that don't all fit as visible buttons.
> **When not to use:** Form field selection (use Select instead). Don't nest dropdowns more than 1 level deep.

- Trigger: `aria-haspopup="menu"`, `aria-expanded`
- Panel: `role="menu"`, shadow var(--shadow-lg), padding 4px
- Items: `role="menuitem"`, height 36px, keyboard nav (ArrowUp/Down, Enter, Escape, typeahead)

### 3.22 Avatar (NEW)

> **When to use:** User profile images, team member lists, comment authors, activity feeds. Use the group variant for collaboration indicators.
> **When not to use:** Decorative images (use `<img>` directly). Don't use avatars smaller than 24px — initials become unreadable.

**Sizes:** xs (24px), sm (32px), md (40px), lg (48px), xl (64px)
- Fallback chain: Image → Initials → Icon
- Status dot: 8-12px, bottom-right, border 2px solid var(--color-bg-primary)
- Group: overlap -8px, "+N" count at end

### 3.23 Skeleton / Loading (NEW)

> **When to use:** Content placeholders while data is loading. Use skeleton shapes that match the layout of the content being loaded (text lines, card shapes, avatar circles).
> **When not to use:** Button loading states (use a spinner inside the button). Don't use for errors or empty states — use appropriate empty state or error patterns.

- Shimmer: linear-gradient sweep animation 1.5s infinite
- `aria-busy="true"` on container, `aria-hidden="true"` on skeleton elements
- `prefers-reduced-motion`: static bg, no animation

### 3.24 Toast / Snackbar (NEW)

> **When to use:** Transient feedback after user actions — "Saved successfully", "Email sent", "Item deleted (undo)". Auto-dismisses after 5 seconds.
> **When not to use:** Persistent messages that require action (use Alert). Don't use for errors that need user correction — use inline validation. Don't show more than 3 toasts simultaneously.

**Variants:** Success, Error, Warning, Info, Neutral
- Fixed position, z-index var(--z-toast), min 320px / max 420px
- border-left 4px semantic color, shadow var(--shadow-lg)
- Auto-dismiss 5s (pauses on hover), max 3 visible, stacking
- `role="alert"` (error/warning), `role="status"` (success/info)

### 3.25 Pagination (NEW)

> **When to use:** Navigating through large datasets (tables, search results, product listings). Use Numbered for known total pages, Simple for API-paginated data, Load More for feeds.
> **When not to use:** Short lists under 20 items (show all). Don't use Infinite Scroll for content users may want to bookmark or share at a specific page.

**Variants:** Numbered, Simple (prev/next), Load More, Infinite Scroll
- `<nav aria-label="Pagination">`, 36px square buttons
- Truncation: 1 ... 4 5 6 ... 20, `aria-current="page"` on active
- Mobile: collapse to prev/next + "Page X of Y"

### 3.26 Data Table (NEW)

> **When to use:** Displaying structured data with multiple columns that users need to scan, sort, filter, or act on. Use for admin panels, dashboards, reports.
> **When not to use:** Simple lists or card-based content (use a list or card grid). Don't use on mobile for tables with more than 4 columns — use a responsive card layout instead.

**Variants:** Basic, Sortable, Selectable, Expandable
- Density: compact (36px), default (48px), comfortable (56px)
- Sticky header, striped rows, hover rows, sort icons with `aria-sort`
- Selected row: `rgba(var(--color-brand-primary-rgb), 0.08)` background

---

### 3.27 Date Picker (NEW)

> **When to use:** Selecting a single date or date range for forms, filters, scheduling. Use for booking flows, report date ranges, task due dates.
> **When not to use:** Selecting only a time (use a time input). Selecting from a small fixed set of date options (use a Select with pre-built options like "Last 7 days").

**Variants:** Single date, Date range, With time
- Calendar grid: 7 columns (Sun–Sat), 6 rows max
- Cell size: 40px × 40px (meets 44px touch target with 2px gap)
- Today: `--color-brand-muted` background, `--color-brand-primary` text
- Selected: `--color-brand-primary` background, `--color-text-on-brand` text
- Range: selected endpoints solid, range fill `rgba(var(--color-brand-primary-rgb), 0.1)`
- Disabled dates: `opacity: var(--opacity-disabled)`, `cursor: not-allowed`
- Navigation: `<` / `>` buttons for month, month/year dropdown for quick jumps
- Keyboard: Arrow keys navigate grid, Enter selects, Escape closes
- ARIA: `role="grid"` on calendar, `role="gridcell"` per date, `aria-selected`, `aria-disabled`
- Props: `min`, `max`, `disabledDates`, `locale`, `firstDayOfWeek`

---

### 3.28 Command Palette (NEW)

> **When to use:** Power-user keyboard navigation for large apps. Quick search across actions, pages, settings. Use in SaaS dashboards, developer tools, admin panels.
> **When not to use:** Simple apps with few pages (use standard navigation). Mobile-only interfaces (command palettes are keyboard-centric).

**Trigger:** `⌘K` / `Ctrl+K`
- Overlay modal with search input auto-focused
- Fuzzy search across actions, pages, recent items
- Result groups: "Recent", "Pages", "Actions", "Settings"
- Each result: icon + label + optional shortcut badge + optional description
- Keyboard: `↑`/`↓` navigate, `Enter` executes, `Escape` closes, `Tab` cycles groups
- Input: full-width, no border, large font (`--text-heading-sm`)
- Result highlight: `--color-bg-tertiary` background
- Max results visible: 8 (scroll for more)
- Backdrop: `--color-overlay` with `z-index: var(--z-modal)`
- ARIA: `role="combobox"` on input, `role="listbox"` on results, `aria-activedescendant`
- Props: `actions[]`, `onSelect`, `placeholder`, `groups[]`, `recentLimit`

---

### 3.29 Progress Indicator (NEW)

> **When to use:** Showing completion status for multi-step flows, uploads, loading states. Use for onboarding wizards, file uploads, checkout flows.
> **When not to use:** Indeterminate loading with no progress info (use Skeleton or a spinner). Very short operations under 1 second (no indicator needed).

**Variants:** Bar, Circular, Stepper
- **Bar:** Height 4px (sm), 8px (md). Track: `--color-bg-tertiary`. Fill: `--color-brand-primary`. Animated fill with `transition: width var(--duration-slow) var(--ease-default)`
- **Circular:** 48px (md), 64px (lg). SVG circle with `stroke-dasharray`/`stroke-dashoffset`. Center text shows percentage.
- **Stepper:** Horizontal numbered steps connected by lines. States: completed (checkmark + brand color), active (brand ring), upcoming (muted). Responsive: stacks vertical on mobile.
- Indeterminate mode: animated gradient sweep (bar) or rotating arc (circular)
- ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label`
- Props: `value`, `max`, `variant`, `size`, `indeterminate`, `label`, `showValue`

---

### 3.30 Side Navigation (NEW)

> **When to use:** Primary navigation for dashboard-style apps with deep page hierarchies. Use for admin panels, settings pages, documentation sites.
> **When not to use:** Marketing/landing pages (use top NavBar). Apps with fewer than 5 pages (use tabs or top nav).

**Variants:** Default (icon + label), Collapsed (icon-only), With sections
- Width: `--layout-sidebar-default` (240px), collapsed: `--layout-sidebar-collapsed` (64px)
- Item height: 40px, padding: 8px 16px, gap between items: 2px
- States: default (`--color-text-secondary`), hover (`--color-bg-tertiary` + `--color-text-primary`), active (`--color-brand-muted` background + `--color-brand-primary` text + 2px left border)
- Section headers: `--text-label`, uppercase, `--color-text-tertiary`, 24px top margin
- Nested items: 12px additional left padding per level, max 3 levels
- Collapse toggle: chevron button at bottom, smooth width transition (`--duration-slow`)
- Tooltip on collapsed items: shows label on hover
- ARIA: `<nav aria-label="Main navigation">`, `aria-current="page"` on active item, `aria-expanded` on collapsible sections
- Props: `items[]`, `collapsed`, `onNavigate`, `activeItem`, `sections[]`

---

### 3.31 File Upload (NEW)

> **When to use:** Uploading files from the user's device. Use for profile photos, document attachments, bulk imports.
> **When not to use:** Selecting from already-uploaded files (use a file picker/browser). Text-only input (use a textarea).

**Variants:** Dropzone, Button, Avatar upload
- **Dropzone:** Dashed border (`2px dashed --color-border-default`), 120px min-height, centered icon + text. Drag-over state: `--color-brand-muted` background, `--color-brand-primary` dashed border, `--shadow-glow`
- **Button:** Styled like `btn--secondary`, opens native file picker on click
- **Avatar upload:** Circular preview with overlay "Change" on hover
- File list: filename, size, type icon, progress bar, remove button
- Validation: `accept` attribute for file types, `maxSize` prop, inline error via `--color-error`
- States: idle, drag-over, uploading (progress bar), success (checkmark), error (error message)
- Keyboard: `Enter`/`Space` on dropzone opens file picker, `Delete` removes file from queue
- ARIA: `<input type="file">` with `aria-label`, drag zone uses `role="button"`, status messages via `aria-live="polite"`
- Props: `accept`, `maxSize`, `maxFiles`, `multiple`, `onUpload`, `onRemove`, `variant`

---

## 4. Patterns & Page Templates

### 4.1 Homepage Pattern

**Section order (observed across 100 sites):**

1. **Navigation** — Sticky, 64px height, logo + links + CTA
2. **Hero** — 85vh, headline + subheadline + CTA(s) + visual, social proof below
3. **Social Proof** — Logo strip or stat counters
4. **Feature Grid** — 3-4 column cards, scroll-revealed
5. **Product Showcase** — Screenshot or interactive demo
6. **How It Works** — 3-step horizontal flow or vertical timeline
7. **Testimonials** — Carousel or grid of quote cards
8. **Pricing** — 3-tier comparison (SaaS) or CTA section (corporate)
9. **CTA Section** — Dark or brand-colored block, centered headline + button
10. **Footer** — Multi-column links + newsletter + legal

### 4.2 Responsive Grid System

```
Desktop (≥1280px):  12-column grid, 24px gutter, 1280px max-width
Laptop (≥1024px):   12-column grid, 20px gutter, 100% width
Tablet (≥768px):    8-column grid, 16px gutter, 100% width
Mobile (<768px):    4-column grid, 16px gutter, 100% width
```

Common column patterns:
- Hero: full-width or 7+5 split
- Features: 4+4+4 (3-col) or 3+3+3+3 (4-col)
- Content + sidebar: 8+4
- Testimonials: 4+4+4
- Footer: 3+3+3+3 or 2+2+2+3+3

### 4.3 Animation Patterns

**Scroll reveal (used by 78%):**
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity var(--duration-slow) var(--ease-out),
              transform var(--duration-slow) var(--ease-out);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Staggered children (used by 55%):**
Each child delays by 80-120ms. Max stagger: 5-6 items. Beyond that, animate as a group.

**Hover lift (used by 88%):**
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-default);
}
```

**Parallax (used by 30%):**
Background moves at 0.3-0.5x scroll speed. Use transform: translate3d for GPU acceleration.

---


### 4.4 Form Pattern

**Structure:** Vertical stack of labeled inputs with consistent spacing and validation.

**Layout rules:**
- Form max-width: `--layout-container-sm` (640px)
- Field spacing: `--spacing-6` (24px) between fields
- Section spacing: `--spacing-10` (40px) between field groups
- Label-to-input gap: `--spacing-1` (4px)
- Helper/error text margin-top: `--spacing-1` (4px)

**Validation behavior:**
1. Validate on blur (first interaction), then on change (subsequent)
2. Show error below the field with `role="alert"` for screen readers
3. Scroll to first error on submit with `--duration-slow` smooth scroll
4. Success states optional — only show for fields requiring server validation

**Submit area:**
- Primary button right-aligned (or full-width on mobile)
- Secondary "Cancel" button to the left of Primary
- Loading state: disable both buttons, show spinner in Primary

### 4.5 Authentication Pattern

**Pages:** Sign In, Sign Up, Forgot Password, Reset Password, Email Verification

**Layout:**
- Centered card: `max-width: 420px`, `--spacing-10` padding
- Logo + brand name at top
- Social login buttons (if applicable) above divider "or"
- Form fields below divider

**Sign In fields:** Email, Password, "Remember me" toggle, "Forgot password?" link
**Sign Up fields:** Name, Email, Password (with strength meter), Confirm password

**Security UX:**
- Password toggle visibility button (eye icon)
- Password strength: 4-segment bar (weak/fair/good/strong)
- Rate-limit feedback: "Too many attempts. Try again in 30s."
- CSRF token in hidden field

### 4.6 Dashboard Pattern

**Layout:** Side navigation + header bar + content area

**Grid:** 
- Sidebar: `--layout-sidebar-default` (240px), collapsible to `--layout-sidebar-collapsed` (64px)
- Content: `flex: 1`, max-width: `--layout-container-xl` (1280px), padding: `--spacing-8`
- Header: sticky, 64px height, contains breadcrumb + actions

**Content patterns:**
- **Stat cards row:** 4-column grid, each card shows metric + trend arrow + sparkline
- **Data table:** Full-width with filters toolbar above
- **Chart area:** 2-column grid for chart + summary panel

**Responsive:**
- `< 1024px`: Sidebar collapses to icon-only
- `< 768px`: Sidebar becomes off-canvas drawer
- `< 640px`: Stat cards stack to 2-column, then 1-column

### 4.7 Empty State Pattern

**Usage:** Shown when a section, list, or page has no data to display.

**Structure:**
- Centered vertically and horizontally in the content area
- Illustration or icon: `--icon-xl` (32px) or custom SVG, `--color-text-tertiary`
- Headline: `--text-heading-md`, `--font-weight-semibold`
- Description: `--text-body-md`, `--color-text-secondary`, max-width 360px
- Action button: Primary variant for the main CTA ("Create your first project")
- Optional secondary link below button

**Variants:**
| Context | Tone | Action |
|---|---|---|
| First-time user | Welcoming, instructional | "Get started" |
| Empty search results | Helpful, suggestive | "Clear filters" |
| Error/failure | Empathetic, actionable | "Try again" |
| No permissions | Clear, directive | "Request access" |

### 4.8 Settings Page Pattern

**Layout:** Sidebar sub-navigation + form content area

**Structure:**
- Settings nav: vertical tabs or left sidebar within the content area
- Content: single-column, max-width `--layout-container-md` (768px)
- Section headers: `--text-heading-md`, with optional description

**Section types:**
- **Toggle settings:** Label + description on left, toggle on right
- **Input settings:** Full-width input with label above
- **Destructive settings:** Red zone at bottom with warning text + destructive button

**Save behavior:**
- Option A: Auto-save with toast confirmation
- Option B: "Save changes" button (sticky at bottom of form)
- Always show unsaved changes indicator in nav

## 5. Color Palettes

### Governance Rule: What Palettes Control

**A palette changes color and shadow only.** Typography, spacing, radii, motion, z-index, opacity, and layout are foundation-level decisions that remain constant across all palettes. This is the core governance boundary of the system.

| Layer | Controlled by | Changes per palette? |
|---|---|---|
| Colors (bg, text, brand, semantic) | Palette | Yes |
| Shadows / elevation | Palette | Yes (shadow color/intensity) |
| Typography (font family, size, weight, line-height) | Foundation | No |
| Spacing | Foundation | No |
| Border radius | Foundation | No |
| Motion (duration, easing) | Foundation | No |
| Z-index | Foundation | No |
| Opacity | Foundation | No |
| Layout (breakpoints, containers) | Foundation | No |

**Each palette ships with 2 appearance modes** — light and dark — controlled by a single `data-appearance` attribute. This replaces the separate dark-mode toggle.

**Palette usage:**

| Scenario | Approach |
|---|---|
| Single product | Pick 1 palette. Ship both appearance modes. |
| White-label SaaS | Expose palette picker to customers. Foundation stays locked. |
| Agency/studio | Start from 1 palette, customize colors to client brand. |

**Adding a custom palette** requires overriding ~20 color tokens and ~4 shadow tokens. No font, radius, spacing, or motion overrides are permitted.


### 5.1 Minimal SaaS Palette

```css
:root[data-theme="minimal-saas"] {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #FAFAFA;
  --color-text-primary: #111827;
  --color-brand-primary: #2563EB;
  /* Restrained: no gradients, no glow, minimal shadow */
}
```

### 5.2 AI Futuristic Palette

```css
:root[data-theme="ai-futuristic"] {
  --color-bg-primary: #0A0A0F;
  --color-bg-secondary: #111118;
  --color-text-primary: #E0E0EE;
  --color-brand-primary: #00FF88;
  --color-brand-secondary: #00D4FF;
  --shadow-glow: 0 0 40px rgba(0, 255, 136, 0.15);
  /* Rich: gradients, glow effects, neon accents */
}
```

### 5.3 Gradient Startup Palette

```css
:root[data-theme="gradient-startup"] {
  --color-bg-primary: #FFFFFF;
  --color-brand-primary: #7C3AED; /* FIXED: was #8B5CF6 (4.23:1) → now 5.09:1 */
  --color-brand-primary-rgb: 124, 58, 237;
  --color-brand-secondary: #EC4899;
  --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-cta: linear-gradient(135deg, #8B5CF6, #EC4899);
  /* Bold: vibrant gradients, animated backgrounds, bold CTAs */
}
```

### 5.4 Corporate Enterprise Palette

```css
:root[data-theme="corporate"] {
  --color-bg-secondary: #F7F8FA;
  --color-text-primary: #1A202C;
  --color-text-secondary: #4A5568;
  --color-text-tertiary: #636B78;
  --color-brand-primary: #1A365D;
  --color-brand-primary-rgb: 26, 54, 93;
  --color-brand-secondary: #2B6CB0;
  --color-border-default: #CBD5E0;
}
```

### 5.5 Apple Minimal Palette

```css
:root[data-theme="apple-minimal"] {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #FBFBFD;
  --color-bg-tertiary: #F5F5F7;
  --color-bg-inverse: #000000;
  --color-text-primary: #1D1D1F;
  --color-text-secondary: #515154; /* Darkened for distinction */
  --color-text-tertiary: #6E6E73;
  --color-brand-primary: #0071E3;
  --color-brand-primary-rgb: 0, 113, 227;
  --color-border-default: #D2D2D7;
}
```

### 5.6 Illustration Palette


```css
:root[data-theme="illustration"] {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #FFF8F0;
  --color-bg-tertiary: #FFF0E6;
  --color-bg-inverse: #1A1523;
  --color-text-primary: #1A1523;
  --color-text-secondary: #5C5470;
  --color-text-tertiary: #7A7189;
  --color-brand-primary: #E8590C;
  --color-brand-primary-rgb: 232, 89, 12;
  --color-brand-secondary: #7048E8;
  --color-brand-accent: #12B886;
}
```

### 5.7 Dashboard Palette


```css
:root[data-theme="dashboard"] {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F7F8FC;
  --color-text-primary: #0F1117;
  --color-brand-primary: #4F46E5;
  --color-brand-secondary: #0EA5E9;
  --color-chart-1: #4F46E5; --color-chart-2: #0EA5E9;
  --color-chart-3: #10B981; --color-chart-4: #F59E0B;
  --color-chart-5: #EF4444; --color-chart-6: #8B5CF6;
  --color-chart-7: #EC4899; --color-chart-8: #06B6D4;
}
```

### 5.8 Bold Lifestyle Palette


```css
:root[data-theme="bold-lifestyle"] {
  --color-bg-primary: #FFFFFF;
  --color-text-primary: #111111;
  --color-brand-primary: #111111;
  --color-brand-secondary: #FF4500;
  --color-brand-accent: #FFD700;
}
```

### 5.9 Minimal Corporate Palette


```css
:root[data-theme="minimal-corporate"] {
  --color-bg-primary: #FDFCFB;
  --color-bg-secondary: #F7F5F2;
  --color-text-primary: #1C1917;
  --color-brand-primary: #B45309;
  --color-brand-secondary: #92400E;
}
```

All 9 palettes include light + dark appearance modes. Shadow technique varies per palette (drop shadow for light palettes, glow-border for dark palettes). See `design-tokens.json` and `figma-tokens.json` for complete token definitions.

---

## 6. Accessibility Checklist (WCAG 2.2 AA)

| Requirement | Spec | Applies To | Status |
|-------------|------|-----------|--------|
| Color contrast (text) | 4.5:1 ratio minimum (AA) | All text against backgrounds | ✅ Fixed in v0.2.0 |
| Color contrast (UI) | 3:1 ratio minimum (SC 1.4.11) | Buttons, inputs, borders | ✅ --color-border-input added |
| Focus indicators | 2px solid ring, 2px offset, visible on all themes | All interactive elements | ✅ Implemented |
| Keyboard navigation | Full tab order, Enter/Space activation, Escape dismissal | All components | ✅ Theme switcher uses arrow keys |
| Screen reader labels | aria-label on icon buttons, alt on images, sr-only text | All non-text elements | ✅ ARIA added to reference |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables animations | All animated elements | ✅ Added in v0.2.0 |
| Forced colors | `@media (forced-colors: active)` ensures visibility | All UI components | ✅ Added in v0.2.0 |
| Touch targets | Minimum 44x44px | All mobile interactive elements | ✅ btn--md now 44px |
| Color independence | Information never conveyed by color alone | Status, errors, charts | ✅ Icons + text accompany colors |
| Semantic HTML | `<main>`, `<nav>`, `<section>`, `<footer>` structure | Page structure | ✅ Reference refactored |
| Skip navigation | Skip-to-content link as first focusable element | All pages | ✅ Added in v0.2.0 |
| Heading hierarchy | h1 > h2 > h3 nesting (no skipped levels) | All pages | ✅ Fixed in reference |
| Focus Not Obscured (2.4.11) | Focused element must not be fully hidden by sticky headers, modals, or other overlays | All interactive elements | ✅ NEW v0.4.0 |
| Accessible Authentication (3.3.8) | Auth flows must support password managers and biometric alternatives; no cognitive-only tests | Login/signup forms | ✅ NEW v0.4.0 |
| Redundant Entry (3.3.7) | Don't require re-entry of previously submitted info in multi-step forms | Multi-step forms | ✅ NEW v0.4.0 |
| Focus Appearance (2.4.13) | Focus indicator must have ≥2px outline and ≥3:1 contrast against adjacent colors | All focusable elements | ✅ 2px ring + offset already compliant |

---

## 7. Token Sync Workflow

### 7.1 Architecture

```
Figma (Tokens Studio plugin)
    ↓ Push to branch
Git Repository (design-tokens.json = source of truth)
    ↓ CI/CD (GitHub Actions)
Style Dictionary transform
    ↓ Build outputs
CSS custom properties / JS constants / iOS Swift / Android Kotlin
    ↓ Published
NPM package (@org/design-system-tokens)
```

### 7.2 Sync Direction

**Git-first (recommended):** Tokens are authored and versioned in `design-tokens.json`. Designers import into Figma via Tokens Studio. Changes flow: Code PR → merge → Tokens Studio pulls from main.

**Figma-first (alternative):** Designers update tokens in Tokens Studio, push to a Git branch. Developers review the PR, merge, and CI/CD rebuilds outputs.

### 7.3 Updating Tokens

1. Edit `design-tokens.json` (or use Tokens Studio in Figma).
2. Run `npx style-dictionary build` locally to verify output.
3. Open a PR with the token changes + rebuilt CSS.
4. Merge triggers CI/CD to publish updated NPM package.
5. Consuming projects update their dependency to get new tokens.

### 7.4 Adding a New Palette

1. Add a new theme object to `design-tokens.json` under `theme.<name>`.
2. Add the theme to `figma-tokens.json` under `$metadata.tokenSetOrder` and as a new token set.
3. Add a `data-theme="<name>"` CSS block to the docs HTML.
4. Run verification script to confirm all required tokens are present.

---

## 8. File Structure

```
/design-system
  design-tokens.json          ← W3C DTCG single source of truth (NEW)
  /tokens
    colors.css
    typography.css
    spacing.css
    motion.css
    shadows.css
    opacity.css                ← NEW
    z-index.css                ← NEW
    icons.css                  ← NEW
    themes/
      minimal-saas.css
      ai-futuristic.css
      gradient-startup.css
      corporate.css
      apple-minimal.css
      illustration.css           ← NEW v0.3.0
      dashboard.css              ← NEW v0.3.0
      bold-lifestyle.css         ← NEW v0.3.0
      minimal-corporate.css      ← NEW v0.3.0
  /components
    Button/
    NavBar/
    Hero/
    FeatureCard/
    PricingTable/
    SocialProof/
    TestimonialCard/
    Footer/
    CodeBlock/
    Modal/
    FormInput/                 ← NEW
    Select/                    ← NEW
    Checkbox/                  ← NEW
    Toggle/                    ← NEW
    Alert/                     ← NEW
    Badge/                     ← NEW
    Tabs/                      ← NEW v0.3.0
    Accordion/                 ← NEW v0.3.0
    Breadcrumb/                ← NEW v0.3.0
    Tooltip/                   ← NEW v0.3.0
    DropdownMenu/              ← NEW v0.3.0
    Avatar/                    ← NEW v0.3.0
    Skeleton/                  ← NEW v0.3.0
    Toast/                     ← NEW v0.3.0
    Pagination/                ← NEW v0.3.0
    DataTable/                 ← NEW v0.3.0
  /patterns
    homepage.md
    pricing-page.md
    about-page.md
  /utils
    animations.css
    grid.css
    responsive.css
  /docs
    getting-started.md
    tokens-reference.md
    component-api.md
    theme-guide.md
    changelog.md               ← NEW
```
