# Contributing

Thank you for your interest in contributing to the Universal Design System.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Run the validation suite: `npm run check`

## Making Changes

### Token Changes

All design tokens live in `tokens/design-tokens.json` (source of truth) and `tokens/figma-tokens.json` (Figma sync). When modifying tokens:

1. Edit `tokens/design-tokens.json` first — this is the canonical source
2. Mirror structural changes to `tokens/figma-tokens.json`
3. Run `python scripts/validate-tokens.py` to verify format and sync
4. Run `python scripts/wcag-audit.py` to check contrast ratios
5. Update the HTML docs (`docs/index.html`) if the change affects component rendering

### Component Changes

Components are defined in `docs/index.html` and `docs/component-library.html`. When adding or modifying components:

1. Add the CSS using `var()` references to design tokens — never hardcode colors, radii, or shadows
2. Ensure the component works across all 9 palettes and both appearance modes
3. Add a CVA-style variant table documenting props, sizes, and states
4. Run `python scripts/verify-docs.py` to catch hardcoded values or broken links

### Documentation

The interactive documentation (`docs/index.html`) is a self-contained HTML file. All CSS, JS, and content is inline. When editing:

1. Preserve the section structure and sidebar navigation
2. Add new sidebar links when adding new sections
3. Maintain the existing code-block styling (`.code-block` class with `<code>` tag)
4. Test palette switching across all 9 palettes after changes

## Governance Rules

The following tokens are **foundation-locked** and should not vary per palette:

- Body typography (Inter, font sizes, line heights)
- Spacing scale (4px base, 12-step)
- Motion durations and easing curves
- Z-index layers
- Opacity values

The following tokens **can** vary per palette:

- Colors (brand, text, background, border, status)
- Shadows (elevation scale)
- Border radius (shape scale)
- Display font (h1–h3 typeface)

## Pull Request Process

1. Run `npm run check` and ensure all validations pass
2. Include a description of what changed and why
3. Update `CHANGELOG.md` with your changes
4. If adding a new palette, include WCAG audit results

## Code Style

- CSS: Use custom properties (`var(--token-name)`) for all themeable values
- HTML: Semantic elements, ARIA attributes where needed
- Python scripts: Follow PEP 8, include docstrings
- JSON: 2-space indentation

## Reporting Issues

When reporting bugs, please include:

- Which palette and mode (light/dark) you're using
- Browser and version
- A screenshot if it's a visual issue
- Steps to reproduce
