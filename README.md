# Universal Design System

> Other tools tell AI what colors to use. We give it a complete, accessible, WCAG-validated design system it can ship.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1-AA_Compliant-green.svg)]()
[![Platforms](https://img.shields.io/badge/AI_Platforms-20-purple.svg)]()

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

```bash
# Install via CLI
npx uds install

# Or manually copy the skill
cp -r .claude/skills/universal-design-system ~/.claude/skills/

# Search the design system
python src/scripts/search.py "fintech dashboard"

# Generate a complete design system
python src/scripts/design_system.py "saas landing page"

# Generate with Tailwind config
python src/scripts/design_system.py "healthcare portal" --format tailwind

# Generate with framework code
python src/scripts/design_system.py "ecommerce store" --framework react
```

Apply any palette with a single attribute:

```html
<html lang="en" data-theme="corporate">
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

Switch at runtime:

```js
document.documentElement.setAttribute('data-theme', 'ai-futuristic');
```

---

## How It Works

1. **Install** the skill on your AI coding platform
2. **Describe** your product ("fintech dashboard", "kids education app", "saas landing page")
3. **Get** a complete, shipping-ready design system -- tokens, components, typography, color palette, anti-patterns, and WCAG compliance baked in

The engine doesn't guess. It reasons across 15 databases and 1200+ data rows to produce opinionated, domain-appropriate design decisions.

---

## Architecture: 3-Layer Reasoning Pipeline

```
User Query -> Domain Detection -> BM25 Search -> Rule Application -> Output
               (21 sectors,        (15 CSVs,       (165 rules,
                8 product types)    1200+ rows)      55 anti-patterns)
```

**Layer 1 -- Domain Detection:** Classifies your product across 21 industry sectors and 8 product types. Returns sector + product type with confidence scores.

**Layer 2 -- BM25 Search:** Okapi BM25 ranking (k1=1.5, b=0.75) across 15 CSV databases. Surfaces the most relevant palettes, components, patterns, typography, and color schemes for your domain.

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

Install on any AI coding platform with one command:

```bash
npx uds install --platform cursor
```

| Platform | Platform | Platform | Platform |
|----------|----------|----------|----------|
| Claude Code | Cursor | Windsurf | VS Code (Copilot) |
| Zed | Aider | Cline | Continue |
| Bolt | Lovable | v0 | Devin |
| Kiro | Gemini | Qoder | Roo Code |
| Trae | OpenCode | Copilot | Droid |

---

## Project Structure

```
universal-design-system/
  .claude/skills/         # Claude Code skill (auto-loaded)
  tokens/                 # W3C DTCG design tokens (source of truth)
  src/
    data/                 # 15 CSV databases (1200+ rows)
    scripts/              # BM25 engine, search CLI, spec generator
    templates/            # Platform configs and reference docs
  cli/                    # TypeScript CLI installer
  docs/                   # Interactive HTML documentation
  scripts/                # Validation scripts (WCAG, tokens, docs)
  audits/                 # WCAG audit results
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `python src/scripts/search.py "query"` | Search all databases with BM25 ranking |
| `python src/scripts/design_system.py "query"` | Generate a full design system spec |
| `python src/data/_sync_all.py` | Validate CSV cross-references |
| `python scripts/wcag-audit.py` | WCAG contrast audit (all palettes) |
| `python scripts/validate-tokens.py` | W3C DTCG token format validation |
| `python scripts/verify-docs.py` | HTML docs integrity check |
| `npm run check` | Run the full validation suite |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License. See [LICENSE](LICENSE) for details.
