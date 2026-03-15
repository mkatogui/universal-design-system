---
name: UDS Getting Started
description: How to use the installed Universal Design System skills, pick which ones to use, and add or customize skills in your project.
version: 0.5.0
triggers:
  - uds getting started
  - how to use uds
  - which skills are installed
  - add my own skill
  - customize uds skills
  - uds install
  - use design system skills
  - pick skills
  - uds quick start
---

# UDS Getting Started — Using and Customizing Installed Skills

This skill explains what was installed when you ran `uds install` (or `npx @mkatogui/universal-design-system install`) and how to get the most from it: picking skills, using MCP and scripts, and adding or improving skills.

## What Gets Installed

- **Skills** — Copied into your platform’s skills directory (e.g. `.cursor/skills/`, `.claude/skills/`). The AI uses them when your prompts match their triggers.
- **Agents** — Optional specialized agents (e.g. pre-pr-reviewer, palette-sync, a11y-remediator) if your platform supports them.
- **Commands** — Slash commands (e.g. `/pre-pr-review`, `/palette-sync`, `/a11y-fix`, `/new-component`, `/docs-sync`, `/align-metrics`) when supported.
- **MCP server config** — On supported platforms, an MCP server is configured so the AI can call `search_design_system`, `get_palette`, `get_component`, `generate_tokens`, `list_palettes`, `list_components`.
- **Data and scripts** — Under the main `universal-design-system` skill: CSV databases and Python scripts (search, design_system, palette) for local use.
- **Tokens** — A `tokens/` folder at project root (if not already present) with design token sources.

## Installed Skills (Pick What You Need)

| Skill | When to use |
|-------|-------------|
| **universal-design-system** | Design system overview, palettes, components, tokens, reasoning engine, BM25 search, Tailwind/React/Vue/Svelte output. |
| **brand-identity** | Brand systems: color psychology, typography pairings, visual identity rules mapped to UDS palettes. |
| **design-audit** | Audit UIs for WCAG, contrast, typography, spacing, anti-patterns; scored reports and fixes. |
| **ui-styling** | Concrete CSS help with UDS tokens: snippets, dark mode, responsive breakpoints, no hardcoded values. |
| **slides-design** | Presentation design: slide templates, typography, colors mapped to UDS palettes. |
| **pre-pr-review** | Deep review before PR: TypeScript, lint, tests, SonarCloud-style checks that would run in CI. |

The AI **picks skills by triggers**: when the user says things like “design system”, “brand colors”, “accessibility audit”, “button style”, “slides”, or “review before PR”, the matching skill is used. You don’t have to “enable” them one by one; they are all available and the model chooses based on the conversation.

## How to Use After Install

1. **Chat** — Ask for design system recommendations, palettes, components, or styling; the right skill is applied automatically.
2. **Slash commands** — Use `/pre-pr-review`, `/palette-sync`, `/a11y-fix`, `/new-component`, `/docs-sync`, `/align-metrics` if your IDE supports them.
3. **MCP tools** — If MCP is configured, the AI can call `search_design_system`, `get_palette`, `get_component`, `generate_tokens`, etc., directly.
4. **Scripts** — From project root:
   - `python3 .cursor/skills/universal-design-system/scripts/search.py "fintech dashboard"`
   - `python3 .cursor/skills/universal-design-system/scripts/design_system.py "saas landing" --format tailwind`
   - (Use your platform’s skill path: e.g. `.claude/skills/...` for Claude Code.)

## Picking and Disabling Skills

- **Picking**: You don’t need to “select” skills. Ask for what you want (e.g. “audit this page for accessibility”, “suggest a palette for a fintech app”); the right skill is invoked by trigger matching.
- **Disabling**: To stop using a skill, remove or rename its folder under your platform’s skills directory (e.g. delete `.cursor/skills/design-audit` if you don’t want the audit skill).
- **Priority**: If your platform supports skill ordering or priority, put the skills you use most first.

## Adding Your Own Skill or Making Improvements

1. **New skill** — Create a folder under the same skills directory (e.g. `.cursor/skills/my-product-brand/SKILL.md`). Add a `SKILL.md` with:
   - Front matter: `name`, `description`, `version`, `triggers` (list of phrases that should invoke this skill).
   - Body: instructions, rules, and examples for the AI. The AI will use it when the user’s request matches one of `triggers`.
2. **Improve an existing skill** — Edit the installed `SKILL.md` (e.g. `.cursor/skills/universal-design-system/SKILL.md`). Add project-specific rules, examples, or constraints. These changes are local to your repo.
3. **Extend with data** — You can add CSV files or scripts under the main skill’s `data/` or `scripts/` and reference them in the skill text so the AI knows when to use them.
4. **Upgrade from upstream** — Re-run `uds install` to overwrite with the latest UDS skills; back up any local edits first or merge manually.

## Quick Reference

- **Search**: `python3 <skillDir>/universal-design-system/scripts/search.py "your query"`
- **Full spec**: `python3 <skillDir>/universal-design-system/scripts/design_system.py "product description" [--format tailwind] [--framework react|vue|svelte]`
- **Commands**: `/pre-pr-review`, `/palette-sync`, `/a11y-fix`, `/align-metrics`, `/new-component`, `/docs-sync`
- **MCP tools**: `search_design_system`, `get_palette`, `get_component`, `generate_tokens`, `list_palettes`, `list_components`

Replace `<skillDir>` with your platform’s skill base (e.g. `.cursor/skills` or `.claude/skills`).
