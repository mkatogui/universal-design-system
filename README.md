# Universal Design System

> Other tools tell AI what colors to use. We give it a complete, accessible, WCAG-validated design system it can ship.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1-AA_Compliant-green.svg)](https://mkatogui.github.io/universal-design-system/)
[![Platforms](https://img.shields.io/badge/AI_Platforms-20-purple.svg)](https://mkatogui.github.io/universal-design-system/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)]()

[Live Demo](https://mkatogui.github.io/universal-design-system/) · [Documentation](https://mkatogui.github.io/universal-design-system/docs.html) · [Component Library](https://mkatogui.github.io/universal-design-system/component-library.html) · [Token Reference](https://mkatogui.github.io/universal-design-system/reference.html)

---

## At a Glance

| | | |
|---|---|---|
| **9** structural palettes | **496** W3C DTCG tokens | **31** BEM components |
| **165+** product category rules | **55+** anti-patterns | **200+** Google Fonts catalog |
| **200+** icon library index | **20** AI platform support | **100%** WCAG 2.1 AA compliance |
| **BM25** reasoning engine | **Tailwind CSS** config generation | **React, Vue, Svelte** output |

---

## Quick Start

### CLI (zero dependencies)

```bash
# Install on your AI coding platform (auto-detects)
uds install

# Or target a specific platform
uds install --platform cursor

# Interactive setup wizard
uds init

# Search the design system
uds search "fintech dashboard"

# Generate a complete design system
uds generate "saas landing page"

# Generate with Tailwind config
uds generate "healthcare portal" --format tailwind

# Generate with framework code
uds generate "ecommerce store" --framework react
```

### Manual Install

```bash
# Clone and use directly
git clone https://github.com/mkatogui/universal-design-system.git
cd universal-design-system

# Search with Python directly
python3 src/scripts/search.py "fintech dashboard"

# Generate a full spec
python3 src/scripts/design_system.py "saas landing page"
```

### Apply a Palette

```html
<html lang="en" data-theme="corporate">
```

Switch at runtime:

```js
document.documentElement.setAttribute('data-theme', 'ai-futuristic');
```

---

## 9 Structural Palettes

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

---

## How It Works

1. **Install** the skill on your AI coding platform
2. **Describe** your product ("fintech dashboard", "kids education app", "saas landing page")
3. **Get** a complete, shipping-ready design system -- tokens, components, typography, color palette, anti-patterns, and WCAG compliance baked in

The engine doesn't guess. It reasons across 16 databases and 1400+ data rows to produce opinionated, domain-appropriate design decisions.

---

## Architecture: 3-Layer Reasoning Pipeline

```
User Query -> Domain Detection -> BM25 Search -> Rule Application -> Output
               (21 sectors,        (16 CSVs,       (165 rules,
                8 product types)    1400+ rows)      55 anti-patterns)
```

**Layer 1 -- Domain Detection:** Classifies your product across 21 industry sectors and 8 product types. Returns sector + product type with confidence scores.

**Layer 2 -- BM25 Search:** Okapi BM25 ranking (k1=1.5, b=0.75) across 16 CSV databases. Surfaces the most relevant palettes, components, patterns, typography, and color schemes for your domain.

**Layer 3 -- Rule Application:** Evaluates 165 conditional rules (IF sector=finance THEN palette=corporate). Flags 55+ industry-specific anti-patterns (bright colors in finance, playful animations in healthcare).

---

## 31 Components

All components use BEM naming (`.uds-{component}--{variant}`) and CSS custom properties. No hardcoded values.

| Category | Components |
|----------|-----------|
| **Navigation** | Button, Navbar, Sidebar, Tabs, Breadcrumb, Pagination |
| **Data Input** | Input, Select, Checkbox, Radio, Toggle |
| **Data Display** | Card, Table, Badge, Avatar, Tooltip, Stat |
| **Feedback** | Alert, Toast, Modal, Progress |
| **Layout** | Accordion, Divider, Grid, Drawer, Footer |
| **Composite** | Hero, Pricing, Testimonial, Feature, CTA |

```html
<button class="uds-btn uds-btn--primary uds-btn--md">Get Started</button>
```

---

## Supported Platforms

Install on any AI coding platform:

```bash
uds install --platform cursor
```

| Platform | Platform | Platform | Platform |
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
```

---

## Validation

```bash
npm run check            # Full validation suite
npm run validate         # W3C DTCG token format
npm run audit            # WCAG 2.1 AA contrast (108 checks)
npm run verify           # HTML docs integrity
npm run sync-data        # CSV cross-reference validation
```

---

## Project Structure

```
universal-design-system/
  tokens/                 # W3C DTCG design tokens (source of truth)
  src/
    data/                 # 16 CSV databases (1400+ rows)
    scripts/              # BM25 engine, search CLI, spec generator
  cli/                    # TypeScript CLI (zero dependencies)
  docs/                   # Interactive HTML documentation
  scripts/                # Validation scripts (WCAG, tokens, docs)
  audits/                 # WCAG audit results
  .claude/skills/         # Claude Code skills (5 skills)
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License. See [LICENSE](LICENSE) for details.
