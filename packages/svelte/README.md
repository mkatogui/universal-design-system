# @mkatogui/uds-svelte

Svelte 5 components for the Universal Design System. 32 accessible, themeable components built with Svelte 5 runes, BEM naming, and full WCAG 2.1 AA compliance.

## Installation

```bash
npm install @mkatogui/uds-svelte
```

Requires Svelte 5 or later as a peer dependency.

## Usage

```svelte
<script>
  import { Button, Alert, Modal } from '@mkatogui/uds-svelte';
</script>

<Button variant="primary" size="md" onclick={() => console.log('clicked')}>
  Get Started
</Button>

<Alert variant="success" title="Done" message="Operation completed successfully." dismissible />
```

## Theming

Components use UDS CSS custom properties (`--color-*`, `--space-*`, `--font-size-*`). Apply a palette with the `data-theme` attribute on a parent element:

```html
<div data-theme="minimal-saas">
  <!-- All UDS components inside inherit the palette -->
</div>
```

Available palettes: `minimal-saas`, `ai-futuristic`, `gradient-startup`, `corporate`, `apple-minimal`, `illustration`, `dashboard`, `bold-lifestyle`, `minimal-corporate`.

## Components

| Component | CSS Class | Variants |
|---|---|---|
| Button | `uds-btn` | primary, secondary, ghost, gradient, destructive, icon-only |
| NavigationBar | `uds-navbar` | standard, minimal, dark, transparent |
| HeroSection | `uds-hero` | centered, product-screenshot, video-bg, gradient-mesh, search-forward, split |
| FeatureCard | `uds-card` | icon-top, image-top, horizontal, stat-card, dashboard-preview |
| PricingTable | `uds-pricing` | 2-column, 3-column, 4-column, toggle |
| SocialProofBar | `uds-social-proof` | logo-strip, stats-counter, testimonial-mini, combined |
| TestimonialCard | `uds-testimonial` | quote-card, video, metric, carousel |
| Footer | `uds-footer` | simple, multi-column, newsletter, mega-footer |
| CodeBlock | `uds-code-block` | syntax-highlighted, terminal, multi-tab |
| Modal | `uds-modal` | confirmation, task, alert |
| FormInput | `uds-input` | text, email, password, number, search, textarea |
| Select | `uds-select` | native, custom |
| Checkbox | `uds-checkbox` | standard, indeterminate |
| Radio | `uds-radio` | standard, card |
| ToggleSwitch | `uds-toggle` | standard, with-label |
| Alert | `uds-alert` | success, warning, error, info |
| Badge | `uds-badge` | status, count, tag |
| Tabs | `uds-tabs` | line, pill, segmented |
| Accordion | `uds-accordion` | single, multi, flush |
| Breadcrumb | `uds-breadcrumb` | standard, truncated |
| Tooltip | `uds-tooltip` | simple, rich |
| DropdownMenu | `uds-dropdown` | action, context, nav-sub |
| Avatar | `uds-avatar` | image, initials, icon, group |
| Skeleton | `uds-skeleton` | text, card, avatar, table |
| Toast | `uds-toast` | success, error, warning, info, neutral |
| Pagination | `uds-pagination` | numbered, simple, load-more, infinite-scroll |
| DataTable | `uds-data-table` | basic, sortable, selectable, expandable |
| DatePicker | `uds-date-picker` | single, range, with-time |
| CommandPalette | `uds-command-palette` | standard |
| ProgressIndicator | `uds-progress` | bar, circular, stepper |
| SideNavigation | `uds-side-nav` | default, collapsed, with-sections |
| FileUpload | `uds-file-upload` | dropzone, button, avatar-upload |

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- Proper ARIA roles and attributes (dialog, alert, switch, tablist, etc.)
- Keyboard navigation support (arrow keys, Enter, Space, Escape)
- Focus management and visible focus indicators
- Label associations (`for`/`id` pairing on form controls)
- Semantic HTML elements (nav, blockquote, fieldset, etc.)
- Live regions for dynamic content (role=alert, role=status, aria-live)

## Svelte 5 Patterns

Components use Svelte 5 features:

- `$props()` rune for prop declarations
- `$derived()` rune for computed values
- `$state()` rune for internal state
- `$effect()` rune for side effects
- `$bindable()` for two-way binding on form values
- `{@render children?.()}` for snippet-based slot content

## License

MIT
