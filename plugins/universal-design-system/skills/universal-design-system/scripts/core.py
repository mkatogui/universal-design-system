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
# Synonym Dictionary
# ---------------------------------------------------------------------------

SYNONYMS: dict[str, list[str]] = {
    "ecommerce": ["e-commerce", "online-store", "webshop"],
    "e-commerce": ["ecommerce", "online-store", "webshop"],
    "ai": ["artificial-intelligence", "machine-learning"],
    "artificial-intelligence": ["ai", "machine-learning"],
    "ml": ["machine-learning", "ai"],
    "machine-learning": ["ml", "ai"],
    "saas": ["software-as-a-service", "cloud-software"],
    "software-as-a-service": ["saas", "cloud-software"],
    "ui": ["user-interface"],
    "user-interface": ["ui"],
    "ux": ["user-experience"],
    "user-experience": ["ux"],
    "b2b": ["business-to-business"],
    "business-to-business": ["b2b"],
    "b2c": ["business-to-consumer"],
    "business-to-consumer": ["b2c"],
    "iot": ["internet-of-things", "connected-device"],
    "internet-of-things": ["iot", "connected-device"],
    "devops": ["dev-ops", "cicd"],
    "dev-ops": ["devops", "cicd"],
    "crm": ["customer-relationship-management"],
    "customer-relationship-management": ["crm"],
    "cms": ["content-management-system"],
    "content-management-system": ["cms"],
    "api": ["application-programming-interface"],
    "fintech": ["financial-technology"],
    "financial-technology": ["fintech"],
    "defi": ["decentralized-finance"],
    "decentralized-finance": ["defi"],
    "nft": ["non-fungible-token"],
    "non-fungible-token": ["nft"],
    "seo": ["search-engine-optimization"],
    "search-engine-optimization": ["seo"],
}


# ---------------------------------------------------------------------------
# Porter Stemmer (lightweight, no external dependencies)
# ---------------------------------------------------------------------------

class PorterStemmer:
    """Minimal Porter stemmer for common English suffixes."""

    _VOWELS = frozenset("aeiou")

    _STEP2_MAP = (
        ("ational", "ate"), ("tional", "tion"), ("enci", "ence"),
        ("anci", "ance"), ("izer", "ize"), ("abli", "able"),
        ("alli", "al"), ("entli", "ent"), ("eli", "e"),
        ("ousli", "ous"), ("ization", "ize"), ("ation", "ate"),
        ("ator", "ate"), ("alism", "al"), ("iveness", "ive"),
        ("fulness", "ful"), ("ousness", "ous"), ("aliti", "al"),
        ("iviti", "ive"), ("biliti", "ble"),
    )

    _STEP3_MAP = (
        ("icate", "ic"), ("ative", ""), ("alize", "al"),
        ("iciti", "ic"), ("ical", "ic"), ("ful", ""), ("ness", ""),
    )

    _STEP4_SUFFIXES = (
        "al", "ance", "ence", "er", "ic", "able", "ible",
        "ant", "ement", "ment", "ent", "ion", "ou", "ism",
        "ate", "iti", "ous", "ive", "ize",
    )

    @staticmethod
    def _measure(stem: str) -> int:
        """Count consonant-vowel sequences (the 'm' value in Porter)."""
        if not stem:
            return 0
        vowels = PorterStemmer._VOWELS
        cv = "".join("v" if ch in vowels else "c" for ch in stem)
        return cv.count("cv")

    @staticmethod
    def _has_vowel(stem: str) -> bool:
        return any(ch in PorterStemmer._VOWELS for ch in stem)

    @staticmethod
    def _ends_double_consonant(word: str) -> bool:
        if len(word) < 2:
            return False
        return (
            word[-1] == word[-2]
            and word[-1] not in PorterStemmer._VOWELS
        )

    @staticmethod
    def _ends_cvc(word: str) -> bool:
        """True if word ends consonant-vowel-consonant (and last is not w/x/y)."""
        if len(word) < 3:
            return False
        v = PorterStemmer._VOWELS
        return (
            word[-1] not in v
            and word[-2] in v
            and word[-3] not in v
            and word[-1] not in "wxy"
        )

    def stem(self, word: str) -> str:
        """Return the stemmed form of a single word."""
        if len(word) <= 2:
            return word

        word = word.lower()

        # Step 1a: plurals
        if word.endswith("sses"):
            word = word[:-2]
        elif word.endswith("ies"):
            word = word[:-2]
        elif word.endswith("ss"):
            pass
        elif word.endswith("s") and len(word) > 3:
            word = word[:-1]

        # Step 1b: -eed, -ed, -ing
        if word.endswith("eed"):
            stem = word[:-3]
            if self._measure(stem) > 0:
                word = word[:-1]
        elif word.endswith("ed"):
            stem = word[:-2]
            if self._has_vowel(stem) and len(stem) > 1:
                word = stem
                word = self._step1b_fixup(word)
        elif word.endswith("ing"):
            stem = word[:-3]
            if self._has_vowel(stem) and len(stem) > 1:
                word = stem
                word = self._step1b_fixup(word)

        # Step 1c: y -> i
        if word.endswith("y") and self._has_vowel(word[:-1]) and len(word) > 2:
            word = word[:-1] + "i"

        # Step 2: suffix mapping (m > 0)
        for suffix, replacement in self._STEP2_MAP:
            if word.endswith(suffix):
                stem = word[: -len(suffix)]
                if self._measure(stem) > 0:
                    word = stem + replacement
                break

        # Step 3: further suffix reduction (m > 0)
        for suffix, replacement in self._STEP3_MAP:
            if word.endswith(suffix):
                stem = word[: -len(suffix)]
                if self._measure(stem) > 0:
                    word = stem + replacement
                break

        # Step 4: remove known suffixes when m > 1
        for suffix in self._STEP4_SUFFIXES:
            if word.endswith(suffix):
                stem = word[: -len(suffix)]
                if self._measure(stem) > 1:
                    if suffix == "ion" and stem and stem[-1] in "st":
                        word = stem
                    elif suffix != "ion":
                        word = stem
                break

        # Step 5a: remove trailing 'e' when m > 1, or m == 1 and not *o
        if word.endswith("e"):
            stem = word[:-1]
            m = self._measure(stem)
            if m > 1 or (m == 1 and not self._ends_cvc(stem)):
                word = stem

        # Step 5b: double consonant + m > 1 -> remove last letter
        if (
            self._ends_double_consonant(word)
            and word[-1] == "l"
            and self._measure(word[:-1]) > 1
        ):
            word = word[:-1]

        return word

    def _step1b_fixup(self, word: str) -> str:
        """Fix up word after removing -ed / -ing in step 1b."""
        if word.endswith(("at", "bl", "iz")):
            word += "e"
        elif self._ends_double_consonant(word) and word[-1] not in "lsz":
            word = word[:-1]
        elif self._measure(word) == 1 and self._ends_cvc(word):
            word += "e"
        return word


# ---------------------------------------------------------------------------
# BM25 Index
# ---------------------------------------------------------------------------

class BM25Index:
    """Okapi BM25 ranking function over CSV rows with stemming and synonyms.

    Uses an inverted index for O(k) search time where k is the number of
    posting list entries for the query tokens, instead of O(n) iteration
    over all documents.
    """

    _stemmer = PorterStemmer()

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: list[dict] = []
        self.doc_len: list[int] = []
        self.avg_dl: float = 0.0
        self.df: Counter = Counter()
        self.n_docs: int = 0
        self.sources: list[str] = []
        # Inverted index: token -> list of (doc_id, term_frequency)
        self._inverted: dict[str, list[tuple[int, int]]] = {}

    @staticmethod
    def tokenize(text: str, expand: bool = False) -> list[str]:
        """Lowercase, hyphen-aware tokenization with optional synonym expansion.

        Hyphenated terms produce both the hyphenated form and joined form, plus
        any sub-parts longer than 1 character.  When *expand* is True, each
        token is also looked up in the SYNONYMS dictionary and its synonyms are
        appended.  Stemmed forms of every token are added as well.
        """
        text = text.lower()
        # Keep hyphens in a first pass, split on everything else
        text = re.sub(r"[^a-z0-9\-/]", " ", text)
        raw_tokens = [t for t in text.split() if len(t) > 1]

        tokens: list[str] = []
        stemmer = BM25Index._stemmer
        for tok in raw_tokens:
            tokens.append(tok)
            # Compute the de-hyphenated form once for reuse
            joined = tok.replace("-", "") if "-" in tok else tok
            # Hyphen-aware expansion: "e-commerce" -> ["e-commerce", "ecommerce", "commerce"]
            if "-" in tok:
                if len(joined) > 1:
                    tokens.append(joined)
                for part in tok.split("-"):
                    if len(part) > 1:
                        tokens.append(part)
            # Add stemmed form
            stemmed = stemmer.stem(joined)
            if stemmed and len(stemmed) > 1 and stemmed != tok:
                tokens.append(stemmed)

        if expand:
            expanded: list[str] = list(tokens)
            seen = set(tokens)
            for tok in tokens:
                for syn in SYNONYMS.get(tok, []):
                    if syn not in seen:
                        expanded.append(syn)
                        seen.add(syn)
                        # Also add joined form of hyphenated synonyms
                        if "-" in syn:
                            joined_syn = syn.replace("-", "")
                            if len(joined_syn) > 1 and joined_syn not in seen:
                                expanded.append(joined_syn)
                                seen.add(joined_syn)
            return expanded
        return tokens

    def add_documents(self, rows: list[dict], source: str, text_fields: list[str]):
        """Index a set of CSV rows with specified text fields."""
        for row in rows:
            text_parts = []
            for field in text_fields:
                val = row.get(field, "")
                if val:
                    text_parts.append(str(val))
            combined = " ".join(text_parts)
            tokens = self.tokenize(combined, expand=False)

            doc_id = len(self.corpus)
            self.corpus.append(row)
            self.doc_len.append(len(tokens))
            self.sources.append(source)

            # Build inverted index: for each unique token, record (doc_id, tf)
            tf_counts = Counter(tokens)
            for token, tf in tf_counts.items():
                self.df[token] += 1
                if token not in self._inverted:
                    self._inverted[token] = []
                self._inverted[token].append((doc_id, tf))

        self.n_docs = len(self.corpus)
        self.avg_dl = sum(self.doc_len) / max(self.n_docs, 1)

    def search(self, query: str, top_k: int = 10, source_filter: Optional[str] = None) -> list[dict]:
        """Search the index with synonym expansion and return top-k results.

        Uses the inverted index to iterate only over posting lists for query
        tokens (O(k) where k = total postings) instead of scanning all docs.
        """
        query_tokens = self.tokenize(query, expand=True)
        # Deduplicate while preserving order for scoring
        seen: set[str] = set()
        unique_tokens: list[str] = []
        for qt in query_tokens:
            if qt not in seen:
                seen.add(qt)
                unique_tokens.append(qt)
        query_tokens = unique_tokens

        # Accumulate scores via inverted index traversal
        doc_scores: dict[int, float] = {}

        for qt in query_tokens:
            postings = self._inverted.get(qt)
            if not postings:
                continue

            idf = math.log(
                (self.n_docs - self.df[qt] + 0.5) / (self.df[qt] + 0.5) + 1
            )

            for doc_id, tf in postings:
                if source_filter and self.sources[doc_id] != source_filter:
                    continue
                dl = self.doc_len[doc_id]
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * dl / self.avg_dl)
                doc_scores[doc_id] = doc_scores.get(doc_id, 0.0) + idf * numerator / denominator

        # Sort by score descending
        scored = sorted(doc_scores.items(), key=lambda x: -x[1])
        results = []
        for idx, score in scored[:top_k]:
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
    "finance": ["financial", "investment", "trading", "mortgage", "payment", "accounting", "tax"],
    "fintech": ["fintech", "financial-technology", "neobank", "digital-banking", "mobile-banking", "paytech"],
    "banking": ["banking", "bank", "credit-union", "deposits", "loans", "retail-banking"],
    "insurance": ["insurance", "insuretech", "underwriting", "claims", "actuary", "policy"],
    "healthcare": ["health", "medical", "hospital", "clinic", "telehealth", "patient", "doctor", "pharmacy", "dental", "therapy", "mental-health"],
    "wellness": ["wellness", "mindfulness", "meditation", "yoga", "self-care", "wellbeing", "fitness-wellness"],
    "education": ["education", "school", "university", "course", "learning", "student", "teacher", "lms", "training", "tutorial", "bootcamp"],
    "kids": ["kids", "children", "toddler", "young-learner", "parenting", "child-friendly"],
    "ecommerce": ["ecommerce", "e-commerce", "shop", "store", "retail", "product", "marketplace", "cart", "checkout"],
    "saas": ["saas", "software", "platform", "tool", "app", "service", "subscription", "b2b"],
    "ai": ["ai", "artificial-intelligence", "machine-learning", "ml", "llm", "gpt", "neural", "deep-learning"],
    "tech": ["tech", "technology", "robotics", "cybersecurity", "automation"],
    "devtools": ["devtools", "developer", "api", "sdk", "ide", "code-editor", "cli", "dev-tools"],
    "crypto": ["crypto", "blockchain", "bitcoin", "ethereum", "nft", "token", "wallet", "cryptocurrency"],
    "web3": ["web3", "decentralized", "dapp", "dao", "metaverse", "smart-contract"],
    "defi": ["defi", "decentralized-finance", "yield", "staking", "liquidity", "amm", "swap"],
    "iot": ["iot", "internet-of-things", "sensor", "smart-home", "connected-device", "embedded"],
    "government": ["government", "gov", "public", "municipal", "federal", "civic", "citizen"],
    "legal": ["legal", "law", "attorney", "lawyer", "court", "contract", "compliance"],
    "nonprofit": ["nonprofit", "charity", "donation", "volunteer", "ngo", "social-impact", "cause"],
    "media": ["news", "media", "magazine", "podcast", "video", "streaming", "publishing", "blog"],
    "editorial": ["editorial", "newspaper", "journalism", "press", "content-platform", "copywriting"],
    "creative": ["agency", "portfolio", "photography", "design", "architecture", "art", "studio"],
    "fashion": ["fashion", "apparel", "clothing", "streetwear", "runway", "couture", "outfit"],
    "luxury": ["luxury", "premium", "high-end", "exclusive", "bespoke", "upscale"],
    "hospitality": ["hotel", "restaurant", "travel", "tourism", "booking", "hospitality", "marina", "yacht", "dock", "waterfront", "resort", "spa", "lodge", "inn", "villa", "cruise"],
    "food": ["food", "recipe", "cooking", "delivery", "meal", "catering", "menu"],
    "gaming": ["gaming", "game", "game-dev", "gamer", "multiplayer"],
    "esports": ["esports", "e-sports", "competitive-gaming", "tournament", "league", "twitch"],
    "entertainment": ["entertainment", "music", "movie", "event", "ticket", "concert"],
    "social": ["social", "community", "forum", "dating", "network", "chat", "messaging"],
    "social-media": ["social-media", "feed", "influencer", "followers", "stories", "reels", "tiktok"],
    "analytics": ["analytics", "data-analytics", "bi", "business-intelligence", "reporting", "metrics", "insights"],
    "marketing": ["marketing", "seo", "advertising", "campaign", "email-marketing", "growth", "funnel"],
    "dashboard": ["dashboard", "admin-panel", "control-panel", "monitoring", "ops", "observability"],
    "logistics": ["logistics", "shipping", "warehouse", "fleet", "supply-chain", "delivery"],
    "real-estate": ["real-estate", "property", "housing", "apartment", "realty", "mortgage"],
    "professional": ["consulting", "accounting", "hr", "recruiting", "staffing", "legal-tech"],
    "productivity": ["productivity", "project-management", "crm", "email", "notes", "collaboration"],
    "startup": ["startup", "mvp", "launch", "early-stage", "seed", "pitch"],
    "sustainability": ["sustainability", "green", "eco", "carbon", "renewable", "climate", "environmental"],
    "proptech": ["proptech", "property", "real-estate", "realestate", "rental", "tenant", "landlord", "mortgage"],
    "automotive": ["automotive", "car", "vehicle", "fleet", "dealership", "auto", "ev", "electric-vehicle"],
    "regtech": ["regtech", "regulation", "regulatory", "compliance-tech", "aml", "kyc"],
    "legaltech": ["legaltech", "legal", "law", "attorney", "contract", "litigation", "paralegal"],
    "agritech": ["agritech", "agriculture", "farming", "crop", "livestock", "harvest", "agronomic"],
    "govtech": ["govtech", "government", "civic", "municipal", "public-sector", "citizen", "e-government"],
    "cleantech": ["cleantech", "clean-energy", "solar", "wind-energy", "recycling", "waste-management"],
    "insurtech": ["insurtech", "insurance-tech", "claims", "underwriting", "actuarial", "policy-management"],
    "sporttech": ["sporttech", "sports", "athletics", "fitness-tech", "coaching", "training-analytics"],
    "fashiontech": ["fashiontech", "fashion", "apparel", "clothing", "wardrobe", "style-tech", "textile"],
    "foodtech": ["foodtech", "food", "recipe", "meal-planning", "nutrition-tech", "food-delivery"],
    "musictech": ["musictech", "music", "audio", "streaming-music", "podcast", "sound-engineering"],
    "pettech": ["pettech", "pet", "veterinary", "animal", "pet-care", "grooming"],
    "spacetech": ["spacetech", "space", "satellite", "aerospace", "orbital", "rocket", "astronautic"],
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
    "admin-panel": ["admin", "admin-panel", "backoffice", "cms", "management"],
    "community": ["community", "forum", "social", "discussion", "members"],
    "data-table": ["data-table", "spreadsheet", "grid", "table", "tabular"],
    "marketplace": ["marketplace", "listing", "vendor", "seller", "buyer"],
    "streaming": ["streaming", "video", "audio", "live", "player"],
    "telehealth": ["telehealth", "telemedicine", "virtual-care", "patient-portal", "remote-health"],
    "booking": ["booking", "reservation", "appointment", "scheduling", "calendar"],
    "social-app": ["social-app", "social-network", "social-media", "feed", "timeline"],
    "editor": ["editor", "ide", "code-editor", "text-editor", "wysiwyg"],
    "onboarding": ["onboarding", "signup", "registration", "welcome", "getting-started"],
    "crm": ["crm", "customer-relationship", "sales-pipeline", "leads", "contacts"],
    "productivity": ["productivity", "task-manager", "kanban", "todo", "workflow"],
    "analytics": ["analytics", "insights", "reporting", "metrics", "kpi"],
}


class DomainDetector:
    """Detect sector and product type from query text."""

    @staticmethod
    def _keyword_specificity(keywords: list[str], query_lower: str, tokens: set) -> int:
        """Sum of matched keyword lengths — longer keywords are more specific."""
        total = 0
        for kw in keywords:
            if kw in query_lower or kw in tokens:
                total += len(kw)
        return total

    def detect(self, query: str) -> dict:
        """Return detected sector, product_type, and confidence."""
        query_lower = query.lower()
        tokens = set(re.split(r"\W+", query_lower))

        # Detect sector
        sector_scores = {}
        sector_specificity = {}
        for sector, keywords in SECTOR_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in query_lower or kw in tokens)
            if score > 0:
                sector_scores[sector] = score
                sector_specificity[sector] = self._keyword_specificity(
                    keywords, query_lower, tokens
                )

        # Tiebreaker: when scores tie, prefer sector with higher keyword specificity
        if sector_scores:
            sector = max(
                sector_scores,
                key=lambda s: (sector_scores[s], sector_specificity.get(s, 0)),
            )
        else:
            sector = "general"
        sector_confidence = min(sector_scores.get(sector, 0) / 3.0, 1.0)

        # Detect product type
        product_scores = {}
        product_specificity = {}
        for ptype, keywords in PRODUCT_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in query_lower or kw in tokens)
            if score > 0:
                product_scores[ptype] = score
                product_specificity[ptype] = self._keyword_specificity(
                    keywords, query_lower, tokens
                )

        if product_scores:
            product_type = max(
                product_scores,
                key=lambda p: (product_scores[p], product_specificity.get(p, 0)),
            )
        else:
            product_type = "general"
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

    @staticmethod
    def _evaluate_compound_condition(compound: str, domain: dict) -> bool:
        """Evaluate a compound condition string against a domain dict.

        Supports AND/OR boolean operators with ``field=value`` sub-expressions.
        AND is evaluated before OR (standard precedence): the string is first
        split on `` OR `` to produce OR-groups, then each group is split on
        `` AND ``.  All sub-conditions in an AND-group must match for that
        group to be true; any true group satisfies the whole expression.
        """
        or_groups = compound.split(" OR ")
        for group in or_groups:
            and_parts = group.split(" AND ")
            all_match = True
            for part in and_parts:
                part = part.strip()
                if "=" not in part:
                    all_match = False
                    break
                field, value = part.split("=", 1)
                field = field.strip()
                value = value.strip()
                if domain.get(field) != value:
                    all_match = False
                    break
            if all_match:
                return True
        return False

    @staticmethod
    def _rule_to_applied(rule: dict) -> dict:
        """Convert a raw CSV rule row into an applied-rule dict."""
        return {
            "rule_id": rule.get("id"),
            "category": rule.get("category", ""),
            "then_field": rule.get("then_field", ""),
            "then_value": rule.get("then_value", ""),
            "priority": int(rule.get("priority", 5)),
            "reasoning": rule.get("reasoning", ""),
        }

    def apply_rules(self, domain: dict) -> list[dict]:
        """Apply conditional reasoning rules based on detected domain.

        Rules with a non-empty ``compound_condition`` column are evaluated
        using :meth:`_evaluate_compound_condition`.  When the column is empty
        the original single-field evaluation logic is used.
        """
        applied = []
        sector = domain["sector"]
        product_type = domain["product_type"]

        for rule in self.rules:
            # --- Compound condition path (new) ---
            compound = rule.get("compound_condition", "").strip()
            if compound:
                if self._evaluate_compound_condition(compound, domain):
                    applied.append(self._rule_to_applied(rule))
                continue

            # --- Single-field condition path (original) ---
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
                applied.append(self._rule_to_applied(rule))

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
