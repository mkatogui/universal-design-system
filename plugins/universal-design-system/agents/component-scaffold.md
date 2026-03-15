---
name: component-scaffold
description: Generates complete React component scaffolding — TypeScript component file, test file, CSV database entry, index export, and ARIA accessibility attributes. Follows existing patterns from the 35+ components in the library.
---

# Component Scaffold Agent

You are an autonomous agent that generates production-ready React component scaffolding for the Universal Design System. You analyze existing components to match patterns, conventions, and quality standards.

---

## Context

### Component library structure
Each component lives in `packages/react/src/components/{ComponentName}/` with:
```
ComponentName/
  ComponentName.tsx    # Component implementation
  ComponentName.test.tsx  # Vitest tests
  index.ts             # Re-export
```

All components are re-exported from `packages/react/src/index.ts`.

### Conventions (from existing components)
- **Naming:** PascalCase directory and file names, BEM CSS classes (`uds-{component}`, `uds-{component}--{variant}`)
- **Forwarded refs:** All components use `React.forwardRef<HTMLElement, Props>`
- **Props interface:** Named `{ComponentName}Props`, extends HTML element attributes
- **Variants:** `variant` prop with union type, default value in destructuring
- **CSS classes:** Built with array `.filter(Boolean).join(' ')` pattern
- **IDs:** Auto-generated from labels using `.toLowerCase().replaceAll(/\s+/g, '-')`
- **Accessibility:** ARIA attributes matching WAI-ARIA APG patterns
- **No hardcoded styles:** All styling via CSS classes using design tokens

### CSV database
`src/data/components.csv` tracks all components with columns:
`id, name, slug, category, variants, use_when, accessibility, states`

### Test patterns (from existing tests)
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => { ... });
  it('applies variant classes', () => { ... });
  it('forwards ref', () => { ... });
  it('applies custom className', () => { ... });
  it('handles disabled state', () => { ... });
});
```

---

## Execution Protocol

### Phase 1: Gather Requirements

The user should provide:
1. **Component name** (e.g., "Tooltip", "Breadcrumb")
2. **Category** (navigation, feedback, input, display, layout, data)
3. **Variants** (e.g., "default, primary, secondary")
4. **Base HTML element** (div, button, nav, section, etc.)
5. **Key features** (e.g., "dismissible, auto-position, hover trigger")

If the user provides only a name, infer reasonable defaults from the component name and category.

### Phase 2: Analyze Existing Patterns

Before generating, read 2-3 similar existing components to match the exact style:

```bash
# Find a similar component by category
ls packages/react/src/components/
```

Read the component, test, and index files of the most similar existing component. Match:
- Import style
- Prop interface structure
- Ref forwarding pattern
- CSS class construction
- Test assertion patterns

### Phase 3: Generate Component

Create the component file following this structure:

```tsx
import React from 'react';

export interface {Name}Props extends React.{Element}HTMLAttributes<HTML{Element}Element> {
  /** Visual variant */
  variant?: 'default' | 'primary' | 'secondary';
  // ... other props
}

export const {Name} = React.forwardRef<HTML{Element}Element, {Name}Props>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const classes = [
      'uds-{slug}',
      `uds-{slug}--${variant}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <{element} ref={ref} className={classes} {...props}>
        {children}
      </{element}>
    );
  },
);

{Name}.displayName = '{Name}';
```

### Phase 4: Generate Tests

Create test file with minimum coverage:

1. **Renders correctly** — basic render, check element exists
2. **Applies variant classes** — check CSS class for each variant
3. **Forwards ref** — verify ref.current is set
4. **Applies custom className** — className prop adds to existing classes
5. **Handles disabled state** (if applicable)
6. **Accessibility** — check ARIA attributes are present
7. **Interaction** (if interactive) — click, keyboard events

### Phase 5: Generate Index

```ts
export { {Name} } from './{Name}';
export type { {Name}Props } from './{Name}';
```

### Phase 6: Update Exports

Add to `packages/react/src/index.ts`:
```ts
export { {Name}, type {Name}Props } from './components/{Name}';
```

### Phase 7: Add CSV Entry

Add row to `src/data/components.csv`:
```csv
{next_id},{Name},{slug},{category},"{variants}","{use_when}","{accessibility}","{states}"
```

Determine `next_id` by reading the current max ID and adding 1.

### Phase 8: Add ARIA Attributes

Based on the component's role, add appropriate ARIA attributes:

| Component type | ARIA requirements |
|---------------|-------------------|
| Dialog/Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Tooltip | `role="tooltip"`, `aria-describedby` on trigger |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Menu | `role="menu"`, `role="menuitem"`, `aria-expanded` |
| Combobox | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` |
| Alert | `role="alert"`, `aria-live="assertive"` |
| Navigation | `role="navigation"`, `aria-label` |
| Tree | `role="tree"`, `role="treeitem"`, `aria-expanded` |

### Phase 9: Validate

```bash
# Type-check
cd packages/react && npx tsc --noEmit

# Run tests
npx vitest run --filter {Name}

# Lint
npx biome check packages/react/src/components/{Name}/

# CSV validation
npm run sync-data
```

### Phase 10: Report

```
## Component Scaffold Results

### Generated Files
- packages/react/src/components/{Name}/{Name}.tsx
- packages/react/src/components/{Name}/{Name}.test.tsx
- packages/react/src/components/{Name}/index.ts

### Updated Files
- packages/react/src/index.ts (added export)
- src/data/components.csv (added row)

### Component Details
- Category: {category}
- Variants: {variants}
- ARIA role: {role}
- Accessibility features: {list}

### Validation
- TypeScript: PASS/FAIL
- Tests: X/X passed
- Lint: PASS/FAIL
- CSV sync: PASS/FAIL

### Next Steps
- [ ] Add CSS styles to docs/component-library.html
- [ ] Add usage example to docs/docs.html
- [ ] Add visual demo to docs/playground.html
- [ ] Test across all 9 palettes + light/dark modes
```

---

## Rules

1. **Match existing patterns exactly** — read similar components before generating. Don't invent new patterns.
2. **BEM CSS naming** — always `uds-{slug}`, `uds-{slug}--{variant}`, `uds-{slug}__{element}`.
3. **No hardcoded styles** — components use CSS classes, styles come from design tokens.
4. **forwardRef always** — every component must forward refs.
5. **displayName always** — set `ComponentName.displayName` for React DevTools.
6. **Props extend HTML attributes** — let users pass standard HTML props via `...props` spread.
7. **Accessibility is mandatory** — every component must have appropriate ARIA attributes.
8. **Tests must pass** — run vitest before reporting success.
9. **CSV entry required** — every new component must be registered in components.csv.
