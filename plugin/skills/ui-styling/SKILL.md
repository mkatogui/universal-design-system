---
name: ui-styling
description: >
  This skill should be used when the user asks for "CSS help", "styling help",
  "how to style a button", "card hover effect", "dark mode CSS", "glassmorphism",
  "gradient background", "box shadow", "border radius", "responsive grid",
  "animation CSS", "focus style", "input style", "table style", "backdrop effect",
  "tailwind classes", "css custom properties", "transition", "transform",
  or needs copy-paste CSS/Tailwind snippets using design system tokens.
metadata:
  version: "0.4.2"
  author: "Marcelo Katogui"
---

# UI Styling Assistant

A focused CSS/styling helper that provides copy-paste snippets using Universal Design System tokens. Always uses `var()` custom properties, includes dark mode variants, and shows responsive breakpoints.

## Core Rule

**Never output hardcoded values.** Always reference design tokens:

```css
/* WRONG */
.card { border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

/* RIGHT */
.card { border-radius: var(--radius-md); box-shadow: var(--shadow-md); }
```

## Token Quick Reference

### Colors
```css
var(--color-brand-primary)     /* Primary brand */
var(--color-brand-secondary)   /* Secondary brand */
var(--color-text-primary)      /* Main text */
var(--color-text-secondary)    /* Muted text */
var(--color-bg-primary)        /* Page background */
var(--color-bg-secondary)      /* Card/section background */
var(--color-border-default)    /* Default borders */
var(--color-error)             /* Error state */
var(--color-success)           /* Success state */
```

### Spacing
```css
var(--space-1)   /* 4px */    var(--space-2)   /* 8px */
var(--space-3)   /* 12px */   var(--space-4)   /* 16px */
var(--space-6)   /* 24px */   var(--space-8)   /* 32px */
```

### Radius & Shadows
```css
var(--radius-sm)  var(--radius-md)  var(--radius-lg)  var(--radius-xl)
var(--shadow-sm)  var(--shadow-md)  var(--shadow-lg)
```

### Motion
```css
var(--duration-instant) /* 100ms */  var(--duration-fast) /* 150ms */
var(--duration-normal)  /* 250ms */  var(--duration-slow) /* 400ms */
var(--ease-default)  var(--ease-out)  var(--ease-in)  var(--ease-spring)
```

## Common Styling Recipes

### Card with Hover Effect
```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) var(--ease-out);
}
.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### Button States
```css
.btn {
  background: var(--color-brand-primary);
  color: var(--color-text-on-brand);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  transition: all var(--duration-fast) var(--ease-out);
  min-height: 44px;
}
.btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
.btn:active { transform: scale(0.98); }
.btn:focus-visible {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

### Input Field
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--text-body-md);
  transition: border-color var(--duration-fast) var(--ease-out);
}
.input:focus {
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand-primary) 15%, transparent);
  outline: none;
}
```

### Gradient Background
```css
.gradient-hero {
  background: linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%);
}
```

### Glassmorphism
```css
.glass {
  background: color-mix(in srgb, var(--color-bg-primary) 80%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--color-border-default) 50%, transparent);
  border-radius: var(--radius-lg);
}
```

### Dark Mode Glow Border
```css
.glow-card {
  background: var(--color-bg-secondary);
  border: 1px solid color-mix(in srgb, var(--color-brand-primary) 30%, transparent);
  border-radius: var(--radius-md);
  box-shadow:
    0 0 0 1px color-mix(in srgb, white 5%, transparent),
    0 4px 24px color-mix(in srgb, black 40%, transparent);
}
```

### Scroll Reveal Animation
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity var(--duration-slow) var(--ease-out),
              transform var(--duration-slow) var(--ease-out);
}
.reveal.visible { opacity: 1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

### Responsive Grid
```css
.grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 1fr;
}
@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
```

## Framework Output

When asked, provide the same styles as Tailwind classes, CSS Modules, or styled-components:

### Tailwind
```html
<div class="bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]
            rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]
            hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5
            transition-all duration-150 ease-out">
```

### CSS Modules
```css
.card { background: var(--color-bg-primary); border-radius: var(--radius-lg); }
```

### styled-components
```js
const Card = styled.div`
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
`;
```
