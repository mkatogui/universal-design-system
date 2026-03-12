"""Contract tests: design-tokens.json has all required DTCG categories."""

import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
TOKENS_PATH = ROOT / "tokens" / "design-tokens.json"
sys.path.insert(0, str(ROOT / "src" / "scripts"))


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


class TestFoundationTokenExtraction(unittest.TestCase):
    """Verify resolve_foundation_tokens() extracts all expected categories."""

    @classmethod
    def setUpClass(cls):
        from design_system import load_tokens, resolve_foundation_tokens
        cls.tokens = load_tokens()
        cls.foundation = resolve_foundation_tokens(cls.tokens)

    def test_spacing_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["spacing"]), 10,
                                "Foundation spacing should have at least 10 values")

    def test_shadow_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["shadow"]), 4,
                                "Foundation shadow should have at least 4 levels")

    def test_shadow_values_are_css_strings(self):
        for name, val in self.foundation["shadow"].items():
            self.assertIsInstance(val, str, f"shadow.{name} should be a CSS string")
            self.assertNotIn("[", val, f"shadow.{name} looks like raw JSON, not CSS")

    def test_radius_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["radius"]), 5,
                                "Foundation radius should have at least 5 values")

    def test_motion_duration_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["motion_duration"]), 4,
                                "Foundation motion_duration should have at least 4 values")

    def test_motion_easing_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["motion_easing"]), 3,
                                "Foundation motion_easing should have at least 3 values")
        for name, val in self.foundation["motion_easing"].items():
            self.assertTrue(val.startswith("cubic-bezier("),
                            f"easing.{name} should be cubic-bezier format, got '{val}'")

    def test_font_family_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["font_family"]), 3,
                                "Foundation font_family should have at least 3 stacks")

    def test_font_size_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["font_size"]), 8,
                                "Foundation font_size should have at least 8 values")

    def test_font_weight_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["font_weight"]), 4,
                                "Foundation font_weight should have at least 4 values")

    def test_opacity_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["opacity"]), 3,
                                "Foundation opacity should have at least 3 values")

    def test_z_index_non_empty(self):
        self.assertGreaterEqual(len(self.foundation["z_index"]), 5,
                                "Foundation z_index should have at least 5 values")


if __name__ == "__main__":
    unittest.main()
