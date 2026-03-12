# Basic HTML Example

A self-contained HTML page demonstrating the Universal Design System's
token architecture, BEM component naming, palette switching, and dark mode.

## Usage

Open `index.html` in any browser. No build step, no dependencies, no server required.

## What it demonstrates

- **CSS custom property tokens** -- all styling uses `var(--token-name)`, never hardcoded values
- **Foundation tokens** -- locked typography (Inter), spacing (4px grid), motion, and z-index
- **Palette tokens** -- color, shadow, border-radius, and display font vary per theme
- **4 palettes** -- Minimal SaaS (default), Corporate, AI Futuristic, Illustration
- **Dark mode** -- toggle via `.docs-dark` class on `<html>`, each palette has dark overrides
- **BEM components**:
  - `.uds-btn` with `--primary`, `--secondary`, `--ghost` variants
  - `.uds-card` with `__header` and `__content` elements
  - `.uds-input` with associated label and hint text
  - `.uds-badge` with `--default`, `--success`, `--warning` variants
- **Accessible animations** -- all transitions wrapped in `prefers-reduced-motion`
- **Responsive layout** -- adapts to mobile viewports

## Palette switching

Use the dropdown in the toolbar or call from the console:

```js
document.documentElement.setAttribute('data-theme', 'corporate');
```

## Dark mode

Toggle the switch in the toolbar or call:

```js
document.documentElement.classList.toggle('docs-dark');
```
