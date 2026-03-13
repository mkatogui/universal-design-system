#!/usr/bin/env python3
"""Token coverage scanner — detects hardcoded values that should use design tokens."""

import re
import sys
import json
from pathlib import Path

# Patterns that indicate hardcoded values (should be tokens)
HARDCODED_PATTERNS = {
    'color': re.compile(r'(?<!var\()#[0-9a-fA-F]{3,8}\b'),
    'rgb': re.compile(r'(?<!var\()rgba?\([^)]+\)'),
    'hsl': re.compile(r'(?<!var\()hsla?\([^)]+\)'),
    'px-spacing': re.compile(r'(?:margin|padding|gap):\s*\d+px'),
    'font-size-px': re.compile(r'font-size:\s*\d+px'),
    'font-family': re.compile(r'font-family:\s*(?!var\()["\']?[A-Z][a-z]'),
}

# Pattern for token usage
TOKEN_PATTERN = re.compile(r'var\(--[a-z][\w-]*\)')

def scan_file(filepath):
    """Scan a file and return coverage metrics."""
    content = Path(filepath).read_text()

    hardcoded = {}
    for category, pattern in HARDCODED_PATTERNS.items():
        matches = pattern.findall(content)
        if matches:
            hardcoded[category] = matches

    tokens_used = TOKEN_PATTERN.findall(content)

    total_values = sum(len(v) for v in hardcoded.values()) + len(tokens_used)
    token_count = len(tokens_used)
    coverage = (token_count / total_values * 100) if total_values > 0 else 100.0

    return {
        'file': str(filepath),
        'token_usage_count': token_count,
        'hardcoded_count': sum(len(v) for v in hardcoded.values()),
        'coverage_percent': round(coverage, 1),
        'hardcoded_details': {k: len(v) for k, v in hardcoded.items()},
        'unique_tokens': sorted(set(tokens_used))
    }

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/token-coverage.py <file_or_directory> [--json]")
        sys.exit(1)

    target = Path(sys.argv[1])
    as_json = '--json' in sys.argv

    files = []
    if target.is_file():
        files = [target]
    elif target.is_dir():
        files = sorted(target.glob('**/*.html')) + sorted(target.glob('**/*.css'))

    results = [scan_file(f) for f in files]

    if as_json:
        print(json.dumps(results, indent=2))
    else:
        for r in results:
            status = 'PASS' if r['coverage_percent'] >= 80 else 'WARN'
            print(f"[{status}] {r['file']}: {r['coverage_percent']}% token coverage "
                  f"({r['token_usage_count']} tokens, {r['hardcoded_count']} hardcoded)")
            if r['hardcoded_details']:
                for cat, count in r['hardcoded_details'].items():
                    print(f"       {cat}: {count} hardcoded values")

if __name__ == '__main__':
    main()
