#!/usr/bin/env python3
"""
Universal Design System — BM25 Reasoning Engine

Provides:
- BM25Index: TF-IDF style search across CSV databases
- DomainDetector: Classifies user queries into sectors/product types
- ReasoningEngine: Applies conditional design rules to produce recommendations

Usage:
    from core import ReasoningEngine
    engine = ReasoningEngine()
    result = engine.reason("fintech dashboard for mobile banking")
"""

import csv
import math
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent / "data"


# ---------------------------------------------------------------------------
# BM25 Index
# ---------------------------------------------------------------------------

class BM25Index:
    """Okapi BM25 ranking function over CSV rows."""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: list[dict] = []
        self.doc_tokens: list[list[str]] = []
        self.doc_len: list[int] = []
        self.avg_dl: float = 0.0
        self.df: Counter = Counter()
        self.n_docs: int = 0
        self.sources: list[str] = []

    @staticmethod
    def tokenize(text: str) -> list[str]:
        """Lowercase tokenization with basic normalization."""
        text = text.lower()
        text = re.sub(r"[^a-z0-9\-/]", " ", text)
        return [t for t in text.split() if len(t) > 1]

    def add_documents(self, rows: list[dict], source: str, text_fields: list[str]):
        """Index a set of CSV rows with specified text fields."""
        for row in rows:
            text_parts = []
            for field in text_fields:
                val = row.get(field, "")
                if val:
                    text_parts.append(str(val))
            combined = " ".join(text_parts)
            tokens = self.tokenize(combined)

            self.corpus.append(row)
            self.doc_tokens.append(tokens)
            self.doc_len.append(len(tokens))
            self.sources.append(source)

            for token in set(tokens):
                self.df[token] += 1

        self.n_docs = len(self.corpus)
        self.avg_dl = sum(self.doc_len) / max(self.n_docs, 1)

    def search(self, query: str, top_k: int = 10, source_filter: Optional[str] = None) -> list[dict]:
        """Search the index and return top-k results with scores."""
        query_tokens = self.tokenize(query)
        scores = []

        for i in range(self.n_docs):
            if source_filter and self.sources[i] != source_filter:
                continue

            score = 0.0
            doc_toks = self.doc_tokens[i]
            dl = self.doc_len[i]
            tf_map = Counter(doc_toks)

            for qt in query_tokens:
                if qt not in self.df:
                    continue
                tf = tf_map.get(qt, 0)
                if tf == 0:
                    continue

                idf = math.log(
                    (self.n_docs - self.df[qt] + 0.5) / (self.df[qt] + 0.5) + 1
                )
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * dl / self.avg_dl)
                score += idf * numerator / denominator

            if score > 0:
                scores.append((score, i))

        scores.sort(key=lambda x: -x[0])
        results = []
        for score, idx in scores[:top_k]:
            result = dict(self.corpus[idx])
            result["_score"] = round(score, 3)
            result["_source"] = self.sources[idx]
            results.append(result)

        return results


# ---------------------------------------------------------------------------
# CSV Loader
# ---------------------------------------------------------------------------

def load_csv(filename: str) -> list[dict]:
    """Load a CSV file from the data directory."""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        return []
    with open(filepath, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ---------------------------------------------------------------------------
# Domain Detector
# ---------------------------------------------------------------------------

SECTOR_KEYWORDS = {
    "finance": ["fintech", "banking", "bank", "financial", "investment", "trading", "insurance", "mortgage", "payment", "accounting", "tax"],
    "healthcare": ["health", "medical", "hospital", "clinic", "telehealth", "patient", "doctor", "pharmacy", "dental", "therapy", "mental-health"],
    "education": ["education", "school", "university", "course", "learning", "student", "teacher", "lms", "training", "tutorial", "bootcamp"],
    "ecommerce": ["ecommerce", "e-commerce", "shop", "store", "retail", "product", "marketplace", "cart", "checkout"],
    "saas": ["saas", "software", "platform", "tool", "app", "service", "subscription", "b2b"],
    "technology": ["tech", "ai", "machine-learning", "ml", "developer", "devtools", "api", "iot", "robotics", "cybersecurity"],
    "crypto": ["crypto", "blockchain", "bitcoin", "ethereum", "nft", "defi", "web3", "token", "wallet"],
    "government": ["government", "gov", "public", "municipal", "federal", "civic", "citizen"],
    "legal": ["legal", "law", "attorney", "lawyer", "court", "contract", "compliance"],
    "nonprofit": ["nonprofit", "charity", "donation", "volunteer", "ngo", "social-impact", "cause"],
    "media": ["news", "media", "magazine", "podcast", "video", "streaming", "publishing", "blog"],
    "creative": ["agency", "portfolio", "photography", "design", "architecture", "art", "studio"],
    "hospitality": ["hotel", "restaurant", "travel", "tourism", "booking", "hospitality", "food"],
    "gaming": ["gaming", "game", "esports", "game-dev"],
    "entertainment": ["entertainment", "music", "movie", "event", "ticket", "concert"],
    "social": ["social", "community", "forum", "dating", "network", "chat", "messaging"],
    "logistics": ["logistics", "shipping", "warehouse", "fleet", "supply-chain", "delivery"],
    "real-estate": ["real-estate", "property", "housing", "apartment", "realty", "mortgage"],
    "professional": ["consulting", "accounting", "hr", "recruiting", "staffing", "legal-tech"],
    "productivity": ["productivity", "project-management", "crm", "email", "notes", "collaboration"],
    "startup": ["startup", "mvp", "launch", "early-stage", "seed", "pitch"],
}

PRODUCT_KEYWORDS = {
    "dashboard": ["dashboard", "admin", "panel", "analytics", "metrics", "monitoring", "reporting"],
    "landing-page": ["landing", "homepage", "marketing", "launch", "conversion"],
    "mobile-app": ["mobile", "app", "ios", "android", "phone", "tablet"],
    "documentation": ["docs", "documentation", "api-docs", "guide", "reference"],
    "ecommerce": ["shop", "store", "cart", "checkout", "product-listing"],
    "blog": ["blog", "article", "editorial", "content", "magazine"],
    "saas-app": ["saas", "platform", "tool", "software", "web-app"],
    "portfolio": ["portfolio", "showcase", "gallery", "work", "projects"],
}


class DomainDetector:
    """Detect sector and product type from query text."""

    def detect(self, query: str) -> dict:
        """Return detected sector, product_type, and confidence."""
        query_lower = query.lower()
        tokens = set(re.split(r"\W+", query_lower))

        # Detect sector
        sector_scores = {}
        for sector, keywords in SECTOR_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in query_lower or kw in tokens)
            if score > 0:
                sector_scores[sector] = score

        sector = max(sector_scores, key=sector_scores.get) if sector_scores else "general"
        sector_confidence = min(sector_scores.get(sector, 0) / 3.0, 1.0)

        # Detect product type
        product_scores = {}
        for ptype, keywords in PRODUCT_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in query_lower or kw in tokens)
            if score > 0:
                product_scores[ptype] = score

        product_type = max(product_scores, key=product_scores.get) if product_scores else "general"
        product_confidence = min(product_scores.get(product_type, 0) / 2.0, 1.0)

        return {
            "sector": sector,
            "sector_confidence": round(sector_confidence, 2),
            "product_type": product_type,
            "product_confidence": round(product_confidence, 2),
            "all_sectors": sector_scores,
            "all_products": product_scores,
        }


# ---------------------------------------------------------------------------
# Reasoning Engine
# ---------------------------------------------------------------------------

class ReasoningEngine:
    """Apply design reasoning rules based on detected domain."""

    def __init__(self):
        self.index = BM25Index()
        self.detector = DomainDetector()
        self.rules = load_csv("ui-reasoning.csv")
        self.anti_patterns = load_csv("anti-patterns.csv")
        self._build_index()

    def _build_index(self):
        """Build the BM25 index from all CSV databases."""
        datasets = [
            ("products.csv", ["name", "sector", "sub_sector", "palette", "style", "color_mood", "key_components", "key_patterns", "audience"]),
            ("styles.csv", ["name", "category", "description", "palette", "best_for"]),
            ("colors.csv", ["name", "industry", "mood", "palette_match"]),
            ("typography.csv", ["heading_font", "body_font", "mood", "best_for", "palette_match"]),
            ("landing.csv", ["name", "category", "description", "palette_match", "best_for"]),
            ("charts.csv", ["name", "type", "description", "best_for"]),
            ("components.csv", ["name", "slug", "category", "variants", "use_when"]),
            ("patterns.csv", ["name", "slug", "category", "description", "best_for"]),
            ("ux-guidelines.csv", ["category", "guideline", "applies_to"]),
            ("anti-patterns.csv", ["sector", "anti_pattern", "description"]),
            ("google-fonts.csv", ["name", "category", "mood", "best_for"]),
            ("icons.csv", ["name", "library", "style", "best_for"]),
            ("app-interface.csv", ["category", "issue", "keywords", "description"]),
            ("react-performance.csv", ["category", "issue", "keywords", "description"]),
        ]

        for filename, fields in datasets:
            rows = load_csv(filename)
            if rows:
                self.index.add_documents(rows, filename, fields)

        # Load stacks subdirectory
        stacks_dir = DATA_DIR / "stacks"
        if stacks_dir.exists():
            for csv_file in stacks_dir.glob("*.csv"):
                rows = []
                with open(csv_file, newline="", encoding="utf-8") as f:
                    rows = list(csv.DictReader(f))
                if rows:
                    self.index.add_documents(
                        rows, f"stacks/{csv_file.name}",
                        ["category", "issue", "keywords", "description"]
                    )

    def apply_rules(self, domain: dict) -> list[dict]:
        """Apply conditional reasoning rules based on detected domain."""
        applied = []
        sector = domain["sector"]
        product_type = domain["product_type"]

        for rule in self.rules:
            field = rule.get("field", "")
            operator = rule.get("operator", "")
            value = rule.get("value", "")
            condition = rule.get("condition", "")

            match = False
            if condition == "sector" and field == "sector" and operator == "equals":
                match = sector == value
            elif condition == "product" and field == "product_type" and operator == "equals":
                match = product_type == value
            elif condition == "anti_pattern" and field == "sector" and operator == "equals":
                match = sector == value
            elif condition == "audience" and field == "audience" and operator == "equals":
                # Skip audience matching for now
                pass
            elif condition in ("component", "pattern", "wcag", "motion", "density", "typography", "color", "shadow", "radius", "layout", "contrast", "responsive", "performance", "icon"):
                if field == "sector" and operator == "equals":
                    match = sector == value
                elif field == "product_type" and operator == "equals":
                    match = product_type == value
                elif field == "palette" and operator == "equals":
                    # Will be applied after palette is determined
                    pass
                elif field == "theme_mode" and operator == "equals":
                    pass
                elif field == "audience" and operator == "contains":
                    pass

            if match:
                applied.append({
                    "rule_id": rule.get("id"),
                    "category": rule.get("category", ""),
                    "then_field": rule.get("then_field", ""),
                    "then_value": rule.get("then_value", ""),
                    "priority": int(rule.get("priority", 5)),
                    "reasoning": rule.get("reasoning", ""),
                })

        # Sort by priority descending
        applied.sort(key=lambda r: -r["priority"])
        return applied

    def get_anti_patterns(self, sector: str) -> list[dict]:
        """Get anti-patterns for a given sector."""
        results = []
        for ap in self.anti_patterns:
            if ap.get("sector", "").lower() == sector.lower():
                results.append({
                    "anti_pattern": ap.get("anti_pattern", ""),
                    "severity": ap.get("severity", ""),
                    "description": ap.get("description", ""),
                    "alternative": ap.get("alternative", ""),
                })
        return results

    def reason(self, query: str) -> dict:
        """Full reasoning pipeline: detect domain → search → apply rules → recommend."""
        domain = self.detector.detect(query)
        rules = self.apply_rules(domain)
        anti_patterns = self.get_anti_patterns(domain["sector"])

        # Search for relevant products
        products = self.index.search(query, top_k=5, source_filter="products.csv")

        # Search for relevant styles
        styles = self.index.search(query, top_k=3, source_filter="styles.csv")

        # Search for relevant colors
        colors = self.index.search(query, top_k=3, source_filter="colors.csv")

        # Search for relevant typography
        typography = self.index.search(query, top_k=3, source_filter="typography.csv")

        # Search for relevant components
        components = self.index.search(query, top_k=10, source_filter="components.csv")

        # Search for relevant patterns
        patterns = self.index.search(query, top_k=5, source_filter="patterns.csv")

        # Search for relevant guidelines
        guidelines = self.index.search(query, top_k=5, source_filter="ux-guidelines.csv")

        # Determine recommended palette from rules
        palette = "minimal-saas"  # default
        for rule in rules:
            if rule["then_field"] == "palette":
                palette = rule["then_value"]
                break

        # If no rule matched, use top product match
        if palette == "minimal-saas" and products:
            palette = products[0].get("palette", "minimal-saas")

        return {
            "query": query,
            "domain": domain,
            "recommended_palette": palette,
            "rules_applied": rules,
            "anti_patterns": anti_patterns,
            "search_results": {
                "products": products,
                "styles": styles,
                "colors": colors,
                "typography": typography,
                "components": components,
                "patterns": patterns,
                "guidelines": guidelines,
            },
        }


# ---------------------------------------------------------------------------
# Quick test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    engine = ReasoningEngine()
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "saas dashboard"
    result = engine.reason(query)

    print(f"Query: {result['query']}")
    print(f"Sector: {result['domain']['sector']} ({result['domain']['sector_confidence']})")
    print(f"Product: {result['domain']['product_type']} ({result['domain']['product_confidence']})")
    print(f"Palette: {result['recommended_palette']}")
    print(f"Rules: {len(result['rules_applied'])}")
    print(f"Anti-patterns: {len(result['anti_patterns'])}")
    print(f"Products found: {len(result['search_results']['products'])}")
    print(f"Components: {len(result['search_results']['components'])}")
