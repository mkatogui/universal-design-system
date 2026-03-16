# Token-only audit

Audit outcome: React package and component CSS use design tokens only; hardcoded color fallbacks were removed so themes behave predictably.

## Scope

- **packages/react/src**: Component TSX files use BEM classes and no inline hex/rgb for colors. Component styles live in `packages/react/src/styles/components.css` and reference `var(--token-name)` only.
- **packages/react/src/styles/tokens.css**: Defines palette variables per `[data-theme="..."]`; hex/rgba there are the token *definitions* (source of truth), not component-level hardcoding.
- **packages/react/src/styles/components.css**: All color and shadow usage goes through tokens. Previously, a few rules used fallbacks (e.g. `var(--color-warning, #d97706)` or `rgba(var(--color-brand-primary-rgb, 37, 99, 235), 0.15)`); those were replaced with token-only usage (`var(--color-warning)`, `rgba(var(--color-brand-primary-rgb), 0.15)`) so that palette switching fully controls appearance.

## Changes made

- `.uds-rating__star--filled`: `color: var(--color-warning, #d97706)` → `var(--color-warning)`.
- Focus ring / box-shadow rules that used `--color-brand-primary-rgb` with numeric fallbacks: removed fallbacks; use `rgba(var(--color-brand-primary-rgb), 0.15)` (and similar) only.
- `.uds-login-form__input:focus`: replaced `var(--color-brand-primary-alpha, rgba(59, 130, 246, 0.15))` with `rgba(var(--color-brand-primary-rgb), 0.15)`.

## Docs

HTML docs in `docs/*.html` use inline CSS that is synced from `tokens/design-tokens.json` (see `npm run generate-docs-tokens` and palette sync). Those files are expected to use tokens only; any hardcoded values there would be caught by `npm run verify`.
