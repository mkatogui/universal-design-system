#!/usr/bin/env python3
"""
Dataset Schema Validator for Universal Design System
Validates all 16 CSV databases against formal schemas.

- Required columns must exist
- No completely empty rows
- No duplicate IDs (where id column exists)
- Palette references match the 9 valid palettes
- Component slug cross-references (products.csv -> components.csv)
- Pattern slug cross-references (products.csv -> patterns.csv)
- Type validation for enum-like columns
- Permissive: only required columns are checked, extra columns allowed

Usage:
    python3 scripts/validate-datasets.py [--json]

Exit codes:
    0 = all validations passed
    1 = one or more errors found
"""

import csv
import json
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "src" / "data"
STACKS_DIR = DATA_DIR / "stacks"

# ---------------------------------------------------------------------------
# Palette registry (single source of truth)
# ---------------------------------------------------------------------------
sys.path.insert(0, str(PROJECT_ROOT / "src" / "scripts"))
try:
    from registry import get_all_palettes
    VALID_PALETTES = set(get_all_palettes())
except ImportError:
    VALID_PALETTES = {
        "minimal-saas",
        "ai-futuristic",
        "gradient-startup",
        "corporate",
        "apple-minimal",
        "illustration",
        "dashboard",
        "bold-lifestyle",
        "minimal-corporate",
    }

# ---------------------------------------------------------------------------
# Valid severity values used across CSVs
# ---------------------------------------------------------------------------
VALID_SEVERITIES_ANTI_PATTERNS = {
    "critical", "high", "moderate", "low",
}
VALID_SEVERITIES_MOBILE = {
    "critical", "high", "medium", "low",
}

# ---------------------------------------------------------------------------
# Reasoning CSV valid values
# ---------------------------------------------------------------------------
VALID_OPERATORS = {"equals", "contains", "not_equals", "in", "not_in"}
VALID_REASONING_CATEGORIES = {
    "sector-palette", "product-palette", "product-constraint",
    "audience-style", "audience-accessibility", "sector-anti",
    "product-component", "product-pattern", "accessibility",
    "sector-motion", "product-motion", "sector-density",
    "product-density", "sector-typography", "sector-color",
    "palette-shadow", "palette-radius", "product-layout",
    "theme-contrast", "responsive", "performance",
    "product-icon", "cross-cutting", "sector-transition",
}

# ---------------------------------------------------------------------------
# Schema definitions for all 16 CSVs
# ---------------------------------------------------------------------------
# Each schema specifies:
#   required     - columns that must exist
#   optional     - columns that may exist (for documentation; not enforced)
#   types        - per-column type hints used for validation
#   palette_col  - column name containing palette references to validate
#   component_col - column containing semicolon-delimited component slugs
#   pattern_col  - column containing semicolon-delimited pattern slugs
#   unique_cols  - columns whose values must be unique across rows
# ---------------------------------------------------------------------------

SCHEMAS = {
    "products.csv": {
        "path": DATA_DIR / "products.csv",
        "required": [
            "id", "name", "sector", "sub_sector", "palette", "style",
            "color_mood", "typography_mood", "key_components",
            "key_patterns", "audience", "complexity", "anti_patterns",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "sector": "string",
            "sub_sector": "string",
            "palette": "palette-ref",
            "style": "string",
            "color_mood": "string",
            "typography_mood": "string",
            "key_components": "slug-list",
            "key_patterns": "slug-list",
            "audience": "string",
            "complexity": "enum:low,medium,high",
            "anti_patterns": "string",
        },
        "palette_col": "palette",
        "component_col": "key_components",
        "pattern_col": "key_patterns",
        "unique_cols": ["id"],
    },
    "components.csv": {
        "path": DATA_DIR / "components.csv",
        "required": [
            "id", "name", "slug", "category", "variants", "sizes",
            "states", "props", "accessibility", "use_when",
            "dont_use_when", "css_class", "container_query",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "slug": "slug",
            "category": "string",
            "variants": "string",
            "sizes": "string",
            "states": "string",
            "props": "string",
            "accessibility": "string",
            "use_when": "string",
            "dont_use_when": "string",
            "css_class": "slug",
            "container_query": "enum:yes,no",
        },
        "unique_cols": ["id", "slug"],
    },
    "ui-reasoning.csv": {
        "path": DATA_DIR / "ui-reasoning.csv",
        "required": [
            "id", "condition", "field", "operator", "value",
            "then_field", "then_value", "priority", "reasoning",
            "category",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "condition": "string",
            "field": "string",
            "operator": "string",
            "value": "string",
            "then_field": "string",
            "then_value": "string",
            "priority": "integer",
            "reasoning": "string",
            "category": "string",
        },
        "unique_cols": ["id"],
    },
    "anti-patterns.csv": {
        "path": DATA_DIR / "anti-patterns.csv",
        "required": [
            "id", "sector", "anti_pattern", "severity",
            "description", "alternative", "example",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "sector": "string",
            "anti_pattern": "slug",
            "severity": "enum:critical,high,moderate,low",
            "description": "string",
            "alternative": "string",
            "example": "string",
        },
        "unique_cols": ["id"],
    },
    "typography.csv": {
        "path": DATA_DIR / "typography.csv",
        "required": [
            "id", "heading_font", "body_font", "mood", "category",
            "heading_weight", "body_weight", "best_for",
            "google_fonts_url", "palette_match",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "heading_font": "string",
            "body_font": "string",
            "mood": "string",
            "category": "string",
            "heading_weight": "integer",
            "body_weight": "integer",
            "best_for": "string",
            "google_fonts_url": "url",
            "palette_match": "palette-ref",
        },
        "palette_col": "palette_match",
        "unique_cols": ["id"],
    },
    "styles.csv": {
        "path": DATA_DIR / "styles.csv",
        "required": [
            "id", "name", "category", "description", "palette",
            "bg_treatment", "border_treatment", "shadow_treatment",
            "typography_treatment", "animation_treatment",
            "best_for", "avoid_for",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "category": "string",
            "description": "string",
            "palette": "palette-ref",
            "bg_treatment": "string",
            "border_treatment": "string",
            "shadow_treatment": "string",
            "typography_treatment": "string",
            "animation_treatment": "string",
            "best_for": "string",
            "avoid_for": "string",
        },
        "palette_col": "palette",
        "unique_cols": ["id"],
    },
    "colors.csv": {
        "path": DATA_DIR / "colors.csv",
        "required": [
            "id", "name", "industry", "primary", "secondary",
            "accent", "bg_primary", "bg_secondary", "text_primary",
            "mood", "wcag_aa", "palette_match",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "industry": "string",
            "primary": "hex-color",
            "secondary": "hex-color",
            "accent": "hex-color",
            "bg_primary": "hex-color",
            "bg_secondary": "hex-color",
            "text_primary": "hex-color",
            "mood": "string",
            "wcag_aa": "enum:yes,no",
            "palette_match": "palette-ref",
        },
        "palette_col": "palette_match",
        "unique_cols": ["id"],
    },
    "patterns.csv": {
        "path": DATA_DIR / "patterns.csv",
        "required": [
            "id", "name", "slug", "category", "description",
            "section_order", "key_components", "responsive_strategy",
            "best_for", "dont_use_for",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "slug": "slug",
            "category": "string",
            "description": "string",
            "section_order": "string",
            "key_components": "slug-list",
            "responsive_strategy": "string",
            "best_for": "string",
            "dont_use_for": "string",
        },
        "component_col": "key_components",
        "unique_cols": ["id", "slug"],
    },
    "google-fonts.csv": {
        "path": DATA_DIR / "google-fonts.csv",
        "required": [
            "id", "name", "category", "weights", "style", "mood",
            "best_for", "variable", "url",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "category": "string",
            "weights": "string",
            "style": "string",
            "mood": "string",
            "best_for": "string",
            "variable": "enum:yes,no",
            "url": "url",
        },
        "unique_cols": ["id"],
    },
    "icons.csv": {
        "path": DATA_DIR / "icons.csv",
        "required": [
            "id", "name", "library", "license", "style", "sizes",
            "tree_shakeable", "default_color", "best_for", "url",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "library": "string",
            "license": "string",
            "style": "string",
            "sizes": "string",
            "tree_shakeable": "enum:yes,no",
            "default_color": "string",
            "best_for": "string",
            "url": "string",
        },
        "unique_cols": ["id"],
    },
    "landing.csv": {
        "path": DATA_DIR / "landing.csv",
        "required": [
            "id", "name", "category", "description", "sections",
            "hero_variant", "cta_style", "palette_match", "best_for",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "category": "string",
            "description": "string",
            "sections": "string",
            "hero_variant": "string",
            "cta_style": "string",
            "palette_match": "palette-ref",
            "best_for": "string",
        },
        "palette_col": "palette_match",
        "unique_cols": ["id"],
    },
    "charts.csv": {
        "path": DATA_DIR / "charts.csv",
        "required": [
            "id", "name", "type", "description", "best_for",
            "data_type", "min_data_points", "max_data_points",
            "palette_tokens", "accessibility_notes",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "name": "string",
            "type": "string",
            "description": "string",
            "best_for": "string",
            "data_type": "string",
            "min_data_points": "integer",
            "max_data_points": "integer",
            "palette_tokens": "string",
            "accessibility_notes": "string",
        },
        "unique_cols": ["id"],
    },
    "ux-guidelines.csv": {
        "path": DATA_DIR / "ux-guidelines.csv",
        "required": [
            "id", "category", "guideline", "priority",
            "applies_to", "rationale",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "category": "string",
            "guideline": "string",
            "priority": "integer",
            "applies_to": "string",
            "rationale": "string",
        },
        "unique_cols": ["id"],
    },
    "app-interface.csv": {
        "path": DATA_DIR / "app-interface.csv",
        "required": [
            "id", "category", "issue", "keywords", "platform",
            "description", "do", "dont", "severity",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "category": "string",
            "issue": "string",
            "keywords": "string",
            "platform": "string",
            "description": "string",
            "do": "string",
            "dont": "string",
            "severity": "enum:critical,high,medium,low",
        },
        "unique_cols": ["id"],
    },
    "react-performance.csv": {
        "path": DATA_DIR / "react-performance.csv",
        "required": [
            "id", "category", "issue", "keywords", "platform",
            "description", "do", "dont", "severity",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "category": "string",
            "issue": "string",
            "keywords": "string",
            "platform": "string",
            "description": "string",
            "do": "string",
            "dont": "string",
            "severity": "enum:critical,high,medium,low",
        },
        "unique_cols": ["id"],
    },
    "stacks/react-native.csv": {
        "path": STACKS_DIR / "react-native.csv",
        "required": [
            "id", "category", "issue", "keywords", "platform",
            "description", "do", "dont", "severity",
        ],
        "optional": [],
        "types": {
            "id": "integer",
            "category": "string",
            "issue": "string",
            "keywords": "string",
            "platform": "string",
            "description": "string",
            "do": "string",
            "dont": "string",
            "severity": "enum:critical,high,medium,low",
        },
        "unique_cols": ["id"],
    },
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_csv(filepath: Path) -> list[dict]:
    """Load a CSV file and return list of row dicts."""
    if not filepath.exists():
        return []
    with open(filepath, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def is_integer(value: str) -> bool:
    """Check if string represents an integer."""
    try:
        int(value)
        return True
    except (ValueError, TypeError):
        return False


def is_hex_color(value: str) -> bool:
    """Check if string is a valid hex color (#RGB, #RRGGBB, #RRGGBBAA)."""
    if not value.startswith("#"):
        return False
    hex_part = value[1:]
    if len(hex_part) not in (3, 6, 8):
        return False
    return all(c in "0123456789abcdefABCDEF" for c in hex_part)


def is_slug(value: str) -> bool:
    """Check if string is a valid slug (lowercase, alphanumeric, hyphens)."""
    return all(c.isalnum() or c == "-" for c in value) and value == value.lower()


def is_url(value: str) -> bool:
    """Check if string looks like a URL."""
    return value.startswith("http://") or value.startswith("https://")


# ---------------------------------------------------------------------------
# Validation logic
# ---------------------------------------------------------------------------

class ValidationResult:
    """Accumulates errors and warnings for a single file."""

    def __init__(self, filename: str):
        self.filename = filename
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.row_count = 0

    def error(self, msg: str):
        self.errors.append(f"{self.filename}: {msg}")

    def warning(self, msg: str):
        self.warnings.append(f"{self.filename}: {msg}")

    @property
    def passed(self) -> bool:
        return len(self.errors) == 0

    def to_dict(self) -> dict:
        return {
            "file": self.filename,
            "rows": self.row_count,
            "errors": len(self.errors),
            "warnings": len(self.warnings),
            "passed": self.passed,
            "error_details": self.errors,
            "warning_details": self.warnings,
        }


def validate_file(
    filename: str,
    schema: dict,
    component_slugs: set[str],
    pattern_slugs: set[str],
) -> ValidationResult:
    """Validate a single CSV file against its schema definition."""
    result = ValidationResult(filename)
    filepath = schema["path"]
    rows = load_csv(filepath)

    if not rows:
        result.error("File is empty or missing")
        return result

    result.row_count = len(rows)
    headers = set(rows[0].keys())

    # ------------------------------------------------------------------
    # 1. Required columns
    # ------------------------------------------------------------------
    for col in schema["required"]:
        if col not in headers:
            result.error(f"Missing required column '{col}'")

    # ------------------------------------------------------------------
    # 2. Empty rows (all values blank)
    # ------------------------------------------------------------------
    for i, row in enumerate(rows, start=2):  # row 1 = header
        if all(v.strip() == "" for v in row.values()):
            result.error(f"Row {i} is completely empty")

    # ------------------------------------------------------------------
    # 3. Duplicate IDs
    # ------------------------------------------------------------------
    for unique_col in schema.get("unique_cols", []):
        if unique_col not in headers:
            continue
        seen: dict[str, int] = {}
        for i, row in enumerate(rows, start=2):
            val = row.get(unique_col, "").strip()
            if not val:
                continue
            if val in seen:
                result.error(
                    f"Duplicate {unique_col} '{val}' "
                    f"(rows {seen[val]} and {i})"
                )
            else:
                seen[val] = i

    # ------------------------------------------------------------------
    # 4. Palette reference validation
    # ------------------------------------------------------------------
    palette_col = schema.get("palette_col")
    if palette_col and palette_col in headers:
        for i, row in enumerate(rows, start=2):
            palette = row.get(palette_col, "").strip()
            if palette and palette not in VALID_PALETTES:
                result.error(
                    f"Row {i} (id={row.get('id', '?')}): "
                    f"Invalid palette '{palette}' in column '{palette_col}'"
                )

    # ------------------------------------------------------------------
    # 5. Component slug cross-references
    # ------------------------------------------------------------------
    component_col = schema.get("component_col")
    if component_col and component_col in headers and component_slugs:
        for i, row in enumerate(rows, start=2):
            raw = row.get(component_col, "").strip()
            if not raw:
                continue
            for slug in raw.split(";"):
                slug = slug.strip()
                if slug and slug not in component_slugs:
                    result.error(
                        f"Row {i} (id={row.get('id', '?')}): "
                        f"Unknown component slug '{slug}' in '{component_col}'"
                    )

    # ------------------------------------------------------------------
    # 6. Pattern slug cross-references
    # ------------------------------------------------------------------
    pattern_col = schema.get("pattern_col")
    if pattern_col and pattern_col in headers and pattern_slugs:
        for i, row in enumerate(rows, start=2):
            raw = row.get(pattern_col, "").strip()
            if not raw:
                continue
            for slug in raw.split(";"):
                slug = slug.strip()
                if slug and slug not in pattern_slugs:
                    result.error(
                        f"Row {i} (id={row.get('id', '?')}): "
                        f"Unknown pattern slug '{slug}' in '{pattern_col}'"
                    )

    # ------------------------------------------------------------------
    # 7. Type-level validation for required columns
    # ------------------------------------------------------------------
    types = schema.get("types", {})
    for col, type_spec in types.items():
        if col not in headers:
            continue  # already reported as missing required
        for i, row in enumerate(rows, start=2):
            val = row.get(col, "").strip()
            if not val:
                continue  # blank cells are permissible

            if type_spec == "integer":
                if not is_integer(val):
                    result.error(
                        f"Row {i} (id={row.get('id', '?')}): "
                        f"Column '{col}' expected integer, got '{val}'"
                    )

            elif type_spec == "hex-color":
                if not is_hex_color(val):
                    result.error(
                        f"Row {i} (id={row.get('id', '?')}): "
                        f"Column '{col}' expected hex color, got '{val}'"
                    )

            elif type_spec == "palette-ref":
                pass  # already validated above in step 4

            elif type_spec == "slug":
                if not is_slug(val):
                    result.warning(
                        f"Row {i} (id={row.get('id', '?')}): "
                        f"Column '{col}' value '{val}' is not a clean slug"
                    )

            elif type_spec == "url":
                if not is_url(val) and val != "N/A":
                    result.warning(
                        f"Row {i} (id={row.get('id', '?')}): "
                        f"Column '{col}' value '{val}' does not look like a URL"
                    )

            elif type_spec.startswith("enum:"):
                valid_values = set(type_spec.split(":", 1)[1].split(","))
                if val not in valid_values:
                    result.error(
                        f"Row {i} (id={row.get('id', '?')}): "
                        f"Column '{col}' value '{val}' not in "
                        f"allowed values {sorted(valid_values)}"
                    )

    return result


# ---------------------------------------------------------------------------
# Cross-file validation: orphaned references
# ---------------------------------------------------------------------------

def check_orphaned_references(
    component_slugs: set[str],
    pattern_slugs: set[str],
    all_results: list[ValidationResult],
) -> ValidationResult:
    """Check for component/pattern slugs that are never referenced."""
    result = ValidationResult("cross-references")

    # Collect all referenced component slugs across files
    referenced_components: set[str] = set()
    referenced_patterns: set[str] = set()

    for filename, schema in SCHEMAS.items():
        filepath = schema["path"]
        rows = load_csv(filepath)
        headers = set(rows[0].keys()) if rows else set()

        component_col = schema.get("component_col")
        if component_col and component_col in headers:
            for row in rows:
                raw = row.get(component_col, "").strip()
                for slug in raw.split(";"):
                    slug = slug.strip()
                    if slug:
                        referenced_components.add(slug)

        pattern_col = schema.get("pattern_col")
        if pattern_col and pattern_col in headers:
            for row in rows:
                raw = row.get(pattern_col, "").strip()
                for slug in raw.split(";"):
                    slug = slug.strip()
                    if slug:
                        referenced_patterns.add(slug)

    # Components defined but never referenced
    orphan_components = component_slugs - referenced_components
    for slug in sorted(orphan_components):
        result.warning(f"Component slug '{slug}' is defined but never referenced")

    # Patterns defined but never referenced
    orphan_patterns = pattern_slugs - referenced_patterns
    for slug in sorted(orphan_patterns):
        result.warning(f"Pattern slug '{slug}' is defined but never referenced")

    result.row_count = 0
    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    json_mode = "--json" in sys.argv

    # Load reference data first
    component_rows = load_csv(DATA_DIR / "components.csv")
    component_slugs = {row["slug"] for row in component_rows if "slug" in row}

    pattern_rows = load_csv(DATA_DIR / "patterns.csv")
    pattern_slugs = {row["slug"] for row in pattern_rows if "slug" in row}

    all_results: list[ValidationResult] = []
    total_rows = 0
    total_errors = 0
    total_warnings = 0

    if not json_mode:
        print("Dataset Schema Validation")
        print("=" * 60)
        print()

    # Validate each file
    for filename, schema in SCHEMAS.items():
        res = validate_file(filename, schema, component_slugs, pattern_slugs)
        all_results.append(res)
        total_rows += res.row_count
        total_errors += len(res.errors)
        total_warnings += len(res.warnings)

        if not json_mode:
            status = "PASS" if res.passed else "FAIL"
            suffix = ""
            if res.errors:
                suffix += f", {len(res.errors)} error(s)"
            if res.warnings:
                suffix += f", {len(res.warnings)} warning(s)"
            print(f"  {status}: {filename} ({res.row_count} rows{suffix})")

    # Cross-file orphan checks
    if not json_mode:
        print()
        print("Cross-Reference Analysis")
        print("=" * 60)

    orphan_result = check_orphaned_references(
        component_slugs, pattern_slugs, all_results
    )
    all_results.append(orphan_result)
    total_warnings += len(orphan_result.warnings)

    if not json_mode:
        if orphan_result.warnings:
            print(f"  INFO: {len(orphan_result.warnings)} orphaned reference(s)")
            for w in orphan_result.warnings:
                print(f"    - {w}")
        else:
            print("  PASS: No orphaned references")

    # Summary
    if not json_mode:
        print()
        print("=" * 60)
        print(
            f"Total: {len(SCHEMAS)} files, {total_rows} rows, "
            f"{total_errors} error(s), {total_warnings} warning(s)"
        )
        print()

        if total_errors > 0:
            print(f"FAILED: {total_errors} error(s) found")
            print()
            for res in all_results:
                for err in res.errors:
                    print(f"  - {err}")
        else:
            print("PASSED: All datasets valid")

    # JSON output
    if json_mode:
        summary = {
            "passed": total_errors == 0,
            "total_files": len(SCHEMAS),
            "total_rows": total_rows,
            "total_errors": total_errors,
            "total_warnings": total_warnings,
            "valid_palettes": sorted(VALID_PALETTES),
            "files": [r.to_dict() for r in all_results],
        }
        print(json.dumps(summary, indent=2))

    return 0 if total_errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
