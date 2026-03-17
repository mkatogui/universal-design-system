# Universal Design System — Platforms, Motion, Accessibility

## Contents

- [React](#react)
- [Vue](#vue)
- [Svelte](#svelte)
- [SwiftUI](#swiftui-token-reference)
- [Flutter](#flutter-token-reference)
- [Tailwind CSS](#tailwind-css-integration)
- [Motion Choreography](#motion-choreography)
- [Accessibility Requirements](#accessibility-requirements)
- [Example Queries](#example-queries)

---

## React

```jsx
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

function Button({ variant = 'primary', size = 'md', children, ...props }) {
  return (
    <button className={`btn btn--${variant} btn--${size}`} {...props}>
      {children}
    </button>
  );
}
```

---

## Vue

```vue
<script setup>
import { ref, onMounted } from 'vue'
const theme = ref('minimal-saas')
function switchTheme(newTheme) {
  document.documentElement.setAttribute('data-theme', newTheme)
  theme.value = newTheme
}
onMounted(() => document.documentElement.setAttribute('data-theme', theme.value))
</script>
<template>
  <button :class="`btn btn--${variant} btn--${size}`"><slot /></button>
</template>
```

---

## Svelte

```svelte
<script>
  export let variant = 'primary', size = 'md';
  import { onMount } from 'svelte';
  let theme = 'minimal-saas';
  onMount(() => document.documentElement.setAttribute('data-theme', theme));
  function switchTheme(newTheme) {
    document.documentElement.setAttribute('data-theme', newTheme);
    theme = newTheme;
  }
</script>
<button class="btn btn--{variant} btn--{size}"><slot /></button>
```

---

## SwiftUI (Token Reference)

```swift
struct DesignTokens {
    struct Color {
        static let brandPrimary = Color(hex: "#2563EB")
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

---

## Flutter (Token Reference)

```dart
class DesignTokens {
  static const brandPrimary = Color(0xFF2563EB);
  static const bgPrimary = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF111827);
  static const space1 = 4.0, space2 = 8.0, space4 = 16.0, space6 = 24.0;
  static const radiusSm = 6.0, radiusMd = 8.0, radiusLg = 12.0;
}
```

---

## Tailwind CSS Integration

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
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)' },
      boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
    },
  },
};
```

---

## Motion Choreography

**Enter:** fade-in, slide-up, scale-in, expand. **Exit:** fade-out, slide-down, scale-out. **Stagger:** children-fast (40ms), children-normal (60ms), grid (80ms). **Interaction:** hover-lift, press-down, focus-ring. Wrap all motion in `@media (prefers-reduced-motion: no-preference)`; for reduce use opacity only, no transform.

---

## Accessibility Requirements

WCAG 2.2 AA: text contrast ≥ 4.5:1, UI ≥ 3:1, focus indicators 2px ring/offset, full keyboard nav, screen reader labels, reduced motion support, 44x44px touch targets, color independence, semantic HTML, skip link, heading hierarchy, focus not obscured (2.4.11), target size min 24×24 (2.5.8). Run: `python scripts/wcag-audit.py` (108 checks).

---

## Example Queries

**"Build a fintech dashboard"** — Sector finance → palette corporate. Components: data-table, tabs, badge, side-navigation, pagination, toast. Anti-patterns: no playful animations, no neon, no dark. Typography: Inter/Inter or Manrope/Inter.

**"Design a kids education app"** — Sector education → palette illustration. Components: button, avatar, progress-indicator, badge, tabs, modal. Anti-patterns: no small text, no dark, no complex nav. Typography: Nunito/Inter or Poppins/Inter.

**"Create a SaaS landing page"** — Sector saas → palette gradient-startup. Components: hero, navigation, feature-card, social-proof, pricing-table, footer. Pattern: Homepage order. Typography: DM Sans/Inter or Plus Jakarta Sans/Inter.

**"Design a luxury brand website"** — Sector luxury → palette apple-minimal. Anti-patterns: no busy layouts, no discount badges, no bright gradients. Typography: Playfair Display/Inter. Layout: spacious, minimal.
