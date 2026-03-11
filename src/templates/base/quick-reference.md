# Universal Design System — Quick Reference

## Palettes

| Palette | Radius | Shadow | Display Font | Best For |
|---------|--------|--------|-------------|----------|
| minimal-saas | 8px | subtle | Inter | SaaS, productivity |
| ai-futuristic | 12px | glow | Space Grotesk | AI, dev tools |
| gradient-startup | 16px | medium | Plus Jakarta Sans | Startups, MVPs |
| corporate | 4px | subtle | Inter | Enterprise, B2B |
| apple-minimal | 12px | diffused | SF Pro Display | Premium, luxury |
| illustration | 20px | playful | Nunito | Kids, education |
| dashboard | 8px | subtle | Inter | Analytics, admin |
| bold-lifestyle | 0px | hard | Clash Display | Fashion, lifestyle |
| minimal-corporate | 6px | subtle | DM Sans | Legal, consulting |

## Type Scale (Foundation)

| Token | Size | Line Height | Weight |
|-------|------|-------------|--------|
| --font-size-xs | 0.75rem | 1rem | 400 |
| --font-size-sm | 0.875rem | 1.25rem | 400 |
| --font-size-base | 1rem | 1.5rem | 400 |
| --font-size-lg | 1.125rem | 1.75rem | 500 |
| --font-size-xl | 1.25rem | 1.75rem | 600 |
| --font-size-2xl | 1.5rem | 2rem | 600 |
| --font-size-3xl | 1.875rem | 2.25rem | 700 |
| --font-size-4xl | 2.25rem | 2.5rem | 700 |
| --font-size-5xl | 3rem | 1.1 | 800 |
| --font-size-6xl | 3.75rem | 1.1 | 800 |

## Spacing Scale (Foundation)

| Token | Value |
|-------|-------|
| --space-1 | 0.25rem |
| --space-2 | 0.5rem |
| --space-3 | 0.75rem |
| --space-4 | 1rem |
| --space-5 | 1.25rem |
| --space-6 | 1.5rem |
| --space-8 | 2rem |
| --space-10 | 2.5rem |
| --space-12 | 3rem |
| --space-16 | 4rem |
| --space-20 | 5rem |
| --space-24 | 6rem |

## Color Token Slots (Per Palette)

```
--color-primary       Main brand action color
--color-primary-hover Hover state
--color-secondary     Supporting color
--color-accent        Highlight / CTA emphasis
--color-bg            Page background
--color-surface       Card / panel background
--color-text          Primary text
--color-text-muted    Secondary text
--color-border        Default borders
--color-error         Error / destructive
--color-success       Success / confirmation
--color-warning       Warning / caution
```

## Shadow Tokens (Per Palette)

```
--shadow-sm    Subtle elevation (cards)
--shadow-md    Medium elevation (dropdowns)
--shadow-lg    High elevation (modals)
```

## Radius Tokens (Per Palette)

```
--radius-sm    Small rounding (inputs, badges)
--radius-md    Medium rounding (cards, buttons)
--radius-lg    Large rounding (modals, sections)
--radius-full  Fully round (avatars, pills)
```

## Motion Tokens (Foundation)

```
--duration-fast    150ms
--duration-normal  250ms
--duration-slow    400ms
--easing-default   cubic-bezier(0.4, 0, 0.2, 1)
--easing-in        cubic-bezier(0.4, 0, 1, 1)
--easing-out       cubic-bezier(0, 0, 0.2, 1)
--easing-bounce    cubic-bezier(0.34, 1.56, 0.64, 1)
```

## Z-Index Scale (Foundation)

```
--zIndex-dropdown    1000
--zIndex-sticky      1020
--zIndex-fixed       1030
--zIndex-backdrop    1040
--zIndex-modal       1050
--zIndex-popover     1060
--zIndex-tooltip     1070
--zIndex-toast       1080
```

## Breakpoints

```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

## Component Quick Ref

| Component | CSS Class | Key Variants |
|-----------|-----------|-------------|
| Button | .uds-btn | primary, secondary, ghost, danger + sm/md/lg |
| Input | .uds-input | text, email, password, search + sm/md/lg |
| Card | .uds-card | elevated, outlined, flat + sm/md/lg |
| Modal | .uds-modal | sm, md, lg, fullscreen |
| Alert | .uds-alert | info, success, warning, error |
| Badge | .uds-badge | solid, outline, subtle + sm/md/lg |
| Avatar | .uds-avatar | sm, md, lg, xl |
| Table | .uds-table | default, striped, compact |
| Tabs | .uds-tabs | underline, pill, boxed |
| Toast | .uds-toast | info, success, warning, error |
| Tooltip | .uds-tooltip | top, right, bottom, left |
| Toggle | .uds-toggle | sm, md, lg |
| Select | .uds-select | single, multi, searchable |
| Navbar | .uds-navbar | sticky, transparent, solid |
| Sidebar | .uds-sidebar | expanded, collapsed, overlay |

## WCAG 2.1 AA Requirements

- Body text contrast: >= 4.5:1
- Large text contrast: >= 3:1
- Focus indicator: 2px solid with 3:1 contrast
- Touch targets: >= 44x44px
- Motion: respect `prefers-reduced-motion`
- Labels: all inputs have associated labels
- Alt text: all images have alt attributes
- Keyboard: full keyboard navigation support
