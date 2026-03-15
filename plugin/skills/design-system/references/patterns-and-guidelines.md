# Patterns, Anti-Patterns & UX Guidelines

## 8 Page Patterns

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

## Homepage Section Order (Proven by 100-site analysis)

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

## Responsive Grid System

```
Desktop (≥1280px):  12-column grid, 24px gutter, 1280px max
Laptop  (≥1024px):  12-column grid, 20px gutter, 100% width
Tablet  (≥768px):   8-column grid, 16px gutter, 100% width
Mobile  (<768px):   4-column grid, 16px gutter, 100% width
```

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

## WCAG 2.2 AA Checklist

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

## RTL & Logical Properties

Use logical CSS properties (`margin-inline-start`, `padding-block-end`) instead of physical (`margin-left`, `padding-bottom`) for internationalization support.
