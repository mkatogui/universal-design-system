"""Box (ASCII) output formatter."""

from checklist import get_pre_delivery_checklist


def generate_box_output(result: dict, palette_tokens: dict) -> str:
    """Generate a compact ASCII box summary for terminal scanning."""
    w = 72  # inner content width
    border = "+" + "-" * (w + 2) + "+"
    empty = "|" + " " * (w + 2) + "|"

    def row(s: str) -> str:
        return "| " + (s[:w] if len(s) > w else s).ljust(w) + " |"

    search = result["search_results"]
    palette = result["recommended_palette"]
    display_name = result.get("palette_display") or palette.replace("-", " ").title()
    checklist = get_pre_delivery_checklist()[:7]

    lines = ["", border, row(f"DESIGN SYSTEM: {result['query'].title()}"), empty]

    # Pattern (from top pattern or product)
    pattern_name = ""
    if search["patterns"]:
        pattern_name = search["patterns"][0].get("name", "?")
    if not pattern_name and search["products"]:
        pattern_name = search["products"][0].get("name", "?") or "—"
    lines.append(row(f"PATTERN: {pattern_name}"))
    lines.append(empty)
    lines.append(row(f"PALETTE: {display_name} (data-theme=\"{palette}\")"))
    lines.append(empty)

    comp_names = [c.get("name", "?") for c in search["components"][:3]]
    lines.append(row("COMPONENTS: " + ", ".join(comp_names)))
    lines.append(empty)

    if search["typography"]:
        t = search["typography"][0]
        typo = f"{t.get('heading_font', '?')} / {t.get('body_font', '?')} — {t.get('mood', '')}"
        lines.append(row("TYPOGRAPHY: " + typo))
    else:
        lines.append(row("TYPOGRAPHY: —"))
    lines.append(empty)

    avoid = [ap.get("anti_pattern", "?") for ap in result["anti_patterns"][:5]]
    lines.append(row("AVOID: " + ", ".join(avoid)))
    lines.append(empty)
    lines.append(row("PRE-DELIVERY CHECKLIST:"))
    for item in checklist:
        lines.append(row("  [ ] " + (item[: w - 6] + "…" if len(item) > w - 6 else item)))
    lines.extend([empty, border, ""])
    return "\n".join(lines)
