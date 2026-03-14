#!/usr/bin/env python3
"""
Custom Palette Injector — injects custom palette CSS and buttons into docs.html.

Reads all CSS files from tokens/custom/*.css and injects them into docs.html
between marker comments. Also adds palette switcher buttons.

Usage:
    python scripts/inject-custom-palettes.py
    python scripts/inject-custom-palettes.py --file docs/docs.html
"""

import argparse
import sys
from pathlib import Path

CSS_START = "/* CUSTOM_PALETTES_START */"
CSS_END = "/* CUSTOM_PALETTES_END */"
BTN_START = "<!-- CUSTOM_PALETTE_BUTTONS_START -->"
BTN_END = "<!-- CUSTOM_PALETTE_BUTTONS_END -->"

CUSTOM_DIR = Path(__file__).parent.parent / "tokens" / "custom"


def get_custom_css_files() -> list:
    """Return sorted list of custom CSS files."""
    if not CUSTOM_DIR.exists():
        return []
    return sorted(CUSTOM_DIR.glob("*.css"))


def inject_between_markers(html: str, start: str, end: str, content: str) -> str:
    """Replace content between start and end markers."""
    start_idx = html.find(start)
    end_idx = html.find(end)

    if start_idx == -1 or end_idx == -1:
        return html

    return html[:start_idx + len(start)] + "\n" + content + "\n" + html[end_idx:]


def generate_buttons(css_files: list) -> str:
    """Generate palette switcher button HTML from CSS file names."""
    buttons = []
    for css_file in css_files:
        name = css_file.stem  # e.g. 'my-brand'
        display = " ".join(w.capitalize() for w in name.split("-"))
        buttons.append(
            f'        <button class="palette-btn" data-theme="{name}">{display}</button>'
        )
    return "\n".join(buttons)


def main():
    parser = argparse.ArgumentParser(description="Inject custom palettes into docs")
    parser.add_argument("--file", default="docs/docs.html", help="HTML file to inject into")
    args = parser.parse_args()

    html_path = Path(args.file)
    if not html_path.exists():
        print(f"  File not found: {args.file}")
        return 1

    html = html_path.read_text()
    css_files = get_custom_css_files()

    # Inject CSS
    if CSS_START in html:
        css_content = ""
        for css_file in css_files:
            css_content += f"    /* Custom: {css_file.stem} */\n"
            css_content += "    " + css_file.read_text().replace("\n", "\n    ").rstrip() + "\n"
        html = inject_between_markers(html, CSS_START, CSS_END, css_content)
        print(f"  Injected {len(css_files)} custom palette CSS block(s)")
    else:
        print(f"  Warning: CSS markers not found in {args.file}")

    # Inject buttons
    if BTN_START in html:
        btn_content = generate_buttons(css_files)
        html = inject_between_markers(html, BTN_START, BTN_END, btn_content)
        print(f"  Injected {len(css_files)} palette button(s)")
    else:
        print(f"  Warning: Button markers not found in {args.file}")

    html_path.write_text(html)
    print(f"  Updated: {args.file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
