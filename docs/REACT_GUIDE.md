# UDS React — Getting Started

A practical guide to using the Universal Design System React component library (`@mkatogui/uds-react`) in your application.

---

## Installation

```bash
npm install @mkatogui/uds-react
```

---

## Quick start

Import the CSS once at your app's entry point, then use components anywhere.

```tsx
// main.tsx or App.tsx
import '@mkatogui/uds-react/dist/styles.css';
```

```tsx
import { Button, Input, Card } from '@mkatogui/uds-react';

function App() {
  return (
    <Card>
      <Input label="Email" type="email" required />
      <Button variant="primary" size="md">Submit</Button>
    </Card>
  );
}
```

---

## Theming with palettes

UDS ships with **9 structural palettes**. Apply one by setting `data-theme` on a root element (typically `<html>` or a wrapper `<div>`):

```html
<html data-theme="minimal-saas">
```

Available palettes:

| Palette | Best for |
|---------|----------|
| `minimal-saas` | SaaS dashboards, admin panels |
| `ai-futuristic` | AI/ML products, dark-first interfaces |
| `gradient-startup` | Marketing sites, startup landing pages |
| `corporate` | Enterprise apps, B2B portals |
| `apple-minimal` | Consumer products, clean editorial |
| `illustration` | Creative tools, portfolios |
| `dashboard` | Data-heavy dashboards, analytics |
| `bold-lifestyle` | E-commerce, lifestyle brands |
| `minimal-corporate` | Professional services, finance |

**One palette per surface.** Don't mix palettes on the same page.

### Dark mode

Add the `docs-dark` class alongside the palette:

```html
<html data-theme="minimal-saas" class="docs-dark">
```

Toggle programmatically:

```tsx
function toggleDarkMode() {
  document.documentElement.classList.toggle('docs-dark');
}
```

---

## Component overview

All components follow BEM naming (`.uds-{component}`) and use CSS custom properties for theming. They accept standard HTML attributes via `...props` spreading and support `ref` forwarding.

### Layout

| Component | Import | Use when |
|-----------|--------|----------|
| `Box` | `import { Box } from '@mkatogui/uds-react'` | Generic container with token-based spacing |
| `Container` | `import { Container } from '@mkatogui/uds-react'` | Max-width centered wrapper |
| `Grid` | `import { Grid } from '@mkatogui/uds-react'` | CSS Grid layout |
| `Stack` | `import { Stack } from '@mkatogui/uds-react'` | Vertical/horizontal flex stack |
| `Divider` | `import { Divider } from '@mkatogui/uds-react'` | Visual separator |

### Forms

| Component | Import | Use when |
|-----------|--------|----------|
| `Input` | `import { Input } from '@mkatogui/uds-react'` | Text, email, password, number, search, textarea |
| `Select` | `import { Select } from '@mkatogui/uds-react'` | Dropdown selection |
| `Checkbox` | `import { Checkbox } from '@mkatogui/uds-react'` | Boolean toggle (checkbox) |
| `Radio` | `import { Radio } from '@mkatogui/uds-react'` | Single selection from a group |
| `Toggle` | `import { Toggle } from '@mkatogui/uds-react'` | On/off switch |
| `Slider` | `import { Slider } from '@mkatogui/uds-react'` | Range selection |
| `FileUpload` | `import { FileUpload } from '@mkatogui/uds-react'` | File upload (dropzone, button, avatar) |
| `DatePicker` | `import { DatePicker } from '@mkatogui/uds-react'` | Date selection |
| `TimePicker` | `import { TimePicker } from '@mkatogui/uds-react'` | Time selection |
| `NumberInput` | `import { NumberInput } from '@mkatogui/uds-react'` | Numeric stepper |
| `OTPInput` | `import { OTPInput } from '@mkatogui/uds-react'` | One-time passcode entry |
| `ColorPicker` | `import { ColorPicker } from '@mkatogui/uds-react'` | Color selection |
| `ChipInput` | `import { ChipInput } from '@mkatogui/uds-react'` | Multi-value tag input |
| `Form` | `import { Form } from '@mkatogui/uds-react'` | Form wrapper |
| `FormSection` | `import { FormSection } from '@mkatogui/uds-react'` | Field group with heading |

### Navigation

| Component | Import | Use when |
|-----------|--------|----------|
| `Navbar` | `import { Navbar } from '@mkatogui/uds-react'` | Top navigation bar |
| `SideNav` | `import { SideNav } from '@mkatogui/uds-react'` | Sidebar navigation |
| `Breadcrumb` | `import { Breadcrumb } from '@mkatogui/uds-react'` | Breadcrumb trail |
| `Tabs` | `import { Tabs } from '@mkatogui/uds-react'` | Tabbed content |
| `Pagination` | `import { Pagination } from '@mkatogui/uds-react'` | Page navigation |
| `Stepper` | `import { Stepper } from '@mkatogui/uds-react'` | Multi-step progress |
| `CommandPalette` | `import { CommandPalette } from '@mkatogui/uds-react'` | Power-user keyboard navigation |

### Feedback

| Component | Import | Use when |
|-----------|--------|----------|
| `Alert` | `import { Alert } from '@mkatogui/uds-react'` | Inline messages |
| `Toast` | `import { Toast } from '@mkatogui/uds-react'` | Temporary notifications |
| `Notification` | `import { Notification } from '@mkatogui/uds-react'` | Persistent notifications |
| `Progress` | `import { Progress } from '@mkatogui/uds-react'` | Loading bars, spinners, steppers |
| `Skeleton` | `import { Skeleton } from '@mkatogui/uds-react'` | Loading placeholders |
| `Empty` | `import { Empty } from '@mkatogui/uds-react'` | Empty state messaging |

### Data display

| Component | Import | Use when |
|-----------|--------|----------|
| `DataTable` | `import { DataTable } from '@mkatogui/uds-react'` | Sortable, filterable tables |
| `Card` | `import { Card } from '@mkatogui/uds-react'` | Content cards |
| `Badge` | `import { Badge } from '@mkatogui/uds-react'` | Status indicators, counts |
| `Avatar` | `import { Avatar } from '@mkatogui/uds-react'` | User/entity images |
| `Chip` | `import { Chip } from '@mkatogui/uds-react'` | Tags, filters |
| `Statistic` | `import { Statistic } from '@mkatogui/uds-react'` | Key metrics |
| `List` | `import { List } from '@mkatogui/uds-react'` | Structured lists |
| `Descriptions` | `import { Descriptions } from '@mkatogui/uds-react'` | Key-value pairs |
| `CodeBlock` | `import { CodeBlock } from '@mkatogui/uds-react'` | Code display |
| `Timeline` | `import { Timeline } from '@mkatogui/uds-react'` | Chronological events |
| `TreeView` | `import { TreeView } from '@mkatogui/uds-react'` | Hierarchical data |

### Overlays

| Component | Import | Use when |
|-----------|--------|----------|
| `Modal` | `import { Modal } from '@mkatogui/uds-react'` | Dialogs, confirmations |
| `AlertDialog` | `import { AlertDialog } from '@mkatogui/uds-react'` | Destructive action confirmation |
| `Drawer` | `import { Drawer } from '@mkatogui/uds-react'` | Side panels |
| `Popover` | `import { Popover } from '@mkatogui/uds-react'` | Contextual content |
| `Popconfirm` | `import { Popconfirm } from '@mkatogui/uds-react'` | Inline confirmation |
| `Tooltip` | `import { Tooltip } from '@mkatogui/uds-react'` | Hover hints |
| `ContextMenu` | `import { ContextMenu } from '@mkatogui/uds-react'` | Right-click menus |
| `Dropdown` | `import { Dropdown } from '@mkatogui/uds-react'` | Dropdown menus |

### Actions

| Component | Import | Use when |
|-----------|--------|----------|
| `Button` | `import { Button } from '@mkatogui/uds-react'` | Primary actions |
| `Link` | `import { Link } from '@mkatogui/uds-react'` | Navigation links |
| `FloatButton` | `import { FloatButton } from '@mkatogui/uds-react'` | Floating action button |
| `Toolbar` | `import { Toolbar } from '@mkatogui/uds-react'` | Action bar |
| `SegmentedControl` | `import { SegmentedControl } from '@mkatogui/uds-react'` | Toggle between views |

### Content

| Component | Import | Use when |
|-----------|--------|----------|
| `Typography` | `import { Typography } from '@mkatogui/uds-react'` | Headings, body text |
| `Hero` | `import { Hero } from '@mkatogui/uds-react'` | Landing page hero sections |
| `Accordion` | `import { Accordion } from '@mkatogui/uds-react'` | Expandable content |
| `Collapsible` | `import { Collapsible } from '@mkatogui/uds-react'` | Toggle content visibility |
| `Carousel` | `import { Carousel } from '@mkatogui/uds-react'` | Image/content slider |
| `Image` | `import { Image } from '@mkatogui/uds-react'` | Responsive images |
| `AspectRatio` | `import { AspectRatio } from '@mkatogui/uds-react'` | Fixed aspect ratio container |
| `Icon` | `import { Icon } from '@mkatogui/uds-react'` | Icon wrapper |
| `Rating` | `import { Rating } from '@mkatogui/uds-react'` | Star ratings |
| `Testimonial` | `import { Testimonial } from '@mkatogui/uds-react'` | Customer testimonials |
| `SocialProof` | `import { SocialProof } from '@mkatogui/uds-react'` | Trust indicators |
| `Pricing` | `import { Pricing } from '@mkatogui/uds-react'` | Pricing cards |
| `Footer` | `import { Footer } from '@mkatogui/uds-react'` | Page footer |

---

## Common patterns

### Form with validation

```tsx
import { Form, FormSection, Input, FileUpload, Button } from '@mkatogui/uds-react';

function ApplicationForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <Form onSubmit={handleSubmit}>
      <FormSection title="Personal info">
        <Input label="Full name" required errorText={errors.name} />
        <Input label="Email" type="email" required errorText={errors.email} />
        <Input label="Phone" optional />
      </FormSection>

      <FormSection title="Documents" description="Upload your resume in PDF format.">
        <FileUpload
          accept=".pdf"
          maxSize={5 * 1024 * 1024}
          placeholderTitle="Drop your resume here"
          placeholderDescription="PDF, max 5 MB"
          error={errors.resume}
        />
      </FormSection>

      <FormSection title="About you">
        <Input label="Cover letter" multiline helperText="Tell us why you're a good fit." />
      </FormSection>

      <Button type="submit" variant="primary">Submit application</Button>
    </Form>
  );
}
```

### Data dashboard

```tsx
import { Card, DataTable, Statistic, Grid, Badge } from '@mkatogui/uds-react';

function Dashboard() {
  return (
    <>
      <Grid columns={3} gap="md">
        <Statistic title="Revenue" value="$48,200" trend="up" />
        <Statistic title="Users" value="1,240" trend="up" />
        <Statistic title="Issues" value="3" trend="down" />
      </Grid>

      <Card>
        <DataTable
          columns={columns}
          data={rows}
          sortable
          filterable
        />
      </Card>
    </>
  );
}
```

### Modal confirmation

```tsx
import { Modal, Button } from '@mkatogui/uds-react';

function DeleteConfirmation({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete item?">
      <p>This action cannot be undone.</p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </div>
    </Modal>
  );
}
```

---

## Sizing

Most interactive components support `size` with `'sm' | 'md' | 'lg'`:

```tsx
<Button size="sm">Small</Button>
<Input size="md" label="Medium" />
<Select size="lg" label="Large" options={options} />
```

---

## Accessibility

All components are built with WCAG 2.2 AA compliance:

- **ARIA attributes** are applied automatically (roles, labels, expanded states, live regions).
- **Keyboard navigation** works out of the box (Tab, Enter, Space, Escape, Arrow keys).
- **Focus management** is handled for overlays (Modal, Drawer, AlertDialog trap focus).
- **Screen readers** are supported via semantic HTML and ARIA.

Key props for accessibility:

```tsx
// Required indicator + aria-required
<Input label="Email" required />

// Error state + aria-invalid
<Input label="Email" errorText="Invalid email address" />

// Custom accessible label
<FileUpload label="Upload resume" />

// Modal with proper labelling
<Modal title="Confirm action" open={open} onClose={onClose}>
  ...
</Modal>
```

---

## CSS custom properties (tokens)

Components use design tokens via CSS custom properties. Override them to customize appearance without touching component code:

```css
/* Override tokens for a specific scope */
.my-app {
  --color-brand-primary: #3B82F6;
  --color-bg-primary: #FFFFFF;
  --color-text-primary: #1A1A2E;
  --font-sans: 'Inter', sans-serif;
  --radius-md: 8px;
  --space-4: 16px;
}
```

Key token categories:

| Category | Examples |
|----------|---------|
| Color | `--color-brand-primary`, `--color-text-primary`, `--color-bg-primary`, `--color-border-default` |
| Spacing | `--space-1` (4px) through `--space-12` (48px) |
| Typography | `--font-sans`, `--font-size-base`, `--font-size-sm`, `--font-size-lg` |
| Border radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full` |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |

---

## Tree-shaking

The package uses named ESM exports and declares `sideEffects: ["**/*.css"]`. Bundlers (webpack, Vite, esbuild) automatically drop unused components from the JS bundle. Import only what you use:

```tsx
// Only Button and Input are included in your bundle
import { Button, Input } from '@mkatogui/uds-react';
```

---

## Further reading

- [Form patterns](./FORM_PATTERNS.md) — required/optional fields, validation, FormSection
- [Adoption feedback](./ADOPTION_FEEDBACK.md) — API decisions and rationale
- [Interactive playground](https://mkatogui.github.io/universal-design-system/playground.html) — try all components live
- [Component library](https://mkatogui.github.io/universal-design-system/component-library.html) — code reference with copy buttons
- [Token reference](https://mkatogui.github.io/universal-design-system/reference.html) — visual token catalog
