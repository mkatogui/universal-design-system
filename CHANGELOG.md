# Changelog

All notable changes to the Universal Design System.

## [0.8.0] - 2026-03-11

### Added
- Motion choreography specification with 13 presets (enter/exit/stagger/interaction)
- Automated WCAG 2.1 AA contrast audit across all 18 palette x mode combinations (100% pass rate, 62 checks)
- CVA-style component variant API contracts for 9 components (Button, Input, Card, Badge, Alert, Toast, Avatar, Toggle, Data Table)
- Interactive component sandbox with live prop controls and code output
- Size variant CSS for Badge, Input, Card, Alert, and Toast components
- Disabled state CSS for Button, Input, and Toggle
- Card variant classes (outlined, filled, compact, spacious, interactive)
- `a11y-audit.json` artifact for CI integration
- "API & Tools" sidebar navigation group

### Fixed
- Code block rendering (added `white-space: pre` to `.code-block` and `.code-block code`)
- Sandbox JS now properly applies size classes per component type
- design-tokens.json synced with structural palette overrides
- figma-tokens.json updated with `theme/` prefix keys for structural tokens

## [0.7.0] - 2026-03-11

### Added
- Structural palette identity: palettes now override `--radius-*`, `--shadow-*`, and `--font-display`
- 9 distinct shape identities per palette (sharp, round, squared, smooth, friendly, compact, brutalist, subtle, balanced)
- Dynamic radius labels that update when switching palettes
- Google Fonts loaded for DM Sans, Oswald, Source Serif 4
- `font-family: var(--font-display)` applied to `.main h3`

### Fixed
- 4 hardcoded border-radius values replaced with `var(--radius-sm)`
- 8 duplicate dark mode selector pairs cleaned up
- Dark mode rewritten to use CSS variables instead of hardcoded hex

## [0.6.0] - 2026-03-11

### Changed
- **Architectural restructuring**: themes become color palettes; fonts/radii/spacing/motion locked to foundation
- Dark mode folded into palette system (class on `<html>` + `[data-theme]`)
- Removed reference-list framing
- Added layout foundation section

## [0.5.0] - 2026-03-10

### Added
- 5 new components (31 total)
- 5 new patterns (8 total)
- Motion behavior guidelines
- Do/Don't pattern examples
- Token JSON sync (42 tokens added)

## [0.4.0] - 2026-03-10

### Added
- Getting Started guide with quick install options
- WCAG 2.2 AA compliance annotations
- DTCG token aliases and `$type` annotations
- OKLCH color definitions
- Style Dictionary build pipeline
- Component usage guidance
- Interactive prop playground
- Documentation search
- Framework tabs (React/Vue/Svelte)

## [0.3.0] - 2026-03-10

### Added
- 4 missing theme palettes (all 9 style categories now covered)
- 10 new components (26 total)
- Storybook-style interactive documentation
- Shadcn-style component library
- Figma token export
- Dark mode for all 9 themes

## [0.2.0] - 2026-03-10

### Fixed
- 7 critical WCAG contrast issues

### Added
- Form and alert components
- 3-tier token architecture (primitive > semantic > component)
- Theme-aware dark shadows
- Semantic HTML reference

## [0.1.0] - 2026-03-10

### Added
- Initial design system derived from 100-website reverse-engineering analysis
- Core token definitions (color, typography, spacing, shadow, radius)
- Initial component set (16 components)
- 3 pattern layouts
- 5 theme palettes
