---
name: Design Audit
description: Audit existing UIs for WCAG accessibility, color contrast, typography hierarchy, spacing consistency, and industry anti-patterns. Generates scored reports with actionable fixes.
version: 0.4.0
triggers:
  - design audit
  - ui audit
  - accessibility audit
  - ux review
  - design review
  - design critique
  - ui review
  - design feedback
  - wcag audit
  - contrast check
  - design score
  - accessibility check
  - ui analysis
---

# Design Audit — Claude Code Skill

Audit existing UIs against Universal Design System standards. Evaluates WCAG accessibility, color contrast, typography, spacing, component patterns, and industry anti-patterns. Produces a scored report with actionable CSS fixes.

## How This Skill Works

### Step 1: Identify the Target
Accept input as:
- A URL to screenshot/analyze
- A description of the current UI
- A code file (HTML/CSS/JSX) to evaluate
- A screenshot to visually inspect

### Step 2: Detect Industry Context
Use `src/scripts/core.py: DomainDetector` to classify the product's sector and type, then load relevant anti-patterns from `src/data/anti-patterns.csv`.

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
| Typography | 6/10 | 4 issues found |
| ... | ... | ... |

## Critical Issues (Fix Immediately)
1. [Issue]: [Description]
   Fix: [CSS snippet]

## Quick Wins (< 1 hour each)
1. [Issue]: [Fix]

## Long-term Improvements
1. [Issue]: [Recommendation]

## Anti-Patterns Detected
- [CRITICAL] [anti-pattern name]: [description]
  Alternative: [from anti-patterns.csv]
```

### Step 5: Provide CSS Fixes

All fixes use Universal Design System tokens:

```css
/* Fix: Low contrast text */
.problematic-text {
  color: var(--color-text-primary);  /* was: #999 → now: #111118 */
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

## WCAG Quick Reference

| Criterion | Requirement | How to Test |
|-----------|-------------|-------------|
| 1.4.3 Contrast | 4.5:1 normal text, 3:1 large | Color contrast checker |
| 2.1.1 Keyboard | All functionality via keyboard | Tab through entire page |
| 2.4.7 Focus Visible | Visible focus indicator | Tab and check visual ring |
| 2.5.5 Target Size | 44x44px touch targets | Inspect element dimensions |
| 1.1.1 Non-text | Alt text on images | Check all img elements |

---

*Powered by Universal Design System v0.4.0*
