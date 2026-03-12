#!/usr/bin/env python3
"""
CSV Data Validation & Sync Script
Validates cross-file integrity across all 13 CSV databases:
- All palette references match valid palette names
- All component references match components.csv
- All pattern references match patterns.csv
- No duplicate IDs within files
- Required columns present in each file

Usage:
    python src/data/_sync_all.py
"""

import csv
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent

# Dynamic palette registry
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))
try:
    from registry import get_all_palettes
    VALID_PALETTES = get_all_palettes()
except ImportError:
    VALID_PALETTES = [
        "minimal-saas",
        "ai-futuristic",
        "gradient-startup",
        "corporate",
        "apple-minimal",
        "illustration",
        "dashboard",
        "bold-lifestyle",
        "minimal-corporate",
    ]

FILE_SCHEMAS = {
    "products.csv": {
        "required": ["id", "name", "sector", "palette", "key_components", "key_patterns"],
        "palette_col": "palette",
        "component_col": "key_components",
        "pattern_col": "key_patterns",
    },
    "styles.csv": {
        "required": ["id", "name", "category", "palette"],
        "palette_col": "palette",
    },
    "colors.csv": {
        "required": ["id", "name", "industry", "primary", "palette_match"],
        "palette_col": "palette_match",
    },
    "typography.csv": {
        "required": ["id", "heading_font", "body_font", "palette_match"],
        "palette_col": "palette_match",
    },
    "ui-reasoning.csv": {
        "required": ["id", "condition", "field", "operator", "value"],
    },
    "ux-guidelines.csv": {
        "required": ["id", "category", "guideline", "priority"],
    },
    "components.csv": {
        "required": ["id", "name", "slug", "category", "variants"],
    },
    "patterns.csv": {
        "required": ["id", "name", "slug", "category"],
    },
    "landing.csv": {
        "required": ["id", "name", "category", "palette_match"],
        "palette_col": "palette_match",
    },
    "charts.csv": {
        "required": ["id", "name", "type", "best_for"],
    },
    "icons.csv": {
        "required": ["id", "name", "library", "license"],
    },
    "anti-patterns.csv": {
        "required": ["id", "sector", "anti_pattern", "severity"],
    },
    "google-fonts.csv": {
        "required": ["id", "name", "category", "weights"],
    },
}


def load_csv(filename: str) -> list[dict]:
    """Load a CSV file and return list of row dicts."""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        return []
    with open(filepath, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def validate_file(filename: str, schema: dict, components: set, patterns: set) -> list[str]:
    """Validate a single CSV file against its schema."""
    errors = []
    rows = load_csv(filename)

    if not rows:
        errors.append(f"{filename}: File is empty or missing")
        return errors

    # Check required columns
    headers = set(rows[0].keys())
    for col in schema["required"]:
        if col not in headers:
            errors.append(f"{filename}: Missing required column '{col}'")

    # Check for duplicate IDs
    ids = [row.get("id", "") for row in rows]
    seen = set()
    for row_id in ids:
        if row_id in seen:
            errors.append(f"{filename}: Duplicate ID '{row_id}'")
        seen.add(row_id)

    # Validate palette references
    palette_col = schema.get("palette_col")
    if palette_col and palette_col in headers:
        for row in rows:
            palette = row.get(palette_col, "").strip()
            if palette and palette not in VALID_PALETTES:
                errors.append(
                    f"{filename} row {row.get('id', '?')}: "
                    f"Invalid palette '{palette}'"
                )

    # Validate component references
    component_col = schema.get("component_col")
    if component_col and component_col in headers and components:
        for row in rows:
            refs = row.get(component_col, "").split(";")
            for ref in refs:
                ref = ref.strip()
                if ref and ref not in components:
                    errors.append(
                        f"{filename} row {row.get('id', '?')}: "
                        f"Unknown component '{ref}'"
                    )

    # Validate pattern references
    pattern_col = schema.get("pattern_col")
    if pattern_col and pattern_col in headers and patterns:
        for row in rows:
            refs = row.get(pattern_col, "").split(";")
            for ref in refs:
                ref = ref.strip()
                if ref and ref not in patterns:
                    errors.append(
                        f"{filename} row {row.get('id', '?')}: "
                        f"Unknown pattern '{ref}'"
                    )

    return errors


COMPOUND_KNOWN_FIELDS = {
    "sector", "product_type", "audience", "preference",
    "data_type", "form_density", "loading_strategy",
    "data_volume", "content_type", "theme_mode",
}


def validate_compound_conditions() -> list[str]:
    """Validate compound_condition syntax in ui-reasoning.csv.

    Each sub-expression must be ``field=value`` where *field* is one of the
    known domain fields.  Operators are `` AND `` and `` OR ``.
    """
    errors = []
    rows = load_csv("ui-reasoning.csv")
    for row in rows:
        compound = row.get("compound_condition", "").strip()
        if not compound:
            continue
        row_id = row.get("id", "?")
        # Split on OR first, then AND within each group
        or_groups = compound.split(" OR ")
        for group in or_groups:
            and_parts = group.split(" AND ")
            for part in and_parts:
                part = part.strip()
                if "=" not in part:
                    errors.append(
                        f"ui-reasoning.csv row {row_id}: "
                        f"compound_condition sub-expression '{part}' missing '='"
                    )
                    continue
                field, value = part.split("=", 1)
                field = field.strip()
                value = value.strip()
                if not field:
                    errors.append(
                        f"ui-reasoning.csv row {row_id}: "
                        f"compound_condition has empty field in '{part}'"
                    )
                if not value:
                    errors.append(
                        f"ui-reasoning.csv row {row_id}: "
                        f"compound_condition has empty value in '{part}'"
                    )
                if field not in COMPOUND_KNOWN_FIELDS:
                    errors.append(
                        f"ui-reasoning.csv row {row_id}: "
                        f"compound_condition uses unknown field '{field}'"
                    )
    return errors


def validate_taxonomy() -> list[str]:
    """Check that all sector values in CSV rules exist in DomainDetector."""
    errors = []
    # Import the authoritative sector list from core.py
    scripts_dir = DATA_DIR.parent / "scripts"
    sys.path.insert(0, str(scripts_dir))
    try:
        from core import SECTOR_KEYWORDS
    except ImportError:
        errors.append("taxonomy: Cannot import SECTOR_KEYWORDS from core.py")
        return errors

    valid_sectors = set(SECTOR_KEYWORDS.keys())

    # Check ui-reasoning.csv (single-field rules only; compound conditions
    # reference sectors via their own sub-expressions validated separately)
    reasoning_rows = load_csv("ui-reasoning.csv")
    reasoning_sectors = set()
    for row in reasoning_rows:
        if row.get("field", "").strip() == "sector":
            val = row.get("value", "").strip()
            if val:
                reasoning_sectors.add(val)

    orphan_reasoning = reasoning_sectors - valid_sectors
    for s in sorted(orphan_reasoning):
        errors.append(f"taxonomy: ui-reasoning.csv uses sector '{s}' not in DomainDetector")

    # Check anti-patterns.csv
    ap_rows = load_csv("anti-patterns.csv")
    ap_sectors = set()
    for row in ap_rows:
        val = row.get("sector", "").strip()
        if val:
            ap_sectors.add(val)

    orphan_ap = ap_sectors - valid_sectors
    for s in sorted(orphan_ap):
        errors.append(f"taxonomy: anti-patterns.csv uses sector '{s}' not in DomainDetector")

    return errors


def main():
    print("CSV Data Validation")
    print("=" * 50)

    # Load reference data first
    component_rows = load_csv("components.csv")
    component_slugs = {row["slug"] for row in component_rows if "slug" in row}

    pattern_rows = load_csv("patterns.csv")
    pattern_slugs = {row["slug"] for row in pattern_rows if "slug" in row}

    all_errors = []
    total_rows = 0

    for filename, schema in FILE_SCHEMAS.items():
        rows = load_csv(filename)
        row_count = len(rows)
        total_rows += row_count

        errors = validate_file(filename, schema, component_slugs, pattern_slugs)

        if errors:
            print(f"  FAIL: {filename} ({row_count} rows, {len(errors)} errors)")
            all_errors.extend(errors)
        else:
            print(f"  PASS: {filename} ({row_count} rows)")

    # Taxonomy validation
    print()
    print("Taxonomy Validation")
    print("=" * 50)
    taxonomy_errors = validate_taxonomy()
    if taxonomy_errors:
        print(f"  FAIL: {len(taxonomy_errors)} orphan sector(s)")
        all_errors.extend(taxonomy_errors)
    else:
        print("  PASS: All CSV sectors exist in DomainDetector")

    # Compound condition validation
    print()
    print("Compound Condition Validation")
    print("=" * 50)
    compound_errors = validate_compound_conditions()
    if compound_errors:
        print(f"  FAIL: {len(compound_errors)} compound condition error(s)")
        all_errors.extend(compound_errors)
    else:
        print("  PASS: All compound conditions have valid syntax")

    print()
    print(f"Total: {len(FILE_SCHEMAS)} files, {total_rows} rows")
    print()

    if all_errors:
        print(f"FAILED: {len(all_errors)} error(s)")
        for err in all_errors:
            print(f"  - {err}")
        return 1
    else:
        print("PASSED: All CSV cross-references valid")
        return 0


if __name__ == "__main__":
    sys.exit(main())
