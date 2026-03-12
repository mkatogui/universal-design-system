# Universal Design System -- Token Consumption Contract

> Defines how consumers should reference design tokens, the current naming convention,
> and the planned migration path to `--uds-*` prefixed output.

## 1. Current Naming Convention

All tokens are exposed as CSS custom properties (CSS variables) on the `:root` or `[data-theme]` selector. The current naming convention uses category-based prefixes:

| Prefix | Category | Examples |
|---|---|---|
| `--color-*` | Brand, text, background, border, status colors | `--color-brand-primary`, `--color-text-secondary`, `--color-bg-primary` |
| `--space-*` | Spacing scale (4px base grid) | `--space-1` (4px), `--space-4` (16px), `--space-8` (32px) |
| `--font-size-*` | Typography size scale | `--font-size-sm`, `--font-size-base`, `--font-size-2xl` |
| `--radius-*` | Border radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full` |
| `--shadow-*` | Elevation shadows | `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| `--motion-*` | Duration and easing | `--motion-duration-fast`, `--motion-easing-default` |
| `--opacity-*` | Opacity levels | `--opacity-disabled`, `--opacity-muted`, `--opacity-overlay` |
| `--z-index-*` | Z-index layering | `--z-index-dropdown`, `--z-index-modal`, `--z-index-toast` |

### 1.1 Color Token Naming Pattern

```css
/* Brand */
--color-brand-primary
--color-brand-secondary
--color-brand-accent
--color-brand-muted

/* Text */
--color-text-primary
--color-text-secondary
--color-text-tertiary
--color-text-on-brand

/* Background */
--color-bg-primary
--color-bg-secondary
--color-bg-tertiary
--color-bg-inverse

/* Border */
--color-border-default
--color-border-input
--color-border-subtle

/* Status */
--color-success
--color-warning
--color-error
--color-info
```

### 1.2 Spacing Token Values

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
```

## 2. Consumption Rules

### 2.1 Always Use var() References

Components must always use `var(--token-name)` references. Never hardcode raw values.

```css
/* CORRECT */
.uds-button {
  padding: var(--space-2) var(--space-4);
  background: var(--color-brand-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
}

/* WRONG -- hardcoded values */
.uds-button {
  padding: 8px 16px;
  background: #3B82F6;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### 2.2 Palette Selection via data-theme

Apply a palette by setting the `data-theme` attribute. Only one palette per surface.

```html
<div data-theme="corporate">
  <!-- All --color-*, --radius-*, --shadow-* tokens resolve to corporate values -->
</div>
```

### 2.3 Dark Mode via CSS Variable Override

Dark mode is activated by adding the `.docs-dark` class alongside the `data-theme` attribute. The same `--color-*` tokens are redefined with dark mode values.

```html
<!-- Light mode -->
<div data-theme="corporate">...</div>

<!-- Dark mode -->
<div data-theme="corporate" class="docs-dark">...</div>
```

Under the hood, dark mode is implemented as:

```css
[data-theme="corporate"].docs-dark {
  --color-bg-primary: #0F172A;
  --color-text-primary: #F1F5F9;
  /* ... all color tokens redefined for dark mode ... */
}
```

### 2.4 Motion and Reduced Motion

All animations must be wrapped in `@media (prefers-reduced-motion: no-preference)`:

```css
@media (prefers-reduced-motion: no-preference) {
  .uds-modal {
    transition: opacity var(--motion-duration-normal) var(--motion-easing-out);
  }
}
```

### 2.5 Foundation vs. Palette Tokens

Consumers should understand which tokens change per palette and which remain constant:

- **Foundation (constant):** `--space-*`, `--font-size-*`, `--motion-*`, `--opacity-*`, `--z-index-*`
- **Palette-specific (varies):** `--color-*`, `--radius-*`, `--shadow-*`, display font family

This means spacing, typography scale, motion, and layering are consistent across all palettes. Colors, border radius, shadows, and display headings change with the active palette.

## 3. Why No --uds-* Prefix Rename Now

A namespace prefix (`--uds-*`) would prevent token name collisions when the design system is used alongside other CSS variable-based systems. However, a rename is not feasible at this time due to the scope of existing references:

### 3.1 Reference Count

| Location | Approximate References |
|---|---|
| docs/docs.html | ~555 |
| docs/reference.html | ~507 |
| docs/component-library.html | ~401 |
| docs/playground.html | ~361 |
| docs/index.html | ~309 |
| docs/visual-framework.html | ~289 |
| docs/case-studies.html | ~272 |
| docs/conformance.html | ~238 |
| Other files (article-outline, etc.) | ~1 |
| **Total across HTML docs** | **~2,933** |

In addition to HTML docs, the current naming is used in:
- Style Dictionary build configuration
- Generated platform outputs (CSS, JS, iOS Swift, Android XML)
- CLI templates and generated code
- Framework component generators (React, Vue, Svelte)

**Total estimated references: 1,163+ minimum** (conservative count of unique property definitions and usages, not including generated output).

### 3.2 Risks of Premature Rename

1. **Silent breakage:** Any missed reference produces invisible styling bugs (the browser silently falls back to `initial` for undefined custom properties)
2. **Build pipeline disruption:** Style Dictionary configuration, validators, and WCAG audit scripts all reference current names
3. **Consumer disruption:** Any external consumers using `var(--color-*)` would break immediately
4. **Testing burden:** All 9 palettes x 2 modes x 32 components need visual regression testing

## 4. Future Migration Path: --uds-* Prefix

### 4.1 Strategy: Additive Build Artifact

Rather than renaming existing tokens, `--uds-*` prefixed tokens have been added as an **additional** Style Dictionary build output via the `css-namespaced` platform in `style-dictionary.config.mjs`:

```
tokens/design-tokens.json (source of truth, unchanged)
    |
    +--> build/css/tokens.css               (current: --color-*, --space-*, etc.)
    +--> build/css-namespaced/tokens.css    (new: --uds-color-*, --uds-space-*, etc.)
    +--> build/js/tokens.js                 (current)
    +--> build/js/tokens.d.ts               (TypeScript declarations)
    +--> build/json/tokens.json             (flat JSON export)
    +--> build/ios/DesignTokens.swift       (iOS Swift)
    +--> build/android/design_tokens.xml    (Android)
```

### 4.2 Migration Mapping

| Current | Future (additional) |
|---|---|
| `--color-brand-primary` | `--uds-color-brand-primary` |
| `--space-4` | `--uds-space-4` |
| `--font-size-base` | `--uds-font-size-base` |
| `--radius-md` | `--uds-radius-md` |
| `--shadow-sm` | `--uds-shadow-sm` |
| `--motion-duration-fast` | `--uds-motion-duration-fast` |
| `--opacity-disabled` | `--uds-opacity-disabled` |
| `--z-index-modal` | `--uds-z-index-modal` |

### 4.3 Implementation Steps

1. ~~**Add Style Dictionary transform** to produce `--uds-*` prefixed output alongside current output~~ ✅ Done — `css-namespaced` platform in `style-dictionary.config.mjs` outputs `build/css-namespaced/tokens.css`
2. **Publish both artifacts** in the npm package so consumers can opt-in
3. **Add compatibility layer** that maps `--uds-*` to current names (or vice versa) for gradual migration
4. **Update docs incrementally** to reference `--uds-*` tokens with backward-compatible fallbacks: `var(--uds-color-brand-primary, var(--color-brand-primary))`
5. **Deprecation period** for unprefixed tokens (at least 2 minor versions)
6. **Remove unprefixed output** in a future major version

### 4.4 Consumer Guidance Until Migration

- Use `var()` references (never hardcode)
- Use the current naming convention (`--color-*`, `--space-*`, etc.)
- Do not depend on the absence or presence of a prefix
- When `--uds-*` tokens become available, migrate using the compatibility fallback pattern:

```css
/* During migration period */
.my-component {
  color: var(--uds-color-text-primary, var(--color-text-primary));
}
```

## 5. Token Resolution Order

When the system resolves a token value for a specific palette and mode, the lookup order is:

1. **Palette override (dark):** `theme.{palette}.{token}_dark` (if dark mode is active)
2. **Palette override (light):** `theme.{palette}.{token}` (if light mode is active)
3. **Palette-specific radius/shadow:** `radius.palette-overrides.{palette}` / `shadow.palette-overrides.{palette}`
4. **Semantic token:** `color.semantic.{token}` or foundation-level token
5. **Primitive token:** `color.primitive.{scale}.{shade}`

Foundation tokens (spacing, motion, opacity, z-index, breakpoints, border widths, icon sizes) do not have palette overrides; they resolve directly from the top-level token definition.
