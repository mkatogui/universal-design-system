"""Contract tests: every palette produces non-empty token values."""

import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
TOKENS_PATH = ROOT / "tokens" / "design-tokens.json"


class TestPaletteTokens(unittest.TestCase):
    """Verify every palette under 'theme' produces required token values."""

    @classmethod
    def setUpClass(cls):
        with open(TOKENS_PATH, encoding="utf-8") as f:
            cls.tokens = json.load(f)
        cls.themes = cls.tokens.get("theme", {})

    def test_all_palettes_have_required_tokens(self):
        required_keys_underscore = ["bg_primary", "text_primary", "brand_primary"]
        required_keys_hyphen = ["bg-primary", "text-primary", "brand-primary"]

        for palette_name, palette_data in self.themes.items():
            if palette_name.startswith("$"):
                continue
            with self.subTest(palette=palette_name):
                if "light" in palette_data and isinstance(palette_data["light"], dict):
                    # Newer format
                    light = palette_data["light"]
                    for key in required_keys_hyphen:
                        self.assertIn(
                            key,
                            light,
                            f"Palette '{palette_name}' light missing '{key}'",
                        )
                        val = light[key]
                        if isinstance(val, dict):
                            self.assertIn("$value", val)
                            self.assertTrue(val["$value"], f"'{palette_name}' {key} has empty $value")
                else:
                    # Older flat format
                    for key in required_keys_underscore:
                        self.assertIn(
                            key,
                            palette_data,
                            f"Palette '{palette_name}' missing '{key}'",
                        )
                        val = palette_data[key]
                        if isinstance(val, dict):
                            self.assertIn("$value", val)
                            self.assertTrue(val["$value"], f"'{palette_name}' {key} has empty $value")

    def test_all_palettes_have_dark_mode(self):
        for palette_name, palette_data in self.themes.items():
            if palette_name.startswith("$"):
                continue
            with self.subTest(palette=palette_name):
                if "light" in palette_data and isinstance(palette_data["light"], dict):
                    self.assertIn("dark", palette_data, f"Palette '{palette_name}' missing 'dark' mode")
                    self.assertTrue(palette_data["dark"], f"Palette '{palette_name}' dark mode is empty")
                else:
                    # Flat format: check for _dark suffix keys
                    dark_keys = [k for k in palette_data if k.endswith("_dark")]
                    self.assertTrue(
                        dark_keys,
                        f"Palette '{palette_name}' has no _dark tokens",
                    )

    def test_palette_count(self):
        self.assertGreaterEqual(len(self.themes), 9, "Expected at least 9 palettes")


if __name__ == "__main__":
    unittest.main()
