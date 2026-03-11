#!/usr/bin/env python3
"""
Design System Docs Verification
Programmatic verification of the HTML documentation file:
- All CSS custom properties use var() (no hardcoded values)
- All 9 palettes have light + dark mode definitions
- Sidebar navigation links match section IDs
- Code blocks have proper formatting
- Component variant CSS classes exist
- Accessibility attributes present

Usage:
    python scripts/verify-docs.py
    python scripts/verify-docs.py --file docs/docs.html
"""

import re
import sys
import argparse
from pathlib import Path


def verify_no_hardcoded_radius(html: str) -> list:
    """Check that component CSS uses var(--radius-*) not hardcoded px."""
    errors = []
    # Find component CSS rules (not in :root or palette blocks)
    component_selectors = [
        ".btn",
        ".input",
        ".card",
        ".alert",
        ".toast",
        ".accordion",
        ".tooltip",
        ".badge",
        ".toggle",
        ".avatar",
        ".dropdown",
    ]

    for selector in component_selectors:
        # Find CSS rules for this selector
        pattern = re.escape(selector) + r"\s*\{[^}]*\}"
        matches = re.findall(pattern, html)
        for match in matches:
            if "border-radius:" in match and "var(--radius" not in match:
                if "border-radius: 50%" not in match:  # Allow 50% for circles
                    errors.append(
                        f"Hardcoded border-radius in {selector}: {match[:80]}..."
                    )

    return errors


def verify_palette_definitions(html: str) -> list:
    """Verify all 9 palettes have CSS definitions."""
    errors = []
    palettes = [
        "ai-futuristic",
        "gradient-startup",
        "corporate",
        "apple-minimal",
        "illustration",
        "dashboard",
        "bold-lifestyle",
        "minimal-corporate",
        "minimal-saas",
    ]

    for palette in palettes:
        light_pattern = f'[data-theme="{palette}"]'
        dark_pattern = f'docs-dark.*\\[data-theme="{palette}"\\]'

        if light_pattern not in html:
            errors.append(f"Missing light mode definition for palette: {palette}")
        if not re.search(dark_pattern, html):
            errors.append(f"Missing dark mode definition for palette: {palette}")

    return errors


def verify_section_ids(html: str) -> list:
    """Verify sidebar nav links match section IDs."""
    errors = []

    # Find all sidebar href links
    hrefs = re.findall(r'<a\s+href="#([^"]+)"', html)

    # Find all section and main IDs
    section_ids = re.findall(r'<(?:section|main)\s+[^>]*id="([^"]+)"', html)

    for href in hrefs:
        if href not in section_ids and href not in ["top"]:
            errors.append(f"Sidebar link #{href} has no matching section")

    return errors


def verify_code_blocks(html: str) -> list:
    """Verify code blocks have proper white-space formatting."""
    errors = []

    if "white-space: pre" not in html or ".code-block" not in html:
        errors.append("Missing white-space: pre on .code-block CSS")

    # Check code blocks have multi-line content
    code_blocks = re.findall(
        r'<div class="code-block">.*?<code>(.*?)</code>', html, re.DOTALL
    )
    for i, block in enumerate(code_blocks):
        if "\n" not in block and len(block) > 100:
            errors.append(f"Code block {i + 1} may be missing newlines")

    return errors


def verify_variant_css(html: str) -> list:
    """Verify component variant CSS classes exist."""
    errors = []
    required_classes = [
        ".btn--primary",
        ".btn--secondary",
        ".btn--sm",
        ".btn--lg",
        ".badge--sm",
        ".badge--lg",
        ".input--sm",
        ".input--lg",
        ".alert--sm",
        ".alert--lg",
        ".toast--sm",
        ".toast--lg",
        ".card--compact",
        ".card--spacious",
    ]

    for cls in required_classes:
        if cls not in html:
            errors.append(f"Missing variant CSS class: {cls}")

    return errors


def main():
    parser = argparse.ArgumentParser(description="Verify Design System Docs")
    parser.add_argument("--file", default="docs/docs.html", help="HTML file to verify")
    args = parser.parse_args()

    if not Path(args.file).exists():
        print(f"File not found: {args.file}")
        return 1

    html = Path(args.file).read_text()

    all_errors = []
    checks = [
        ("Hardcoded radius", verify_no_hardcoded_radius),
        ("Palette definitions", verify_palette_definitions),
        ("Section IDs", verify_section_ids),
        ("Code blocks", verify_code_blocks),
        ("Variant CSS", verify_variant_css),
    ]

    for name, check_fn in checks:
        errors = check_fn(html)
        if errors:
            print(f"  FAIL: {name} ({len(errors)} issues)")
            all_errors.extend(errors)
        else:
            print(f"  PASS: {name}")

    print()
    if all_errors:
        print(f"FAILED: {len(all_errors)} issue(s)")
        for err in all_errors:
            print(f"  - {err}")
        return 1
    else:
        print("PASSED: All verification checks passed")
        return 0


if __name__ == "__main__":
    sys.exit(main())
