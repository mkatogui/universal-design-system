# React Example

A minimal reference app demonstrating `@mkatogui/uds-react` component usage
with runtime palette switching and dark mode.

## Quick Start

```bash
cd examples/react-app
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Components Demonstrated

| Component | What it shows |
|-----------|---------------|
| **Button** | Primary, secondary, and ghost variants |
| **Card** | CardHeader, CardTitle, CardContent composition |
| **Input** | Labeled text input with controlled state |
| **Badge** | Default, success, warning, error variants |
| **Alert** | Info variant |
| **Tabs** | Three-tab navigation |
| **Toggle** | Dark mode switch |

## Palette Switching

The app includes a palette switcher that sets `data-theme` on the root
element at runtime. All 9 UDS palettes are available:

- `minimal-saas` (default)
- `ai-futuristic`, `gradient-startup`, `corporate`
- `apple-minimal`, `illustration`, `dashboard`
- `bold-lifestyle`, `minimal-corporate`

Click any palette button to switch; every component re-themes instantly
via CSS custom properties.

## Dark Mode

Use the Toggle at the top of the page. It applies the `docs-dark` class
to the root element, activating dark-mode token overrides.

## Notes

- This is a **reference example**, not a production starter template.
- Built with Vite + TypeScript + React 18.
- All components are imported from `@mkatogui/uds-react`.
