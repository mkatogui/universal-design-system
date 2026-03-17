---
name: i18n-and-rtl
description: Internationalization and right-to-left layout using UDS localization data. Logical CSS properties, dir="rtl", text expansion, and RTL mapper for existing CSS.
version: 0.6.2
triggers:
  - rtl
  - right to left
  - arabic layout
  - hebrew
  - i18n
  - localization
  - logical properties
  - margin-inline-start
  - multilingual ui
  - l10n
  - bidirectional
  - RTL support
  - logical css
  - dir rtl
---

# i18n and RTL — UDS Skill

Use this skill when the user needs **right-to-left (RTL) layout**, **internationalization (i18n)**, or **localization (l10n)** for UI built with or aligned to the Universal Design System. UDS provides a physical→logical CSS mapping and an RTL mapper script.

## When to Use

- User asks for RTL support (Arabic, Hebrew, Persian, Urdu, etc.).
- User wants to use CSS logical properties instead of physical (left/right).
- User needs to convert existing CSS to RTL-safe logical properties.
- User is planning multilingual UI (text expansion, truncation, locale-aware layout).

## Core Resources

- **Physical → logical mapping:** `src/data/localization.csv` — maps properties like `margin-left` → `margin-inline-start`, `text-align: left` → `text-align: start`, plus border-radius, float, inset, and size tokens (inline-size, block-size).
- **RTL mapper script:** `src/scripts/rtl_mapper.py` — use `map_all(css_text)` to convert a CSS string to logical equivalents; or `map_to_logical(physical_prop)` for a single property. The script reads from the same CSV.
- **Direction-sensitive list:** `get_direction_sensitive()` returns rows where `direction_sensitive` is true (e.g. margin-inline-start/end, not block).

## RTL Checklist

1. **Set document direction:** Use `dir="rtl"` on `html` or the root container for RTL; `dir="ltr"` for LTR. Prefer setting at root so one codebase serves both.
2. **Use logical CSS:** Prefer logical properties so the same CSS works in LTR and RTL:
   - Margins/padding: `margin-inline-start`, `margin-inline-end`, `padding-inline-start`, `padding-inline-end`.
   - Position: `inset-inline-start`, `inset-inline-end`, `inset-block-start`, `inset-block-end`.
   - Text: `text-align: start` or `text-align: end`.
   - Sizing: `inline-size`, `block-size`, `min-inline-size`, `max-inline-size`.
   - Border radius: `border-start-start-radius`, `border-start-end-radius`, etc.
3. **Do not mirror:** Numbers, logos, videos, and universal symbols (play, close) should not flip in RTL.
4. **Convert existing CSS:** Run `python src/scripts/rtl_mapper.py` (or call `map_all()` on file contents) to replace physical properties with logical ones in bulk.
5. **Test both directions:** Toggle `dir="rtl"` and `dir="ltr"` and verify layout, navigation order, and focus.

## Text Expansion and Locale

- **Text expansion:** German can be ~30% longer than English; Chinese/Japanese often shorter. Use flexible layouts (min/max width, truncation with tooltips), avoid fixed widths for labels.
- **Character count:** For DB/validation, count characters not bytes (e.g. 4 Chinese characters ≠ 4 bytes).
- **Pseudo-localization:** Use pseudo-locale strings during development to catch overflow and RTL issues before real translation.

## Quick Reference (from localization.csv)

| Physical | Logical |
|----------|---------|
| margin-left / margin-right | margin-inline-start / margin-inline-end |
| padding-left / padding-right | padding-inline-start / padding-inline-end |
| left / right | inset-inline-start / inset-inline-end |
| text-align: left / right | text-align: start / end |
| float: left / right | float: inline-start / inline-end |
| width / height | inline-size / block-size |
| border-top-left-radius (etc.) | border-start-start-radius (etc.) |

Use the full mapping in `src/data/localization.csv` for any other properties.
