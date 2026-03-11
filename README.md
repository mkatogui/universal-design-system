# Universal Design System

A production-grade design system reverse-engineered from 100 modern websites, distilled into one governed brand foundation with 9 structural palettes, 31 components, 8 patterns, and automated WCAG 2.1 AA compliance.

**Version:** 0.8.0 | **License:** MIT

---

## What Makes This Different

Most design systems give you one look. This one gives you **nine distinct visual identities** — each controlling color, shadow, border-radius, and display font — while sharing a single locked foundation for typography, spacing, motion, and layout. Switch palettes with one attribute change; every component adapts automatically.

| Palette | Identity | Best For |
|---------|----------|----------|
| Minimal SaaS | Balanced, neutral | Product UI, apps |
| Gradient Startup | High-energy gradients | Marketing, landing pages |
| AI Futuristic | Sharp, dark-native | Dev tools, AI products |
| Corporate | Conservative, squared | Enterprise, regulated |
| Apple Minimal | Smooth, refined | Premium consumer |
| Illustration | Friendly, rounded | Education, creative |
| Dashboard | Compact, data-dense | Analytics, admin panels |
| Bold Lifestyle | Brutalist, 0px radius | Fashion, media |
| Minimal Corporate | Subtle, understated | Professional services |

## Quick Start

### 1. Open the Docs

Open `docs/index.html` in your browser for the full interactive documentation with live previews, palette switching, a component sandbox, and motion choreography demos.

### 2. Use the Tokens

**CSS Custom Properties (recommended):**
```html
<html lang="en" data-theme="minimal-saas">
```

**Style Dictionary build (CSS, JS, iOS, Android):**
```bash
npm install
npx style-dictionary build
```

**Figma (Tokens Studio):**
Import `tokens/figma-tokens.json` into the Tokens Studio plugin.

### 3. Use a Component

```html
<button class="btn btn--primary btn--md">Get Started</button>
```

Switch themes at any time:
```js
document.documentElement.setAttribute('data-theme', 'corporate');
```

## Repository Structure

```
universal-design-system/
  docs/
    index.html                 # Interactive documentation (Storybook-style)
    component-library.html     # Shadcn-style component library
    reference.html             # Design reference comparisons
    critique.html              # Design critique & analysis
    evaluation.html            # Evaluation rubric
    source-analysis.xlsx       # 100-website reverse-engineering data
  tokens/
    design-tokens.json         # W3C DTCG format (source of truth)
    figma-tokens.json          # Figma Tokens Studio compatible
  audits/
    a11y-audit.json            # WCAG 2.1 AA contrast audit results
  scripts/
    wcag-audit.py              # Automated contrast ratio checker
    validate-tokens.py         # Token format & sync validator
    verify-docs.py             # HTML docs integrity checker
  SPECIFICATION.md             # Full design system specification
  CHANGELOG.md                 # Version history
  CONTRIBUTING.md              # Contribution guidelines
  style-dictionary.config.json # Style Dictionary build pipeline
  package.json                 # NPM project metadata
```

## Architecture

### Foundation (Locked)

These tokens are governance-locked and shared across all palettes:

- **Typography:** Inter (body), system font stack, 8-step modular scale
- **Spacing:** 4px base unit, 12-step scale (2px–96px)
- **Motion:** 4 duration tiers, 3 easing curves, 13 choreography presets
- **Z-Index:** 6-tier stack (dropdown → toast → modal → popover → tooltip → overlay)
- **Opacity:** disabled (0.5), overlay (0.6), subtle (0.08)

### Palettes (Switchable)

Each palette overrides these token categories:

- **Color:** 20+ semantic color tokens (brand, text, background, border, status)
- **Shadow:** 5-tier elevation scale (sm → 2xl)
- **Border Radius:** 5-tier radius scale (sm → 2xl)
- **Display Font:** h1–h3 typeface (DM Sans, Oswald, Source Serif 4, etc.)

### Components (31)

Buttons, Inputs, Cards, Alerts, Toasts, Badges, Toggles, Avatars, Dropdowns, Accordions, Tooltips, Modals, Tabs, Data Tables, Pagination, Breadcrumbs, Skeletons, Progress Bars, and more. Each has a CVA-style variant API with documented props, sizes, and states.

### Patterns (8)

Form layouts, navigation, hero sections, pricing tables, feature grids, testimonials, footer, and dashboard layouts.

## Token Format

Tokens follow the [W3C Design Token Community Group](https://design-tokens.github.io/community-group/format/) specification:

```json
{
  "color": {
    "brand-primary": {
      "$value": "#2563EB",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

## Accessibility

Every palette x mode combination (18 total) passes WCAG 2.1 AA contrast requirements. The automated audit checks 6 critical color pairs per combination (62 checks total, 100% pass rate).

Run the audit yourself:
```bash
python scripts/wcag-audit.py
```

Results are saved to `audits/a11y-audit.json`.

## Motion Choreography

The system includes 13 motion presets organized into 4 categories:

- **Enter:** fade-in, slide-up, scale-in, expand
- **Exit:** fade-out, slide-down, scale-out
- **Stagger:** children-fast (40ms), children-normal (60ms), grid (80ms)
- **Interaction:** hover-lift, press-down, focus-ring

All animations respect `prefers-reduced-motion: reduce`.

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/wcag-audit.py` | Run WCAG contrast checks across all palettes |
| `scripts/validate-tokens.py` | Validate token format and cross-file sync |
| `scripts/verify-docs.py` | Verify HTML docs integrity (no hardcoded values, valid links) |

## Development

```bash
# Install dependencies
npm install

# Build tokens for all platforms
npx style-dictionary build

# Run token validation
python scripts/validate-tokens.py

# Run accessibility audit
python scripts/wcag-audit.py

# Verify documentation integrity
python scripts/verify-docs.py --file docs/index.html
```

## Version History

See [CHANGELOG.md](CHANGELOG.md) for the full version history from v0.1.0 to v0.8.0.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built by reverse-engineering 100 websites into one universal system.
