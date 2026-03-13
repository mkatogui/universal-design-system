# Brand Overrides

This directory contains brand-specific token override files that customize the
Universal Design System for individual brands.

## How it works

Each brand file overrides **color**, **typography**, and **shadow** tokens.
Structural tokens (spacing, motion, layout, z-index, opacity) are inherited
from the base `design-tokens.json` and remain consistent across all brands.

The brand resolver (`src/scripts/brand_resolver.py`) deep-merges a brand file
with the base tokens at build time, so you only need to specify the values you
want to change.

## File naming

Brand files must follow the pattern `{brand-name}.json` (lowercase, hyphens
for spaces). The file stem becomes the brand identifier used by the resolver.

- `_template.json` -- Copy this file to start a new brand.
- `acme-corp.json` -- Example: a brand called "acme-corp".

## Creating a new brand

```bash
cp tokens/brands/_template.json tokens/brands/my-brand.json
# Edit my-brand.json with your brand values
python -c "from src.scripts.brand_resolver import resolve; print(resolve('my-brand'))"
```

## What you can override

| Category   | Tokens                           |
|------------|----------------------------------|
| Color      | primary, secondary, accent       |
| Typography | font-display, font-body          |
| Shadow     | elevation-1 (and additional)     |

Additional token keys are supported -- any key present in the brand file will
override the corresponding key in the base tokens.
