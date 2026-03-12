# @mkatogui/uds-tokens

496 W3C DTCG design tokens from the [Universal Design System](https://github.com/mkatogui/universal-design-system) -- CSS custom properties, JavaScript/TypeScript objects, and flat JSON.

Includes 9 structural palettes (minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal, illustration, dashboard, bold-lifestyle, minimal-corporate) with light and dark mode support.

## Install

```bash
npm install @mkatogui/uds-tokens
```

## Usage

### CSS Custom Properties

Import the CSS file to get all tokens as custom properties on `:root`, plus palette overrides via `[data-theme]` selectors.

```css
/* In your CSS or PostCSS entry */
@import '@mkatogui/uds-tokens/css';
```

```html
<!-- Apply a palette -->
<body data-theme="corporate">
  <h1 style="color: var(--color-semantic-brand-primary)">Hello</h1>
</body>
```

### JavaScript / TypeScript

Import the token object for type-safe access. Each leaf value is a `var()` reference with a fallback to the resolved default.

```js
// ESM
import { tokens } from '@mkatogui/uds-tokens';

// CommonJS
const { tokens } = require('@mkatogui/uds-tokens');
```

```typescript
import { tokens, type Tokens } from '@mkatogui/uds-tokens';

// Autocomplete and type checking
const brand = tokens.color.semantic.brand.primary;
// => "var(--color-semantic-brand-primary, #2563EB)"

const gap = tokens.spacing['4'];
// => "var(--spacing-4, 16px)"
```

### JSON

Import the flat JSON for tooling integrations (Style Dictionary, Figma plugins, etc.).

```js
import tokensJSON from '@mkatogui/uds-tokens/json';
```

## Token Categories

| Category     | Prefix              | Examples                           |
|-------------|---------------------|------------------------------------|
| Color       | `--color-*`         | `--color-primitive-blue-500`, `--color-semantic-brand-primary` |
| Spacing     | `--spacing-*`       | `--spacing-1` (4px) through `--spacing-32` (128px) |
| Typography  | `--font-size-*`     | `--font-size-body-md`, `--font-size-display-xl` |
| Font Family | `--font-family-*`   | `--font-family-sans`, `--font-family-mono` |
| Shadow      | `--shadow-*`        | `--shadow-sm`, `--shadow-lg` |
| Radius      | `--radius-*`        | `--radius-sm`, `--radius-full` |
| Motion      | `--motion-*`        | `--motion-duration-fast`, `--motion-easing-default` |
| Z-Index     | `--zIndex-*`        | `--zIndex-modal`, `--zIndex-tooltip` |
| Layout      | `--layout-*`        | `--layout-container-xl`, `--layout-sidebar-default` |
| Component   | `--component-*`     | `--component-avatar-md`, `--component-toast-max_width` |

## Palettes

Apply any palette with the `data-theme` attribute. Each palette overrides color, radius, shadow, and display font tokens.

```html
<div data-theme="ai-futuristic">...</div>
<div data-theme="corporate">...</div>
<div data-theme="gradient-startup">...</div>
```

For dark mode, add the `.dark` class:

```html
<div data-theme="corporate" class="dark">...</div>
```

## Build from Source

```bash
cd packages/tokens
npm run build
```

This reads `../../tokens/design-tokens.json`, resolves all token references, and outputs the `dist/` artifacts.

## License

MIT
