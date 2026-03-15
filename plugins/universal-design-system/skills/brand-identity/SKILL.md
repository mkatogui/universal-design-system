---
name: Brand Identity Generator
description: Generate complete brand identity systems with color psychology, typography pairings, and visual identity rules mapped to Universal Design System palettes.
version: 0.4.0
triggers:
  - brand identity
  - brand design
  - brand colors
  - brand guidelines
  - visual identity
  - brand book
  - style guide
  - logo usage
  - brand voice
  - color psychology
  - brand palette
  - brand typography
  - brand system
---

# Brand Identity Generator — Claude Code Skill

Generate complete brand identity systems with color psychology reasoning, typography pairings, logo guidelines, and visual identity rules — all mapped to Universal Design System's 9 structural palettes.

## How This Skill Works

### Step 1: Gather Brand Context
Ask for or infer:
- Company name and industry
- Brand values (e.g., trustworthy, innovative, friendly)
- Target audience (age, profession, tech-savviness)
- Competitors to differentiate from
- Existing brand colors (if any — to evolve, not replace)

### Step 2: Map to Palette
Use the industry → palette mapping from Universal Design System:

| Industry | Default Palette | Reasoning |
|----------|----------------|-----------|
| Finance/Banking | `corporate` | Trust, stability, professionalism |
| Healthcare | `minimal-saas` | Calm, clean, accessible |
| Education | `illustration` | Friendly, approachable, warm |
| Technology/AI | `ai-futuristic` | Innovation, cutting-edge |
| Startup | `gradient-startup` | Energy, boldness, momentum |
| Luxury | `apple-minimal` | Refinement, premium, exclusivity |
| Fashion | `bold-lifestyle` | Edge, drama, visual impact |
| Legal/Professional | `minimal-corporate` | Authority, tradition, sobriety |
| E-commerce | `minimal-saas` | Clean, product-focused |
| Kids/Children | `illustration` | Playful, rounded, warm |

### Step 3: Apply Color Psychology

| Color | Psychology | Best Industries |
|-------|-----------|----------------|
| Blue | Trust, stability, calm | Finance, healthcare, tech, corporate |
| Green | Growth, health, nature | Healthcare, wellness, sustainability |
| Purple | Creativity, luxury, wisdom | Luxury, creative, education |
| Red/Orange | Energy, urgency, passion | Food, entertainment, startup |
| Black | Sophistication, power | Luxury, fashion, tech |
| Warm neutrals | Warmth, approachability | Professional services, hospitality |
| Neon/Vibrant | Innovation, disruption | Crypto, gaming, AI/ML |

### Step 4: Generate Brand System

Output a complete brand identity including:

1. **Color Palette** — Primary, secondary, accent, neutrals as CSS custom properties
2. **Typography Pairing** — Heading + body font from the 75 pairings in `src/data/typography.csv`
3. **Logo Usage Rules** — Minimum size, clear space, color variants (full color, mono, reversed)
4. **Brand Voice** — Tone descriptors, writing style, vocabulary guidelines
5. **Visual Identity Rules** — Border radius, shadow style, animation style, photography direction

### Step 5: Output Format

```css
/* Brand: [Company Name] */
/* Palette: [palette-name] */
:root {
  --brand-primary: #HEXVAL;
  --brand-secondary: #HEXVAL;
  --brand-accent: #HEXVAL;
  --brand-dark: #HEXVAL;
  --brand-light: #HEXVAL;
  --brand-bg: #HEXVAL;
  --brand-text: #HEXVAL;
  --brand-radius: Xpx;
  --brand-shadow: ...;
  --brand-font-display: 'Font Name';
  --brand-font-body: 'Font Name';
}
```

## Examples

### "Create brand identity for a fintech startup"
- **Palette:** `corporate` with gradient accents from `gradient-startup`
- **Colors:** Navy primary (#1A365D), blue accent (#3B82F6), clean white backgrounds
- **Typography:** Manrope (headings) + Inter (body) — geometric-modern mood
- **Voice:** Professional yet approachable, data-driven, reassuring
- **Radius:** 4-8px (conservative), subtle shadows

### "Brand identity for a kids learning app"
- **Palette:** `illustration`
- **Colors:** Burnt orange primary (#E8590C), purple accent (#7048E8), warm cream backgrounds
- **Typography:** Nunito (headings) + Inter (body) — soft-approachable mood
- **Voice:** Fun, encouraging, simple language, age-appropriate
- **Radius:** 12-32px (heavily rounded), soft warm shadows

---

*Powered by Universal Design System v0.4.0*
