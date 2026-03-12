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

    def test_new_sectors_detected_correctly(self):
        """Verify the 15 new sectors are detected from representative queries."""
        detector = DomainDetector()
        test_cases = [
            ("sustainability green carbon renewable", "sustainability"),
            ("proptech rental tenant landlord", "proptech"),
            ("automotive vehicle fleet dealership", "automotive"),
            ("regtech regulation aml kyc", "regtech"),
            ("legaltech litigation paralegal", "legaltech"),
            ("agritech agriculture farming crop", "agritech"),
            ("govtech public-sector e-government", "govtech"),
            ("cleantech clean-energy solar recycling", "cleantech"),
            ("insurtech actuarial policy-management", "insurtech"),
            ("sporttech athletics coaching training-analytics", "sporttech"),
            ("fashiontech wardrobe style-tech textile", "fashiontech"),
            ("foodtech meal-planning nutrition-tech food-delivery", "foodtech"),
            ("musictech streaming-music sound-engineering", "musictech"),
            ("pettech veterinary pet-care grooming", "pettech"),
            ("spacetech satellite aerospace orbital rocket", "spacetech"),
        ]
        for query, expected in test_cases:
            result = detector.detect(query)
            self.assertEqual(
                result["sector"],
                expected,
                f"Query '{query}' detected as '{result['sector']}', expected '{expected}'",
            )

    def test_new_sectors_exist_in_sector_keywords(self):
        """Verify all 15 new sectors are present in SECTOR_KEYWORDS."""
        new_sectors = [
            "sustainability", "proptech", "automotive", "regtech", "legaltech",
            "agritech", "govtech", "cleantech", "insurtech", "sporttech",
            "fashiontech", "foodtech", "musictech", "pettech", "spacetech",
        ]
        for sector in new_sectors:
            self.assertIn(
                sector,
                self.valid_sectors,
                f"Sector '{sector}' missing from SECTOR_KEYWORDS",
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


if __name__ == "__main__":
    unittest.main()
