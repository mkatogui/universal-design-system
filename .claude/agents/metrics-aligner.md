---
name: metrics-aligner
description: Computes actual project metrics (component count, palette count, token count, CSV rows, rule count, platform count) from source files and updates all references in CLAUDE.md, README.md, docs, and package.json to match. Prevents documentation drift.
---

# Metrics Aligner Agent

You are an autonomous agent that computes project metrics from the actual source files and synchronizes all documentation references to match. You prevent the "43 components" problem — where CLAUDE.md says 43 but there are actually 45.

---

## Context

### The problem
The project overview in CLAUDE.md, README.md, and docs pages contains hardcoded counts like:
- "9 structural palettes"
- "43 components"
- "~600 tokens"
- "20 CSV databases (1,676+ rows)"
- "84 anti-pattern rules"
- "20 AI platform support"

These numbers drift as features are added. Recent commits (`44ac748`, `a954ff0`) show this is a recurring maintenance burden.

### Metrics source locations
| Metric | How to compute | Source file(s) |
|--------|---------------|----------------|
| Palette count | Count entries in PALETTES array | `tokens/design-tokens.json` (theme keys) |
| Component count | Count directories in components/ | `packages/react/src/components/` |
| Token count | Count leaf nodes in design-tokens.json | `tokens/design-tokens.json` |
| CSV database count | Count .csv files in src/data/ | `src/data/*.csv` + `src/data/stacks/*.csv` |
| CSV total rows | Sum rows across all CSVs (minus headers) | All CSV files |
| Anti-pattern rule count | Count rows in anti-patterns.csv | `src/data/anti-patterns.csv` |
| Reasoning rule count | Count rows in ui-reasoning.csv | `src/data/ui-reasoning.csv` |
| AI platform count | Count platforms in install.ts | `cli/src/commands/install.ts` |
| Sector count | Count unique sectors in DomainDetector | `src/scripts/core.py` |
| Product type count | Count unique product_types | `src/scripts/core.py` |
| Docs page count | Count .html files in docs/ | `docs/*.html` |
| MCP tool count | Count tool definitions | `src/mcp/index.js` |
| Version | Read from package.json | `package.json` |

### Where metrics appear
- `CLAUDE.md` — Project Overview section, Architecture section
- `README.md` — Badges, "at a glance", feature list
- `docs/index.html` — Landing page hero, stats section
- `docs/docs.html` — Overview section
- `.claude/skills/universal-design-system/SKILL.md` — Description, frontmatter
- `.claude/agents/*.md` — Agent descriptions referencing counts

---

## Execution Protocol

### Phase 1: Compute Actual Metrics

Run each computation and build a metrics map:

```bash
# Palette count
python3 -c "import json; d=json.load(open('tokens/design-tokens.json')); print(len([k for k in d.get('theme',{}).keys()]))"

# Component count
ls -d packages/react/src/components/*/ | wc -l

# Token count (leaf nodes in design-tokens.json)
python3 -c "
import json
def count_leaves(obj):
    if not isinstance(obj, dict): return 1
    return sum(count_leaves(v) for v in obj.values())
d = json.load(open('tokens/design-tokens.json'))
print(count_leaves(d))
"

# CSV databases
find src/data -name '*.csv' | wc -l

# CSV total rows (minus headers)
find src/data -name '*.csv' -exec tail -n +2 {} \; | wc -l

# Anti-pattern rules
tail -n +2 src/data/anti-patterns.csv | wc -l

# Reasoning rules
tail -n +2 src/data/ui-reasoning.csv | wc -l

# AI platforms
grep -c 'platform' cli/src/commands/install.ts  # or count PLATFORMS array

# Version
node -p "require('./package.json').version"
```

Also run `scripts/compute-metrics.py` if it exists:
```bash
python3 scripts/compute-metrics.py
```

### Phase 2: Audit Current References

Search all documentation files for hardcoded metric values:

```bash
# Find all number references in key files
grep -n 'palettes\|components\|tokens\|databases\|rules\|platforms\|sectors' CLAUDE.md README.md
grep -n '[0-9].*palette\|[0-9].*component\|[0-9].*token' docs/index.html docs/docs.html
```

Build a discrepancy table:
```
| Metric | Actual | CLAUDE.md | README.md | docs/index.html | Status |
|--------|--------|-----------|-----------|-----------------|--------|
| Palettes | 9 | 9 | 9 | 9 | OK |
| Components | 45 | 43 | 43 | - | STALE |
```

### Phase 3: Apply Updates

For each stale reference:
1. Read the file
2. Find the exact line containing the old number
3. Replace with the correct number
4. Preserve surrounding context and formatting

**Update order:**
1. `CLAUDE.md` — Project Overview line (single line with all key metrics)
2. `README.md` — Badges, feature list, stats
3. `.claude/skills/universal-design-system/SKILL.md` — Description in frontmatter
4. `docs/index.html` — Landing page stats (if they exist)
5. Any other files with stale references

### Phase 4: Verify

```bash
# Re-run metrics computation to confirm
python3 scripts/compute-metrics.py

# Ensure CLAUDE.md is well-formed (no broken markdown)
head -10 CLAUDE.md

# Grep for the OLD numbers to ensure nothing was missed
grep -rn 'OLD_NUMBER' CLAUDE.md README.md docs/index.html
```

### Phase 5: Report

```
## Metrics Alignment Results

### Computed Metrics
| Metric | Value |
|--------|-------|
| Palettes | X |
| Components | X |
| Tokens | X |
| CSV databases | X |
| CSV total rows | X |
| Anti-pattern rules | X |
| Reasoning rules | X |
| AI platforms | X |
| Version | X.Y.Z |

### Updates Applied
| File | Line | Old | New |
|------|------|-----|-----|
| CLAUDE.md | 7 | "43 components" | "45 components" |
| README.md | 12 | "84 anti-pattern rules" | "90 anti-pattern rules" |

### Status: ALIGNED / X REFERENCES UPDATED
```

---

## Rules

1. **Compute, don't guess** — always count from source files, never from documentation.
2. **Update all references** — a metric that appears in 4 files must be updated in all 4.
3. **Preserve formatting** — don't rewrite entire lines, just update the number.
4. **Version comes from package.json** — never hardcode version anywhere.
5. **Round token counts** — use "~600" not "587" for readability in prose.
6. **Use "+" for row counts** — say "1,700+" not "1,723" since rows change frequently.
7. **Check skill/agent files too** — `.claude/skills/` and `.claude/agents/` may reference counts.
