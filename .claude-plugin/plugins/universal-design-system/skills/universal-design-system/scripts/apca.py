#!/usr/bin/env python3
"""
APCA (Advanced Perceptual Contrast Algorithm) implementation.

Implements SAPC-APCA 0.0.98G-4g for calculating perceptual lightness
contrast (Lc) between text and background colors.

APCA is a next-generation contrast algorithm that models human perception
more accurately than the WCAG 2.x luminance ratio. It accounts for
spatial frequency (text size), polarity (dark-on-light vs light-on-dark),
and the HVS (Human Visual System) response curve.

Key thresholds:
    |Lc| >= 75  -- Body text (14-16px, weight 400)
    |Lc| >= 60  -- Large text (24px+, or 18.67px bold)
    |Lc| >= 45  -- Non-text UI elements (icons, borders, controls)

Reference: https://github.com/Myndex/SAPC-APCA
"""


# ---------------------------------------------------------------------------
# SAPC-APCA constants (0.0.98G-4g)
# ---------------------------------------------------------------------------

# sRGB to Y (luminance) coefficients -- these differ from WCAG 2.x
_S_RCO = 0.2126729
_S_GCO = 0.7151522
_S_BCO = 0.0721750

# Pre-processing constants
_NORM_BG = 0.56
_NORM_TXT = 0.57
_REV_TXT = 0.62
_REV_BG = 0.65

# Power curve exponents
_BG_EXP = 0.56
_TXT_EXP = 0.57
_REV_TXT_EXP = 0.62
_REV_BG_EXP = 0.65

# Clamp / scale constants
_SCALE_BOW = 1.14  # black on white
_SCALE_WOB = 1.14  # white on black
_LO_CLIP = 0.1
_LO_BOW_OFFSET = 0.027
_LO_WOB_OFFSET = 0.027

# Soft clamp for very low luminance
_SOFT_CLAMP = 0.03
_SOFT_EXP = 1.45


def _srgb_to_y(r: int, g: int, b: int) -> float:
    """Convert sRGB 0-255 to APCA luminance (Y).

    Uses a simple gamma 2.4 decode (the piecewise sRGB EOTF
    linearisation used by APCA, matching the spec's lookup approach).
    """
    # Linearise each channel with simple power curve (APCA spec)
    r_lin = pow(r / 255.0, 2.4)
    g_lin = pow(g / 255.0, 2.4)
    b_lin = pow(b / 255.0, 2.4)

    # Weighted sum for luminance
    y = _S_RCO * r_lin + _S_GCO * g_lin + _S_BCO * b_lin

    return y


def _soft_clamp(y: float) -> float:
    """Apply soft clamp to very dark colors near black."""
    if y < 0.0:
        return 0.0
    if y < _SOFT_CLAMP:
        return y + pow(_SOFT_CLAMP - y, _SOFT_EXP)
    return y


def hex_to_rgb(hex_color: str) -> tuple:
    """Convert a hex color string to an (R, G, B) tuple.

    Accepts '#RRGGBB', 'RRGGBB', '#RGB', or 'RGB' formats.
    """
    hex_color = hex_color.strip().lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    if len(hex_color) != 6:
        raise ValueError(f"Invalid hex color: #{hex_color}")
    return (
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16),
    )


def apca_contrast(text_hex: str, bg_hex: str) -> float:
    """Calculate the APCA Lightness Contrast (Lc) value.

    Args:
        text_hex: Foreground/text color as hex string (e.g. '#1A1A1A').
        bg_hex:   Background color as hex string (e.g. '#FFFFFF').

    Returns:
        Lc value as a float.
        Positive Lc = dark text on light background.
        Negative Lc = light text on dark background.
        Absolute value is what matters for threshold comparison.

    The sign indicates polarity:
        Lc > 0  -- "normal" polarity (dark text, light bg)
        Lc < 0  -- "reverse" polarity (light text, dark bg)
    """
    txt_r, txt_g, txt_b = hex_to_rgb(text_hex)
    bg_r, bg_g, bg_b = hex_to_rgb(bg_hex)

    # Step 1: sRGB to Y (luminance)
    y_txt = _srgb_to_y(txt_r, txt_g, txt_b)
    y_bg = _srgb_to_y(bg_r, bg_g, bg_b)

    # Step 2: Soft clamp
    y_txt = _soft_clamp(y_txt)
    y_bg = _soft_clamp(y_bg)

    # Step 3: Determine polarity and calculate raw SAPC contrast
    if y_bg > y_txt:
        # Normal polarity: dark text on light background
        sapc = (pow(y_bg, _NORM_BG) - pow(y_txt, _NORM_TXT)) * _SCALE_BOW
        if sapc < _LO_CLIP:
            return 0.0
        lc = sapc - _LO_BOW_OFFSET
    else:
        # Reverse polarity: light text on dark background
        sapc = (pow(y_bg, _REV_BG) - pow(y_txt, _REV_TXT)) * _SCALE_WOB
        if sapc > -_LO_CLIP:
            return 0.0
        lc = sapc + _LO_WOB_OFFSET

    return lc * 100.0


# ---------------------------------------------------------------------------
# WCAG 2.x contrast ratio (for comparison output)
# ---------------------------------------------------------------------------

def _relative_luminance(r: int, g: int, b: int) -> float:
    """Calculate WCAG 2.1 relative luminance."""
    srgb = []
    for c in (r, g, b):
        c_lin = c / 255.0
        if c_lin <= 0.04045:
            srgb.append(c_lin / 12.92)
        else:
            srgb.append(((c_lin + 0.055) / 1.055) ** 2.4)
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]


def wcag_contrast_ratio(hex1: str, hex2: str) -> float:
    """Calculate the WCAG 2.1 contrast ratio between two hex colors."""
    l1 = _relative_luminance(*hex_to_rgb(hex1))
    l2 = _relative_luminance(*hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


# ---------------------------------------------------------------------------
# Threshold helpers
# ---------------------------------------------------------------------------

# Standard APCA Lc thresholds by use case
THRESHOLD_BODY_TEXT = 75   # Body text (14-16px normal weight)
THRESHOLD_LARGE_TEXT = 60  # Large text (24px+ or 18.67px bold)
THRESHOLD_UI_ELEMENT = 45  # Non-text UI (icons, focus rings, borders)


def passes_body_text(lc: float) -> bool:
    """Check if Lc value meets body text threshold (|Lc| >= 75)."""
    return abs(lc) >= THRESHOLD_BODY_TEXT


def passes_large_text(lc: float) -> bool:
    """Check if Lc value meets large text threshold (|Lc| >= 60)."""
    return abs(lc) >= THRESHOLD_LARGE_TEXT


def passes_ui_element(lc: float) -> bool:
    """Check if Lc value meets UI element threshold (|Lc| >= 45)."""
    return abs(lc) >= THRESHOLD_UI_ELEMENT


if __name__ == "__main__":
    # Quick self-test with known values
    print("APCA Contrast Calculator")
    print("=" * 50)

    pairs = [
        ("#000000", "#FFFFFF", "Black on white"),
        ("#FFFFFF", "#000000", "White on black"),
        ("#111118", "#FFFFFF", "Near-black on white"),
        ("#555566", "#FFFFFF", "Gray on white"),
        ("#2563EB", "#FFFFFF", "Blue-600 on white"),
    ]

    for fg, bg, label in pairs:
        lc = apca_contrast(fg, bg)
        wcag = wcag_contrast_ratio(fg, bg)
        print(f"  {label:30s}  Lc: {lc:+7.1f}  WCAG: {wcag:.2f}:1")
