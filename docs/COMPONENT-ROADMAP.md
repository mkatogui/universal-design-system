# Component roadmap — longest list vs. peer design systems

This document tracks UDS components and plans expansion to match or exceed the component count of major design systems (MUI, Ant Design, Radix, Chakra, Carbon).

---

## 1. Current UDS inventory

### 1.1 By layer

| Layer | Count | Source |
|-------|--------|--------|
| **components.csv** (canonical) | **72** | `src/data/components.csv` |
| **React** (`@mkatogui/uds-react`) | **72** | `packages/react/src/index.ts` |
| **Vue** (`@mkatogui/uds-vue`) | **47+** | `packages/vue/src/index.ts` (Phase 1–2 parity) |
| **Svelte** (`@mkatogui/uds-svelte`) | **47+** | `packages/svelte/src/index.js` (Phase 1–2 parity) |

### 1.2 Full list (72) — by category

**Action**
- Button

**Navigation**
- Navigation Bar, Breadcrumb, Tabs, Dropdown Menu, Pagination, Command Palette, Side Navigation, Footer, Stepper, Toolbar

**Layout**
- Hero Section

**Content**
- Feature Card (Card), Code Block, Accordion

**Commerce / trust**
- Pricing Table, Social Proof Bar, Testimonial Card

**Overlay**
- Modal, Tooltip, Drawer, Popover, Alert Dialog

**Form**
- Form Input, Select, Checkbox, Radio, Toggle Switch, Date Picker, File Upload, Combobox, Chip Input, OTP Input

**Input (choice)**
- Segmented Control

**Data display**
- Badge, Avatar, Skeleton, Data Table

**Feedback**
- Alert, Toast, Progress Indicator

**Display**
- Carousel, Tree View

---

## 2. Peer design system counts (approximate)

| System | ~Count | Notes |
|--------|--------|--------|
| **Ant Design** | 50+ | General, Layout, Navigation, Data Entry, Data Display, Feedback |
| **MUI (Material UI)** | 50+ | Inputs, Data Display, Feedback, Surfaces, Navigation, Layout, Lab |
| **MUI Base** | 25+ | Unstyled primitives |
| **Radix Primitives** | 30+ | Unstyled, a11y-first |
| **Radix Themes** | 20+ | Themed on top of Primitives |
| **Chakra UI** | 50+ | Layout, Forms, Data display, Feedback, etc. |
| **Carbon (IBM)** | 40+ | Form, Data, Layout, + community |
| **Primer (GitHub)** | 35+ | React components |
| **Indigo.Design** | 60+ | Marketing reference |

---

## 3. Gap analysis — components in peers but not in UDS

Components below appear in at least two of MUI, Ant Design, Chakra, Carbon, or Radix but are **not** in UDS today. Treat this as the “longest list” target set to consider.

### 3.1 Layout & structure
| Component | MUI | Ant | Chakra | Carbon | Radix | Priority |
|-----------|-----|-----|--------|--------|-------|----------|
| **Box** | ✓ | ✓ | ✓ | — | — | High (primitive) |
| **Container** | ✓ | — | ✓ | — | — | Medium |
| **Grid** | ✓ | ✓ | ✓ | — | — | High |
| **Stack / Flex** | ✓ | ✓ | ✓ | — | — | High |
| **Divider** | ✓ | ✓ | ✓ | — | — | High |
| **Splitter** | — | ✓ | — | — | — | Low |
| **Aspect Ratio** | — | — | ✓ | — | ✓ | Medium |
| **Paper / Surface** | ✓ | — | — | — | — | Low |

### 3.2 Form & input
| Component | MUI | Ant | Chakra | Carbon | Radix | Priority |
|-----------|-----|-----|--------|--------|-------|----------|
| **Number Input** | ✓ | ✓ | — | ✓ | — | High |
| **Slider** | ✓ | ✓ | ✓ | ✓ | ✓ | High |
| **Rating / Rate** | ✓ | ✓ | — | — | — | Medium |
| **Color Picker** | — | ✓ | ✓ | — | — | Medium |
| **Time Picker** | ✓ | ✓ | — | — | — | Medium |
| **Mentions** | — | ✓ | — | — | — | Low |
| **Transfer** | ✓ | ✓ | — | — | — | Low |
| **Cascader** | — | ✓ | — | — | — | Low |
| **Form** (context) | ✓ | ✓ | ✓ | ✓ | — | High |

### 3.3 Data display
| Component | MUI | Ant | Chakra | Carbon | Radix | Priority |
|-----------|-----|-----|--------|--------|-------|----------|
| **Chip** (standalone) | ✓ | Tag | ✓ | Tag | — | Medium |
| **List** | ✓ | — | ✓ | ✓ | — | High |
| **Descriptions** | — | ✓ | — | — | — | Medium |
| **Empty** | — | ✓ | — | — | — | High |
| **Image** | ✓ | ✓ | ✓ | — | — | High |
| **Statistic / Stat** | — | ✓ | — | — | — | Medium |
| **Timeline** | ✓ | ✓ | — | — | — | Medium |
| **Typography** | ✓ | ✓ | ✓ | — | — | High |
| **Calendar** (inline) | — | ✓ | ✓ | — | — | Low |
| **QR Code** | — | ✓ | — | — | — | Low |

### 3.4 Feedback & overlay
| Component | MUI | Ant | Chakra | Carbon | Radix | Priority |
|-----------|-----|-----|--------|--------|-------|----------|
| **Backdrop** | ✓ | — | — | — | — | Low |
| **Message** | — | ✓ | — | — | — | Low |
| **Notification** | — | ✓ | — | — | — | Medium |
| **Popconfirm** | — | ✓ | — | — | — | Medium |
| **Tour / Onboarding** | — | ✓ | — | — | — | Low |
| **Context Menu** | — | — | — | — | ✓ | High |
| **Collapsible** | — | Collapse | ✓ | — | ✓ | Medium |

### 3.5 Navigation & misc
| Component | MUI | Ant | Chakra | Carbon | Radix | Priority |
|-----------|-----|-----|--------|--------|-------|----------|
| **Anchor** | — | ✓ | — | — | — | Low |
| **Menu** (bar) | ✓ | ✓ | — | ✓ | — | Medium |
| **Float Button / FAB** | ✓ | ✓ | — | — | — | Medium |
| **Bottom Navigation** | ✓ | — | — | — | — | Low |
| **Link** | ✓ | — | ✓ | ✓ | — | High |
| **Icon** | ✓ | ✓ | ✓ | — | — | High |

---

## 4. Proposed target list (longest list)

Target: add **~25–30** components so UDS reaches **~68–73** components, in line with “longest list” projects (e.g. Indigo 60+, Ant/MUI/Chakra 50+).

### Phase 1 — Layout & primitives (high impact)
1. **Box** — layout/spacing primitive
2. **Stack** (or **Flex**) — vertical/horizontal stack
3. **Grid** — responsive grid
4. **Divider** — visual separator
5. **Container** — max-width wrapper
6. **Typography** — text variants (heading, body, caption, etc.)
7. **Link** — styled link with variants

### Phase 2 — Form & input
8. **Number Input** — numeric only, stepper optional
9. **Slider** — range slider
10. **Form** — wrapper with label/error/required context (no full validation engine required for v1)
11. **Time Picker** — or extend Date Picker with time
12. **Rating** — star (or custom) rating input
13. **Color Picker** — swatch + optional input

### Phase 3 — Data display
14. **List** — simple list (ul/ol + list item)
15. **Empty** — empty state illustration + message + action
16. **Image** — img with fallback, aspect ratio, lazy
17. **Chip** — standalone removable tag (distinct from ChipInput)
18. **Descriptions** — key-value list
19. **Statistic** — large number + label
20. **Timeline** — vertical timeline
21. **Aspect Ratio** — wrapper for 16:9, 1:1, etc.

### Phase 4 — Overlay & feedback
22. **Context Menu** — right-click menu
23. **Popconfirm** — confirm/cancel popover
24. **Notification** — corner toasts (or extend Toast)
25. **Collapsible** — single expand/collapse (simpler than Accordion)

### Phase 5 — Navigation & polish
26. **Icon** — icon wrapper + size/color from tokens
27. **Float Button (FAB)** — floating action button
28. **Menu** — horizontal/vertical menu bar (if distinct from Dropdown)
29. **Anchor** — in-page link group (optional)

---

## 5. Tracking checklist (per component)

For each new component:

- [ ] **components.csv** — add row (id, name, slug, category, variants, sizes, states, props, accessibility, use_when, dont_use_when, css_class, container_query, min_target_size, lifecycle_stage)
- [ ] **React** — implement in `packages/react/src/components/<Name>/`, export from `index.ts`, BEM CSS in `components.css`
- [ ] **Vue** — implement in `packages/vue/src/components/Uds<Name>.vue`, export from `index.ts`
- [ ] **Svelte** — implement in `packages/svelte/src/components/<Name>.svelte`, export from `index.js`
- [ ] **Docs** — add to `docs/component-library.html` (HTML demo + React snippet), reference in `docs/docs.html` if needed
- [ ] **Tests** — React: `tests/components/<Name>.test.tsx`; optionally Vue/Svelte tests
- [ ] **Storybook** — React story in `stories-react/<Name>.stories.tsx`
- [ ] **Reasoning** — ensure `ui-reasoning.csv` / product-component mapping still makes sense
- [ ] **Bundle** — run `npm run size:check` and adjust limits if needed

---

## 6. Summary

| Metric | Current (implemented) | Target |
|--------|------------------------|--------|
| **components.csv** | **72** | 72 ✓ |
| **React** | **72** | 72 ✓ |
| **Vue / Svelte** | 47+ (Phase 1–2 full parity) | 72 (Phases 3–5 React-only for now) |

**Phases 1–5 implemented (React):** Box, Stack, Grid, Divider, Container, Typography, Link, Number Input, Slider, Form, Time Picker, Rating, Color Picker, List, Empty, Image, Chip, Descriptions, Statistic, Timeline, Aspect Ratio, Context Menu, Popconfirm, Notification, Collapsible, Icon, Float Button, Menu, Anchor.

This roadmap prioritizes components that appear across multiple major design systems and that support layout, forms, and data display first, then overlay/feedback and navigation, so UDS can offer one of the longest, well-tracked component lists among peer design systems.
