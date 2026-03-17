---
name: figma-handoff
description: Figma to code handoff using UDS tokens. Align Figma variables with design-tokens.json, naming conventions, Dev Mode, and token sync.
version: 0.6.2
triggers:
  - figma to code
  - design handoff
  - dev mode
  - figma tokens
  - design to code
  - Figma variables
  - Tokens Studio
  - design specs
  - figma handoff
  - design specs for dev
---

# Figma Handoff — UDS Skill

Use this skill when the user needs **design-to-code handoff** or **Figma alignment** with the Universal Design System. UDS provides W3C DTCG design tokens, a Figma-compatible token file, and a token writer for custom palettes.

## When to Use

- User wants to sync Figma with code (tokens, variables, Dev Mode).
- User is setting up Figma Variables or Tokens Studio to match the codebase.
- User needs naming conventions so developers see token names (e.g. `color.primary`) instead of raw hex in Dev Mode.
- User wants to keep `tokens/design-tokens.json` and Figma in sync.

## Source of Truth

- **Code/tokens:** `tokens/design-tokens.json` — W3C DTCG format, 3-tier (primitive → semantic → palette overrides). This is the single source of truth for the build.
- **Figma:** `tokens/figma-tokens.json` — Figma Tokens Studio compatible. Must stay in sync with design-tokens.json for consistent handoff.
- **Validation:** `scripts/validate-tokens.py` — validates DTCG structure and cross-file sync between design tokens and Figma tokens. Run after any token change.

## Naming Conventions for Handoff

So developers see token names in Figma Dev Mode (not just raw values):

- **Colors:** Use semantic names, e.g. `color.primary`, `color.background`, `color.text.primary`, with modes for Light/Dark.
- **Spacing:** Align with UDS scale: `space.4`, `space.8`, `space.16`, etc. (4px base).
- **Typography:** `type.heading.lg`, `type.body.md`, etc., matching UDS typography scale.
- **Radius:** `radius.sm`, `radius.md`, `radius.lg` — per-palette in UDS.
- **Collections and modes:** Use Figma variable collections with modes (e.g. Light/Dark) so Dev Mode shows the right values per theme.

## Sync Workflow

1. **Change tokens in one place:** Prefer editing `tokens/design-tokens.json` (and running the build) so CSS/JS outputs stay correct.
2. **Update Figma tokens:** Use `src/scripts/token_writer.py` to generate Figma token entries for custom palettes; for the core system, ensure `tokens/figma-tokens.json` is updated to match design-tokens.json (structure and values).
3. **Run validation:** `npm run validate` (or `python scripts/validate-tokens.py`) to check DTCG format and cross-file sync.
4. **Build:** `npm run build` runs Style Dictionary and produces platform outputs (CSS, JS, iOS, Android) from design-tokens.json.

## Figma Dev Mode Tips

- **Designers:** Use Figma Variables (native) or Tokens Studio; avoid local styles for colors/spacing/typography so Dev Mode can show token names.
- **Dev handoff page:** Include a short note on naming (e.g. "Colors use semantic tokens; see design-tokens.json"). Link to component docs or Storybook if available.
- **Developer notes:** Add annotations in Figma pointing to `design-tokens.json` or the docs so developers know where to read token values and usage.

## Token Writer (Custom Palettes)

For **custom palettes** derived from UDS (e.g. `palette.py create "my-palette" --base corporate`), the token writer can generate Figma token entries matching `tokens/figma-tokens.json` format. Use this to keep custom brand tokens in sync with Figma.

## Quick Reference

| Asset | Purpose |
|-------|---------|
| `tokens/design-tokens.json` | Source of truth; DTCG format; used by Style Dictionary build |
| `tokens/figma-tokens.json` | Figma Tokens Studio compatible; keep in sync with design-tokens.json |
| `scripts/validate-tokens.py` | Validates structure and cross-file sync |
| `src/scripts/token_writer.py` | Generates Figma token entries for custom palettes |
| `npm run build` | Builds CSS/JS/iOS/Android from design-tokens.json |
