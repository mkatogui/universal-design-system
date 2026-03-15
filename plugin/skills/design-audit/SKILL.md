---
name: design-audit
description: >
  This skill should be used when the user asks to "audit my UI", "review this design",
  "check accessibility", "critique this mockup", "score my website", "check contrast",
  "wcag audit", "design feedback", "ux review", "is this accessible?", or needs a
  structured evaluation of an existing UI for WCAG compliance, color contrast, typography
  hierarchy, spacing consistency, and industry anti-patterns.
metadata:
  version: "0.4.2"
  author: "Marcelo Katogui"
---

# Design Audit

Audit existing UIs against Universal Design System standards. Evaluate WCAG accessibility, color contrast, typography, spacing, component patterns, and industry anti-patterns. Produce a scored report with actionable CSS fixes.

## Workflow

### Step 1: Identify the Target

Accept input as:
- A URL to screenshot/analyze
- A description of the current UI
- A code file (HTML/CSS/JSX) to evaluate
- A screenshot to visually inspect

### Step 2: Detect Industry Context

Classify the product's sector and type, then load relevant anti-patterns for that industry (finance: no playful animations; healthcare: no aggressive reds; education/kids: no small text; luxury: no busy layouts; government: target WCAG AAA).

### Step 3: Evaluate 10 Categories

Score each category 1-10:

| # | Category | Weight | What to Check |
|---|----------|--------|---------------|
| 1 | **Color Contrast** | 10 | WCAG AA (4.5:1 text, 3:1 UI), color independence |
| 2 | **Typography** | 9 | Hierarchy (h1>h2>h3), size scale, line height, font pairing |
| 3 | **Spacing** | 8 | Consistent scale, adequate padding, breathing room |
| 4 | **Component Quality** | 8 | States (hover/focus/disabled), accessibility labels |
| 5 | **Navigation** | 7 | Clarity, depth, mobile adaptation, breadcrumbs |
| 6 | **Responsiveness** | 8 | Mobile layout, touch targets (44px), breakpoints |
| 7 | **Accessibility** | 10 | Keyboard nav, screen reader, focus indicators, alt text |
| 8 | **Visual Consistency** | 7 | Border radius, shadow, color usage consistency |
| 9 | **Performance** | 6 | Image sizes, font loading, critical CSS |
| 10 | **Anti-Pattern Check** | 8 | Industry-specific violations from anti-patterns database |

### Step 4: Generate Report

```
# Design Audit Report

**Overall Grade: B+ (78/100)**
**Industry: [sector] | Product: [type]**

## Category Scores
| Category | Score | Issues |
|----------|-------|--------|
| Color Contrast | 8/10 | 2 minor issues |
| ... | ... | ... |

## Critical Issues (Fix Immediately)
1. [Issue]: [Description]
   Fix: [CSS snippet using var() tokens]

## Quick Wins (< 1 hour each)
1. [Issue]: [Fix]

## Long-term Improvements
1. [Issue]: [Recommendation]

## Anti-Patterns Detected
- [CRITICAL] [anti-pattern name]: [description]
  Alternative: [recommendation]
```

### Step 5: Provide CSS Fixes

All fixes use Universal Design System tokens:

```css
/* Fix: Low contrast text */
.problematic-text {
  color: var(--color-text-primary);  /* was: #999 */
}

/* Fix: Missing focus indicator */
button:focus-visible {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
}

/* Fix: Touch target too small */
.small-button {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-3) var(--space-4);
}
```

## Grading Scale

| Grade | Score | Meaning |
|-------|-------|---------|
| A+ | 95-100 | Exceptional, production-ready |
| A | 90-94 | Excellent, minor polish needed |
| B+ | 85-89 | Good, some improvements needed |
| B | 80-84 | Solid, noticeable gaps |
| C+ | 70-79 | Fair, significant issues |
| C | 60-69 | Below average, major rework needed |
| D | 50-59 | Poor, fundamental problems |
| F | <50 | Failing, rebuild recommended |
