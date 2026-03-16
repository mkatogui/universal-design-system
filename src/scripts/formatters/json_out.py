"""JSON output formatter."""

from typing import Optional

from checklist import get_pre_delivery_checklist


def build_json_output(
    result: dict,
    palette_tokens: dict,
    palette_display_name: str,
    palette_source: str = "default",
    palette_rule_id: Optional[str] = None,
) -> dict:
    """Build the full JSON output dict for --format json."""
    return {
        "query": result["query"],
        "palette": result["recommended_palette"],
        "palette_display": palette_display_name,
        "palette_source": palette_source,
        "palette_rule_id": palette_rule_id,
        "domain": result["domain"],
        "tokens": palette_tokens,
        "components": [
            {"name": c.get("name"), "score": c.get("_score"), "source": c.get("_source")}
            for c in result["search_results"]["components"]
        ],
        "patterns": [
            {"name": p.get("name"), "score": p.get("_score"), "source": p.get("_source")}
            for p in result["search_results"]["patterns"]
        ],
        "products": [
            {"name": p.get("name"), "palette": p.get("palette"), "score": p.get("_score")}
            for p in result["search_results"]["products"]
        ],
        "typography": [
            {"heading": t.get("heading_font"), "body": t.get("body_font"), "score": t.get("_score")}
            for t in result["search_results"]["typography"]
        ],
        "anti_patterns": result["anti_patterns"],
        "rules": result["rules_applied"],
        "pre_delivery_checklist": get_pre_delivery_checklist(),
    }
