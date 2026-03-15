# Tokens & Motion Reference

## Foundation Tokens (Locked — Same Across All Palettes)

### Typography Scale

| Token | Mobile | Desktop | Line Height | Usage |
|-------|--------|---------|-------------|-------|
| `--text-display-xl` | 40px | 72px | 1.05 | Hero headline |
| `--text-display-lg` | 36px | 60px | 1.1 | Page headline |
| `--text-display-md` | 30px | 48px | 1.15 | Section headline |
| `--text-heading-lg` | 24px | 36px | 1.2 | Subsection |
| `--text-heading-md` | 20px | 28px | 1.3 | Card titles |
| `--text-heading-sm` | 18px | 22px | 1.3 | Minor headings |
| `--text-body-lg` | 18px | 20px | 1.6 | Lead paragraphs |
| `--text-body-md` | 16px | 16px | 1.6 | Default body |
| `--text-body-sm` | 14px | 14px | 1.5 | Captions |
| `--text-label` | 12px | 12px | 1.4 | Overlines, badges |

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight icon gaps |
| `--space-2` | 8px | Inline gaps |
| `--space-3` | 12px | Form padding |
| `--space-4` | 16px | Component padding |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Group spacing |
| `--space-12` | 48px | Mobile section |
| `--space-16` | 64px | Tablet section |
| `--space-20` | 80px | Desktop compact |
| `--space-24` | 96px | Desktop standard |

### Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Hover color |
| `--duration-fast` | 150ms | Button state |
| `--duration-normal` | 250ms | Card transitions |
| `--duration-slow` | 400ms | Section reveals |
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | General |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Entering |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exiting |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful |

### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 10 | Dropdowns |
| `--z-sticky` | 20 | Sticky headers |
| `--z-overlay` | 30 | Overlays |
| `--z-modal` | 40 | Modal dialogs |
| `--z-toast` | 50 | Toasts |
| `--z-system` | 100 | System UI |

## 13 Motion Presets

### Enter Presets

| Preset | CSS | Duration | Easing |
|--------|-----|----------|--------|
| fade-in | `opacity: 0 → 1` | 250ms | ease-out |
| slide-up | `translateY(24px) → 0` | 400ms | ease-out |
| scale-in | `scale(0.95) → 1` + opacity | 250ms | ease-out |
| expand | `max-height: 0 → auto` | 400ms | ease-default |

### Exit Presets

| Preset | CSS | Duration | Easing |
|--------|-----|----------|--------|
| fade-out | `opacity: 1 → 0` | 200ms | ease-in |
| slide-down | `translateY(0) → 24px` | 200ms | ease-in |
| scale-out | `scale(1) → 0.95` + opacity | 200ms | ease-in |

### Stagger Presets

| Preset | Delay | Max Items |
|--------|-------|-----------|
| children-fast | 40ms per child | 6 |
| children-normal | 60ms per child | 6 |
| grid | 80ms per child | 12 |

### Interaction Presets

| Preset | CSS | Duration |
|--------|-----|----------|
| hover-lift | `translateY(-2px)` + shadow-md | 150ms |
| press-down | `scale(0.98)` | 100ms |
| focus-ring | `box-shadow: 0 0 0 3px brand-15%` | 150ms |

### Reduced Motion

All motion must respect `prefers-reduced-motion: reduce`:
- Replace all transitions with `opacity: 0 → 1` (instant)
- Remove all transform animations
- Keep `transition: opacity 0ms`

## 9 Palette Color Details

### Minimal SaaS
- Brand: `#2563EB` (blue) | Background: `#FFFFFF` / `#FAFAFA` | Text: `#111827`
- Radius: 6-24px | Shadow: Standard | Display Font: Inter 600-800

### AI Futuristic
- Brand: `#00FF88` (neon green) + `#00D4FF` (cyan) | Background: `#0A0A0F` (near-black) | Text: `#E0E0EE`
- Radius: 2-12px | Shadow: Glow-border | Display Font: DM Sans 700
- Style: Rich gradients, glow effects, neon accents

### Gradient Startup
- Brand: `#7C3AED` (violet) + `#EC4899` (pink) | Background: `#FFFFFF`
- Gradient Hero: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Radius: 8-28px | Shadow: Soft + glow | Display Font: DM Sans 700

### Corporate
- Brand: `#1A365D` (navy) | Background: `#FFFFFF` / `#F7F8FA` | Text: `#1A202C`
- Radius: 4-12px | Shadow: Conservative | Display Font: Inter 600-700

### Apple Minimal
- Brand: `#0071E3` (Apple blue) | Background: `#FFFFFF` / `#FBFBFD` / `#F5F5F7` | Text: `#1D1D1F`
- Radius: 10-24px | Shadow: Smooth diffused | Display Font: SF-style sans

### Illustration
- Brand: `#E8590C` (burnt orange) + `#7048E8` (purple) | Background: `#FFFFFF` / `#FFF8F0` | Text: `#1A1523`
- Radius: 12-32px | Shadow: Soft warm | Display Font: Poppins/Nunito
- ⚠️ Orange brand-primary fails 4.5:1 on white/light backgrounds

### Dashboard
- Brand: `#4F46E5` (indigo) + `#0EA5E9` (sky) | Chart: 8-color distinguishable scale
- Radius: 4-12px | Shadow: Tight | Display Font: Inter 500-700

### Bold Lifestyle
- Brand: `#111111` (black) + `#FF4500` (red-orange) | Background: `#FFFFFF` | Text: `#111111`
- Radius: 0px | Shadow: None or hard offset | Display Font: Oswald/Bebas

### Minimal Corporate
- Brand: `#B45309` (warm stone) | Background: `#FDFCFB` / `#F7F5F2` | Text: `#1C1917`
- Radius: 4-8px | Shadow: None/subtle | Display Font: Source Serif 4

## W3C DTCG Token Format

Tokens follow the W3C Design Token Community Group specification:

```json
{
  "color": {
    "brand-primary": {
      "$value": "#2563EB",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

CSS usage: `var(--color-brand-primary)`, `var(--space-4)`, `var(--radius-md)`, etc.
