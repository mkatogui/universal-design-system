# Platform-Specific Code

## React

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
    <button className={`btn btn--${variant} btn--${size}`} {...props}>
      {children}
    </button>
  );
}
```

## Vue

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

## Svelte

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

## SwiftUI (Token Reference)

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

## Flutter (Token Reference)

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

## CSS Custom Properties Usage

```html
<html lang="en" data-theme="minimal-saas">
```

Switch at runtime:
```js
document.documentElement.setAttribute('data-theme', 'corporate');
```

## CSS Token References

```css
/* Colors */
var(--color-brand-primary)     /* Primary brand */
var(--color-brand-secondary)   /* Secondary brand */
var(--color-text-primary)      /* Main text */
var(--color-text-secondary)    /* Muted text */
var(--color-bg-primary)        /* Page background */
var(--color-bg-secondary)      /* Card/section background */
var(--color-border-default)    /* Default borders */
var(--color-error)             /* Error state */
var(--color-success)           /* Success state */

/* Spacing */
var(--space-1) through var(--space-24)

/* Radius */
var(--radius-sm)  var(--radius-md)  var(--radius-lg)  var(--radius-xl)

/* Shadows */
var(--shadow-sm)  var(--shadow-md)  var(--shadow-lg)

/* Motion */
var(--duration-instant)  var(--duration-fast)  var(--duration-normal)  var(--duration-slow)
var(--ease-default)  var(--ease-out)  var(--ease-in)  var(--ease-spring)
```
