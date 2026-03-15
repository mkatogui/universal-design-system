# Component Library (43 Components)

## Component Quick Reference

| Component | CSS Class | Variants | Sizes |
|-----------|-----------|----------|-------|
| Button | `.btn` | primary, secondary, ghost, gradient, destructive, icon-only | sm, md, lg, xl |
| Navigation Bar | `.navbar` | standard, minimal, dark, transparent | desktop, mobile |
| Hero Section | `.hero` | centered, product-screenshot, video-bg, gradient-mesh, search-forward, split | full, compact |
| Feature Card | `.card` | icon-top, image-top, horizontal, stat-card, dashboard-preview | sm, md, lg |
| Pricing Table | `.pricing` | 2-column, 3-column, 4-column, toggle | standard, compact |
| Social Proof | `.social-proof` | logo-strip, stats-counter, testimonial-mini, combined | standard, compact |
| Testimonial | `.testimonial` | quote-card, video, metric, carousel | sm, md, lg |
| Footer | `.footer` | simple, multi-column, newsletter, mega-footer | standard, compact |
| Code Block | `.code-block` | syntax-highlighted, terminal, multi-tab | sm, md, lg |
| Modal | `.modal` | confirmation, task, alert | sm, md, lg |
| Form Input | `.input` | text, email, password, number, search, textarea | sm, md, lg |
| Select | `.select` | native, custom | sm, md, lg |
| Checkbox | `.checkbox` | standard, indeterminate | md |
| Radio | `.radio` | standard, card | md |
| Toggle Switch | `.toggle` | standard, with-label | md |
| Alert | `.alert` | success, warning, error, info | sm, md, lg |
| Badge | `.badge` | status, count, tag | sm, md |
| Tabs | `.tabs` | line, pill, segmented | sm, md, lg |
| Accordion | `.accordion` | single, multi, flush | standard |
| Breadcrumb | `.breadcrumb` | standard, truncated | standard |
| Tooltip | `.tooltip` | simple, rich | sm, md |
| Dropdown Menu | `.dropdown` | action, context, nav-sub | sm, md, lg |
| Avatar | `.avatar` | image, initials, icon, group | xs, sm, md, lg, xl |
| Skeleton | `.skeleton` | text, card, avatar, table | sm, md, lg |
| Toast | `.toast` | success, error, warning, info, neutral | sm, md, lg |
| Pagination | `.pagination` | numbered, simple, load-more, infinite-scroll | sm, md |
| Data Table | `.data-table` | basic, sortable, selectable, expandable | compact, default, comfortable |
| Date Picker | `.date-picker` | single, range, with-time | md, lg |
| Command Palette | `.command-palette` | standard | md, lg |
| Progress Indicator | `.progress` | bar, circular, stepper | sm, md, lg |
| Side Navigation | `.side-nav` | default, collapsed, with-sections | default, collapsed |
| File Upload | `.file-upload` | dropzone, button, avatar-upload | sm, md, lg |
| Drawer | `.drawer` | left, right, top, bottom | sm, md, lg |
| Popover | `.popover` | top, bottom, left, right, auto | sm, md |
| Combobox | `.combobox` | autocomplete, multiselect, creatable | sm, md, lg |
| Alert Dialog | `.alert-dialog` | info, warning, destructive | sm, md |
| Carousel | `.carousel` | slide, fade, auto-play | sm, md, lg |
| Chip Input | `.chip-input` | single, multi, removable | sm, md, lg |
| Stepper | `.stepper` | horizontal, vertical, linear, non-linear | sm, md, lg |
| Segmented Control | `.segmented-control` | default, icon-only, icon-label | sm, md, lg |
| Toolbar | `.toolbar` | horizontal, vertical, with-overflow | sm, md, lg |
| Tree View | `.tree-view` | single-select, multi-select, checkbox | sm, md, lg |
| OTP Input | `.otp-input` | 4-digit, 6-digit, alphanumeric | md, lg |

## Component API Pattern (CVA-Style)

All components follow a Class Variance Authority (CVA) pattern:

```html
<!-- Button: variant + size -->
<button class="btn btn--primary btn--md">Get Started</button>
<button class="btn btn--secondary btn--sm">Cancel</button>
<button class="btn btn--ghost btn--lg">Learn More</button>

<!-- Alert: variant + dismissible -->
<div class="alert alert--error" role="alert">
  <span class="alert__icon">!</span>
  <div class="alert__content">
    <strong class="alert__title">Error</strong>
    <p class="alert__body">Something went wrong.</p>
  </div>
</div>

<!-- Badge: variant + size -->
<span class="badge badge--success badge--sm">Active</span>

<!-- Card: variant -->
<div class="card card--compact">
  <div class="card__header">...</div>
  <div class="card__body">...</div>
</div>

<!-- Toast: variant + position -->
<div class="toast toast--success" role="status">
  <span class="toast__icon">✓</span>
  <p class="toast__message">Saved successfully</p>
</div>
```

## BEM Naming Convention

- Block: `.uds-{component}` or `.{component}`
- Element: `.{component}__{element}`
- Modifier: `.{component}--{variant}`

## Component States

All interactive components support:

- **Default** — Resting state
- **Hover** — Mouse over (+2% brightness, translateY(-1px))
- **Active** — Pressed (scale(0.98))
- **Focus** — Keyboard focus (2px ring, 2px offset, brand color)
- **Disabled** — Non-interactive (opacity: 0.5, cursor: not-allowed)
- **Loading** — Processing (spinner replaces content)

## APG Pattern Reference

Every component maps to a WAI-ARIA APG pattern for keyboard interaction and ARIA attributes:

| Pattern | Components |
|---------|-----------|
| Button | button |
| Dialog (Modal) | modal, date-picker |
| Tabs | tabs |
| Accordion | accordion |
| Tooltip | tooltip |
| Disclosure Navigation | navigation, dropdown, side-nav |
| Listbox | select |
| Combobox | command-palette |
| Checkbox | checkbox |
| Radio Group | radio |
| Switch | toggle |
| Alert / Status | alert, toast |
| Carousel | testimonial |
| Table | pricing-table, data-table |
| Progressbar | progress-indicator |
| Textbox | input |
| Breadcrumb | breadcrumb |
| Landmark Regions | hero, footer, social-proof |
