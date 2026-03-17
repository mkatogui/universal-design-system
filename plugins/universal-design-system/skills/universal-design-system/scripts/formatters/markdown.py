"""Markdown output formatter."""

from checklist import get_pre_delivery_checklist


def generate_markdown(result: dict, palette_tokens: dict) -> str:
    """Generate a Markdown design system specification."""
    lines = []
    domain = result["domain"]
    search = result["search_results"]
    palette = result["recommended_palette"]
    display_name = result.get("palette_display") or palette.replace("-", " ").title()

    lines.append(f"# Design System: {result['query'].title()}")
    lines.append("")
    lines.append(f"**Palette:** {display_name} (`data-theme=\"{palette}\"`)")
    lines.append(f"**Sector:** {domain['sector']}")
    lines.append(f"**Product Type:** {domain['product_type']}")
    lines.append("")

    # Palette tokens
    if palette_tokens:
        lines.append("## Color Tokens")
        lines.append("")
        lines.append("```css")
        lines.append(f':root[data-theme="{palette}"] {{')
        for token, value in sorted(palette_tokens.items()):
            lines.append(f"  {token}: {value};")
        lines.append("}")
        lines.append("```")
        lines.append("")

    # Components
    if search["components"]:
        lines.append("## Components")
        lines.append("")
        lines.append("| Component | Category | Variants |")
        lines.append("|-----------|----------|----------|")
        for comp in search["components"]:
            name = comp.get("name", "?")
            cat = comp.get("category", "")
            variants = comp.get("variants", "")
            lines.append(f"| {name} | {cat} | {variants} |")
        lines.append("")

    # Patterns
    if search["patterns"]:
        lines.append("## Patterns")
        lines.append("")
        for pat in search["patterns"]:
            name = pat.get("name", "?")
            desc = pat.get("description", "")
            lines.append(f"### {name}")
            lines.append(f"{desc}")
            lines.append("")

    # Typography
    if search["typography"]:
        lines.append("## Typography")
        lines.append("")
        lines.append("| Heading Font | Body Font | Mood |")
        lines.append("|-------------|-----------|------|")
        for t in search["typography"][:3]:
            h = t.get("heading_font", "?")
            b = t.get("body_font", "?")
            m = t.get("mood", "")
            lines.append(f"| {h} | {b} | {m} |")
        lines.append("")

    # Anti-patterns
    if result["anti_patterns"]:
        lines.append("## Anti-Patterns (Avoid)")
        lines.append("")
        for ap in result["anti_patterns"]:
            sev = ap.get("severity", "").upper()
            name = ap.get("anti_pattern", "")
            desc = ap.get("description", "")
            alt = ap.get("alternative", "")
            lines.append(f"- **[{sev}] {name}**: {desc}")
            if alt:
                lines.append(f"  - *Instead:* {alt}")
        lines.append("")

    # Rules applied
    if result["rules_applied"]:
        lines.append("## Design Rules Applied")
        lines.append("")
        for rule in result["rules_applied"][:10]:
            reasoning = rule.get("reasoning", "")
            lines.append(f"- {reasoning}")
        lines.append("")

    # UX Guidelines
    if search["guidelines"]:
        lines.append("## UX Guidelines")
        lines.append("")
        for g in search["guidelines"][:5]:
            guideline = g.get("guideline", "")
            rationale = g.get("rationale", "")
            lines.append(f"- {guideline}")
            if rationale:
                lines.append(f"  - *Rationale:* {rationale}")
        lines.append("")

    # Pre-delivery checklist
    checklist = get_pre_delivery_checklist()
    if checklist:
        lines.append("## Pre-delivery Checklist")
        lines.append("")
        for item in checklist:
            lines.append(f"- [ ] {item}")
        lines.append("")

    # Quick start
    lines.append("## Quick Start")
    lines.append("")
    lines.append("```html")
    lines.append(f'<html lang="en" data-theme="{palette}">')
    lines.append("```")
    lines.append("")
    lines.append("Switch themes at runtime:")
    lines.append("```js")
    lines.append(f"document.documentElement.setAttribute('data-theme', '{palette}');")
    lines.append("```")

    return "\n".join(lines)
