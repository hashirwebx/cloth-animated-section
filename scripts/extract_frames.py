#!/usr/bin/env python3
"""Turn video -> trimmed, alpha WebP frame sequence + manifest entry.
Usage: python scripts/extract_frames.py clip.mp4 --slug ashfall-crewneck [--mirror] [--height 960]
Needs: pip install opencv-python-headless pillow numpy
"""
import argparse, json, pathlib
import cv2, numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("--slug", required=True)
ap.add_argument("--height", type=int, default=960)
ap.add_argument("--settle", type=float, default=1.8, help="mean abs diff to final frame that counts as settled")
ap.add_argument("--mirror", action="store_true", help="clip turns the wrong way: flip, blend into true final")
a = ap.parse_args()

cap = cv2.VideoCapture(a.video); frames = []
while True:
    ok, f = cap.read()
    if not ok: break
    frames.append(f)
last = frames[-1].astype(np.float32)

# 1. trim: first moving frame -> first settled frame (compared to the final frame)
first = frames[0].astype(np.float32)
start = next((i for i, f in enumerate(frames) if np.abs(f.astype(np.float32) - first).mean() > 0.6), 0)
start = max(0, start - 1)
end = next((i for i, f in enumerate(frames) if np.abs(f.astype(np.float32) - last).mean() < a.settle), len(frames) - 1)
kept = frames[start:end + 1]

# 2. optional mirror, blended into the TRUE (unmirrored) final over last 6 frames
if a.mirror:
    n = len(kept); true_final = kept[-1]
    kept = [cv2.flip(f, 1) for f in kept]
    for k in range(6):
        i = n - 6 + k; t = (k + 1) / 6
        kept[i] = cv2.addWeighted(kept[i], 1 - t, true_final, t, 0)

# 3. white -> real alpha (no multiply needed, works on dark themes)
def to_rgba(bgr):
    mn = bgr.min(axis=2)
    bg = (mn >= 236).astype(np.uint8)
    _, lab = cv2.connectedComponents(bg)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgm = np.isin(lab, list(border)).astype(np.uint8)
    band = (cv2.dilate(bgm, np.ones((5, 5), np.uint8)) > 0) & (bgm == 0)
    alpha = np.where(bgm == 1, 0, 255).astype(np.float32)
    soft = np.clip((255 - mn.astype(np.float32)) / (255 - 60), 0, 1) * 255
    alpha[band] = soft[band]
    rgb = bgr[..., ::-1].astype(np.float32)
    al = np.maximum(alpha[..., None] / 255, 1e-3)
    de = np.clip((rgb - (1 - al) * 255) / al, 0, 255)
    rgb = np.where(band[..., None], de, rgb)
    return np.dstack([rgb, alpha]).astype(np.uint8)

rgba = [to_rgba(f) for f in kept]
ys = [np.where(r[..., 3] > 8)[0] for r in rgba]; xs = [np.where(r[..., 3] > 8)[1] for r in rgba]
y0, y1 = min(y.min() for y in ys), max(y.max() for y in ys)
x0, x1 = min(x.min() for x in xs), max(x.max() for x in xs)
h = y1 - y0 + 1; w = x1 - x0 + 1
W = round(w * a.height / h)

out = pathlib.Path("public/rack") / a.slug; out.mkdir(parents=True, exist_ok=True)
for old in out.glob("*.webp"): old.unlink()
for i, r in enumerate(rgba, 1):
    im = Image.fromarray(r[y0:y1 + 1, x0:x1 + 1], "RGBA").resize((W, a.height), Image.LANCZOS)
    im.save(out / f"{i:03d}.webp", "WEBP", quality=82, method=6)

mp = pathlib.Path("src/data/manifest.json")
m = json.loads(mp.read_text()) if mp.exists() else {}
m[a.slug] = {"dir": f"/rack/{a.slug}", "count": len(rgba), "width": W, "height": a.height}
mp.write_text(json.dumps(m, indent=2))
touched = [i for i, r in enumerate(rgba) if r[:, 0, 3].max() > 8 or r[:, -1, 3].max() > 8]
print(f"source={len(frames)} kept={len(rgba)} (frames {start+1}-{end+1}) size={W}x{a.height}")
print(f"WARNING: garment touches the video edge in {len(touched)} frames (cropped sleeves)" if touched else "edges clean")
