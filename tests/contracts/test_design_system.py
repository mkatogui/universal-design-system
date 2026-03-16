"""Contract tests: design_system.py helpers — pre-delivery checklist and box output."""

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "src" / "scripts"))

from design_system import get_pre_delivery_checklist, generate_box_output


class TestPreDeliveryChecklist(unittest.TestCase):
    """get_pre_delivery_checklist() returns a non-empty list with expected content."""

    def test_returns_list(self):
        checklist = get_pre_delivery_checklist()
        self.assertIsInstance(checklist, list, "get_pre_delivery_checklist() should return a list")

    def test_non_empty(self):
        checklist = get_pre_delivery_checklist()
        self.assertGreater(len(checklist), 0, "Pre-delivery checklist should not be empty")

    def test_contains_uds_bullets(self):
        checklist = get_pre_delivery_checklist()
        # UDS bullets from PRE_DELIVERY_UDS (data-theme, tokens, etc.)
        uds_related = [c for c in checklist if "data-theme" in c or "token" in c.lower() or "palette" in c.lower()]
        self.assertGreater(
            len(uds_related),
            0,
            "Checklist should include at least one UDS-related item (e.g. data-theme)",
        )

    def test_all_items_non_empty_strings(self):
        checklist = get_pre_delivery_checklist()
        for i, item in enumerate(checklist):
            self.assertIsInstance(item, str, f"Checklist item {i} should be a string")
            self.assertTrue(item.strip(), f"Checklist item {i} should not be blank")


class TestGenerateBoxOutput(unittest.TestCase):
    """generate_box_output() returns a string with expected sections."""

    def _minimal_result(self):
        """Minimal result dict matching engine output shape."""
        return {
            "query": "test query",
            "recommended_palette": "minimal-saas",
            "domain": {"sector": "tech", "product_type": "dashboard"},
            "search_results": {
                "components": [{"name": "Button"}, {"name": "Input"}],
                "patterns": [{"name": "Dashboard"}],
                "products": [{"name": "SaaS Dashboard"}],
                "typography": [{"heading_font": "Inter", "body_font": "Inter", "mood": "neutral"}],
            },
            "anti_patterns": [{"anti_pattern": "Dense tables"}],
        }

    def test_returns_string(self):
        result = self._minimal_result()
        palette_tokens = {"--color-brand-primary": "#6366f1"}
        out = generate_box_output(result, palette_tokens)
        self.assertIsInstance(out, str)

    def test_contains_design_system_header(self):
        result = self._minimal_result()
        palette_tokens = {}
        out = generate_box_output(result, palette_tokens)
        self.assertIn("DESIGN SYSTEM:", out, "Box output should include DESIGN SYSTEM header")

    def test_contains_palette(self):
        result = self._minimal_result()
        palette_tokens = {}
        out = generate_box_output(result, palette_tokens)
        self.assertIn("PALETTE:", out, "Box output should include PALETTE line")
        self.assertIn("minimal-saas", out, "Box output should include recommended palette id")

    def test_contains_pre_delivery_checklist(self):
        result = self._minimal_result()
        palette_tokens = {}
        out = generate_box_output(result, palette_tokens)
        self.assertIn("PRE-DELIVERY CHECKLIST:", out, "Box output should include checklist section")

    def test_box_border_format(self):
        result = self._minimal_result()
        palette_tokens = {}
        out = generate_box_output(result, palette_tokens)
        lines = out.strip().split("\n")
        self.assertGreaterEqual(len(lines), 2, "Box should have at least border and content")
        self.assertTrue(
            lines[0].startswith("+") and lines[0].endswith("+"),
            "First line should be top border",
        )


if __name__ == "__main__":
    unittest.main()
