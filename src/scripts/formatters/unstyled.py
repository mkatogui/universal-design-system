"""Unstyled/headless output formatters."""

UNSTYLED_TEMPLATES = {
    "button": {
        "element": "button",
        "aria": {"role": "button", "aria-disabled": "false"},
        "keyboard": ["Enter: activate", "Space: activate"],
        "states": ["default", "hover", "focus", "active", "disabled"],
        "focus": "Focusable by default. Use tabindex=-1 to remove from tab order.",
    },
    "modal": {
        "element": "dialog",
        "aria": {
            "role": "dialog",
            "aria-modal": "true",
            "aria-labelledby": "{title-id}",
        },
        "keyboard": ["Escape: close dialog", "Tab: cycle focus within modal"],
        "states": ["open", "closed"],
        "focus": "Trap focus within modal when open. Move focus to first focusable element on open. Return focus to trigger element on close.",
    },
    "tabs": {
        "element": "div",
        "aria": {
            "role": "tablist (container), tab (trigger), tabpanel (content)",
            "aria-selected": "true/false on each tab",
            "aria-controls": "tab references its panel id",
            "aria-labelledby": "panel references its tab id",
        },
        "keyboard": [
            "ArrowLeft: activate previous tab",
            "ArrowRight: activate next tab",
            "Home: activate first tab",
            "End: activate last tab",
        ],
        "states": ["active", "inactive", "disabled"],
        "focus": "Only the active tab is in the tab order (tabindex=0). Inactive tabs have tabindex=-1. Arrow keys move focus between tabs.",
    },
    "input": {
        "element": "input",
        "aria": {
            "aria-invalid": "true when validation fails",
            "aria-describedby": "{error-message-id} when error is present",
            "aria-required": "true when field is required",
        },
        "keyboard": ["Tab: move focus in/out"],
        "states": ["default", "focus", "filled", "disabled", "readonly", "invalid"],
        "focus": "Focusable by default. Associate label via for/id or aria-labelledby. Error messages linked via aria-describedby.",
    },
    "card": {
        "element": "article or div",
        "aria": {
            "role": "article (if standalone) or group (if in a list)",
        },
        "keyboard": ["Tab: move focus to interactive children within the card"],
        "states": ["default", "interactive (if clickable)"],
        "focus": "Not focusable by default unless the card is interactive. If clickable, add tabindex=0 and role=button or use an anchor wrapper.",
    },
    "alert": {
        "element": "div",
        "aria": {
            "role": "alert (for errors/warnings) or status (for info/success)",
            "aria-live": "assertive (errors) or polite (info/success)",
            "aria-atomic": "true",
        },
        "keyboard": ["Tab: move focus to dismiss button if present"],
        "states": ["visible", "dismissed"],
        "focus": "Not focusable by default. Dismiss button (if present) is focusable. Use aria-live to announce dynamic alerts to screen readers.",
    },
    "accordion": {
        "element": "div",
        "aria": {
            "aria-expanded": "true/false on each trigger button",
            "aria-controls": "trigger references its panel id",
            "role": "region on each panel",
            "aria-labelledby": "panel references its trigger id",
        },
        "keyboard": [
            "Enter: toggle section",
            "Space: toggle section",
            "ArrowDown: move focus to next header",
            "ArrowUp: move focus to previous header",
            "Home: move focus to first header",
            "End: move focus to last header",
        ],
        "states": ["expanded", "collapsed", "disabled"],
        "focus": "Each accordion header button is focusable. Panel content enters the tab order when expanded.",
    },
    "tooltip": {
        "element": "div (popover)",
        "aria": {
            "role": "tooltip",
            "aria-describedby": "trigger references tooltip id",
        },
        "keyboard": ["Escape: dismiss tooltip", "Focus/hover on trigger: show tooltip"],
        "states": ["hidden", "visible"],
        "focus": "Tooltip itself is not focusable. Trigger element must be focusable. Show on focus and hover, dismiss on Escape and blur.",
    },
    "dropdown": {
        "element": "div (menu container)",
        "aria": {
            "role": "menu (container), menuitem (option)",
            "aria-expanded": "true/false on trigger",
            "aria-haspopup": "true on trigger",
            "aria-activedescendant": "id of focused menuitem",
        },
        "keyboard": [
            "Enter/Space: open menu, activate item",
            "ArrowDown: move to next item",
            "ArrowUp: move to previous item",
            "Escape: close menu",
            "Home: move to first item",
            "End: move to last item",
        ],
        "states": ["open", "closed"],
        "focus": "Trigger is focusable. When menu opens, focus moves to first item. On close, return focus to trigger. Use aria-activedescendant for virtual focus.",
    },
    "toggle": {
        "element": "button",
        "aria": {
            "role": "switch",
            "aria-checked": "true/false",
            "aria-labelledby": "{label-id}",
        },
        "keyboard": ["Enter: toggle state", "Space: toggle state"],
        "states": ["on", "off", "disabled"],
        "focus": "Focusable by default. Announce state changes via aria-checked. Pair with a visible label via aria-labelledby.",
    },
    "badge": {
        "element": "span",
        "aria": {
            "role": "status (if dynamic count)",
            "aria-label": "descriptive text when badge is icon-only",
        },
        "keyboard": ["Not interactive by default. If removable, Tab to remove button."],
        "states": ["default", "removable"],
        "focus": "Not focusable by default. If a remove button is present, it is focusable. Use aria-live=polite for dynamically updating counts.",
    },
    "avatar": {
        "element": "img or span (fallback)",
        "aria": {
            "role": "img",
            "alt": "descriptive text for the person/entity",
            "aria-label": "used when no alt text is available on fallback",
        },
        "keyboard": ["Not interactive by default. If clickable, Tab to focus."],
        "states": ["image-loaded", "fallback-initials", "fallback-icon"],
        "focus": "Not focusable by default. If the avatar is a link or button, it inherits focus from the interactive wrapper.",
    },
}


def generate_unstyled_markdown(result: dict) -> str:
    """Generate a headless/unstyled component specification in Markdown.

    Outputs behavior-only specs: ARIA attributes, keyboard interactions,
    state machines, and focus management — no CSS classes or visual tokens.
    """
    lines = []
    domain = result["domain"]

    lines.append(f"# Headless Component Spec: {result['query'].title()}")
    lines.append("")
    lines.append(f"**Mode:** Unstyled / Headless (behavior-only)")
    lines.append(f"**Sector:** {domain['sector']}")
    lines.append(f"**Product Type:** {domain['product_type']}")
    lines.append("")
    lines.append("> These specs define ARIA attributes, keyboard interactions, "
                 "state machines, and focus management only. No CSS classes or "
                 "visual tokens are included. Bring your own styles.")
    lines.append("")

    for name, spec in sorted(UNSTYLED_TEMPLATES.items()):
        display = name.replace("-", " ").title()
        lines.append(f"## {display}")
        lines.append("")
        lines.append(f"**Element:** `<{spec['element']}>`")
        lines.append("")

        # ARIA
        lines.append("**ARIA Attributes:**")
        lines.append("")
        for attr, val in spec["aria"].items():
            lines.append(f"- `{attr}`: `{val}`")
        lines.append("")

        # Keyboard
        lines.append("**Keyboard Interactions:**")
        lines.append("")
        for interaction in spec["keyboard"]:
            lines.append(f"- {interaction}")
        lines.append("")

        # States
        lines.append(f"**States:** {', '.join(spec['states'])}")
        lines.append("")

        # Focus
        lines.append(f"**Focus Management:** {spec['focus']}")
        lines.append("")
        lines.append("---")
        lines.append("")

    return "\n".join(lines)


def generate_unstyled_json(result: dict) -> dict:
    """Generate a headless/unstyled component specification as a dict for JSON output.

    Returns a dict with query metadata and all UNSTYLED_TEMPLATES entries.
    """
    domain = result["domain"]
    return {
        "query": result["query"],
        "mode": "unstyled",
        "domain": domain,
        "components": {
            name: {
                "element": spec["element"],
                "aria": spec["aria"],
                "keyboard": spec["keyboard"],
                "states": spec["states"],
                "focus": spec["focus"],
            }
            for name, spec in sorted(UNSTYLED_TEMPLATES.items())
        },
    }
