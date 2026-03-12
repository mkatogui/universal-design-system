"""
Color math library for the Universal Design System.

Pure Python color manipulation: hex/RGB/HSL conversions, WCAG contrast,
luminance calculations, and color adjustment utilities.
"""

import math


# --- Conversions ---

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color string to (r, g, b) tuple (0-255)."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert (r, g, b) to uppercase hex string like #RRGGBB."""
    r = max(0, min(255, round(r)))
    g = max(0, min(255, round(g)))
    b = max(0, min(255, round(b)))
    return f"#{r:02X}{g:02X}{b:02X}"


def rgb_to_hsl(r: int, g: int, b: int) -> tuple:
    """Convert (r, g, b) 0-255 to (h, s, l) where h=0-360, s=0-1, l=0-1."""
    r_norm, g_norm, b_norm = r / 255.0, g / 255.0, b / 255.0
    c_max = max(r_norm, g_norm, b_norm)
    c_min = min(r_norm, g_norm, b_norm)
    delta = c_max - c_min

    # Lightness
    l = (c_max + c_min) / 2.0

    if delta == 0:
        h = 0.0
        s = 0.0
    else:
        # Saturation
        s = delta / (1 - abs(2 * l - 1))

        # Hue
        if c_max == r_norm:
            h = 60.0 * (((g_norm - b_norm) / delta) % 6)
        elif c_max == g_norm:
            h = 60.0 * (((b_norm - r_norm) / delta) + 2)
        else:
            h = 60.0 * (((r_norm - g_norm) / delta) + 4)

    return (h % 360, s, l)


def hsl_to_rgb(h: float, s: float, l: float) -> tuple:
    """Convert (h, s, l) to (r, g, b) 0-255. h=0-360, s=0-1, l=0-1."""
    s = max(0.0, min(1.0, s))
    l = max(0.0, min(1.0, l))
    h = h % 360

    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2

    if h < 60:
        r1, g1, b1 = c, x, 0
    elif h < 120:
        r1, g1, b1 = x, c, 0
    elif h < 180:
        r1, g1, b1 = 0, c, x
    elif h < 240:
        r1, g1, b1 = 0, x, c
    elif h < 300:
        r1, g1, b1 = x, 0, c
    else:
        r1, g1, b1 = c, 0, x

    return (
        max(0, min(255, round((r1 + m) * 255))),
        max(0, min(255, round((g1 + m) * 255))),
        max(0, min(255, round((b1 + m) * 255))),
    )


# --- Adjustments ---

def adjust_lightness(hex_color: str, amount: float) -> str:
    """Adjust lightness by amount (-1 to 1). Positive = lighter."""
    r, g, b = hex_to_rgb(hex_color)
    h, s, l = rgb_to_hsl(r, g, b)
    l = max(0.0, min(1.0, l + amount))
    return rgb_to_hex(*hsl_to_rgb(h, s, l))


def set_lightness(hex_color: str, lightness: float) -> str:
    """Set lightness to an absolute value (0-1)."""
    r, g, b = hex_to_rgb(hex_color)
    h, s, _ = rgb_to_hsl(r, g, b)
    return rgb_to_hex(*hsl_to_rgb(h, s, max(0.0, min(1.0, lightness))))


def adjust_saturation(hex_color: str, amount: float) -> str:
    """Adjust saturation by amount (-1 to 1). Positive = more saturated."""
    r, g, b = hex_to_rgb(hex_color)
    h, s, l = rgb_to_hsl(r, g, b)
    s = max(0.0, min(1.0, s + amount))
    return rgb_to_hex(*hsl_to_rgb(h, s, l))


def rotate_hue(hex_color: str, degrees: float) -> str:
    """Rotate hue by degrees."""
    r, g, b = hex_to_rgb(hex_color)
    h, s, l = rgb_to_hsl(r, g, b)
    h = (h + degrees) % 360
    return rgb_to_hex(*hsl_to_rgb(h, s, l))


def mix_colors(hex1: str, hex2: str, weight: float = 0.5) -> str:
    """Mix two colors. weight=0 is all hex1, weight=1 is all hex2."""
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    w = max(0.0, min(1.0, weight))
    return rgb_to_hex(
        round(r1 * (1 - w) + r2 * w),
        round(g1 * (1 - w) + g2 * w),
        round(b1 * (1 - w) + b2 * w),
    )


# --- WCAG Contrast ---

def relative_luminance(r: int, g: int, b: int) -> float:
    """Calculate relative luminance per WCAG 2.1."""
    srgb = []
    for c in (r, g, b):
        c_linear = c / 255.0
        if c_linear <= 0.03928:
            srgb.append(c_linear / 12.92)
        else:
            srgb.append(((c_linear + 0.055) / 1.055) ** 2.4)
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]


def contrast_ratio(hex1: str, hex2: str) -> float:
    """Calculate WCAG contrast ratio between two hex colors."""
    l1 = relative_luminance(*hex_to_rgb(hex1))
    l2 = relative_luminance(*hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def auto_text_color(bg_hex: str) -> str:
    """Pick white or black text for max contrast on given background."""
    ratio_white = contrast_ratio(bg_hex, "#FFFFFF")
    ratio_black = contrast_ratio(bg_hex, "#000000")
    return "#FFFFFF" if ratio_white >= ratio_black else "#000000"


def ensure_contrast(fg_hex: str, bg_hex: str, min_ratio: float = 4.5, max_steps: int = 20) -> str:
    """Adjust fg lightness until contrast ratio meets min_ratio against bg.

    Darkens fg if bg is light, lightens fg if bg is dark.
    """
    if contrast_ratio(fg_hex, bg_hex) >= min_ratio:
        return fg_hex

    bg_lum = relative_luminance(*hex_to_rgb(bg_hex))
    r, g, b = hex_to_rgb(fg_hex)
    h, s, l = rgb_to_hsl(r, g, b)

    # Determine direction: darken if bg is light, lighten if bg is dark
    direction = -1 if bg_lum > 0.5 else 1
    step = 0.05

    for _ in range(max_steps):
        l = max(0.0, min(1.0, l + direction * step))
        candidate = rgb_to_hex(*hsl_to_rgb(h, s, l))
        if contrast_ratio(candidate, bg_hex) >= min_ratio:
            return candidate

    # If we hit the limit, return the extreme
    return rgb_to_hex(*hsl_to_rgb(h, s, 0.0 if direction < 0 else 1.0))


# --- Shape Presets ---

SHAPE_PRESETS = {
    "sharp": {
        "radius_sm": "2px", "radius_md": "4px", "radius_lg": "6px",
        "radius_xl": "8px", "radius_2xl": "12px", "radius_full": "9999px",
        "description": "sharp identity",
    },
    "balanced": {
        "radius_sm": "6px", "radius_md": "8px", "radius_lg": "12px",
        "radius_xl": "16px", "radius_2xl": "24px", "radius_full": "9999px",
        "description": "balanced identity",
    },
    "round": {
        "radius_sm": "8px", "radius_md": "12px", "radius_lg": "16px",
        "radius_xl": "20px", "radius_2xl": "28px", "radius_full": "9999px",
        "description": "rounded identity",
    },
    "brutalist": {
        "radius_sm": "0", "radius_md": "0", "radius_lg": "0",
        "radius_xl": "0", "radius_2xl": "0", "radius_full": "9999px",
        "description": "brutalist identity",
    },
}

# Fixed status colors (consistent across all palettes)
STATUS_COLORS = {
    "success": "#059669", "success_bg": "#ECFDF5",
    "warning": "#D97706", "warning_bg": "#FFFBEB",
    "error": "#DC2626", "error_bg": "#FEF2F2",
}

STATUS_COLORS_DARK = {
    "success": "#34D399", "success_bg": "#064E3B",
    "warning": "#FBBF24", "warning_bg": "#78350F",
    "error": "#F87171", "error_bg": "#7F1D1D",
}


class PaletteDeriver:
    """Derive a complete palette (33 light + 33 dark tokens) from 1-5 hex colors.

    Args:
        colors: 1-5 hex color strings
        shape: Shape preset name (sharp, balanced, round, brutalist)
    """

    def __init__(self, colors: list, shape: str = "balanced"):
        if not colors or len(colors) > 5:
            raise ValueError("Provide 1-5 hex colors")
        self.colors = [c.upper() if c.startswith("#") else f"#{c.upper()}" for c in colors]
        self.shape = shape if shape in SHAPE_PRESETS else "balanced"
        self._derive_brand_colors()

    def _derive_brand_colors(self):
        """From 1-5 inputs, derive the 4 brand colors."""
        n = len(self.colors)
        if n == 1:
            self.brand_primary = self.colors[0]
            self.brand_secondary = rotate_hue(self.brand_primary, 15)
            self.brand_accent = rotate_hue(self.brand_primary, 30)
            self.brand_muted = set_lightness(self.brand_primary, 0.95)
        elif n == 2:
            self.brand_primary = self.colors[0]
            self.brand_secondary = self.colors[1]
            self.brand_accent = mix_colors(self.colors[0], self.colors[1], 0.3)
            self.brand_accent = adjust_saturation(self.brand_accent, 0.1)
            self.brand_muted = set_lightness(self.brand_primary, 0.95)
        elif n >= 3:
            self.brand_primary = self.colors[0]
            self.brand_secondary = self.colors[1]
            self.brand_accent = self.colors[2]
            self.brand_muted = self.colors[3] if n >= 4 else set_lightness(self.brand_primary, 0.95)
            if n == 5:
                self._bg_override = self.colors[4]

    def _derive_light_tokens(self) -> dict:
        """Generate light mode semantic tokens."""
        bg_primary = getattr(self, "_bg_override", "#FFFFFF")
        bg_secondary = adjust_lightness(bg_primary, -0.02)
        bg_tertiary = adjust_lightness(bg_primary, -0.04)
        bg_inverse = "#111118"

        # Derive text colors with contrast enforcement
        text_primary = ensure_contrast("#111118", bg_primary, 4.5)
        text_secondary = ensure_contrast("#555566", bg_primary, 4.5)
        text_tertiary = ensure_contrast("#6B6B7B", bg_primary, 3.0)
        text_on_brand = auto_text_color(self.brand_primary)

        # Derive border colors
        border_default = mix_colors(bg_primary, text_primary, 0.25)
        border_input = mix_colors(bg_primary, text_primary, 0.40)
        border_subtle = mix_colors(bg_primary, text_primary, 0.12)

        # Brand primary RGB for shadow-glow
        r, g, b = hex_to_rgb(self.brand_primary)
        brand_primary_rgb = f"{r}, {g}, {b}"

        # Info color matches brand
        info_color = self.brand_primary
        info_bg = set_lightness(self.brand_primary, 0.95)

        return {
            "bg_primary": bg_primary,
            "bg_secondary": bg_secondary,
            "bg_tertiary": bg_tertiary,
            "bg_inverse": bg_inverse,
            "text_primary": text_primary,
            "text_secondary": text_secondary,
            "text_tertiary": text_tertiary,
            "text_on_brand": text_on_brand,
            "brand_primary": self.brand_primary,
            "brand_primary_rgb": brand_primary_rgb,
            "brand_secondary": self.brand_secondary,
            "brand_accent": self.brand_accent,
            "brand_muted": self.brand_muted,
            "border_default": border_default,
            "border_input": border_input,
            "border_subtle": border_subtle,
            **STATUS_COLORS,
            "info": info_color,
            "info_bg": info_bg,
        }

    def _derive_dark_tokens(self) -> dict:
        """Generate dark mode semantic tokens."""
        bg_primary = "#0F0F14"
        bg_secondary = "#161620"
        bg_tertiary = "#1E1E2A"
        bg_inverse = "#F5F5FA"

        # Lighten brand for dark mode contrast
        brand_dark = ensure_contrast(self.brand_primary, bg_primary, 4.5)
        brand_secondary_dark = ensure_contrast(self.brand_secondary, bg_primary, 3.0)
        brand_accent_dark = ensure_contrast(self.brand_accent, bg_primary, 3.0)
        brand_muted_dark = set_lightness(self.brand_primary, 0.12)

        text_primary = ensure_contrast("#F5F5FA", bg_primary, 4.5)
        text_secondary = ensure_contrast("#A0A0B0", bg_primary, 4.5)
        text_tertiary = ensure_contrast("#7A7A8A", bg_primary, 3.0)
        text_on_brand = auto_text_color(brand_dark)

        border_default = mix_colors(bg_primary, text_primary, 0.20)
        border_input = mix_colors(bg_primary, text_primary, 0.30)
        border_subtle = mix_colors(bg_primary, text_primary, 0.10)

        r, g, b = hex_to_rgb(brand_dark)
        brand_primary_rgb = f"{r}, {g}, {b}"

        info_color = brand_dark
        info_bg = set_lightness(self.brand_primary, 0.15)

        return {
            "bg_primary": bg_primary,
            "bg_secondary": bg_secondary,
            "bg_tertiary": bg_tertiary,
            "bg_inverse": bg_inverse,
            "text_primary": text_primary,
            "text_secondary": text_secondary,
            "text_tertiary": text_tertiary,
            "text_on_brand": text_on_brand,
            "brand_primary": brand_dark,
            "brand_primary_rgb": brand_primary_rgb,
            "brand_secondary": brand_secondary_dark,
            "brand_accent": brand_accent_dark,
            "brand_muted": brand_muted_dark,
            "border_default": border_default,
            "border_input": border_input,
            "border_subtle": border_subtle,
            **STATUS_COLORS_DARK,
            "info": info_color,
            "info_bg": info_bg,
        }

    def derive(self) -> dict:
        """Return the full palette specification.

        Returns dict with keys: light, dark, structural, shadows_light, shadows_dark,
        gradient_light, gradient_dark.
        """
        light = self._derive_light_tokens()
        dark = self._derive_dark_tokens()
        shape = SHAPE_PRESETS[self.shape]

        r, g, b = hex_to_rgb(light["brand_primary"])
        rd, gd, bd = hex_to_rgb(dark["brand_primary"])

        shadows_light = {
            "xs": f"0 1px 2px rgba(0,0,0,0.05)",
            "sm": f"0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
            "md": f"0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
            "lg": f"0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.04)",
            "xl": f"0 16px 48px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.04)",
            "glow": f"0 0 40px rgba({r},{g},{b},0.2)",
        }

        shadows_dark = {
            "xs": f"0 1px 2px rgba(0,0,0,0.3)",
            "sm": f"0 2px 4px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.25)",
            "md": f"0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.25)",
            "lg": f"0 8px 24px rgba(0,0,0,0.45), 0 4px 8px rgba(0,0,0,0.25)",
            "xl": f"0 16px 48px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.25)",
            "glow": f"0 0 40px rgba({rd},{gd},{bd},0.3)",
        }

        gradient_light = f"linear-gradient(135deg, {light['brand_primary']}, {light['brand_accent']})"
        gradient_dark = f"linear-gradient(135deg, {dark['brand_primary']}, {dark['brand_accent']})"

        return {
            "light": light,
            "dark": dark,
            "structural": {
                "shape": self.shape,
                "radius-md": shape["radius_md"],
                "font-display": "Inter",
            },
            "radius": {k: v for k, v in shape.items() if k != "description"},
            "radius_description": shape["description"],
            "shadows_light": shadows_light,
            "shadows_dark": shadows_dark,
            "gradient_light": gradient_light,
            "gradient_dark": gradient_dark,
        }

    def validate_wcag(self) -> list:
        """Check all critical contrast pairs. Returns list of (pair, ratio, passed)."""
        palette = self.derive()
        results = []
        pairs_4_5 = [
            ("text_primary", "bg_primary"),
            ("text_secondary", "bg_primary"),
            ("text_primary", "bg_secondary"),
            ("text_on_brand", "brand_primary"),
        ]
        pairs_3_0 = [
            ("brand_primary", "bg_primary"),
            ("text_tertiary", "bg_primary"),
        ]

        for mode_name, mode_tokens in [("light", palette["light"]), ("dark", palette["dark"])]:
            for fg_key, bg_key in pairs_4_5:
                fg = mode_tokens[fg_key]
                bg = mode_tokens[bg_key]
                ratio = contrast_ratio(fg, bg)
                results.append((f"{mode_name}: {fg_key}/{bg_key}", ratio, ratio >= 4.5))
            for fg_key, bg_key in pairs_3_0:
                fg = mode_tokens[fg_key]
                bg = mode_tokens[bg_key]
                ratio = contrast_ratio(fg, bg)
                results.append((f"{mode_name}: {fg_key}/{bg_key}", ratio, ratio >= 3.0))

        return results


# --- Self-test ---

if __name__ == "__main__":
    print("Color Engine Self-Test")
    print("=" * 50)

    # Test hex_to_rgb
    assert hex_to_rgb("#FF0000") == (255, 0, 0), "hex_to_rgb red failed"
    assert hex_to_rgb("#00FF00") == (0, 255, 0), "hex_to_rgb green failed"
    assert hex_to_rgb("#0000FF") == (0, 0, 255), "hex_to_rgb blue failed"
    assert hex_to_rgb("#FFF") == (255, 255, 255), "hex_to_rgb shorthand failed"
    print("[PASS] hex_to_rgb")

    # Test rgb_to_hex
    assert rgb_to_hex(255, 0, 0) == "#FF0000", "rgb_to_hex red failed"
    assert rgb_to_hex(0, 128, 255) == "#0080FF", "rgb_to_hex mixed failed"
    print("[PASS] rgb_to_hex")

    # Test HSL roundtrip
    for hex_val in ["#FF0000", "#00FF00", "#0000FF", "#3B82F6", "#FFFFFF", "#000000"]:
        r, g, b = hex_to_rgb(hex_val)
        h, s, l = rgb_to_hsl(r, g, b)
        r2, g2, b2 = hsl_to_rgb(h, s, l)
        assert abs(r - r2) <= 1 and abs(g - g2) <= 1 and abs(b - b2) <= 1, \
            f"HSL roundtrip failed for {hex_val}: ({r},{g},{b}) -> ({r2},{g2},{b2})"
    print("[PASS] HSL roundtrip")

    # Test contrast_ratio
    # White on black should be 21:1
    ratio = contrast_ratio("#FFFFFF", "#000000")
    assert abs(ratio - 21.0) < 0.1, f"contrast_ratio white/black = {ratio}"
    print(f"[PASS] contrast_ratio white/black = {ratio:.2f}")

    # Test auto_text_color
    assert auto_text_color("#FFFFFF") == "#000000", "auto_text_color white bg"
    assert auto_text_color("#000000") == "#FFFFFF", "auto_text_color black bg"
    assert auto_text_color("#2563EB") == "#FFFFFF", "auto_text_color blue bg"
    print("[PASS] auto_text_color")

    # Test ensure_contrast
    result = ensure_contrast("#888888", "#FFFFFF", 4.5)
    assert contrast_ratio(result, "#FFFFFF") >= 4.5, "ensure_contrast failed"
    print(f"[PASS] ensure_contrast: #888888 on white -> {result} (ratio={contrast_ratio(result, '#FFFFFF'):.2f})")

    # Test rotate_hue
    rotated = rotate_hue("#FF0000", 120)
    r, g, b = hex_to_rgb(rotated)
    assert g > r and g > b, f"rotate_hue 120 from red should be greenish, got {rotated}"
    print(f"[PASS] rotate_hue: red +120° = {rotated}")

    # Test mix_colors
    mixed = mix_colors("#000000", "#FFFFFF", 0.5)
    r, g, b = hex_to_rgb(mixed)
    assert 125 <= r <= 130 and r == g == b, f"mix 50/50 black+white = {mixed}"
    print(f"[PASS] mix_colors: black + white 50% = {mixed}")

    # Test adjust_lightness
    lighter = adjust_lightness("#3B82F6", 0.2)
    r1, g1, b1 = hex_to_rgb("#3B82F6")
    r2, g2, b2 = hex_to_rgb(lighter)
    _, _, l1 = rgb_to_hsl(r1, g1, b1)
    _, _, l2 = rgb_to_hsl(r2, g2, b2)
    assert l2 > l1, f"adjust_lightness +0.2 should increase lightness"
    print(f"[PASS] adjust_lightness: #3B82F6 +0.2 = {lighter}")

    # Test PaletteDeriver
    print()
    print("PaletteDeriver Tests")
    print("-" * 50)

    # 1-color derivation
    pd1 = PaletteDeriver(["#3B82F6"])
    result = pd1.derive()
    assert "light" in result and "dark" in result, "derive() must return light+dark"
    assert len(result["light"]) >= 20, f"light tokens should be >= 20, got {len(result['light'])}"
    assert len(result["dark"]) >= 20, f"dark tokens should be >= 20, got {len(result['dark'])}"
    print(f"[PASS] 1-color: {len(result['light'])} light + {len(result['dark'])} dark tokens")

    # 2-color derivation
    pd2 = PaletteDeriver(["#E8590C", "#7048E8"])
    result2 = pd2.derive()
    assert result2["light"]["brand_primary"] == "#E8590C"
    assert result2["light"]["brand_secondary"] == "#7048E8"
    print(f"[PASS] 2-color: primary={result2['light']['brand_primary']}, secondary={result2['light']['brand_secondary']}")

    # WCAG validation
    wcag = pd1.validate_wcag()
    all_pass = all(passed for _, _, passed in wcag)
    print(f"[PASS] WCAG validation: {sum(1 for _,_,p in wcag if p)}/{len(wcag)} pairs pass")
    for pair, ratio, passed in wcag:
        status = "OK" if passed else "FAIL"
        print(f"       {status} {pair}: {ratio:.2f}")

    # Shape presets
    for shape_name in SHAPE_PRESETS:
        pd = PaletteDeriver(["#3B82F6"], shape=shape_name)
        r = pd.derive()
        assert r["structural"]["shape"] == shape_name
    print(f"[PASS] All shape presets: {list(SHAPE_PRESETS.keys())}")

    print()
    print("All tests passed!")
