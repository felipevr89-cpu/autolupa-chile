#!/usr/bin/env python3
"""Arma hojas de contacto en /tmp/preview/sheet-N.jpg para curaduría visual."""
import json
import os
from PIL import Image, ImageDraw, ImageFont

OUT = "/tmp/preview"
manifest = json.load(open(os.path.join(OUT, "manifest.json")))

CELL_W, CELL_H, LABEL_H = 480, 320, 26
COLS, ROWS = 3, 3
PER = COLS * ROWS

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
except OSError:
    font = ImageFont.load_default()

for idx in range(0, len(manifest), PER):
    chunk = manifest[idx : idx + PER]
    rows = (len(chunk) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * CELL_W, rows * (CELL_H + LABEL_H)), "white")
    draw = ImageDraw.Draw(sheet)
    for pos, (label, name) in enumerate(chunk):
        col, row = pos % COLS, pos // COLS
        x, y = col * CELL_W, row * (CELL_H + LABEL_H)
        img_path = os.path.join(OUT, f"{label}.jpg")
        if os.path.exists(img_path):
            im = Image.open(img_path).convert("RGB")
            im.thumbnail((CELL_W - 8, CELL_H - 8))
            sheet.paste(im, (x + (CELL_W - im.width) // 2, y + (CELL_H - im.height) // 2))
        draw.rectangle([x, y, x + CELL_W - 1, y + CELL_H + LABEL_H - 1], outline="black")
        draw.text((x + 6, y + CELL_H + 4), f"{label}: {name[:58]}", fill="black", font=font)
    out = os.path.join(OUT, f"sheet-{idx // PER + 1}.jpg")
    sheet.save(out, quality=88)
    print(out)
