# Per-component token reference

Components in `@mkatogui/uds-react` use design tokens only (no hardcoded colors or spacing). This table lists the main tokens each component block uses for theming and overrides. The full list of rules is in `packages/react/src/styles/components.css`.

| Component (BEM block) | Main tokens |
|------------------------|-------------|
| **Button** (`.uds-btn`) | `--color-brand-primary`, `--color-text-on-brand`, `--color-bg-secondary`, `--color-text-primary`, `--color-border-default`, `--color-bg-tertiary`, `--color-error`, `--color-text-on-error`, `--color-brand-primary-rgb`, `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--radius-md`, `--font-sans`, `--text-body-sm/md/lg`, `--duration-fast`, `--ease-out`, `--opacity-disabled` |
| **Input** (`.uds-input`) | `--color-bg-primary`, `--color-text-primary`, `--color-text-tertiary`, `--color-border-input`, `--color-brand-primary`, `--color-brand-primary-rgb`, `--color-error`, `--color-error-rgb`, `--radius-md`, `--space-3`, `--space-4`, `--text-body-sm/md/lg`, `--text-label`, `--font-sans`, `--duration-fast`, `--ease-out`, `--opacity-disabled` |
| **Card** (`.uds-card`) | `--color-bg-primary`, `--color-border-default`, `--color-text-primary`, `--color-text-secondary`, `--color-border-subtle`, `--radius-lg`, `--shadow-sm`, `--space-4`, `--space-6`, `--space-8`, `--font-display`, `--text-heading-sm`, `--text-body-md` |
| **Alert** (`.uds-alert`) | `--color-bg-tertiary`, `--color-text-primary`, `--color-success-bg`, `--color-success`, `--color-warning-bg`, `--color-warning`, `--color-error-bg`, `--color-error`, `--color-info-bg`, `--color-info`, `--radius-md`, `--space-1`, `--space-2`, `--text-label`, `--font-sans` |
| **Modal** (`.uds-modal`) | `--color-bg-primary`, `--color-border-default`, `--color-text-primary`, `--color-text-secondary`, `--radius-lg`, `--shadow-xl`, `--z-modal` (from tokens), overlay uses `--color-overlay-bg` |
| **FileUpload** (`.uds-file-upload`) | `--color-border-default`, `--color-bg-secondary`, `--color-text-primary`, `--color-text-tertiary`, `--color-brand-primary`, `--radius-md`, `--space-*`, `--text-*`, `--font-sans` |
| **FormSection** (`.uds-form-section`) | `--color-text-primary`, `--color-text-secondary`, `--space-*`, `--text-heading-sm`, `--text-body-sm`, `--font-sans` |
| **Badge** (`.uds-badge`) | `--color-bg-tertiary`, `--color-text-primary`, `--color-success-bg`, `--color-success`, `--color-warning-bg`, `--color-warning`, `--color-error-bg`, `--color-error`, `--radius-full`, `--space-1`, `--space-2`, `--text-label` |
| **Rating** (`.uds-rating`) | `--color-border-default`, `--color-warning`, `--opacity-disabled` |
| **LoginForm** (`.uds-login-form`) | `--color-brand-primary`, `--color-brand-primary-rgb`, `--color-error`, `--color-border-*`, `--color-text-*`, `--radius-md`, `--space-*`, `--text-*`, `--font-sans` |

## How to override

Set or override these tokens under your theme or a wrapper:

```css
[data-theme="my-app"] {
  --color-brand-primary: #0f766e;
  --color-text-on-brand: #fff;
}
```

Or use a scoped wrapper:

```css
.my-wrapper {
  --color-brand-primary: #0f766e;
}
```

See [Token architecture](https://mkatogui.github.io/universal-design-system/reference.html) and `tokens/design-tokens.json` for the full token set.
