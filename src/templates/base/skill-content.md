# Universal Design System — Core Content

## Design System Generation Workflow

When a user asks for a design system, follow this 5-step process:

### Step 1: Detect Domain
Classify the user's query into sector + product type.
- Search `products.csv` for matching product categories
- Match against known sectors (fintech, healthcare, education, ecommerce, etc.)
- Identify product type (dashboard, landing, mobile-app, etc.)

### Step 2: Search Databases
Run BM25 search across all CSV databases:
- **products.csv** — Find matching product archetypes
- **styles.csv** — Match UI visual styles
- **colors.csv** — Find industry-appropriate color palettes
- **typography.csv** — Get font pairings by mood
- **components.csv** — Identify required UI components
- **patterns.csv** — Find layout patterns
- **landing.csv** — Get landing page templates (if applicable)
- **charts.csv** — Chart recommendations (for dashboards)
- **icons.csv** — Icon system suggestions

### Step 3: Apply Reasoning Rules
Process conditional rules from `ui-reasoning.csv`:
- Filter rules matching the detected sector/product type
- Apply in priority order (1 = highest)
- Override defaults with rule outputs
- Check `anti-patterns.csv` for common mistakes in this domain

### Step 4: Generate Design System
Combine all resolved data into a complete specification:
- **Palette**: Selected from 9 structural palettes
- **Tokens**: Resolved from `design-tokens.json`
- **Typography**: Font pairing + scale
- **Components**: Full list with variants
- **Patterns**: Page layouts and sections
- **Guidelines**: UX best practices

### Step 5: Deliver with Checklist
Verify the output against the pre-delivery checklist:
1. Palette declared with `data-theme`
2. All tokens use CSS custom properties
3. Typography scale uses `--font-size-*` tokens
4. Spacing uses `--space-*` tokens
5. All interactive elements have focus states
6. Color contrast passes WCAG 2.1 AA (4.5:1 body, 3:1 large)
7. Components include ARIA attributes
8. Responsive breakpoints defined
9. Motion respects `prefers-reduced-motion`
10. Dark mode considerations documented

## Palette Architecture

The system uses 9 structural palettes. Each palette controls:
- `--color-*` — Full color scale (primary, secondary, accent, bg, surface, text, border, error, success, warning)
- `--shadow-*` — Shadow depth tokens (sm, md, lg)
- `--radius-*` — Border radius tokens (sm, md, lg, full)
- `--font-display` — Display/heading typeface

Foundation tokens (spacing, typography scale, motion, z-index) are shared across all palettes.

### Palette Selection Logic
| Sector | Default Palette | Override Condition |
|--------|----------------|-------------------|
| SaaS/Productivity | minimal-saas | — |
| AI/ML/Developer | ai-futuristic | — |
| Startup/MVP | gradient-startup | — |
| Enterprise/B2B | corporate | — |
| Premium/Luxury | apple-minimal | — |
| Education/Kids | illustration | — |
| Dashboard/Analytics | dashboard | — |
| Lifestyle/Fashion | bold-lifestyle | — |
| Legal/Professional | minimal-corporate | — |

## Component Categories

### Navigation (6)
Button, Navbar, Sidebar, Tabs, Breadcrumb, Pagination

### Data Input (5)
Input, Select, Checkbox, Radio, Toggle

### Data Display (6)
Card, Table, Badge, Avatar, Tooltip, Stat

### Feedback (4)
Alert, Toast, Modal, Progress

### Layout (5)
Accordion, Divider, Grid, Drawer, Footer

### Composite (5)
Hero, Pricing, Testimonial, Feature, CTA
