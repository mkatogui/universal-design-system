"""Output formatters for design system specifications.

Registry FORMATTERS maps format name to a callable (result, palette_tokens) -> str.
JSON and unstyled are handled separately in main(). Framework output is dispatched
by --framework, not --format.
"""

from formatters.box import generate_box_output
from formatters.css_in_js import generate_css_in_js
from formatters.framework import generate_framework_output
from formatters.json_out import build_json_output
from formatters.markdown import generate_markdown
from formatters.tailwind import generate_tailwind_config
from formatters.unstyled import (
    UNSTYLED_TEMPLATES,
    generate_unstyled_json,
    generate_unstyled_markdown,
)

__all__ = [
    "generate_box_output",
    "generate_css_in_js",
    "generate_framework_output",
    "generate_markdown",
    "generate_tailwind_config",
    "generate_unstyled_markdown",
    "generate_unstyled_json",
    "build_json_output",
    "UNSTYLED_TEMPLATES",
    "FORMATTERS",
]

# Registry for OCP: add new format here without editing main()
FORMATTERS = {
    "markdown": generate_markdown,
    "box": generate_box_output,
    "tailwind": generate_tailwind_config,
    "css-in-js": generate_css_in_js,
}
