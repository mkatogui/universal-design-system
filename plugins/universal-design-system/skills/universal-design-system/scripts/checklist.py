#!/usr/bin/env python3
"""
Pre-delivery checklist for Universal Design System.

Single responsibility: build the pre-delivery checklist from ux-guidelines.csv
(by priority), a11y bullets, and UDS-specific items.
"""

from core import load_csv

PRE_DELIVERY_UX_COUNT = 10
PRE_DELIVERY_A11Y = [
    "Light mode: text contrast 4.5:1 minimum (WCAG 1.4.3).",
    "Focus states visible for keyboard navigation (WCAG 2.4.7).",
    "Respect prefers-reduced-motion for animations.",
]
PRE_DELIVERY_UDS = [
    "Use UDS tokens only (no hardcoded colors/spacing).",
    "Set data-theme on <html> for palette application.",
]


def get_pre_delivery_checklist() -> list[str]:
    """Build pre-delivery checklist from ux-guidelines.csv (top by priority) + a11y + UDS bullets."""
    try:
        rows = load_csv("ux-guidelines.csv")
    except Exception:
        rows = []
    items = []
    if rows:
        by_priority = sorted(
            rows,
            key=lambda r: (int(r.get("priority", 0)) if str(r.get("priority", "")).isdigit() else 0),
            reverse=True,
        )
        for r in by_priority[:PRE_DELIVERY_UX_COUNT]:
            g = (r.get("guideline") or "").strip()
            if g:
                items.append(g)
    items.extend(PRE_DELIVERY_A11Y)
    items.extend(PRE_DELIVERY_UDS)
    return items
