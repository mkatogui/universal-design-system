# Universal Design System

> The first AI-native design system. Describe your product — get a complete, accessible, shipping-ready design system in seconds.

[![npm](https://img.shields.io/npm/v/@mkatogui/universal-design-system)](https://www.npmjs.com/package/@mkatogui/universal-design-system)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1-AA-green.svg)](https://mkatogui.github.io/universal-design-system/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![9 Palettes](https://img.shields.io/badge/Palettes-9-blue.svg)](#9-palettes)
[![31 Components](https://img.shields.io/badge/Components-31-blue.svg)](#31-components)
[![496 Tokens](https://img.shields.io/badge/Tokens-496-blue.svg)](#token-architecture)
[![AI Platforms](https://img.shields.io/badge/AI_Platforms-20-purple.svg)](#supported-platforms)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)]()

[Live Demo](https://mkatogui.github.io/universal-design-system/) · [Documentation](https://mkatogui.github.io/universal-design-system/docs.html) · [Component Library](https://mkatogui.github.io/universal-design-system/component-library.html) · [Token Reference](https://mkatogui.github.io/universal-design-system/reference.html)

---

## Why Universal Design System?

Most design systems give you components. We give AI a **reasoning engine** that understands your domain and makes design decisions for you.

```bash
python3 src/scripts/design_system.py "fintech dashboard"
# => palette: corporate, components: data-table, tabs, badge, side-nav
#    anti-patterns: playful-animations (CRITICAL), neon-colors (CRITICAL)
#    tokens: 4px radius, subtle shadows, Inter font, minimal motion
```

One command. Full design system. WCAG-validated. Domain-appropriate.

### How it compares

| Feature | UDS | Material UI | DaisyUI | Style Dictionary | Radix UI |
|---------|-----|-------------|---------|-----------------|----------|
| AI-native reasoning engine | Yes | No | No | No | No |
| Domain-aware recommendations | 40 sectors, 8 product types | Manual selection | Manual selection | N/A | N/A |
| WCAG 2.1 AA automated audit | Automated contrast validation (108 pairs) | Partial | No | No | Yes (runtime) |
| Anti-pattern detection | 55+ domain-specific rules | No | No | No | No |
| Multi-framework output | React, Vue, Svelte | React only | CSS only | Platform tokens | React only |
| AI platform support | 20 platforms | N/A | N/A | N/A | N/A |
| Design tokens (W3C DTCG) | 496 tokens | Custom format | CSS vars | Yes (tooling) | CSS vars |
| Zero-config palette system | 9 palettes + custom | Theming API | 30+ themes | N/A | N/A |
| BM25 search across 17 databases | Yes (1500+ rows) | No | No | No | No |
| Tailwind CSS generation | Built-in | Community | Built-in | Plugin | No |

---

## Architecture

![Architecture](docs/assets/architecture.svg)

```
User Query -> Domain Detection -> BM25 Search -> Rule Application -> Output
               (40 sectors,        (17 CSVs,       (165 rules,
                8 product types)    1500+ rows)      55 anti-patterns)
```

**Layer 1 -- Domain Detection:** Classifies your product across 40 industry sectors and 8 product types with confidence scores.

**Layer 2 -- BM25 Search:** Okapi BM25 ranking (k1=1.5, b=0.75) across 17 CSV databases. Surfaces the most relevant palettes, components, patterns, typography, and color schemes.

**Layer 3 -- Rule Application:** Evaluates 165 conditional rules and flags 55+ industry-specific anti-patterns. First match wins for palette; all matching rules accumulate.

---

## Quick Start

### Install on any AI coding platform

```bash
npx @mkatogui/universal-design-system install
# Auto-detects: Claude Code, Cursor, Windsurf, VS Code, Zed, and 15 more
```

### Use the reasoning engine

```bash
# Search across all 17 databases
python3 src/scripts/search.py "fintech dashboard"

# Generate a full design system specification
python3 src/scripts/design_system.py "saas landing page"

# Generate with Tailwind CSS config
python3 src/scripts/design_system.py "healthcare portal" --format tailwind

# Generate with framework components
python3 src/scripts/design_system.py "ecommerce store" --framework react
python3 src/scripts/design_system.py "education app" --framework vue
python3 src/scripts/design_system.py "fintech dashboard" --framework svelte
```

### Apply a palette

```html
<html lang="en" data-theme="corporate">
```

```js
// Switch at runtime
document.documentElement.setAttribute('data-theme', 'ai-futuristic');
```

### Use tokens in your CSS

```css
.my-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}
```

### Install standalone tokens

```bash
npm install @mkatogui/uds-tokens
```

```js
import '@mkatogui/uds-tokens/css';           // CSS custom properties
import { tokens } from '@mkatogui/uds-tokens'; // JS/TS object
```

---

## What You Get

Describe your product in plain English. The engine reasons across 17 databases and 1500+ data rows:

```
$ python3 src/scripts/design_system.py "fintech dashboard"

========================================
  DESIGN SYSTEM SPECIFICATION
  Query: fintech dashboard
  Palette: corporate
========================================

  COLOR TOKENS
  ----------------------------------------
  --color-brand:       #1E40AF
  --color-brand-hover: #1E3A8A
  --color-bg-primary:  #FFFFFF
  --color-bg-surface:  #F8FAFC
  --color-text:        #0F172A
  --color-border:      #E2E8F0

  COMPONENTS
  ----------------------------------------
  data-table    Sortable rows, sticky headers
  tabs          Section switching, active state
  badge         Status indicators (success/warning/error)
  side-nav      Collapsible navigation, active highlight
  stat          KPI display with trend arrows

  ANTI-PATTERNS
  ----------------------------------------
  [CRITICAL] playful-animations -- Finance users expect stability
  [CRITICAL] neon-colors -- Undermines trust in regulated sectors
  [HIGH]     dark-themes -- Reduces data readability in dashboards

  DESIGN RULES
  ----------------------------------------
  * Use 4px border-radius (corporate precision)
  * Subtle shadows only (no dramatic elevation)
  * Inter for body, Inter for display headings
  * Minimal motion -- transitions under 200ms
========================================
```

---

## 9 Palettes

![Palettes](docs/assets/palettes.svg)

Each palette controls color, shadow, border-radius, and display font. Foundation tokens (spacing, type scale, motion, z-index) stay locked across all palettes.

| Palette | Radius | Shadow | Display Font | Best For |
|---------|--------|--------|-------------|----------|
| `minimal-saas` | 8px | subtle | Inter | SaaS, productivity tools |
| `ai-futuristic` | 12px | glow | Space Grotesk | AI products, dev tools |
| `gradient-startup` | 16px | medium | Plus Jakarta Sans | Startups, MVPs |
| `corporate` | 4px | subtle | Inter | Enterprise, B2B, regulated |
| `apple-minimal` | 12px | diffused | SF Pro Display | Premium, luxury brands |
| `illustration` | 20px | playful | Nunito | Education, kids, creative |
| `dashboard` | 8px | subtle | Inter | Analytics, admin panels |
| `bold-lifestyle` | 0px | hard | Clash Display | Fashion, media, lifestyle |
| `minimal-corporate` | 6px | subtle | DM Sans | Legal, consulting, professional |

### Custom Palettes

Create palettes from your brand colors:

```bash
python3 src/scripts/palette.py create --name my-brand --colors "#8B5CF6"
python3 src/scripts/palette.py create --name duo-tone --colors "#E8590C,#7048E8" --shape round
python3 src/scripts/palette.py preview --colors "#8B5CF6"
python3 src/scripts/palette.py list
```

---

## 31 Components

All components use BEM naming (`.uds-{component}--{variant}`) and CSS custom properties. No hardcoded values.

| Category | Components |
|----------|-----------|
| **Navigation** | Button, Navbar, Sidebar, Tabs, Breadcrumb, Pagination |
| **Data Input** | Input, Select, Checkbox, Radio, Toggle, Date Picker, File Upload |
| **Data Display** | Card, Table, Badge, Avatar, Tooltip, Stat, Skeleton |
| **Feedback** | Alert, Toast, Modal, Progress, Command Palette |
| **Layout** | Hero, Accordion, Divider, Footer, Dropdown Menu |
| **Composite** | Pricing, Testimonial, Feature Card, Code Block |

```html
<button class="uds-btn uds-btn--primary uds-btn--md">Get Started</button>

<div class="uds-card">
  <h3 class="uds-card__title">Feature</h3>
  <p class="uds-card__body">Description using design tokens.</p>
</div>
```

---

## Token Architecture

496 W3C DTCG tokens across 3 tiers:

```
Primitive (raw values)  ->  Semantic (functional names)  ->  Palette Overrides (per-palette)
  color.blue.700              color.brand                      corporate.color.brand
  space.4                     space.md                         (locked across palettes)
```

**Foundation tokens (locked):** body typography (Inter), 12-step spacing scale (4px base), motion durations/easing, z-index layers, opacity.

**Palette tokens (vary):** color (brand, text, bg, border, status), shadow (elevation), border-radius (shape), display font (h1-h3 only).

**Dark mode:** CSS variable override — same `--color-*` tokens redefined under `[data-theme="X"].docs-dark`.

---

## Supported Platforms

Install on any AI coding platform with one command:

```bash
npx @mkatogui/universal-design-system install --platform <name>
```

| | | | |
|----------|----------|----------|----------|
| Claude Code | Cursor | Windsurf | VS Code (Copilot) |
| Zed | Aider | Cline | Continue |
| Bolt | Lovable | Replit | OpenAI Codex |
| Kiro | Gemini CLI | Qoder | Roo Code |
| Trae | OpenCode | GitHub Copilot | Droid |

---

## CLI Commands

```bash
uds install              # Auto-detect platform and install
uds install --platform X # Install for a specific platform
uds install --dry-run    # Preview without changes
uds init                 # Interactive setup wizard
uds search "query"       # Search all databases
uds search "query" -v    # Verbose output
uds search "query" -j    # JSON output
uds generate "query"     # Generate full design system spec
uds generate "query" -f tailwind        # Tailwind CSS config
uds generate "query" --framework react  # React components
uds generate "query" --framework vue    # Vue components
uds generate "query" --framework svelte # Svelte components
uds tailwind "query"     # Shortcut for Tailwind generation
uds palette create       # Create custom palette from brand colors
uds palette list         # List all palettes
```

---

## Validation

Every change is validated against 3 automated checks:

```bash
npm run check            # Full validation suite (runs all 3 below)
npm run validate         # W3C DTCG token format validation
npm run audit            # WCAG 2.1 AA contrast (108 checks: 9 palettes x 2 modes)
npm run verify           # HTML docs integrity (no hardcoded values)
npm run sync-data        # CSV cross-reference validation
npm run test:a11y        # axe-core accessibility audit (5 docs pages)
npm run audit:apca       # APCA/WCAG 3.0 contrast analysis
```

---

## Project Structure

```
universal-design-system/
  tokens/                 # W3C DTCG design tokens (source of truth)
  src/
    data/                 # 17 CSV databases (1500+ rows)
    scripts/              # BM25 engine, search CLI, spec generator, palette CLI
    mcp/                  # MCP server for AI coding tool integration
  cli/                    # TypeScript CLI (zero dependencies)
  packages/
    tokens/               # Standalone token package (@mkatogui/uds-tokens)
    react/                # React components (@mkatogui/uds-react)
    vue/                  # Vue 3 components (@mkatogui/uds-vue)
    svelte/               # Svelte 5 components (@mkatogui/uds-svelte)
    primitives/           # Headless accessible primitives (@mkatogui/uds-primitives)
  docs/                   # Interactive HTML documentation (5 pages)
    assets/               # Architecture diagram, palette swatches
  scripts/                # Validation scripts (WCAG, tokens, docs, axe-core, APCA)
  audits/                 # Audit results (WCAG, axe-core, APCA)
  .claude/skills/         # Claude Code skills (5 skills)
```

---

## MCP Server

Expose the design system to any AI coding tool via Model Context Protocol:

```json
{
  "mcpServers": {
    "universal-design-system": {
      "command": "node",
      "args": ["src/mcp/index.js"]
    }
  }
}
```

Available tools: `search_design_system`, `get_palette`, `get_component`, `generate_tokens`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding palettes, components, and reasoning rules.

## License

MIT License. See [LICENSE](LICENSE) for details.
