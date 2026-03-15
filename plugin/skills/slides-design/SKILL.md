---
name: slides-design
description: >
  This skill should be used when the user asks to "design a presentation",
  "create slide templates", "pitch deck design", "slide layout", "presentation colors",
  "keynote design", "powerpoint design", "google slides design", "deck design",
  "presentation typography", or needs guidance on slide design systems, presentation
  palettes, slide templates, or data visualization colors for presentations.
metadata:
  version: "0.5.0"
  author: "Marcelo Katogui"
---

# Slides Design System

Generate consistent presentation design systems with slide templates, typography rules for large-screen readability, data visualization colors, and animation recommendations — all driven by Universal Design System palettes.

## Workflow

### Step 1: Determine Presentation Context

Classify the presentation:
- **Pitch Deck** — Startup fundraising, investor meeting
- **Product Demo** — Feature showcase, sales deck
- **Conference Talk** — Technical talk, keynote
- **Internal Report** — Team update, quarterly review
- **Educational** — Workshop, training, lecture
- **Marketing** — Brand presentation, case study

### Step 2: Select Palette

| Context | Palette | Reasoning |
|---------|---------|-----------|
| Startup Pitch | `gradient-startup` | Energy, bold, memorable |
| Enterprise Sales | `corporate` | Trust, professionalism |
| Tech/AI Demo | `ai-futuristic` | Innovation, cutting-edge |
| Education | `illustration` | Friendly, approachable |
| Brand/Luxury | `apple-minimal` | Premium, refined |
| Analytics Report | `dashboard` | Data-focused, clean |
| Creative Agency | `bold-lifestyle` | Bold, impactful |
| Professional Services | `minimal-corporate` | Subtle, authoritative |

### Step 3: Generate 7 Core Slide Types

**1. Title Slide** — Logo, large headline (48-72pt), subtitle (24-28pt), date/presenter (16-18pt), palette primary or gradient background.

**2. Content Slide** — Section title (36-44pt, weight 700), body text (24-28pt, weight 400, max 6 bullets), max 40 words per slide, left-aligned with 10% margins.

**3. Comparison Slide** — Two-column with divider, column headers (28-32pt bold), items (20-24pt), brand-primary vs neutral.

**4. Data/Chart Slide** — Single chart (70% of slide area), chart title (28-32pt), axis labels (16-18pt), 8-color palette scale, source citation (14pt, bottom-right).

**5. Quote Slide** — Large quotation marks in brand-accent, quote (32-40pt italic), attribution (20-24pt right-aligned), generous whitespace.

**6. Section Divider** — Full-bleed brand-primary/gradient, section number (120pt, semi-transparent), title (48-60pt white/on-brand), optional subtitle (24pt).

**7. Closing/CTA Slide** — Clear CTA (36-44pt), contact/next steps (20-24pt), logo, optional social/QR.

### Step 4: Typography Rules

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Title | 48-72pt | 800 | 1.1 |
| Section Title | 36-44pt | 700 | 1.2 |
| Subtitle | 28-32pt | 600 | 1.3 |
| Body Text | 24-28pt | 400 | 1.5 |
| Caption | 16-18pt | 400 | 1.4 |
| Footnote | 14pt | 400 | 1.3 |

**Rules:**
- Never go below 18pt for any projected text
- Maximum 3 font sizes per slide
- One font family for headings, one for body
- Use font-weight contrast instead of size contrast where possible

### Step 5: Slide Dimensions & Safe Areas

| Format | Dimensions | Safe Margin |
|--------|-----------|-------------|
| 16:9 (standard) | 1920x1080px | 96px (5%) all sides |
| 4:3 (classic) | 1024x768px | 51px (5%) all sides |

### Animation Guidelines

| Transition | When to Use | Duration |
|-----------|-------------|----------|
| Fade | Default, between any slides | 300ms |
| Slide Left | Sequential content flow | 400ms |
| None | Data-heavy slides, formal | 0ms |
| Scale In | Emphasis reveals | 250ms |

**Rules:**
- One transition type per presentation
- Never use: spin, bounce, fly, zoom, flip
- Build animations: fade-in items one by one (60ms stagger)
- Charts: animate data points sequentially

## Example

### "Create a pitch deck design for an AI startup"

**Palette:** `gradient-startup` with `ai-futuristic` accents
**Typography:** Space Grotesk (headings) + Inter (body)
**Slides:** 10-12 slides for a seed pitch

1. Title — Company name + tagline + gradient background
2. Problem — Single stat or bold statement
3. Solution — Product screenshot + 3 bullet points
4. How It Works — 3-step visual flow
5. Market Size — TAM/SAM/SOM chart
6. Traction — Key metrics, growth chart
7. Business Model — Revenue streams diagram
8. Competition — 2x2 matrix
9. Team — Headshots + titles
10. The Ask — Funding amount + use of funds
11. Closing — Contact + CTA
