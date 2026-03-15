# Universal Design System Plugin

Production-grade AI-native design system with 9 structural palettes, 43 components, 600 W3C DTCG tokens, BM25 reasoning engine, WCAG 2.2 AA compliance, and Tailwind/React/Vue/Svelte output. Reverse-engineered from 100 modern websites.

## Overview

This plugin gives Claude deep knowledge of the Universal Design System — a deterministic UI recommendation engine that recommends palettes, components, patterns, and anti-patterns based on product domain. It works in two modes:

- **Skills-only mode** — Claude uses the embedded design system knowledge to recommend palettes, components, typography, patterns, and provide CSS/Tailwind snippets. No setup required.
- **Full mode (with MCP)** — Claude can also query the BM25 reasoning engine across 20 CSV databases (1,676+ rows) for dynamic, data-driven recommendations. Requires Node.js 18+ and Python 3.8+.

## Components

### Skills

| Skill | Triggers on | What it does |
|-------|-------------|--------------|
| **design-system** | "design a UI", "recommend a palette", "pick components", "create a design system", "tailwind config", "dark mode" | Core skill: 5-step workflow from domain detection → palette → components → tokens → delivery. Includes 4 reference files for components, tokens, patterns, and platform code. |
| **brand-identity** | "brand identity", "brand colors", "visual identity", "color psychology", "style guide" | Generates complete brand identity systems with color psychology, typography pairings, logo guidelines, and visual identity rules. |
| **design-audit** | "audit my UI", "review this design", "check accessibility", "wcag audit", "design score" | Scores existing UIs across 10 categories (contrast, typography, spacing, accessibility, anti-patterns) with actionable CSS fixes. |
| **ui-styling** | "CSS help", "hover effect", "glassmorphism", "gradient", "dark mode CSS", "tailwind classes" | Focused CSS helper with copy-paste snippets using design tokens. Includes 8 common recipes and framework output (Tailwind, CSS Modules, styled-components). |
| **slides-design** | "presentation design", "pitch deck", "slide templates", "deck design" | Presentation design systems with 7 slide types, typography rules for projection, and palette-driven color schemes. |

### MCP Server

The plugin configures the `universal-design-system` MCP server, which exposes 6 tools:

| Tool | Description |
|------|-------------|
| `search_design_system` | BM25 search across 20 CSV databases |
| `get_palette` | Full token set for any of the 9 palettes |
| `get_component` | Component lookup by slug (variants, sizes, states, accessibility) |
| `generate_tokens` | Full design system spec (JSON or Tailwind) |
| `list_palettes` | List all 9 palettes with descriptions |
| `list_components` | List all 43 components with categories |

## Setup

### Skills (no setup needed)

The 5 skills work immediately after installing the plugin. Claude uses the embedded knowledge to answer design system questions.

### MCP Server (optional, for dynamic queries)

The MCP server requires:

- **Node.js 18+**
- **Python 3.8+**
- The `@mkatogui/universal-design-system` npm package (installed automatically via `npx`)

If the MCP server fails to start (e.g., Python not found), the skills still work — Claude falls back to the embedded knowledge.

## 9 Palettes

| Palette | Best For | Identity |
|---------|----------|----------|
| `minimal-saas` | Product UI, SaaS apps | Balanced, neutral |
| `gradient-startup` | Marketing, landing pages | High-energy gradients |
| `ai-futuristic` | Dev tools, AI products | Sharp, dark-native |
| `corporate` | Enterprise, regulated | Conservative, squared |
| `apple-minimal` | Premium consumer | Smooth, refined |
| `illustration` | Education, creative | Friendly, rounded |
| `dashboard` | Analytics, admin panels | Compact, data-dense |
| `bold-lifestyle` | Fashion, media | Brutalist, 0px radius |
| `minimal-corporate` | Professional services | Subtle, understated |

## Usage

After installing the plugin, just ask Claude about UI/UX design:

- "Design a fintech dashboard"
- "What palette should I use for a healthcare app?"
- "Give me CSS for a card with hover effect"
- "Audit this screenshot for accessibility"
- "Create a brand identity for my startup"
- "Design slide templates for a pitch deck"

## License

MIT
