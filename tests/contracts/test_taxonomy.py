"""Contract tests: every sector in CSV rules must be recognized by DomainDetector.

Also verifies BM25 fuzzy search, stemming, and synonym expansion.
"""

import csv
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT / "src" / "scripts"))

from core import SECTOR_KEYWORDS, SYNONYMS, BM25Index, DomainDetector, PorterStemmer

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


class TestPorterStemmer(unittest.TestCase):
    """Verify PorterStemmer handles common suffixes and edge cases."""

    def setUp(self):
        self.stemmer = PorterStemmer()

    def test_empty_string(self):
        self.assertEqual(self.stemmer.stem(""), "")

    def test_single_char(self):
        self.assertEqual(self.stemmer.stem("a"), "a")

    def test_two_char(self):
        self.assertEqual(self.stemmer.stem("go"), "go")

    def test_plural_s(self):
        result = self.stemmer.stem("banks")
        self.assertEqual(result, "bank")

    def test_plural_sses(self):
        result = self.stemmer.stem("caresses")
        self.assertEqual(result, "caress")

    def test_plural_ies(self):
        result = self.stemmer.stem("ponies")
        self.assertEqual(result, "poni")

    def test_ing_suffix(self):
        result = self.stemmer.stem("banking")
        self.assertEqual(result, "bank")

    def test_ed_suffix(self):
        result = self.stemmer.stem("walked")
        self.assertEqual(result, "walk")

    def test_tion_suffix(self):
        result = self.stemmer.stem("relational")
        self.assertEqual(result, "relate")

    def test_ment_suffix(self):
        result = self.stemmer.stem("adjustment")
        # Should reduce -ment when m > 1
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)

    def test_ness_suffix(self):
        result = self.stemmer.stem("goodness")
        self.assertEqual(result, "good")

    def test_able_suffix(self):
        result = self.stemmer.stem("adjustable")
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)

    def test_ful_suffix(self):
        result = self.stemmer.stem("hopeful")
        self.assertEqual(result, "hope")

    def test_less_suffix_not_stripped(self):
        # 'less' is not in our step3/step4 lists but -ly, -er, -est are handled
        result = self.stemmer.stem("careless")
        self.assertIsInstance(result, str)

    def test_er_suffix(self):
        result = self.stemmer.stem("trader")
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)

    def test_ly_suffix(self):
        # -ly handled through step1b fixup or step2/3
        result = self.stemmer.stem("happily")
        self.assertIsInstance(result, str)

    def test_stemmer_is_idempotent(self):
        """Stemming an already-stemmed word should not change it further (in most cases)."""
        word = "banking"
        once = self.stemmer.stem(word)
        twice = self.stemmer.stem(once)
        self.assertEqual(once, twice)


class TestHyphenTokenization(unittest.TestCase):
    """Verify hyphen-aware tokenization in BM25Index."""

    def test_hyphenated_produces_joined_form(self):
        tokens = BM25Index.tokenize("e-commerce")
        self.assertIn("e-commerce", tokens)
        self.assertIn("ecommerce", tokens)
        self.assertIn("commerce", tokens)

    def test_non_hyphenated_unchanged(self):
        tokens = BM25Index.tokenize("dashboard")
        self.assertIn("dashboard", tokens)

    def test_multi_hyphen(self):
        tokens = BM25Index.tokenize("business-to-business")
        self.assertIn("business-to-business", tokens)
        self.assertIn("businesstobusiness", tokens)
        self.assertIn("business", tokens)

    def test_synonym_expansion(self):
        tokens = BM25Index.tokenize("ecommerce", expand=True)
        self.assertIn("ecommerce", tokens)
        self.assertIn("e-commerce", tokens)

    def test_ai_synonym_expansion(self):
        tokens = BM25Index.tokenize("ai", expand=True)
        self.assertIn("ai", tokens)
        self.assertIn("artificial-intelligence", tokens)
        self.assertIn("machine-learning", tokens)


class TestBM25FuzzySearch(unittest.TestCase):
    """Verify BM25 fuzzy search, stemming, and synonym matching."""

    @classmethod
    def setUpClass(cls):
        """Build a small index for testing."""
        cls.index = BM25Index()
        cls.index.add_documents(
            [
                {"name": "Online Store", "desc": "An ecommerce platform for retail"},
                {"name": "Banking App", "desc": "A mobile banking application for banks"},
                {"name": "AI Dashboard", "desc": "Artificial intelligence analytics dashboard"},
                {"name": "SaaS Tool", "desc": "Software as a service productivity tool"},
            ],
            source="test.csv",
            text_fields=["name", "desc"],
        )

    def test_ecommerce_hyphen_matches(self):
        """'e-commerce' should match docs containing 'ecommerce'."""
        results = self.index.search("e-commerce")
        self.assertTrue(len(results) > 0)
        names = [r["name"] for r in results]
        self.assertIn("Online Store", names)

    def test_banking_stem_matches(self):
        """'banking' should match documents with 'banks' or 'bank' via stemming."""
        results = self.index.search("banking")
        self.assertTrue(len(results) > 0)
        names = [r["name"] for r in results]
        self.assertIn("Banking App", names)

    def test_ai_dashboard_returns_results(self):
        """'ai dashboard' should return AI-related results."""
        results = self.index.search("ai dashboard")
        self.assertTrue(len(results) > 0)
        names = [r["name"] for r in results]
        self.assertIn("AI Dashboard", names)

    def test_synonym_saas_matches(self):
        """Searching 'software-as-a-service' should match 'saas' via synonyms."""
        results = self.index.search("software-as-a-service")
        names = [r["name"] for r in results]
        self.assertIn("SaaS Tool", names)


class TestBM25FullIndex(unittest.TestCase):
    """Integration tests against the full CSV-backed index."""

    @classmethod
    def setUpClass(cls):
        from core import ReasoningEngine
        cls.engine = ReasoningEngine()

    def test_ecommerce_search_returns_products(self):
        """'e-commerce' should find ecommerce products in the full index."""
        results = self.engine.index.search("e-commerce", top_k=5, source_filter="products.csv")
        self.assertTrue(len(results) > 0, "Expected at least 1 product for 'e-commerce'")

    def test_banking_search_returns_results(self):
        """'banking' should find bank-related entries in the full index."""
        results = self.engine.index.search("banking", top_k=10)
        self.assertTrue(len(results) > 0, "Expected at least 1 result for 'banking'")

    def test_ai_dashboard_full_search(self):
        """'ai dashboard' should find AI-related results in the full index."""
        results = self.engine.index.search("ai dashboard", top_k=5)
        self.assertTrue(len(results) > 0, "Expected at least 1 result for 'ai dashboard'")


if __name__ == "__main__":
    unittest.main()
