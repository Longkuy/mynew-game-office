#!/usr/bin/env python3
"""
AI Keyframe SpriteSheet Auto-Slicer & Pivot-Aligner (Method 3 Pipeline)
-----------------------------------------------------------------------
Takes a raw AI-generated 2x8 SpriteSheet on a flat chroma background (e.g. pastel green),
removes the background cleanly with fringe suppression, detects each of the 16 sprites,
aligns every frame by bottom-center foot pivot onto a crisp uniform grid, and exports:
  1. Transparent RGBA production PNG SpriteSheet (3 rows: walk[8], idle[4], run[4])
  2. Engine-ready .atlas.json (Godot / Unity / Phaser / HTML5 Canvas)
"""
import argparse
import json
from collections import deque
from pathlib import Path
from PIL import Image


def is_bg_pixel(r: int, g: int, b: int, bg_rgb: tuple[int, int, int], tol: int = 58) -> bool:
    dr = r - bg_rgb[0]
    dg = g - bg_rgb[1]
    db = b - bg_rgb[2]
    dist_sq = dr * dr + dg * dg + db * db
    if dist_sq <= tol * tol:
        return True
    # Also catch greenish anti-aliased halo pixels adjacent to pastel green bg
    if g > r + 18 and g > b + 14 and g > 140:
        return True
    return False


def remove_background_floodfill(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()

    # Sample background color from the 4 corners
    corners = [px[2, 2][:3], px[w - 3, 2][:3], px[2, h - 3][:3], px[w - 3, h - 3][:3]]
    bg_rgb = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    visited = bytearray(w * h)
    q = deque()

    # Seed from all border pixels
    for x in range(w):
        for y in (0, h - 1):
            idx = y * w + x
            if not visited[idx]:
                r, g, b, _ = px[x, y]
                if is_bg_pixel(r, g, b, bg_rgb, tol=64):
                    visited[idx] = 1
                    q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            idx = y * w + x
            if not visited[idx]:
                r, g, b, _ = px[x, y]
                if is_bg_pixel(r, g, b, bg_rgb, tol=64):
                    visited[idx] = 1
                    q.append((x, y))

    # BFS flood fill for outer background
    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not visited[nidx]:
                    r, g, b, _ = px[nx, ny]
                    if is_bg_pixel(r, g, b, bg_rgb, tol=62):
                        visited[nidx] = 1
                        q.append((nx, ny))

    # Also clear trapped interior background pockets (e.g., between legs / arms)
    # using a stricter color match so we never touch character colors
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and is_bg_pixel(r, g, b, bg_rgb, tol=36):
                px[x, y] = (0, 0, 0, 0)

    # Despill 1px fringe adjacent to transparent pixels
    alpha_copy = [px[x, y][3] for y in range(h) for x in range(w)]
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            has_trans_neighbor = (
                alpha_copy[(y - 1) * w + x] == 0
                or alpha_copy[(y + 1) * w + x] == 0
                or alpha_copy[y * w + (x - 1)] == 0
                or alpha_copy[y * w + (x + 1)] == 0
            )
            if has_trans_neighbor and g > r + 10 and g > b + 8:
                # If very bright/greenish fringe, drop it; otherwise clamp green channel
                if g > 170 and r > 120:
                    px[x, y] = (0, 0, 0, 0)
                else:
                    px[x, y] = (r, min(g, max(r, b)), b, a)

    return rgba


def find_intervals(proj: list[int], min_val: int = 3, min_gap: int = 4) -> list[tuple[int, int]]:
    intervals = []
    in_seg = False
    start = 0
    for i, v in enumerate(proj):
        if v >= min_val and not in_seg:
            start = i
            in_seg = True
        elif v < min_val and in_seg:
            intervals.append((start, i - 1))
            in_seg = False
    if in_seg:
        intervals.append((start, len(proj) - 1))

    # Merge tiny gaps
    merged = []
    for s, e in intervals:
        if merged and s - merged[-1][1] <= min_gap:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    return merged


def slice_sprites(rgba: Image.Image, expected_rows: int = 2, expected_cols: int = 8) -> list[list[Image.Image]]:
    w, h = rgba.size
    px = rgba.load()

    # Horizontal projection to find rows
    row_proj = [sum(1 for x in range(w) if px[x, y][3] > 20) for y in range(h)]
    row_bands = [b for b in find_intervals(row_proj, min_val=10, min_gap=8) if (b[1] - b[0]) > h * 0.12]
    if len(row_bands) != expected_rows:
        band_h = h // expected_rows
        row_bands = [(r * band_h, (r + 1) * band_h - 1) for r in range(expected_rows)]

    grid = []
    for ry0, ry1 in row_bands:
        col_proj = [sum(1 for y in range(ry0, ry1 + 1) if px[x, y][3] > 20) for x in range(w)]
        # Use min_gap=1 so tightly spaced sprites remain distinct
        col_bands = [b for b in find_intervals(col_proj, min_val=2, min_gap=1) if (b[1] - b[0]) > w * 0.03]

        # If two sprites touched slightly and merged into one wide band, split the widest band at its minimum valley
        while len(col_bands) < expected_cols and col_bands:
            idx = max(range(len(col_bands)), key=lambda i: col_bands[i][1] - col_bands[i][0])
            s, e = col_bands[idx]
            margin = max(10, (e - s) // 4)
            if e - s < 2 * margin + 2:
                break
            split_x = min(range(s + margin, e - margin + 1), key=lambda x: col_proj[x])
            col_bands[idx:idx + 1] = [(s, split_x - 1), (split_x + 1, e)]

        # If tiny noise islands exist, keep the top expected_cols widest bands sorted left-to-right
        if len(col_bands) > expected_cols:
            col_bands = sorted(col_bands, key=lambda b: b[1] - b[0], reverse=True)[:expected_cols]
            col_bands.sort(key=lambda b: b[0])

        row_sprites = []
        for cx0, cx1 in col_bands:
            crop = rgba.crop((cx0, ry0, cx1 + 1, ry1 + 1))
            bbox = crop.getbbox()
            if bbox:
                crop = crop.crop(bbox)
            row_sprites.append(crop)
        grid.append(row_sprites)

    return grid


def align_and_pack(
    grid: list[list[Image.Image]],
    frame_w: int = 128,
    frame_h: int = 160,
    foot_margin: int = 6,
) -> tuple[Image.Image, dict]:
    """
    Packs 2x8 AI grid into a clean 3-row production sheet:
      Row 0: walk (8 frames)
      Row 1: idle (4 frames)
      Row 2: run  (4 frames)
    All frames normalized to identical character height and bottom-center foot pivot.
    """
    walk_frames = grid[0][:8]
    idle_frames = grid[1][:4]
    run_frames = grid[1][4:8]

    all_frames = walk_frames + idle_frames + run_frames
    # Use median height as reference scale so breathing/bobbing stays natural while all frames fit cleanly
    heights = sorted(im.height for im in all_frames)
    ref_h = heights[len(heights) // 2]
    target_char_h = frame_h - foot_margin - 10
    scale = target_char_h / max(1, ref_h)

    # Also ensure widest sprite fits inside frame_w - 8
    max_w = max(im.width for im in all_frames)
    if max_w * scale > frame_w - 8:
        scale = (frame_w - 8) / max_w

    rows_spec = [
        ("walk", walk_frames, 10),
        ("idle", idle_frames, 6),
        ("run", run_frames, 12),
    ]

    cols = max(len(frames) for _, frames, _ in rows_spec)
    sheet = Image.new("RGBA", (frame_w * cols, frame_h * len(rows_spec)), (0, 0, 0, 0))

    atlas = {
        "meta": {
            "style": "Faye Anime Pixel Art (Method 3 AI Keyframe + Pivot-Aligned)",
            "frameWidth": frame_w,
            "frameHeight": frame_h,
            "columns": cols,
            "rows": len(rows_spec),
            "sheetWidth": frame_w * cols,
            "sheetHeight": frame_h * len(rows_spec),
            "pivot": {"x": 0.5, "y": round(1.0 - foot_margin / frame_h, 3)},
            "recommendedGameLoopFps": 60,
        },
        "animations": {},
    }

    for row_idx, (anim_name, frames, rec_fps) in enumerate(rows_spec):
        anim_frames_meta = []
        for col_idx, im in enumerate(frames):
            nw = max(1, round(im.width * scale))
            nh = max(1, round(im.height * scale))
            resized = im.resize((nw, nh), Image.Resampling.NEAREST)

            # Bottom-center foot pivot alignment
            ox = col_idx * frame_w + (frame_w - nw) // 2
            oy = row_idx * frame_h + (frame_h - foot_margin - nh)
            sheet.paste(resized, (ox, oy), resized)

            anim_frames_meta.append({
                "index": col_idx,
                "x": col_idx * frame_w,
                "y": row_idx * frame_h,
                "w": frame_w,
                "h": frame_h,
            })

        atlas["animations"][anim_name] = {
            "row": row_idx,
            "frameCount": len(frames),
            "recommendedFps": rec_fps,
            "loop": True,
            "frames": anim_frames_meta,
        }

    return sheet, atlas


def main():
    parser = argparse.ArgumentParser(description="Slice & align AI 2x8 spritesheet into transparent game-ready PNG + JSON.")
    parser.add_argument("input", help="Path to raw AI spritesheet image")
    parser.add_argument("--out-png", required=True, help="Output transparent PNG spritesheet path")
    parser.add_argument("--out-json", required=True, help="Output JSON atlas path")
    parser.add_argument("--frame-w", type=int, default=128)
    parser.add_argument("--frame-h", type=int, default=160)
    args = parser.parse_args()

    raw = Image.open(args.input)
    rgba = remove_background_floodfill(raw)
    grid = slice_sprites(rgba, expected_rows=2, expected_cols=8)
    sheet, atlas = align_and_pack(grid, frame_w=args.frame_w, frame_h=args.frame_h)

    out_png = Path(args.out_png)
    out_json = Path(args.out_json)
    out_png.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_png, "PNG")
    out_json.write_text(json.dumps(atlas, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps({
        "ok": True,
        "out_png": str(out_png),
        "out_json": str(out_json),
        "sheetSize": [sheet.width, sheet.height],
        "frameSize": [args.frame_w, args.frame_h],
        "detectedRows": [len(r) for r in grid],
    }, indent=2))


if __name__ == "__main__":
    main()
