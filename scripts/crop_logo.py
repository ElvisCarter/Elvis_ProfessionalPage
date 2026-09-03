"""Crop official Elvis S. stacked logo into site asset variants."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw
import numpy as np

SRC = Path(__file__).resolve().parents[1] / "asset" / "Images" / "brand" / "logo-brand-kit.png"
OUT = Path(__file__).resolve().parents[1] / "asset" / "Images" / "brand"

NAVY = (16, 27, 45, 255)  # #101B2D
IVORY = (245, 240, 230, 255)  # #F5F0E6


def content_bbox(img: Image.Image, threshold: float = 0.008) -> tuple[int, int, int, int]:
    arr = np.array(img.convert("RGBA"))
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    bg = (r > 240) & (g > 235) & (b > 230) & (a > 200)
    content = ~bg
    row_density = content.mean(axis=1)
    col_density = content.mean(axis=0)
    rows = np.where(row_density > threshold)[0]
    cols = np.where(col_density > threshold)[0]
    return int(cols[0]), int(rows[0]), int(cols[-1]), int(rows[-1])


def crop_with_padding(img: Image.Image, box: tuple[int, int, int, int], pad: int = 0) -> Image.Image:
    x0, y0, x1, y1 = box
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width - 1, x1 + pad)
    y1 = min(img.height - 1, y1 + pad)
    return img.crop((x0, y0, x1 + 1, y1 + 1))


def find_section_breaks(img: Image.Image) -> list[int]:
    arr = np.array(img.convert("RGBA"))
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    bg = (r > 240) & (g > 235) & (b > 230) & (a > 200)
    row_density = (~bg).mean(axis=1)

    _, y0, _, y1 = content_bbox(img)
    gaps: list[tuple[int, int]] = []
    start = None
    for y in range(y0, y1 + 1):
        if row_density[y] < 0.004:
            if start is None:
                start = y
        elif start is not None:
            if y - start >= 10:
                gaps.append((start, y - 1))
            start = None
    if start is not None and y1 - start >= 10:
        gaps.append((start, y1))

    return [int((a + b) / 2) for a, b in gaps]


def make_mark_transparent(mark: Image.Image) -> Image.Image:
    """Remove cream background; keep navy and copper mark on transparency."""
    arr = np.array(mark.convert("RGBA"), copy=True)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    bg = (r > 240) & (g > 235) & (b > 230) & (a > 200)
    arr[bg] = (0, 0, 0, 0)
    return Image.fromarray(arr)


def tight_mark_crop(img: Image.Image, box: tuple[int, int, int, int], pad: int = 8) -> Image.Image:
    """Crop a region, then trim to non-background pixels."""
    region = img.crop((box[0], box[1], box[2] + 1, box[3] + 1))
    inner = content_bbox(region, threshold=0.01)
    return crop_with_padding(region, inner, pad=pad)


def recolor_mark_for_dark(mark: Image.Image) -> Image.Image:
    """Convert navy mark to ivory mark on transparent."""
    arr = np.array(make_mark_transparent(mark), copy=True)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    visible = a > 40
    dark = visible & ~((r > 150) & (g > 100) & (g < 170) & (b < 140))
    arr[dark, 0] = IVORY[0]
    arr[dark, 1] = IVORY[1]
    arr[dark, 2] = IVORY[2]
    copper = visible & (r > 150) & (g > 100) & (g < 170) & (b < 140)
    arr[copper, 0] = 198
    arr[copper, 1] = 135
    arr[copper, 2] = 103
    return Image.fromarray(arr)


def composite_icon(mark: Image.Image, shape: str, size: int = 512) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    if shape == "circle":
        draw.ellipse((0, 0, size - 1, size - 1), fill=NAVY)
        inset = int(size * 0.18)
    else:
        radius = int(size * 0.22)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=NAVY)
        inset = int(size * 0.16)

    mark_light = recolor_mark_for_dark(mark)
    mark_w = size - inset * 2
    mark_h = mark_w
    mark_resized = mark_light.resize((mark_w, mark_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(mark_resized, (inset, inset))
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    img = Image.open(SRC).convert("RGBA")

    full_box = content_bbox(img)
    full = crop_with_padding(img, full_box, pad=24)
    full.save(OUT / "logo-brand-kit.png")

    breaks = find_section_breaks(img)
    x0, y0, x1, y1 = full_box
    print("breaks:", breaks)

    # Expected layout: mark | name | tagline
    if len(breaks) >= 2:
        mark_end = breaks[0]
        name_end = breaks[1]
    elif len(breaks) == 1:
        mark_end = breaks[0]
        name_end = int(y0 + (y1 - y0) * 0.62)
    else:
        mark_end = int(y0 + (y1 - y0) * 0.42)
        name_end = int(y0 + (y1 - y0) * 0.62)

    mark = tight_mark_crop(img, (x0, y0, x1, mark_end), pad=8)
    lockup = crop_with_padding(img, (x0, y0, x1, name_end), pad=20)
    stacked = crop_with_padding(img, full_box, pad=20)

    mark.save(OUT / "logo-mark-light.png")
    make_mark_transparent(mark).save(OUT / "logo-mark-transparent.png")
    lockup.save(OUT / "logo-lockup-light.png")
    stacked.save(OUT / "logo-lockup-stacked.png")

    mark_light = recolor_mark_for_dark(mark)
    mark_light.save(OUT / "logo-mark-dark.png")

    composite_icon(mark, "circle").save(OUT / "logo-icon-circle.png")
    composite_icon(mark, "squircle").save(OUT / "logo-icon-app.png")

    print("Wrote assets to", OUT)


if __name__ == "__main__":
    main()
