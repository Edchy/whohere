#!/usr/bin/env python3
"""
Generate app icon, adaptive icon, splash screen, and favicon PNGs
from assets/groovy.svg.

Requirements:
    pip install cairosvg pillow

Usage:
    python scripts/generate-icon.py

Output files (all written to assets/):
    icon.png           — 1024x1024, transparent bg, white emoji
    adaptive-icon.png  — 1024x1024, transparent bg, white emoji (Android)
    splash-icon.png    — 1284x2778, #111111 bg, white emoji centred
    splash-icon-light.png — 1284x2778, #F2EEE9 bg, dark emoji centred
    images/favicon.png — 48x48, transparent bg, white emoji
"""

import io
import os
import sys
import xml.etree.ElementTree as ET

try:
    import cairosvg
except ImportError:
    print("ERROR: cairosvg is not installed.")
    print("Run: pip install cairosvg")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is not installed.")
    print("Run: pip install pillow")
    sys.exit(1)

PROJECT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SOURCE_SVG   = os.path.join(PROJECT_ROOT, "assets", "groovy.svg")


def load_svg_paths() -> str:
    """Return the inner SVG content (all <path> elements) from groovy.svg."""
    tree = ET.parse(SOURCE_SVG)
    root = tree.getroot()
    ns = {"svg": "http://www.w3.org/2000/svg"}
    paths = root.findall(".//svg:path", ns) or root.findall(".//path")
    return "".join(ET.tostring(p, encoding="unicode") for p in paths)


def make_svg(bg_color: str | None, fill: str) -> str:
    """
    Build a coloured SVG from the groovy.svg paths.
    bg_color: hex string or None for transparent.
    fill:     hex fill colour for the emoji paths.
    """
    paths_xml = load_svg_paths()

    # Override fill on every path
    # ET gives us fill="" or nothing; inject fill attribute via string replace
    # on the rendered path tags. Simpler: wrap in a <g fill=...>.
    bg_rect = f'<rect width="1200" height="1200" fill="{bg_color}"/>' if bg_color else ""

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 1200 1200" width="1200" height="1200">'
        f'{bg_rect}'
        f'<g fill="{fill}">'
        f'{paths_xml}'
        f'</g>'
        f'</svg>'
    )


def svg_to_png(svg: str, width: int, height: int) -> bytes:
    return cairosvg.svg2png(
        bytestring=svg.encode("utf-8"),
        output_width=width,
        output_height=height,
    )


def save_png(png_bytes: bytes, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png_bytes)
    print(f"  saved → {path}")


def main() -> None:
    assets_dir = os.path.join(PROJECT_ROOT, "assets")
    images_dir = os.path.join(assets_dir, "images")

    print("Generating GroovyEmoji app assets from groovy.svg...")

    # ── icon.png — 1024x1024, dark bg, white emoji ────────────────────────
    # iOS App Store requires opaque icons; transparent is not allowed.
    svg = make_svg(bg_color="#111111", fill="#ffffff")
    save_png(svg_to_png(svg, 1024, 1024), os.path.join(assets_dir, "icon.png"))

    # ── adaptive-icon.png — 1024x1024, transparent bg ─────────────────────
    # Android composites the foreground over its own adaptive bg, so transparent is correct.
    svg_transparent = make_svg(bg_color=None, fill="#ffffff")
    save_png(svg_to_png(svg_transparent, 1024, 1024), os.path.join(assets_dir, "adaptive-icon.png"))

    # ── splash-icon.png — 1284x2778, dark mode (#111111) ──────────────────
    splash_w, splash_h = 1284, 2778
    icon_size = 800  # emoji rendered at this px, centred on the tall canvas

    svg_dark  = make_svg(bg_color=None, fill="#ffffff")
    img_dark  = Image.open(io.BytesIO(svg_to_png(svg_dark, icon_size, icon_size))).convert("RGBA")
    canvas    = Image.new("RGBA", (splash_w, splash_h), (17, 17, 17, 255))
    px = (splash_w - icon_size) // 2
    py = (splash_h - icon_size) // 2 - int(splash_h * 0.04)  # slight upward optical shift
    canvas.paste(img_dark, (px, py), img_dark)
    canvas.convert("RGB").save(os.path.join(assets_dir, "splash-icon.png"), "PNG")
    print(f"  saved → {os.path.join(assets_dir, 'splash-icon.png')}")

    # ── splash-icon-light.png — 1284x2778, light mode (#F2EEE9) ──────────
    svg_light  = make_svg(bg_color=None, fill="#111111")
    img_light  = Image.open(io.BytesIO(svg_to_png(svg_light, icon_size, icon_size))).convert("RGBA")
    canvas_l   = Image.new("RGBA", (splash_w, splash_h), (242, 238, 233, 255))
    canvas_l.paste(img_light, (px, py), img_light)
    canvas_l.convert("RGB").save(os.path.join(assets_dir, "splash-icon-light.png"), "PNG")
    print(f"  saved → {os.path.join(assets_dir, 'splash-icon-light.png')}")

    # ── images/favicon.png — 48x48, transparent bg ────────────────────────
    svg = make_svg(bg_color=None, fill="#ffffff")
    save_png(svg_to_png(svg, 48, 48), os.path.join(images_dir, "favicon.png"))

    print("\nDone.")


if __name__ == "__main__":
    main()
