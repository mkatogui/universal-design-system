# Minimal React starter (playground-style)

A minimal UDS React app in a handful of files: one HTML file, one CSS import, one page with **Container**, **Card**, and **Button**. Use this to compare with your own app if styling doesn’t match the [Playground](https://mkatogui.github.io/universal-design-system/playground.html).

## What’s in this example

- **index.html** — Sets `data-theme="minimal-saas"` on `<html>` (required for correct theming).
- **main.tsx** — Imports `@mkatogui/uds-react/styles.css` first, then mounts the app.
- **App.tsx** — Single page: `<Container size="lg">`, one `<Card>` with title and content, one `<Button variant="primary">`.

## Quick start

```bash
cd examples/minimal-react
npm install
npm run dev
```

Open `http://localhost:5173`. You should see the same stack as the docs: one theme, one page, UDS components with correct tokens.

## If your app doesn’t look like this

1. **Theme:** Ensure `<html>` (or your root wrapper) has `data-theme="minimal-saas"` (or another palette).
2. **Styles:** Import `@mkatogui/uds-react/styles.css` once at your app entry, before other imports.
3. **Structure:** Wrap your content in `<Container size="lg">` if you want the same max-width and padding as the playground.
