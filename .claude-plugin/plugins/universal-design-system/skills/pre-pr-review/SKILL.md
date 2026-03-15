---
name: Pre-PR Deep Review
description: Deep review and test all code changes before creating a PR. Catches TypeScript errors, lint regressions, SonarCloud code smells, test failures, and output correctness issues that would fail CI.
version: 0.4.0
triggers:
  - pre-pr review
  - deep review
  - review before pr
  - check before pr
  - validate changes
  - pr readiness
  - sonarcloud check
  - code quality check
---

# Pre-PR Deep Review — Claude Code Skill

Comprehensive review and testing of all staged/unstaged changes before creating a PR. This skill catches issues that would fail CI pipelines (SonarCloud quality gate, Biome lint, TypeScript compilation, Vitest, token build).

## Execution Steps

Run ALL steps below sequentially. Do not skip any step. Report every finding.

---

### Step 1: Inventory Changes

```bash
git diff --stat
git diff --name-only
```

Identify which subsystems are affected:
- **react** = any file under `packages/react/`
- **cli** = any file under `cli/`
- **mcp** = any file under `src/mcp/`
- **tokens** = any file under `packages/tokens/`
- **docs** = any file under `docs/`
- **scripts** = any file under `scripts/` or `src/scripts/`
- **data** = any file under `src/data/`

---

### Step 2: Diff Review (line-by-line)

For EACH changed file, run `git diff -- <file>` and review for:

#### 2a: SonarCloud Rule Violations (these WILL fail the quality gate)
- **Nested template literals** — template literal inside another template literal. Extract inner to variable.
- **Array index as React key** — `key={index}` or `key={i}`. Must use stable data-derived key.
- **`.replace()` with global regex** — `.replace(/pattern/g, ...)` should be `.replaceAll(/pattern/g, ...)`.
- **Missing optional chaining** — `obj && obj.prop` should be `obj?.prop`.
- **`[arr.length - 1]`** — should use `.at(-1)`.
- **Deprecated APIs** — check against the project's actual TypeScript types version, NOT latest. For this project: React 18 types (`@types/react@18.x`), so `MutableRefObject` is NOT deprecated and `RefObject.current` IS readonly.
- **Cognitive complexity** — functions with deeply nested if/else/for. Keep under 15.
- **Duplicate string literals** — same string 3+ times should be a constant.
- **Unused imports/variables** — dead code.

#### 2b: React-Specific Issues
- **ARIA attributes**: `aria-expanded` should use boolean `{value}` not string `"true"`.
- **`aria-controls`/`aria-labelledby`** must reference an existing element `id`.
- **`role="presentation"`** on elements that don't need semantic suppression — remove it.
- **`tabIndex` on ARIA roles**: elements with interactive ARIA roles (`combobox`, `option`, `tab`) must have `tabIndex`. But `tablist` with `tabIndex={0}` creates an extra tab stop — verify this is intentional.
- **biome-ignore comments**: verify the suppressed rule actually fires. Run `npx biome check <file>` without the suppression to confirm. Remove unused suppression comments — they cause Biome warnings.

#### 2c: Build Output Issues
- **`[object Object]`** in generated files — typically from using an object where a string was expected (e.g., template literal interpolation of an object).
- **Missing `export` keywords** in ESM output.
- **Incorrect `.cjs`/`.esm` property access** when a function returns `{ cjs, esm }`.

#### 2d: Type Safety
- **`as` casts to wrong type** — e.g., casting to `RefObject` when `MutableRefObject` is needed (React 18).
- **`.at()` return type** — `.at(-1)` returns `T | undefined`, verify downstream code handles `undefined`.
- **`JSON.stringify()` on renderable values** — verify it's only used for actual objects, not primitives.

---

### Step 3: TypeScript Compilation

Run type-checks for ALL affected subsystems. Every one must pass with zero errors.

```bash
# React package (if packages/react/ changed)
cd packages/react && npx tsc --noEmit

# CLI (if cli/ changed)
cd cli && npx tsc --noEmit

# Root (if root-level TS files changed)
npx tsc --noEmit
```

If any errors, fix immediately. Common traps:
- `React.RefObject.current` is `readonly` in React 18 types
- `.at()` returns `T | undefined` which may not match expected type
- `replaceAll` requires the `/g` flag when called with a RegExp

---

### Step 4: Lint Comparison (before vs. after)

Compare lint error/warning counts before and after changes to verify no regressions.

```bash
# Baseline (stash changes, run lint, pop)
git stash
npm run lint 2>&1 | grep "Found"
git stash pop

# Current
npm run lint 2>&1 | grep "Found"
```

**Pass criteria:**
- Error count must NOT increase (new errors = blocker)
- Warning count should decrease or stay the same
- If warnings increased, investigate — likely unused biome-ignore suppression comments

If lint warnings increased, run `npx biome check <file> 2>&1 | grep "unused"` on each changed file to find unused suppression comments and remove them.

---

### Step 5: Test Suite

Run ALL relevant test suites. Every one must pass with zero failures.

```bash
# React components (if packages/react/ changed)
npm run test:react

# React coverage (checks coverage thresholds)
npm run test:react:coverage

# Primitives (if tokens/scripts changed)
npm run test:primitives

# Contract tests (if data/ or scripts/ changed)
npm run test:contracts
```

If tests fail, check:
- Was a React key change made that altered component identity (causing remount)?
- Was a render output changed (e.g., `typeof page === 'string'` vs `page === '...'`)?
- Was an ARIA attribute added/removed that test snapshots check?

---

### Step 6: Build Verification

If `packages/tokens/build.js` was changed:

```bash
node packages/tokens/build.js
```

Then verify output correctness:
```bash
# No [object Object] in output
grep -c "object Object" packages/tokens/dist/index.js packages/tokens/dist/index.mjs

# CJS has module.exports
grep "module.exports" packages/tokens/dist/index.js

# ESM has export keywords
grep "^export " packages/tokens/dist/index.mjs | head -5

# TypeScript declarations valid
grep "export declare" packages/tokens/dist/index.d.ts | head -5
grep "export type\|export interface" packages/tokens/dist/tokens.d.ts | head -5
```

If docs/ changed, run the full validation suite:
```bash
npm run check
```

---

### Step 7: SonarCloud-Specific Checks

SonarCloud uses its own analyzer, not Biome. Verify these patterns that Biome misses but SonarCloud catches:

```bash
# Nested template literals (SonarCloud rule: typescript:S3003)
# Search for backtick inside backtick in changed files
git diff --name-only | xargs grep -n '`.*\${.*`.*`' 2>/dev/null

# Sequential .push() calls (SonarCloud: refactoring suggestion)
git diff -U0 | grep -A2 '^\+.*\.push(' | head -30

# console.log left in production code (not test files)
git diff --name-only | grep -v test | xargs grep -n 'console\.\(log\|debug\|info\)' 2>/dev/null
```

---

### Step 8: Final Report

Output a structured report:

```
## Pre-PR Review Results

### Changes
- X files changed across Y subsystems

### TypeScript
- [ ] packages/react: PASS/FAIL
- [ ] cli: PASS/FAIL
- [ ] root: PASS/FAIL (or N/A)

### Lint
- Before: X errors, Y warnings
- After: X errors, Y warnings
- Delta: +/- errors, +/- warnings

### Tests
- [ ] test:react: X/X passed
- [ ] test:coverage: PASS/FAIL
- [ ] test:primitives: PASS/FAIL (or N/A)
- [ ] test:contracts: PASS/FAIL (or N/A)

### Build
- [ ] tokens build: PASS/FAIL (or N/A)
- [ ] npm run check: PASS/FAIL (or N/A)

### Issues Found
1. [BLOCKER/WARNING] description...
2. ...

### Verdict
READY / NOT READY for PR
```

---

## Important Notes

- **Never skip the lint comparison step** — this is where most regressions hide (unused biome-ignore comments, new warnings from changed code patterns).
- **Always type-check with the project's actual types**, not assumptions about latest React/TS versions. Check `node_modules/@types/react/package.json` for the version.
- **SonarCloud and Biome have different rule sets** — code can pass Biome lint but fail SonarCloud. The manual diff review (Step 2) catches SonarCloud-specific issues.
- **Token build output must be verified** — template literal bugs often produce syntactically valid but semantically wrong JavaScript (e.g., `[object Object]` as a string value).
- **Fix issues before reporting** — this skill should both find AND fix problems, not just report them. After fixing, re-run the affected checks.
