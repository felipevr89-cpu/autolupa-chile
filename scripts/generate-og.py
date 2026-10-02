#!/usr/bin/env python3
"""Genera public/og.png (1200x630) para og:image y twitter:image.

Uso: python3 scripts/generate-og.py
Requiere Pillow. Si cambia el dominio o el nombre del sitio, editar SITE_URL.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
START = (37, 99, 235)   # blue-600 #2563eb
END = (124, 58, 237)    # purple-700 #7c3aed
SITE_URL = "autolupa.pages.dev"
FONT_DIR = "/usr/share/fonts/truetype/inter-zorin-os"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f"{FONT_DIR}/{name}.ttf", size)


def gradient() -> Image.Image:
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        row = tuple(round(START[i] + (END[i] - START[i]) * t) for i in range(3))
        for x in range(W):
            px[x, y] = row
    return img


def main() -> None:
    img = gradient().convert("RGBA")
    draw = ImageDraw.Draw(img)

    cx, cy, radius, stroke = 235, 315, 105, 26
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline="white", width=stroke)
    draw.line([cx + 74, cy + 74, cx + 168, cy + 168], fill="white", width=stroke)
    draw.ellipse([cx - 42, cy - 42, cx + 42, cy + 42], outline="white", width=10)

    x = 480
    draw.text((x, 170), "AutoLupa", font=font("Inter-ExtraBold", 116), fill="white")
    draw.text((x, 334), "Compara, decide y publica gratis", font=font("Inter-Medium", 42), fill=(240, 244, 255, 255))
    draw.text((x, 402), "autos usados y nuevos en Chile", font=font("Inter-Medium", 42), fill=(240, 244, 255, 255))
    draw.text((x, 505), SITE_URL, font=font("Inter-SemiBold", 36), fill=(214, 224, 250, 255))

    img.convert("RGB").save("public/og.png", "PNG", optimize=True)
    print("public/og.png generado", W, "x", H)


if __name__ == "__main__":
    main()
