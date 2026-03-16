# Design System: Fintech Dashboard

**Palette:** Dashboard (`data-theme="dashboard"`)
**Sector:** dashboard
**Product Type:** dashboard

## Color Tokens

```css
:root[data-theme="dashboard"] {
  --color-bg-inverse: #0F1117;
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F7F8FC;
  --color-bg-tertiary: #EEF0F8;
  --color-border-default: #C5CAD4;
  --color-border-input: #8B92A0;
  --color-border-subtle: #E5E8F0;
  --color-brand-accent: #06B6D4;
  --color-brand-muted: #EEF2FF;
  --color-brand-primary: #4F46E5;
  --color-brand-primary-rgb: 79, 70, 229;
  --color-brand-secondary: #0EA5E9;
  --color-text-on-brand: #FFFFFF;
  --color-text-primary: #0F1117;
  --color-text-secondary: #525866;
  --color-text-tertiary: #6E7585;
}
```

## Components

| Component | Category | Variants |
|-----------|----------|----------|
| Side Navigation | navigation | default;collapsed;with-sections |
| Feature Card | content | icon-top;image-top;horizontal;stat-card;dashboard-preview |

## Patterns

### Dashboard
Side navigation plus header bar plus content area for data-rich apps

## Typography

| Heading Font | Body Font | Mood |
|-------------|-----------|------|
| Instrument Sans | Inter | precision-clean |
| Instrument Sans | Inter | refined-minimal |
| Urbanist | Inter | sharp-modern |

## Anti-Patterns (Avoid)

- **[HIGH] playful-animations**: Animations distract from data comprehension in dashboards
  - *Instead:* Use instant transitions or subtle fades only
- **[MODERATE] bright-gradients**: Gradients interfere with data visualization readability
  - *Instead:* Use flat solid colors for chart elements
- **[MODERATE] casual-typography**: Casual fonts reduce data credibility in analytical contexts
  - *Instead:* Use tabular figures and professional sans-serif

## Design Rules Applied

- Dashboards need compact data-dense optimized layouts
- Dashboards need core data display and navigation components
- Dashboard products need dashboard and settings patterns
- Dashboards prioritize information density
- Dashboards use sidebar plus content area layout
- Dashboard sidebars collapse to icons then off-canvas on mobile
- Dashboards should minimize animation to avoid distraction
- Dashboards use 16px line icons for density

## UX Guidelines

- Offer compact normal and comfortable density modes for dashboards
  - *Rationale:* Power users prefer dense views. New users prefer comfortable spacing.
- Use side navigation for apps with 5+ pages
  - *Rationale:* Side nav scales better than top nav for deep page hierarchies.
- Show loading skeletons that match table layout
  - *Rationale:* Table skeletons set expectations for data structure and prevent layout shift.
- Collapse complex filters into a filter sheet on mobile
  - *Rationale:* Filter panels don't fit mobile layouts — use expandable sheets.
- Use breadcrumbs for hierarchies deeper than 2 levels
  - *Rationale:* Users need wayfinding in deep hierarchies to avoid feeling lost.

## Pre-delivery Checklist

- [ ] Limit primary navigation to 5-7 items
- [ ] Make mobile hamburger menu accessible via ARIA
- [ ] Make primary CTAs visually dominant over secondary
- [ ] Minimum touch target 44x44px on mobile
- [ ] Never convey information by color alone
- [ ] Provide text alternatives for all non-text content
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Use ARIA labels for icon-only buttons
- [ ] Maintain visible focus indicators on all focusable elements
- [ ] Ensure 4.5:1 contrast ratio for body text
- [ ] Light mode: text contrast 4.5:1 minimum (WCAG 1.4.3).
- [ ] Focus states visible for keyboard navigation (WCAG 2.4.7).
- [ ] Respect prefers-reduced-motion for animations.
- [ ] Use UDS tokens only (no hardcoded colors/spacing).
- [ ] Set data-theme on <html> for palette application.

## Quick Start

```html
<html lang="en" data-theme="dashboard">
```

Switch themes at runtime:
```js
document.documentElement.setAttribute('data-theme', 'dashboard');
```