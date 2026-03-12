"""Contract tests: every sector in CSV rules must be recognized by DomainDetector."""

import csv
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT / "src" / "scripts"))

from core import SECTOR_KEYWORDS, DomainDetector

DATA_DIR = ROOT / "src" / "data"


def _load_csv(filename: str) -> list[dict]:
    filepath = DATA_DIR / filename
    if not filepath.exists():
        return []
    with open(filepath, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _extract_compound_field_values(rows: list[dict], target_field: str) -> set:
    """Extract all values for *target_field* from compound_condition columns."""
    values = set()
    for row in rows:
        compound = row.get("compound_condition", "").strip()
        if not compound:
            continue
        for group in compound.split(" OR "):
            for part in group.split(" AND "):
                part = part.strip()
                if "=" not in part:
                    continue
                field, value = part.split("=", 1)
                if field.strip() == target_field:
                    values.add(value.strip())
    return values


class TestTaxonomyAlignment(unittest.TestCase):
    """Verify DomainDetector sectors cover all CSV sector values."""

    def setUp(self):
        self.valid_sectors = set(SECTOR_KEYWORDS.keys())

    def test_ui_reasoning_sectors_exist_in_detector(self):
        rows = _load_csv("ui-reasoning.csv")
        csv_sectors = set()
        for row in rows:
            if row.get("field", "").strip() == "sector":
                val = row.get("value", "").strip()
                if val:
                    csv_sectors.add(val)

        orphans = csv_sectors - self.valid_sectors
        self.assertEqual(
            orphans,
            set(),
            f"ui-reasoning.csv uses sectors not in DomainDetector: {sorted(orphans)}",
        )

    def test_anti_patterns_sectors_exist_in_detector(self):
        rows = _load_csv("anti-patterns.csv")
        csv_sectors = set()
        for row in rows:
            val = row.get("sector", "").strip()
            if val:
                csv_sectors.add(val)

        orphans = csv_sectors - self.valid_sectors
        self.assertEqual(
            orphans,
            set(),
            f"anti-patterns.csv uses sectors not in DomainDetector: {sorted(orphans)}",
        )

    def test_detector_returns_known_sectors(self):
        detector = DomainDetector()
        test_cases = [
            ("fintech neobank digital banking", "fintech"),
            ("kids children toddler", "kids"),
            ("ai deep-learning llm gpt", "ai"),
            ("fashion apparel streetwear", "fashion"),
        ]
        for query, expected in test_cases:
            result = detector.detect(query)
            self.assertEqual(
                result["sector"],
                expected,
                f"Query '{query}' detected as '{result['sector']}', expected '{expected}'",
            )

    def test_marina_booking_detects_hospitality(self):
        """Niche queries with domain-specific keywords should beat generic sectors."""
        detector = DomainDetector()
        result = detector.detect("marina booking saas")
        self.assertEqual(
            result["sector"],
            "hospitality",
            f"'marina booking saas' detected as '{result['sector']}', expected 'hospitality'",
        )

    def test_tiebreaker_prefers_specific_keywords(self):
        """When scores tie, longer keyword matches should win."""
        detector = DomainDetector()
        result = detector.detect("resort booking")
        self.assertEqual(
            result["sector"],
            "hospitality",
            f"'resort booking' detected as '{result['sector']}', expected 'hospitality'",
        )

    def test_product_keywords_cover_reasoning_rules(self):
        """Every product_type in ui-reasoning.csv must exist in PRODUCT_KEYWORDS."""
        from core import PRODUCT_KEYWORDS
        rows = _load_csv("ui-reasoning.csv")
        csv_product_types = set()
        for row in rows:
            if row.get("field", "").strip() == "product_type":
                val = row.get("value", "").strip()
                if val:
                    csv_product_types.add(val)

        valid_products = set(PRODUCT_KEYWORDS.keys())
        orphans = csv_product_types - valid_products
        self.assertEqual(
            orphans,
            set(),
            f"ui-reasoning.csv uses product_types not in PRODUCT_KEYWORDS: {sorted(orphans)}",
        )

    def test_compound_conditions_reference_valid_sectors(self):
        """Sector values inside compound_condition must exist in DomainDetector."""
        rows = _load_csv("ui-reasoning.csv")
        compound_sectors = _extract_compound_field_values(rows, "sector")
        orphans = compound_sectors - self.valid_sectors
        self.assertEqual(
            orphans,
            set(),
            f"compound_condition uses sectors not in DomainDetector: {sorted(orphans)}",
        )

    def test_compound_conditions_reference_valid_product_types(self):
        """Product type values inside compound_condition must exist in PRODUCT_KEYWORDS."""
        from core import PRODUCT_KEYWORDS
        rows = _load_csv("ui-reasoning.csv")
        compound_products = _extract_compound_field_values(rows, "product_type")
        valid_products = set(PRODUCT_KEYWORDS.keys())
        orphans = compound_products - valid_products
        self.assertEqual(
            orphans,
            set(),
            f"compound_condition uses product_types not in PRODUCT_KEYWORDS: {sorted(orphans)}",
        )

    def test_compound_condition_applies_for_finance_dashboard(self):
        """Compound rules for finance+dashboard should fire and include compact spacing."""
        from core import ReasoningEngine
        engine = ReasoningEngine()
        result = engine.reason("fintech dashboard")
        applied_fields = [r["then_field"] for r in result["rules_applied"]]
        self.assertIn(
            "layout_density",
            applied_fields,
            "Expected compound rule for layout_density to fire for 'fintech dashboard'",
        )

    def test_compound_condition_applies_for_healthcare_mobile(self):
        """Compound rules for healthcare+mobile-app should fire."""
        from core import ReasoningEngine
        engine = ReasoningEngine()
        result = engine.reason("healthcare mobile app")
        applied_fields = [r["then_field"] for r in result["rules_applied"]]
        self.assertIn(
            "touch_target",
            applied_fields,
            "Expected compound rule for touch_target to fire for 'healthcare mobile app'",
        )


if __name__ == "__main__":
    unittest.main()
