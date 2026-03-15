"""RTL/logical property mapper — converts physical CSS to logical equivalents."""
import csv
from pathlib import Path

_CSV_PATH = Path(__file__).parent.parent / "data" / "localization.csv"
_MAPPING = None


def _load():
    global _MAPPING
    if _MAPPING is None:
        _MAPPING = {}
        with open(_CSV_PATH) as f:
            for row in csv.DictReader(f):
                _MAPPING[row["physical_property"]] = row["logical_property"]
    return _MAPPING


def map_to_logical(physical_prop: str) -> str:
    """Convert a physical CSS property to its logical equivalent."""
    mapping = _load()
    return mapping.get(physical_prop, physical_prop)


def map_all(css_text: str) -> str:
    """Convert all physical properties in CSS text to logical equivalents."""
    mapping = _load()
    result = css_text
    for physical, logical in sorted(mapping.items(), key=lambda x: -len(x[0])):
        result = result.replace(physical, logical)
    return result


def get_direction_sensitive() -> list:
    """Return all direction-sensitive property mappings."""
    _load()
    with open(_CSV_PATH) as f:
        return [row for row in csv.DictReader(f) if row["direction_sensitive"] == "true"]
