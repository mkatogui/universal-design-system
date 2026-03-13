# @mkatogui/uds-react

[![npm version](https://img.shields.io/npm/v/@mkatogui/uds-react.svg)](https://www.npmjs.com/package/@mkatogui/uds-react)
[![license](https://img.shields.io/npm/l/@mkatogui/uds-react.svg)](https://github.com/mkatogui/universal-design-system/blob/main/LICENSE)

React components for [Universal Design System](https://mkatogui.github.io/universal-design-system/) -- 43 accessible components, 9 palettes, 600 design tokens, WCAG 2.1 AA compliant.

## Installation

```bash
npm install @mkatogui/uds-react
```

**Peer dependencies:** `react >=18.0.0` and `react-dom >=18.0.0`

## Quick Start

Import the stylesheet once at your app's entry point, then use any component:

```tsx
import '@mkatogui/uds-react/styles.css';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@mkatogui/uds-react';

function App() {
  return (
    <div data-theme="minimal-saas">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your app is ready.</p>
          <Button variant="primary" size="md">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Components

### Button

Variants: `primary` | `secondary` | `ghost` | `destructive`. Sizes: `sm` | `md` | `lg`.

```tsx
import { Button } from '@mkatogui/uds-react';

<Button variant="primary" size="lg">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">Skip</Button>
<Button variant="destructive">Delete</Button>
<Button loading>Submitting...</Button>
```

Props: `variant`, `size`, `loading`. Also accepts all native `<button>` attributes.

### Card

Composable card with subcomponents. Variants: `default`, `compact`, `spacious`.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@mkatogui/uds-react';

<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card body content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Confirm</Button>
  </CardFooter>
</Card>
```

Props: `variant` (`'default'` | `'compact'` | `'spacious'`).

### Input

Text input with built-in label, error, and helper text support.

```tsx
import { Input } from '@mkatogui/uds-react';

<Input label="Email" placeholder="you@example.com" type="email" />
<Input label="Password" type="password" error="Password is required" />
<Input label="Username" helperText="Letters and numbers only" disabled />
```

Props: `label`, `error`, `helperText`, `inputSize` (`'sm'` | `'md'` | `'lg'`). Also accepts all native `<input>` attributes.

### Badge

Inline status indicator. Variants: `default`, `success`, `warning`, `error`, `info`, `brand`.

```tsx
import { Badge } from '@mkatogui/uds-react';

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
<Badge variant="error" dot>Offline</Badge>
<Badge variant="info">New</Badge>
```

Props: `variant` (`'default'` | `'success'` | `'warning'` | `'error'` | `'info'` | `'brand'`), `size`, `dot`.

### Alert

Contextual feedback messages with optional dismiss.

```tsx
import { Alert } from '@mkatogui/uds-react';

<Alert variant="info" title="Heads up">
  This action requires your attention.
</Alert>
<Alert variant="success" title="Saved">Changes saved successfully.</Alert>
<Alert variant="warning">Disk space is running low.</Alert>
<Alert variant="error" dismissible onDismiss={() => console.log('dismissed')}>
  Something went wrong.
</Alert>
```

Props: `variant` (`'success'` | `'warning'` | `'error'` | `'info'`), `title`, `dismissible`, `onDismiss`.

### Modal

Dialog with focus trapping, Escape to close, and scroll lock. Renders via portal.

```tsx
import { useState } from 'react';
import { Modal, Button } from '@mkatogui/uds-react';

function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm Action"
        footer={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        <p>Are you sure you want to proceed?</p>
      </Modal>
    </>
  );
}
```

Props: `open` (required), `onClose` (required), `title`, `footer`.

### Toggle

Accessible switch with `role="switch"` and keyboard support.

```tsx
import { useState } from 'react';
import { Toggle } from '@mkatogui/uds-react';

function Example() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Toggle
      checked={enabled}
      onChange={setEnabled}
      label="Enable notifications"
    />
  );
}
```

Props: `checked` (required), `onChange` (required), `label`, `disabled`.

### Tabs

Keyboard-navigable tabs with `line` and `pill` variants.

```tsx
import { Tabs } from '@mkatogui/uds-react';
import type { TabItem } from '@mkatogui/uds-react';

const items: TabItem[] = [
  { label: 'Overview', content: <p>Overview content</p> },
  { label: 'Settings', content: <p>Settings content</p> },
  { label: 'Disabled', content: <p>Disabled tab</p>, disabled: true },
];

<Tabs tabs={items} defaultIndex={0} variant="line" onChange={(i) => console.log(i)} />
```

Props: `tabs` (`TabItem[]`, required), `defaultIndex`, `variant` (`'line'` | `'pill'`), `onChange`.

`TabItem`: `{ label: string; content: ReactNode; disabled?: boolean }`

## Palette Switching

Apply any palette by setting the `data-theme` attribute on a container element:

```tsx
<div data-theme="corporate">
  {/* All child components inherit the corporate palette */}
</div>
```

Switch at runtime:

```tsx
document.documentElement.setAttribute('data-theme', 'ai-futuristic');
```

## Custom Palettes

Load and unload custom palette CSS at runtime:

```tsx
import { loadCustomPalette, unloadCustomPalette } from '@mkatogui/uds-react';

const myBrandCSS = `
  [data-theme="my-brand"] {
    --color-brand: #6c5ce7;
    --color-bg-primary: #ffffff;
    --color-text-primary: #1a1a2e;
  }
`;

loadCustomPalette('my-brand', myBrandCSS);
document.documentElement.setAttribute('data-theme', 'my-brand');

// Remove later
unloadCustomPalette('my-brand');
```

## TypeScript

All components export their prop types. Import them directly:

```tsx
import type {
  ButtonProps,
  CardProps,
  InputProps,
  BadgeProps,
  AlertProps,
  ModalProps,
  ToggleProps,
  TabsProps,
  TabItem,
} from '@mkatogui/uds-react';
```

## Available Palettes

| Palette | Best for |
|---------|----------|
| `minimal-saas` | SaaS products, clean interfaces |
| `ai-futuristic` | AI/ML tools, tech dashboards |
| `gradient-startup` | Startups, marketing pages |
| `corporate` | Enterprise, finance, B2B |
| `apple-minimal` | Consumer apps, premium feel |
| `illustration` | Creative, education, playful |
| `dashboard` | Data-heavy, analytics, admin |
| `bold-lifestyle` | E-commerce, lifestyle brands |
| `minimal-corporate` | Professional services, legal |

## Links

- [Full Documentation](https://mkatogui.github.io/universal-design-system/) | [GitHub](https://github.com/mkatogui/universal-design-system) | [Component Library](https://mkatogui.github.io/universal-design-system/component-library.html)

## License

MIT
