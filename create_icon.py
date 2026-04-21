"""
Generate Typist.icns — blue T on black background.
Run with: python create_icon.py
"""
import os
import shutil
from PIL import Image, ImageDraw, ImageFont

SIZE = 1024
BG   = (0, 0, 0, 255)
FG   = (30, 120, 255, 255)   # electric blue matching --accent


def make_icon(size: int) -> Image.Image:
    img  = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    # Rounded-rect background (full bleed, corners ~18% of size)
    r = int(size * 0.18)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)

    # Draw "T" with Pillow's built-in font at large size, then scale
    # We'll draw it as two rectangles: horizontal bar + vertical stem
    pad   = int(size * 0.15)
    bar_h = int(size * 0.13)   # thickness of horizontal bar
    stem_w = int(size * 0.18)  # thickness of vertical stem

    # Horizontal bar
    draw.rectangle(
        [pad, pad, size - pad, pad + bar_h],
        fill=FG,
    )
    # Vertical stem — centered, from top bar down to bottom pad
    stem_x = (size - stem_w) // 2
    draw.rectangle(
        [stem_x, pad, stem_x + stem_w, size - pad],
        fill=FG,
    )

    return img


def build_icns(out_path: str) -> None:
    iconset = out_path.replace(".icns", ".iconset")
    os.makedirs(iconset, exist_ok=True)

    specs = [
        (16,   "icon_16x16.png"),
        (32,   "icon_16x16@2x.png"),
        (32,   "icon_32x32.png"),
        (64,   "icon_32x32@2x.png"),
        (128,  "icon_128x128.png"),
        (256,  "icon_128x128@2x.png"),
        (256,  "icon_256x256.png"),
        (512,  "icon_256x256@2x.png"),
        (512,  "icon_512x512.png"),
        (1024, "icon_512x512@2x.png"),
    ]

    base = make_icon(SIZE)
    for px, fname in specs:
        resized = base.resize((px, px), Image.LANCZOS)
        resized.save(os.path.join(iconset, fname))
        print(f"  {px}×{px}  →  {fname}")

    os.system(f'iconutil -c icns "{iconset}" -o "{out_path}"')
    shutil.rmtree(iconset)
    print(f"\nIcon saved → {out_path}")


if __name__ == "__main__":
    os.makedirs("assets", exist_ok=True)
    build_icns("assets/icon.icns")
