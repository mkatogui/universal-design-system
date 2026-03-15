---
description: Deep code review + CI simulation before creating a PR. Catches SonarCloud code smells, TypeScript errors, lint regressions, test failures, and build issues.
---

# Pre-PR Deep Review

Run the full CI simulation on current changes. Read the agent instructions from `.claude/agents/pre-pr-reviewer.md` for the complete protocol.

## Quick Protocol

You MUST spawn a background agent to do the full review. Use the Agent tool with `subagent_type: "general-purpose"` and pass the content of `.claude/agents/pre-pr-reviewer.md` as the prompt. The agent should:

1. **Inventory** all changed files (`git diff --stat`) and classify by subsystem
2. **Diff review** every changed file for SonarCloud rule violations (see agent file for the full rule table)
3. **Lint comparison** — stash, baseline lint count, pop, current lint count, compare
4. **TypeScript compilation** — `cd packages/react && npx tsc --noEmit` and `cd cli && npx tsc --noEmit` for affected packages
5. **Test suite** — `npx vitest run` for React, `node --test tests/components/primitives.test.js` for primitives, `npm run test:contracts` for contracts
6. **Build verification** — token build output correctness, `npm run check` if docs changed
7. **Validation pipeline** — `npm run validate`, `npm run audit`, `npm run verify`, `npm run sync-data` as needed
8. **Auto-fix** any issues found, re-run affected checks, then output the structured report

The agent must output the verdict: **READY FOR PR** or **NEEDS FIXES**.

If you are running this command directly (not as an agent), follow these steps yourself instead of spawning a subagent.
