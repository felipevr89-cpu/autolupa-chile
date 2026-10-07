from os import path
from PIL import Image, ImageDraw

ROOT = path.join(path.dirname(path.abspath(__file__)), '..')
PUBLIC = path.join(ROOT, 'public')
SUPERSAMPLE = 4
TOP_LEFT = (37, 99, 235)
BOTTOM_RIGHT = (124, 58, 237)


def gradient(size):
    base = Image.new('RGB', (512, 512))
    pixels = []
    for y in range(512):
        for x in range(512):
            t = ((x / 511) + (y / 511)) / 2
            pixels.append(tuple(int(TOP_LEFT[i] + (BOTTOM_RIGHT[i] - TOP_LEFT[i]) * t) for i in range(3)))
    base.putdata(pixels)
    return base.resize((size, size), Image.LANCZOS)


def glyphs(scale):
    side = int(scale * 100)
    layer = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    ring = round(25 * scale)
    stroke = max(1, round(6 * scale))
    draw.ellipse([42 * scale - ring, 42 * scale - ring, 42 * scale + ring, 42 * scale + ring],
                 outline=(255, 255, 255, 255), width=stroke)
    draw.line([(58 * scale, 58 * scale), (78 * scale, 78 * scale)], fill=(255, 255, 255, 255), width=stroke)
    for point in (58, 78):
        cap = 3 * scale
        draw.ellipse([point * scale - cap, point * scale - cap, point * scale + cap, point * scale + cap],
                     fill=(255, 255, 255, 255))
    inner = round(11.5 * scale)
    inner_stroke = max(1, round(3 * scale))
    draw.ellipse([42 * scale - inner, 42 * scale - inner, 42 * scale + inner, 42 * scale + inner],
                 outline=(255, 255, 255, 128), width=inner_stroke)
    return layer


def build(size, rounded):
    big = size * SUPERSAMPLE
    background = gradient(big).convert('RGBA')
    if rounded:
        mask = Image.new('L', (big, big), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, big - 1, big - 1], radius=int(big * 0.2), fill=255)
        background.putalpha(mask)
    icon = Image.alpha_composite(background, glyphs(big / 100))
    return icon.resize((size, size), Image.LANCZOS)


build(180, False).save(path.join(PUBLIC, 'apple-touch-icon.png'))
build(192, True).save(path.join(PUBLIC, 'icon-192.png'))
build(512, True).save(path.join(PUBLIC, 'icon-512.png'))
print('iconos generados: apple-touch-icon.png (180), icon-192.png, icon-512.png')
