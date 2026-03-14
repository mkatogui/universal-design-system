# @mkatogui/uds-vue

Vue 3 Composition API components for the Universal Design System. 43 accessible, themeable components built with `<script setup lang="ts">` and `defineProps`.

## Installation

```bash
npm install @mkatogui/uds-vue
```

Vue 3.3+ is required as a peer dependency.

## Usage

Import individual components:

```vue
<script setup>
import { UdsButton, UdsInput, UdsModal } from '@mkatogui/uds-vue'
</script>

<template>
  <UdsButton variant="primary" size="md" @click="handleClick">
    Get Started
  </UdsButton>
</template>
```

## Theming

Components use UDS design tokens via CSS custom properties and BEM class naming (`uds-{component}--{variant}`). Apply a palette with the `data-theme` attribute on a parent element:

```html
<div data-theme="ai-futuristic">
  <UdsButton variant="gradient">Launch</UdsButton>
</div>
```

Available palettes: `minimal-saas`, `ai-futuristic`, `gradient-startup`, `corporate`, `apple-minimal`, `illustration`, `dashboard`, `bold-lifestyle`, `minimal-corporate`.

## Components

| Component | File | Variants |
|-----------|------|----------|
| Button | `UdsButton.vue` | primary, secondary, ghost, gradient, destructive, icon-only |
| Navigation Bar | `UdsNavbar.vue` | standard, minimal, dark, transparent |
| Hero Section | `UdsHero.vue` | centered, product-screenshot, video-bg, gradient-mesh, search-forward, split |
| Feature Card | `UdsCard.vue` | icon-top, image-top, horizontal, stat-card, dashboard-preview |
| Pricing Table | `UdsPricing.vue` | 2-column, 3-column, 4-column, toggle |
| Social Proof Bar | `UdsSocialProof.vue` | logo-strip, stats-counter, testimonial-mini, combined |
| Testimonial Card | `UdsTestimonial.vue` | quote-card, video, metric, carousel |
| Footer | `UdsFooter.vue` | simple, multi-column, newsletter, mega-footer |
| Code Block | `UdsCodeBlock.vue` | syntax-highlighted, terminal, multi-tab |
| Modal | `UdsModal.vue` | confirmation, task, alert |
| Form Input | `UdsInput.vue` | text, email, password, number, search, textarea |
| Select | `UdsSelect.vue` | native, custom |
| Checkbox | `UdsCheckbox.vue` | standard, indeterminate |
| Radio | `UdsRadio.vue` | standard, card |
| Toggle Switch | `UdsToggle.vue` | standard, with-label |
| Alert | `UdsAlert.vue` | success, warning, error, info |
| Badge | `UdsBadge.vue` | status, count, tag |
| Tabs | `UdsTabs.vue` | line, pill, segmented |
| Accordion | `UdsAccordion.vue` | single, multi, flush |
| Breadcrumb | `UdsBreadcrumb.vue` | standard, truncated |
| Tooltip | `UdsTooltip.vue` | simple, rich |
| Dropdown Menu | `UdsDropdown.vue` | action, context, nav-sub |
| Avatar | `UdsAvatar.vue` | image, initials, icon, group |
| Skeleton | `UdsSkeleton.vue` | text, card, avatar, table |
| Toast | `UdsToast.vue` | success, error, warning, info, neutral |
| Pagination | `UdsPagination.vue` | numbered, simple, load-more, infinite-scroll |
| Data Table | `UdsDataTable.vue` | basic, sortable, selectable, expandable |
| Date Picker | `UdsDatePicker.vue` | single, range, with-time |
| Command Palette | `UdsCommandPalette.vue` | standard |
| Progress Indicator | `UdsProgress.vue` | bar, circular, stepper |
| Side Navigation | `UdsSideNav.vue` | default, collapsed, with-sections |
| File Upload | `UdsFileUpload.vue` | dropzone, button, avatar-upload |

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- Proper ARIA roles and attributes (`role`, `aria-label`, `aria-expanded`, `aria-selected`, etc.)
- Keyboard navigation support (arrow keys, Enter, Space, Escape, Tab)
- Focus management (focus traps in Modal, focus restoration)
- Semantic HTML elements (`nav`, `button`, `figure`, `blockquote`, `table`)
- Screen reader announcements via `role="alert"` and `role="status"`
- Form label associations via `for`/`id` pairs

## v-model Support

Form components support Vue's `v-model` directive:

```vue
<UdsInput v-model="email" variant="email" label="Email" />
<UdsSelect v-model="country" :options="countries" label="Country" />
<UdsCheckbox v-model="agreed" label="I agree to the terms" />
<UdsToggle v-model="darkMode" label="Dark mode" />
```

## License

MIT
