"""Contract tests: design-tokens.json has all required DTCG categories."""

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
TOKENS_PATH = ROOT / "tokens" / "design-tokens.json"


class TestTokenStructure(unittest.TestCase):
    """Verify design-tokens.json has all required top-level categories."""

    @classmethod
    def setUpClass(cls):
        with open(TOKENS_PATH, encoding="utf-8") as f:
            cls.tokens = json.load(f)

    def test_required_categories_exist(self):
        required = ["color", "typography", "spacing", "shadow", "radius", "motion", "opacity", "zIndex"]
        for cat in required:
            self.assertIn(cat, self.tokens, f"Missing required category: {cat}")

    def test_color_has_primitives(self):
        color = self.tokens.get("color", {})
        self.assertIn("primitive", color, "color section missing 'primitive'")

    def test_color_has_semantic(self):
        color = self.tokens.get("color", {})
        self.assertIn("semantic", color, "color section missing 'semantic'")

    def test_theme_section_exists(self):
        self.assertIn("theme", self.tokens, "Missing 'theme' section")

    def test_spacing_has_scale(self):
        spacing = self.tokens.get("spacing", {})
        # Should have at least a few scale values
        non_meta = {k: v for k, v in spacing.items() if not k.startswith("$")}
        self.assertGreaterEqual(len(non_meta), 8, "Spacing should have at least 8 scale values")

    def test_tokens_have_dtcg_format(self):
        """Spot-check that tokens use $value format."""
        spacing = self.tokens.get("spacing", {})
        for key, val in spacing.items():
            if key.startswith("$"):
                continue
            if isinstance(val, dict):
                self.assertIn(
                    "$value",
                    val,
                    f"spacing.{key} missing $value (not DTCG format)",
                )
                break


if __name__ == "__main__":
    unittest.main()
