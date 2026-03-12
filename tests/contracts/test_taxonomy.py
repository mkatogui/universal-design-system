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


if __name__ == "__main__":
    unittest.main()
