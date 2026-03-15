---
name: Slides Design System
description: Generate presentation design systems with consistent slide templates, typography rules, and color schemes mapped to Universal Design System palettes.
version: 0.4.0
triggers:
  - presentation design
  - slide design
  - slide deck
  - pitch deck
  - keynote
  - powerpoint
  - google slides
  - slide template
  - presentation template
  - deck design
  - presentation palette
  - slide layout
---

# Slides Design System — Claude Code Skill

Generate consistent presentation design systems with slide templates, typography rules for large-screen readability, data visualization colors, and animation recommendations — all driven by Universal Design System palettes.

## How This Skill Works

### Step 1: Determine Presentation Context
Classify the presentation:
- **Pitch Deck** — Startup fundraising, investor meeting
- **Product Demo** — Feature showcase, sales deck
- **Conference Talk** — Technical talk, keynote
- **Internal Report** — Team update, quarterly review
- **Educational** — Workshop, training, lecture
- **Marketing** — Brand presentation, case study

### Step 2: Select Palette
Map context to Universal Design System palette:

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

### Step 3: Generate Slide Templates

#### 7 Core Slide Types

**1. Title Slide**
- Company logo (top-left or centered)
- Large headline: `--text-display-xl` equivalent (48-72pt)
- Subtitle: `--text-body-lg` equivalent (24-28pt)
- Date/presenter name: `--text-body-sm` equivalent (16-18pt)
- Background: palette primary or gradient

**2. Content Slide**
- Section title: 36-44pt, font-weight 700
- Body text: 24-28pt, font-weight 400, max 6 bullet points
- Rule: Maximum 40 words per slide
- Left-align text, generous margins (10% of slide width)

**3. Comparison Slide**
- Two-column layout with divider
- Column headers: 28-32pt bold
- Comparison items: 20-24pt
- Use brand-primary vs neutral for contrast

**4. Data/Chart Slide**
- Single chart per slide, large (70% of slide area)
- Chart title: 28-32pt
- Axis labels: 16-18pt
- Use palette chart colors (8-color distinguishable scale)
- Source citation: 14pt, bottom-right

**5. Quote Slide**
- Large quotation marks in brand-accent color
- Quote text: 32-40pt italic
- Attribution: 20-24pt, right-aligned
- Minimal background, generous whitespace

**6. Section Divider**
- Full-bleed background color (brand-primary or gradient)
- Section number: 120pt, semi-transparent
- Section title: 48-60pt, white or on-brand text
- Optional subtitle: 24pt

**7. Closing/CTA Slide**
- Clear call-to-action: 36-44pt
- Contact info or next steps: 20-24pt
- Company logo
- Social links/QR code (optional)

### Step 4: Typography Rules for Slides

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
- One font family for headings, one for body (from typography.csv pairings)
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

## Example Output

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

---

*Powered by Universal Design System v0.4.0*
