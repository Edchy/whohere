#!/usr/bin/env python3
"""
Generate app icon, splash screen, and adaptive icon PNGs for the whohere ghost mascot.

Ghost design mirrors Mascot.tsx exactly:
  - bodyWidth  = size * 1.2
  - bodyHeight = size * 1.0
  - top radius = bodyWidth * 0.45  (rounds the top corners)
  - bulge      = bodyWidth * 0.18  (ghost skirt outward flare at bottom)
  - socketW    = size * 0.40, socketH = size * 0.44
  - pupilW     = socketW * 0.82,  pupilH = socketH * 0.88
  - eyeGap     = size * 0.10
  - eyeTop     = bodyHeight * 0.25  (from top of body rect)

Colors (from theme.ts darkColors):
  - background : #000000  (bgPrimary)
  - body       : #FFFFFF  (textPrimary / white)
  - socket     : #1A1A1A  (bgTertiary)
  - pupil      : #FE99D9  (accent / brand500)
"""

import math
import os
from PIL import Image, ImageDraw

# ─── Color palette ────────────────────────────────────────────────────────────
BG_COLOR     = (0,   0,   0,   255)   # #000000 — canvas background
BODY_COLOR   = (255, 255, 255, 255)   # #FFFFFF — ghost body
SOCKET_COLOR = (26,  26,  26,  255)   # #1A1A1A — eye sockets
PUPIL_COLOR  = (254, 153, 217, 255)   # #FE99D9 — pupils (brand accent)


# ─── Cubic Bezier helpers ─────────────────────────────────────────────────────

def cubic_bezier_point(t, p0, p1, p2, p3):
    """Single point on a cubic Bezier at parameter t."""
    u = 1 - t
    x = u**3 * p0[0] + 3*u**2*t * p1[0] + 3*u*t**2 * p2[0] + t**3 * p3[0]
    y = u**3 * p0[1] + 3*u**2*t * p1[1] + 3*u*t**2 * p2[1] + t**3 * p3[1]
    return (x, y)


def cubic_bezier_points(p0, p1, p2, p3, steps=120):
    """Polyline approximation of a cubic Bezier."""
    return [cubic_bezier_point(t / steps, p0, p1, p2, p3) for t in range(steps + 1)]


def arc_points(cx, cy, rx, ry, start_deg, end_deg, steps=60):
    """
    Approximate an elliptical arc as polyline points.
    Angles in degrees, measured from positive-x axis, counter-clockwise.
    The SVG arc used in GhostBody goes clockwise (sweep-flag=1), so we
    produce points in the order that sweeps clockwise.
    """
    pts = []
    # Normalise so we always iterate from start toward end in the clockwise
    # direction (i.e. increasing angle when Y is down in screen coords).
    a0 = math.radians(start_deg)
    a1 = math.radians(end_deg)
    # When rendering on screen (y-down), "clockwise" means increasing angle.
    if a1 < a0:
        a1 += 2 * math.pi
    for i in range(steps + 1):
        a = a0 + (a1 - a0) * i / steps
        pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
    return pts


# ─── Ghost body polygon ───────────────────────────────────────────────────────

def ghost_polygon(bx, by, w, h, r, bulge, steps=80):
    """
    Build the full ghost outline polygon starting from bottom-left, matching
    the SVG path in GhostBody exactly.

    The path (in local space, origin at top-left of the bounding rect):

      M 0 h                             ← bottom-left
      L 0 r                             ← up left side
      A r r 0 0 1  r 0                  ← top-left corner arc (cw)
      L w-r 0                           ← top edge
      A r r 0 0 1  w r                  ← top-right corner arc (cw)
      L w h                             ← down right side
      C w+bulge h  w/2+bulge h+bulge*1.2  w/2 h   ← bottom-right skirt
      C w/2-bulge h+bulge*1.2  -bulge h  0 h       ← bottom-left skirt
      Z

    bx, by = top-left corner of the body rect in canvas coordinates.
    """
    pts = []

    # 1. M 0 h  → bottom-left
    pts.append((bx, by + h))

    # 2. L 0 r  → up left side (already there, next point is start of arc)

    # 3. Arc: top-left corner
    #    From (bx, by+r) curving to (bx+r, by)
    #    Centre = (bx+r, by+r), start=180°, end=270° (going clockwise/screen-down)
    pts += arc_points(bx + r, by + r, r, r, 180, 270, steps)

    # 4. L w-r 0  → top edge
    pts.append((bx + w - r, by))

    # 5. Arc: top-right corner
    #    From (bx+w-r, by) curving to (bx+w, by+r)
    #    Centre = (bx+w-r, by+r), start=270°, end=360°
    pts += arc_points(bx + w - r, by + r, r, r, 270, 360, steps)

    # 6. L w h  → down right side
    pts.append((bx + w, by + h))

    # 7. Cubic: bottom-right outward bulge
    #    C w+bulge h   w/2+bulge h+bulge*1.2   w/2 h
    p0 = (bx + w,             by + h)
    p1 = (bx + w + bulge,     by + h)
    p2 = (bx + w/2 + bulge,   by + h + bulge * 1.2)
    p3 = (bx + w/2,           by + h)
    pts += cubic_bezier_points(p0, p1, p2, p3, steps)

    # 8. Cubic: bottom-left outward bulge
    #    C w/2-bulge h+bulge*1.2   -bulge h   0 h
    p0 = (bx + w/2,           by + h)
    p1 = (bx + w/2 - bulge,   by + h + bulge * 1.2)
    p2 = (bx - bulge,         by + h)
    p3 = (bx,                 by + h)
    pts += cubic_bezier_points(p0, p1, p2, p3, steps)

    return pts


# ─── Draw ghost ───────────────────────────────────────────────────────────────

def draw_ghost(draw: ImageDraw.ImageDraw, cx: float, cy: float, size: float):
    """
    Draw the ghost mascot centred at (cx, cy).
    `size` is the base unit from Mascot.tsx (the `size` prop).
    The visible area is bodyWidth × (bodyHeight + bulge*1.2).
    cy is the vertical centre of that full container.
    """
    body_w  = size * 1.2
    body_h  = size * 1.0
    r       = body_w * 0.45       # top-corner radius (matches GhostBody: r = w * 0.45)
    bulge   = body_w * 0.18

    container_h = body_h + bulge * 1.2

    # Top-left of body rect in canvas space
    bx = cx - body_w / 2
    by = cy - container_h / 2

    # ── 1. Ghost body ──────────────────────────────────────────────────────────
    pts = ghost_polygon(bx, by, body_w, body_h, r, bulge)
    draw.polygon(pts, fill=BODY_COLOR)

    # ── 2. Eye sockets ────────────────────────────────────────────────────────
    sock_w  = size * 0.40
    sock_h  = size * 0.44
    eye_gap = size * 0.10
    eye_top = by + body_h * 0.25   # top of socket relative to canvas

    # Centre of each socket
    left_sock_cx  = cx - eye_gap / 2 - sock_w / 2
    right_sock_cx = cx + eye_gap / 2 + sock_w / 2
    sock_cy = eye_top + sock_h / 2

    for sock_cx in (left_sock_cx, right_sock_cx):
        draw.ellipse(
            [sock_cx - sock_w/2, sock_cy - sock_h/2,
             sock_cx + sock_w/2, sock_cy + sock_h/2],
            fill=SOCKET_COLOR,
        )

    # ── 3. Pupils ─────────────────────────────────────────────────────────────
    pup_w = sock_w * 0.82
    pup_h = sock_h * 0.88

    for sock_cx in (left_sock_cx, right_sock_cx):
        draw.ellipse(
            [sock_cx - pup_w/2, sock_cy - pup_h/2,
             sock_cx + pup_w/2, sock_cy + pup_h/2],
            fill=PUPIL_COLOR,
        )


# ─── Image generators ─────────────────────────────────────────────────────────

def make_icon(size_px: int, ghost_size: float) -> Image.Image:
    """Square icon with dark background and centred ghost."""
    img  = Image.new("RGBA", (size_px, size_px), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_ghost(draw, size_px / 2, size_px / 2, ghost_size)
    return img


def make_splash(width: int, height: int, ghost_size: float) -> Image.Image:
    """
    Splash screen: dark background, ghost centred slightly above the midpoint
    (visually balanced on tall screens).
    """
    img  = Image.new("RGBA", (width, height), BG_COLOR)
    draw = ImageDraw.Draw(img)
    # Shift ghost up by ~5 % of height for optical balance
    cy = height * 0.45
    draw_ghost(draw, width / 2, cy, ghost_size)
    return img


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    project_root = os.path.join(os.path.dirname(__file__), "..")
    assets_dir   = os.path.join(project_root, "assets")
    images_dir   = os.path.join(assets_dir, "images")
    os.makedirs(images_dir, exist_ok=True)

    print("Generating ghost mascot images...")

    # ── App icon: 1024 × 1024  ─────────────────────────────────────────────
    # ghost_size (the `size` prop) chosen so the ghost fills ~60 % of the icon
    # comfortably with padding on all sides.
    icon_ghost_size = 1024 * 0.50   # 512 base units → bodyWidth = 614 px
    icon = make_icon(1024, icon_ghost_size)
    icon_rgb = icon.convert("RGB")
    icon_path = os.path.join(assets_dir, "icon.png")
    icon_rgb.save(icon_path, "PNG")
    print(f"  icon.png saved → {icon_path}")

    # ── Adaptive icon foreground: 1024 × 1024  ────────────────────────────
    # Android clips to a circle/squircle that takes up ~66 % of the canvas,
    # so the safe zone is roughly 660 × 660.  We use the same ghost_size so
    # it sits comfortably inside the safe zone.
    adaptive_ghost_size = 1024 * 0.40   # slightly smaller for Android safe zone
    adaptive = make_icon(1024, adaptive_ghost_size)
    adaptive_path = os.path.join(assets_dir, "adaptive-icon.png")
    adaptive.save(adaptive_path, "PNG")   # keep RGBA for transparent-bg option
    print(f"  adaptive-icon.png saved → {adaptive_path}")

    # ── Splash screen: 1284 × 2778 (iPhone 14 Pro Max)  ──────────────────
    # Expo scales this down; having a large source ensures crisp rendering on
    # any device.
    splash_w, splash_h = 1284, 2778
    splash_ghost_size  = splash_w * 0.45   # ~578 base units, bodyWidth ≈ 694 px
    splash = make_splash(splash_w, splash_h, splash_ghost_size)
    splash_rgb = splash.convert("RGB")
    splash_path = os.path.join(assets_dir, "splash-icon.png")
    splash_rgb.save(splash_path, "PNG")
    print(f"  splash-icon.png saved → {splash_path}")

    # ── images/icon.png (used by some tooling) ────────────────────────────
    icon_img_path = os.path.join(images_dir, "icon.png")
    icon_rgb.save(icon_img_path, "PNG")
    print(f"  images/icon.png saved → {icon_img_path}")

    # ── Favicon: 48 × 48 (web) ────────────────────────────────────────────
    # Transparent background so the ghost floats on the browser tab colour.
    # 85 % fill keeps the ghost large and legible at favicon size while
    # leaving just enough margin that the skirt doesn't clip the canvas edge.
    favicon_size_px    = 48
    favicon_ghost_size = favicon_size_px * 0.85
    # make_icon fills with BG_COLOR; override with a transparent canvas instead.
    favicon = Image.new("RGBA", (favicon_size_px, favicon_size_px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(favicon)
    draw_ghost(draw, favicon_size_px / 2, favicon_size_px / 2, favicon_ghost_size)
    favicon_path = os.path.join(images_dir, "favicon.png")
    favicon.save(favicon_path, "PNG")   # keep RGBA — transparent bg
    print(f"  images/favicon.png saved → {favicon_path}")

    print("\nDone. All assets saved.")
    print("\nColors used:")
    print("  Background : #000000")
    print("  Body       : #FFFFFF")
    print("  Sockets    : #1A1A1A")
    print("  Pupils     : #FE99D9  (brand accent)")


if __name__ == "__main__":
    main()
