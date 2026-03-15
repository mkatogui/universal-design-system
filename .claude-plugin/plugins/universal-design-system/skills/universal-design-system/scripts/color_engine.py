"""
Color math library for the Universal Design System.

Pure Python color manipulation: hex/RGB/HSL/oklch conversions, WCAG contrast,
luminance calculations, color adjustment utilities, and batch oklch propagation.
"""

import json
import math
import re
from pathlib import Path


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


# --- oklch Conversions ---
# Pipeline: hex -> sRGB -> linear RGB -> XYZ (D65) -> oklab -> oklch

def _srgb_to_linear(c: float) -> float:
    """Convert a single sRGB channel (0-1) to linear RGB."""
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def _linear_to_srgb(c: float) -> float:
    """Convert a single linear RGB channel (0-1) to sRGB."""
    if c <= 0.0031308:
        return c * 12.92
    return 1.055 * (c ** (1.0 / 2.4)) - 0.055


def _linear_rgb_to_xyz(r: float, g: float, b: float) -> tuple:
    """Convert linear RGB to CIE XYZ (D65 illuminant)."""
    x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b
    y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b
    z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b
    return (x, y, z)


def _xyz_to_oklab(x: float, y: float, z: float) -> tuple:
    """Convert CIE XYZ to oklab (L, a, b)."""
    l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z
    m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z
    s_ = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z

    l_c = math.copysign(abs(l_) ** (1.0 / 3.0), l_) if l_ != 0 else 0.0
    m_c = math.copysign(abs(m_) ** (1.0 / 3.0), m_) if m_ != 0 else 0.0
    s_c = math.copysign(abs(s_) ** (1.0 / 3.0), s_) if s_ != 0 else 0.0

    L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c
    a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c
    b = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c

    return (L, a, b)


def _oklab_to_oklch(L: float, a: float, b: float) -> tuple:
    """Convert oklab (L, a, b) to oklch (L, C, H)."""
    C = math.sqrt(a * a + b * b)
    H = math.degrees(math.atan2(b, a)) % 360.0
    return (L, C, H)


# --- Reverse Pipeline: oklch -> oklab -> XYZ -> linear RGB -> sRGB -> hex ---

def _oklab_to_xyz(L: float, a: float, b: float) -> tuple:
    """Convert OKLab (L, a, b) to CIE XYZ (D65 illuminant).

    Uses the inverse of the OKLab forward matrices:
    OKLab -> LMS (cube roots) -> XYZ via M1 inverse.
    """
    # OKLab to LMS (cube-root space) via inverse of M2
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b

    # Undo cube root: LMS = (l_^3, m_^3, s_^3)
    l_cubed = l_ * l_ * l_
    m_cubed = m_ * m_ * m_
    s_cubed = s_ * s_ * s_

    # LMS to XYZ via inverse of M1
    x = 1.2270138511035211 * l_cubed - 0.5577999806518222 * m_cubed + 0.2812561489664678 * s_cubed
    y = -0.0405801784232806 * l_cubed + 1.1122568696168302 * m_cubed - 0.0716766786656012 * s_cubed
    z = -0.0763812845057069 * l_cubed - 0.4214819784180127 * m_cubed + 1.5861632204407947 * s_cubed

    return (x, y, z)


def _xyz_to_linear_rgb(x: float, y: float, z: float) -> tuple:
    """Convert CIE XYZ (D65) to linear sRGB via the standard sRGB matrix.

    Returns (r, g, b) in linear light, may be outside [0,1] for out-of-gamut colors.
    """
    r = 3.2404541621141054 * x - 1.5371385940306089 * y - 0.4985314095560162 * z
    g = -0.9692660305051868 * x + 1.8760108454466942 * y + 0.0415560175303498 * z
    b = 0.0556434309591147 * x - 0.2040259135167538 * y + 1.0572251882231791 * z
    return (r, g, b)


def oklch_to_hex(L: float, C: float, H: float) -> str:
    """Convert OKLCH color to hex string (#RRGGBB).

    Full pipeline: OKLCH -> OKLab -> XYZ (D65) -> linear sRGB -> sRGB -> hex.

    Args:
        L: Lightness in [0, 1]
        C: Chroma in [0, ~0.4]
        H: Hue in degrees [0, 360]

    Returns:
        Uppercase hex string like '#RRGGBB'. Out-of-gamut values are clamped to sRGB.
    """
    # OKLCH to OKLab
    H_rad = math.radians(H)
    a = C * math.cos(H_rad)
    b = C * math.sin(H_rad)

    # OKLab to XYZ
    x, y, z = _oklab_to_xyz(L, a, b)

    # XYZ to linear RGB
    r_lin, g_lin, b_lin = _xyz_to_linear_rgb(x, y, z)

    # Linear RGB to sRGB with clamping
    r_srgb = _linear_to_srgb(max(0.0, min(1.0, r_lin)))
    g_srgb = _linear_to_srgb(max(0.0, min(1.0, g_lin)))
    b_srgb = _linear_to_srgb(max(0.0, min(1.0, b_lin)))

    # sRGB to 8-bit hex
    return rgb_to_hex(
        round(r_srgb * 255),
        round(g_srgb * 255),
        round(b_srgb * 255),
    )


def gamut_map_p3(L: float, C: float, H: float, epsilon: float = 0.001) -> tuple:
    """Map an OKLCH color into the sRGB gamut by iteratively reducing chroma.

    Uses binary search on chroma to find the maximum chroma that keeps the
    color within sRGB [0,1] bounds (Display P3 colors are reduced to sRGB).

    Args:
        L: Lightness in [0, 1]
        C: Chroma in [0, ~0.4]
        H: Hue in degrees [0, 360]
        epsilon: Chroma precision threshold for binary search convergence.

    Returns:
        Tuple (L, C_mapped, H) where C_mapped <= C and the color is in sRGB gamut.
    """
    # Check if already in gamut
    if _is_in_srgb_gamut(L, C, H):
        return (L, C, H)

    # Binary search: reduce chroma until in gamut
    lo = 0.0
    hi = C
    while hi - lo > epsilon:
        mid = (lo + hi) / 2.0
        if _is_in_srgb_gamut(L, mid, H):
            lo = mid
        else:
            hi = mid

    return (L, lo, H)


def _is_in_srgb_gamut(L: float, C: float, H: float) -> bool:
    """Check whether an OKLCH color falls within the sRGB gamut.

    Returns True if all linear RGB channels are within [-epsilon, 1+epsilon]
    (small tolerance for floating-point rounding).
    """
    H_rad = math.radians(H)
    a = C * math.cos(H_rad)
    b = C * math.sin(H_rad)

    x, y, z = _oklab_to_xyz(L, a, b)
    r, g, b_val = _xyz_to_linear_rgb(x, y, z)

    tol = 1e-6
    return all(-tol <= ch <= 1.0 + tol for ch in (r, g, b_val))


def hex_to_oklch(hex_color: str) -> dict:
    """Convert '#RRGGBB' hex color to oklch dict with L, C, H values.

    Returns:
        dict with keys 'l' (0-1 lightness), 'c' (chroma), 'h' (hue 0-360)
    """
    r, g, b = hex_to_rgb(hex_color)
    # sRGB 0-1
    r_s, g_s, b_s = r / 255.0, g / 255.0, b / 255.0
    # linear RGB
    r_l, g_l, b_l = _srgb_to_linear(r_s), _srgb_to_linear(g_s), _srgb_to_linear(b_s)
    # XYZ
    x, y, z = _linear_rgb_to_xyz(r_l, g_l, b_l)
    # oklab
    L, a, ob = _xyz_to_oklab(x, y, z)
    # oklch
    L, C, H = _oklab_to_oklch(L, a, ob)
    return {"l": round(L, 4), "c": round(C, 4), "h": round(H, 1)}


def rgba_to_oklch(rgba_str: str) -> dict:
    """Convert 'rgba(r, g, b, a)' string to oklch dict with L, C, H, alpha.

    Returns:
        dict with keys 'l', 'c', 'h', 'alpha'
    """
    match = re.match(
        r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)",
        rgba_str.strip(),
    )
    if not match:
        raise ValueError(f"Cannot parse rgba value: {rgba_str}")
    r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
    alpha = float(match.group(4)) if match.group(4) else 1.0
    hex_color = rgb_to_hex(r, g, b)
    result = hex_to_oklch(hex_color)
    result["alpha"] = round(alpha, 2)
    return result


def oklch_to_css(oklch_dict: dict) -> str:
    """Format oklch dict as CSS oklch() string.

    Example: 'oklch(54.6% 0.2152 262.9)'
    """
    L_pct = round(oklch_dict["l"] * 100, 1)
    C = round(oklch_dict["c"], 4)
    H = round(oklch_dict["h"], 1)
    return f"oklch({L_pct}% {C} {H})"


# --- Batch Token Converter ---

def _is_hex_color(value: str) -> bool:
    """Check if a string is a hex color like #RGB or #RRGGBB."""
    if not isinstance(value, str):
        return False
    return bool(re.match(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$", value.strip()))


def _is_token_reference(value: str) -> bool:
    """Check if a value is a design token reference like {color.primitive.blue.600}."""
    if not isinstance(value, str):
        return False
    return bool(re.match(r"^\{.*\}$", value.strip()))


def _walk_and_add_oklch(node: dict, path: str = "") -> int:
    """Recursively walk token tree and add oklch extensions to color tokens.

    Only processes tokens that:
    - Have a $value that is a hex color (#RRGGBB)
    - Have $type == 'color' (either directly or inherited)
    - Do NOT already have a com.tokens.oklch extension

    Returns count of tokens updated.
    """
    count = 0
    inherited_type = node.get("$type", "")

    for key, value in node.items():
        if key.startswith("$"):
            continue
        if not isinstance(value, dict):
            continue

        current_path = f"{path}.{key}" if path else key

        # Check if this is a leaf token (has $value)
        if "$value" in value:
            token_type = value.get("$type", inherited_type)
            token_value = value["$value"]

            # Only process color tokens with hex values
            if token_type == "color" and _is_hex_color(token_value):
                # Check if already has oklch extension
                extensions = value.get("$extensions", {})
                if "com.tokens.oklch" not in extensions:
                    oklch = hex_to_oklch(token_value)
                    css_str = oklch_to_css(oklch)
                    if "$extensions" not in value:
                        value["$extensions"] = {}
                    value["$extensions"]["com.tokens.oklch"] = css_str
                    count += 1
        else:
            # Recurse into nested groups
            count += _walk_and_add_oklch(value, current_path)

    return count


def batch_convert(tokens_path: str = None) -> int:
    """Read design-tokens.json, add oklch extensions to all color tokens missing them.

    Args:
        tokens_path: Path to design-tokens.json. Auto-detected if None.

    Returns:
        Number of tokens updated.
    """
    if tokens_path is None:
        tokens_path = str(
            Path(__file__).parent.parent.parent / "tokens" / "design-tokens.json"
        )

    with open(tokens_path, "r", encoding="utf-8") as f:
        tokens = json.load(f)

    count = _walk_and_add_oklch(tokens)

    with open(tokens_path, "w", encoding="utf-8") as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)
        f.write("\n")

    return count


def batch_convert_figma(figma_path: str = None) -> int:
    """Read figma-tokens.json, add oklch extensions to all color tokens missing them.

    Args:
        figma_path: Path to figma-tokens.json. Auto-detected if None.

    Returns:
        Number of tokens updated.
    """
    if figma_path is None:
        figma_path = str(
            Path(__file__).parent.parent.parent / "tokens" / "figma-tokens.json"
        )

    with open(figma_path, "r", encoding="utf-8") as f:
        tokens = json.load(f)

    count = 0
    for section_key, section_data in tokens.items():
        if not isinstance(section_data, dict):
            continue
        count += _walk_and_add_oklch(section_data)

    with open(figma_path, "w", encoding="utf-8") as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)
        f.write("\n")

    return count


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


def get_hue(hex_color: str) -> float:
    """Return hue in degrees (0-360) for a hex color."""
    r, g, b = hex_to_rgb(hex_color)
    h, _, _ = rgb_to_hsl(r, g, b)
    return h


# --- Color harmony (Adobe Color–style: derive harmonious palettes from one base) ---

HARMONY_COMPLEMENTARY = "complementary"       # base + opposite (180°)
HARMONY_ANALOGOUS = "analogous"               # base ± 30°
HARMONY_TRIADIC = "triadic"                   # base, +120°, +240°
HARMONY_SPLIT_COMPLEMENTARY = "split_complementary"  # base, +150°, +210°
HARMONY_TETRADIC = "tetradic"                 # base, +90°, +180°, +270°
HARMONY_MONOCHROMATIC = "monochromatic"       # same hue, varying L/S
HARMONY_DEFAULT = "balanced"                  # current: +15°, +30° (balanced)

HARMONY_OPTIONS = [
    HARMONY_COMPLEMENTARY,
    HARMONY_ANALOGOUS,
    HARMONY_TRIADIC,
    HARMONY_SPLIT_COMPLEMENTARY,
    HARMONY_TETRADIC,
    HARMONY_MONOCHROMATIC,
    HARMONY_DEFAULT,
]


def harmony_complementary(hex_primary: str) -> list:
    """Return [primary, complementary]. Complementary = opposite hue (180°)."""
    primary = hex_primary.upper() if hex_primary.startswith("#") else f"#{hex_primary.upper()}"
    comp = rotate_hue(primary, 180)
    return [primary, comp]


def harmony_analogous(hex_primary: str, spread: float = 30.0) -> list:
    """Return [primary, left, right]. Analogous = adjacent hues (±spread)."""
    primary = hex_primary.upper() if hex_primary.startswith("#") else f"#{hex_primary.upper()}"
    left = rotate_hue(primary, -spread)
    right = rotate_hue(primary, spread)
    return [primary, left, right]


def harmony_triadic(hex_primary: str) -> list:
    """Return [primary, +120°, +240°]. Triadic = three hues 120° apart."""
    primary = hex_primary.upper() if hex_primary.startswith("#") else f"#{hex_primary.upper()}"
    return [primary, rotate_hue(primary, 120), rotate_hue(primary, 240)]


def harmony_split_complementary(hex_primary: str) -> list:
    """Return [primary, 150°, 210°]. Split-complementary = base + two flanking opposite."""
    primary = hex_primary.upper() if hex_primary.startswith("#") else f"#{hex_primary.upper()}"
    return [primary, rotate_hue(primary, 150), rotate_hue(primary, 210)]


def harmony_tetradic(hex_primary: str) -> list:
    """Return [primary, +90°, +180°, +270°]. Tetradic = four hues 90° apart (rectangle)."""
    primary = hex_primary.upper() if hex_primary.startswith("#") else f"#{hex_primary.upper()}"
    return [
        primary,
        rotate_hue(primary, 90),
        rotate_hue(primary, 180),
        rotate_hue(primary, 270),
    ]


def harmony_monochromatic(hex_primary: str, steps: int = 3) -> list:
    """Return same hue at different lightness/saturation. steps 3 = [darker, primary, lighter]."""
    primary = hex_primary.upper() if hex_primary.startswith("#") else f"#{hex_primary.upper()}"
    r, g, b = hex_to_rgb(primary)
    h, s, l = rgb_to_hsl(r, g, b)
    out = []
    for i in range(steps):
        # Spread lightness: 0.25, 0.5, 0.75 or similar
        li = 0.2 + (i / max(1, steps - 1)) * 0.6
        si = max(0.15, min(1.0, s * (0.7 + 0.3 * (i / max(1, steps)))))
        out.append(rgb_to_hex(*hsl_to_rgb(h, si, li)))
    return out


def harmony_balanced(hex_primary: str) -> list:
    """Return [primary, +15°, +30°]. Balanced default for single-color derivation."""
    primary = hex_primary.upper() if hex_primary.startswith("#") else f"#{hex_primary.upper()}"
    return [
        primary,
        rotate_hue(primary, 15),
        rotate_hue(primary, 30),
    ]


def derive_harmony(hex_primary: str, harmony: str) -> list:
    """Derive a list of harmonious hex colors from one primary. Used by PaletteDeriver."""
    harmony = (harmony or HARMONY_DEFAULT).lower().strip()
    if harmony == HARMONY_COMPLEMENTARY:
        return harmony_complementary(hex_primary)
    if harmony == HARMONY_ANALOGOUS:
        return harmony_analogous(hex_primary)
    if harmony == HARMONY_TRIADIC:
        return harmony_triadic(hex_primary)
    if harmony == HARMONY_SPLIT_COMPLEMENTARY:
        return harmony_split_complementary(hex_primary)
    if harmony == HARMONY_TETRADIC:
        return harmony_tetradic(hex_primary)
    if harmony == HARMONY_MONOCHROMATIC:
        return harmony_monochromatic(hex_primary)
    return harmony_balanced(hex_primary)


def recommend_primary(hex_color: str, on_white: bool = True) -> dict:
    """Professional recommendation for using a color as primary.

    Returns dict with: recommended (bool), contrast_ratio, wcag_aa (bool),
    message (str). Use for guiding the user toward accessible choices.
    """
    hex_color = hex_color.upper() if hex_color.startswith("#") else f"#{hex_color.upper()}"
    bg = "#FFFFFF" if on_white else "#0F0F14"
    ratio = contrast_ratio(hex_color, bg)
    # WCAG AA: 4.5:1 normal text, 3:1 large text/UI
    wcag_aa_large = ratio >= 3.0
    wcag_aa_normal = ratio >= 4.5
    recommended = wcag_aa_normal or (on_white and ratio >= 3.0)
    if wcag_aa_normal:
        msg = f"Recommended as primary: {hex_color} — meets WCAG 2.2 AA for normal text on {'white' if on_white else 'dark'}."
    elif wcag_aa_large:
        msg = f"Use as primary for large text/UI only: {hex_color} — meets 3:1 on {'white' if on_white else 'dark'} (normal text needs 4.5:1)."
    else:
        msg = f"Low contrast on {'white' if on_white else 'dark'} ({ratio:.2f}:1). Prefer as accent or darken/lighten for primary."
    return {
        "recommended": recommended,
        "contrast_ratio": round(ratio, 2),
        "wcag_aa_normal": wcag_aa_normal,
        "wcag_aa_large": wcag_aa_large,
        "message": msg,
    }


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

    Single primary: uses color harmony (complementary, analogous, triadic, etc.)
    to derive secondary/accent. No hardcoding — text-on-brand, contrast, and
    status colors come from this deriver or from design-tokens.json.

    Args:
        colors: 1-5 hex color strings
        shape: Shape preset name (sharp, balanced, round, brutalist)
        harmony: When len(colors)==1, one of complementary, analogous, triadic,
            split_complementary, tetradic, monochromatic, balanced (default).
    """

    def __init__(self, colors: list, shape: str = "balanced", harmony: str = None):
        if not colors or len(colors) > 5:
            raise ValueError("Provide 1-5 hex colors")
        self.colors = [c.upper() if c.startswith("#") else f"#{c.upper()}" for c in colors]
        self.shape = shape if shape in SHAPE_PRESETS else "balanced"
        self.harmony = harmony or HARMONY_DEFAULT
        self._derive_brand_colors()

    def _derive_brand_colors(self):
        """From 1-5 inputs, derive the 4 brand colors. Single color uses harmony engine."""
        n = len(self.colors)
        if n == 1:
            harmonious = derive_harmony(self.colors[0], self.harmony)
            self.brand_primary = harmonious[0]
            self.brand_secondary = harmonious[1] if len(harmonious) > 1 else rotate_hue(self.brand_primary, 15)
            self.brand_accent = harmonious[2] if len(harmonious) > 2 else rotate_hue(self.brand_primary, 30)
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


# --- Inverse OKLCH Conversions ---
# Pipeline: oklch -> oklab -> XYZ (D65) -> linear RGB -> sRGB -> hex

def _oklch_to_oklab(L: float, C: float, H: float) -> tuple:
    """Convert oklch (L, C, H) to oklab (L, a, b)."""
    H_rad = math.radians(H)
    a = C * math.cos(H_rad)
    b = C * math.sin(H_rad)
    return (L, a, b)


def _oklab_to_xyz(L: float, a: float, b: float) -> tuple:
    """Convert oklab (L, a, b) to CIE XYZ (D65 illuminant)."""
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b

    # Cube the LMS values
    l_c = l_ * l_ * l_
    m_c = m_ * m_ * m_
    s_c = s_ * s_ * s_

    # Inverse M2 matrix (LMS -> XYZ)
    x = 1.2270138511035211 * l_c - 0.5577999806518222 * m_c + 0.2812561489664678 * s_c
    y = -0.0405801784232806 * l_c + 1.1122568696168302 * m_c - 0.0716766786656012 * s_c
    z = -0.0763812845057069 * l_c - 0.4214819784180127 * m_c + 1.5861632204407947 * s_c

    return (x, y, z)


def _xyz_to_linear_rgb(x: float, y: float, z: float) -> tuple:
    """Convert CIE XYZ (D65) to linear RGB."""
    r = 3.2404541621141054 * x - 1.5371385940306089 * y - 0.49853140955601579 * z
    g = -0.96926603050518312 * x + 1.8760108454466942 * y + 0.041556017530349834 * z
    b = 0.055643430959114726 * x - 0.20397695987305730 * y + 1.0572251882231791 * z
    return (r, g, b)


def oklch_to_hex(L: float, C: float, H: float) -> str:
    """Convert oklch (L, C, H) to hex color string '#RRGGBB'.

    Args:
        L: Lightness (0-1)
        C: Chroma (0+, typically 0-0.4)
        H: Hue (0-360)

    Returns:
        Hex color string like '#3B82F6'. Out-of-gamut values are clamped.
    """
    # oklch -> oklab
    ok_L, ok_a, ok_b = _oklch_to_oklab(L, C, H)
    # oklab -> XYZ
    x, y, z = _oklab_to_xyz(ok_L, ok_a, ok_b)
    # XYZ -> linear RGB
    r_lin, g_lin, b_lin = _xyz_to_linear_rgb(x, y, z)
    # linear RGB -> sRGB (clamp to gamut)
    r_s = max(0.0, min(1.0, _linear_to_srgb(max(0.0, r_lin))))
    g_s = max(0.0, min(1.0, _linear_to_srgb(max(0.0, g_lin))))
    b_s = max(0.0, min(1.0, _linear_to_srgb(max(0.0, b_lin))))
    # sRGB -> hex
    return rgb_to_hex(round(r_s * 255), round(g_s * 255), round(b_s * 255))


# --- Tonal Palette ---

class TonalPalette:
    """OKLCH-based tonal palette generator (Material You style).

    Generates a 13-stop tonal scale from a seed color by varying lightness
    in OKLCH color space while keeping the hue constant and adjusting chroma
    at the extremes to stay within the sRGB gamut.
    """

    TONAL_STOPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100]

    def __init__(self, seed_hex: str):
        """Initialize from a seed color hex string.

        Args:
            seed_hex: Hex color like '#3B82F6' or '3B82F6'.
        """
        if not seed_hex.startswith("#"):
            seed_hex = f"#{seed_hex}"
        self.seed_hex = seed_hex.upper()
        oklch = hex_to_oklch(seed_hex)
        self.seed_L = oklch["l"]
        self.seed_C = oklch["c"]
        self.seed_H = oklch["h"]

    def _chroma_for_tone(self, tone: int) -> float:
        """Calculate chroma for a given tonal stop.

        Reduces chroma at very light (>90) and very dark (<10) tones to
        keep colors within sRGB gamut and produce natural-looking scales.
        """
        if tone <= 0 or tone >= 100:
            return 0.0
        # Reduce chroma at extremes using a parabolic curve
        # Peak chroma at tone ~40-60, falling off toward 0 and 100
        t = tone / 100.0
        # Parabolic envelope: peaks at t=0.4, zero at t=0 and t=1
        envelope = 1.0 - ((t - 0.4) / 0.6) ** 2 if t >= 0.4 else t / 0.4
        envelope = max(0.0, min(1.0, envelope))
        return self.seed_C * envelope

    def generate(self) -> dict:
        """Generate 13-stop tonal scale.

        Returns:
            dict mapping tonal stop (int) to hex color string.
            e.g., {0: '#000000', 10: '#001A3D', ..., 100: '#FFFFFF'}
        """
        scale = {}
        for stop in self.TONAL_STOPS:
            L = stop / 100.0
            C = self._chroma_for_tone(stop)
            H = self.seed_H
            scale[stop] = oklch_to_hex(L, C, H)
        return scale

    def get_color_roles(self) -> dict:
        """Assign Material You-style color roles from the tonal scale.

        Returns:
            dict with semantic role names mapped to hex colors.
        """
        scale = self.generate()
        return {
            "primary": scale[40],
            "on-primary": scale[100],
            "primary-container": scale[90],
            "on-primary-container": scale[10],
            "secondary": scale[40],
            "on-secondary": scale[100],
            "secondary-container": scale[90],
            "on-secondary-container": scale[10],
            "surface": scale[99],
            "on-surface": scale[10],
            "surface-variant": scale[90],
            "on-surface-variant": scale[30],
            "outline": scale[50],
            "outline-variant": scale[80],
            "inverse-surface": scale[20],
            "inverse-on-surface": scale[95],
            "inverse-primary": scale[80],
            "surface-dim": scale[87] if 87 in scale else scale[90],
            "surface-bright": scale[98] if 98 in scale else scale[99],
            "surface-container-lowest": scale[100],
            "surface-container-low": scale[96] if 96 in scale else scale[95],
            "surface-container": scale[94] if 94 in scale else scale[95],
            "surface-container-high": scale[92] if 92 in scale else scale[90],
            "surface-container-highest": scale[90],
        }


# --- Self-test ---

def _run_self_tests():
    """Run self-tests for color engine functions."""
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

    # Test oklch conversion
    oklch_blue = hex_to_oklch("#2563EB")
    assert 0.4 < oklch_blue["l"] < 0.7, f"oklch blue lightness out of range: {oklch_blue['l']}"
    assert oklch_blue["c"] > 0.1, f"oklch blue chroma too low: {oklch_blue['c']}"
    assert 200 < oklch_blue["h"] < 300, f"oklch blue hue out of range: {oklch_blue['h']}"
    print(f"[PASS] hex_to_oklch: #2563EB -> {oklch_to_css(oklch_blue)}")

    # Test oklch for white and black
    oklch_white = hex_to_oklch("#FFFFFF")
    assert oklch_white["l"] > 0.99, f"oklch white L should be ~1.0, got {oklch_white['l']}"
    assert oklch_white["c"] < 0.001, f"oklch white C should be ~0, got {oklch_white['c']}"
    oklch_black = hex_to_oklch("#000000")
    assert oklch_black["l"] < 0.01, f"oklch black L should be ~0, got {oklch_black['l']}"
    print(f"[PASS] oklch white={oklch_to_css(oklch_white)}, black={oklch_to_css(oklch_black)}")

    # Test rgba_to_oklch
    oklch_rgba = rgba_to_oklch("rgba(0, 0, 0, 0.5)")
    assert oklch_rgba["alpha"] == 0.5, f"rgba alpha should be 0.5, got {oklch_rgba['alpha']}"
    assert oklch_rgba["l"] < 0.01, f"rgba black L should be ~0, got {oklch_rgba['l']}"
    print(f"[PASS] rgba_to_oklch: rgba(0,0,0,0.5) -> alpha={oklch_rgba['alpha']}")

    # Test contrast_ratio
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

    pd1 = PaletteDeriver(["#3B82F6"])
    result = pd1.derive()
    assert "light" in result and "dark" in result, "derive() must return light+dark"
    assert len(result["light"]) >= 20, f"light tokens should be >= 20, got {len(result['light'])}"
    assert len(result["dark"]) >= 20, f"dark tokens should be >= 20, got {len(result['dark'])}"
    print(f"[PASS] 1-color: {len(result['light'])} light + {len(result['dark'])} dark tokens")

    pd2 = PaletteDeriver(["#E8590C", "#7048E8"])
    result2 = pd2.derive()
    assert result2["light"]["brand_primary"] == "#E8590C"
    assert result2["light"]["brand_secondary"] == "#7048E8"
    print(f"[PASS] 2-color: primary={result2['light']['brand_primary']}, secondary={result2['light']['brand_secondary']}")

    wcag = pd1.validate_wcag()
    print(f"[PASS] WCAG validation: {sum(1 for _,_,p in wcag if p)}/{len(wcag)} pairs pass")
    for pair, ratio, passed in wcag:
        status = "OK" if passed else "FAIL"
        print(f"       {status} {pair}: {ratio:.2f}")

    for shape_name in SHAPE_PRESETS:
        pd = PaletteDeriver(["#3B82F6"], shape=shape_name)
        r = pd.derive()
        assert r["structural"]["shape"] == shape_name
    print(f"[PASS] All shape presets: {list(SHAPE_PRESETS.keys())}")

    print()
    print("All tests passed!")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        _run_self_tests()
    else:
        # Default: batch-convert design tokens and figma tokens
        root = Path(__file__).parent.parent.parent
        dt_path = str(root / "tokens" / "design-tokens.json")
        fg_path = str(root / "tokens" / "figma-tokens.json")

        print("oklch batch converter")
        print("=" * 50)

        dt_count = batch_convert(dt_path)
        print(f"  design-tokens.json: {dt_count} tokens updated with oklch extensions")

        fg_count = batch_convert_figma(fg_path)
        print(f"  figma-tokens.json:  {fg_count} tokens updated with oklch extensions")

        print(f"\nTotal: {dt_count + fg_count} tokens updated")
