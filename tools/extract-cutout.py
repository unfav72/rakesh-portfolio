"""
Pull the portrait off its studio backdrop into a transparent cut-out.

Re-runnable: reads the original JPEG, writes public/assets/name-cutout.webp.
The source is never modified.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os, sys
from collections import deque

SRC = 'reference/portrait-cutout-source.jpg'
OUT = 'public/assets/name-cutout.webp'
BACKDROP = np.array([236.0, 229.0, 222.0])

src = Image.open(SRC).convert('RGB')
W, H = src.size
C = np.array(src).astype(np.float32)
SENT = (255, 0, 255)

def dil(m, r):
    for _ in range(r):
        o = m.copy()
        o[1:, :] |= m[:-1, :]; o[:-1, :] |= m[1:, :]
        o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
        m = o
    return m
def ero(m, r): return ~dil(~m, r)

# 1 ── Dense border seeding at a LOW threshold. Each region floods against its
#      own local tone, so no single global tolerance has to be wide enough to
#      also swallow the white shirt — which is chromatically closer to the
#      backdrop than to anything else in the picture.
f = src.copy(); px = f.load()
seeds = []
for x in range(2, W - 2, 24): seeds += [(x, 2), (x, H - 3)]
for y in range(2, H - 2, 24): seeds += [(2, y), (W - 3, y)]
for s in seeds:
    c = px[s]
    if c == SENT: continue
    if abs(c[0]-236) + abs(c[1]-229) + abs(c[2]-222) > 70: continue
    ImageDraw.floodfill(f, s, SENT, thresh=18)
bg = np.all(np.array(f) == np.array(SENT), axis=2)

# 2 ── The wall edge behind him is a shadow line, mid-toned rather than pale,
#      and the flood misses it. Catch anything backdrop-ish that is NOT deep
#      inside the subject.
#
#      Both numbers are load-bearing and were swept, not guessed. 105 is wide
#      enough to include that shadow (152,138,129) and still nowhere near the
#      darkest skin. 40 is the distance that reaches the patch where the wall
#      meets his arm — at 10 it left 2,022 stray pixels printing as a white
#      stripe. The shirt is backdrop-ish too, but it sits ~150px from any
#      backdrop, so depth protects it where colour cannot: widening the guard
#      from 10 to 40 costs it 1% and clears the artefact completely.
#      The saturation guard is what makes 105 safe. At that distance the test
#      alone also catches lit skin near the silhouette edge, which punched
#      holes in his jaw — and since the die-cut is generated from the alpha,
#      each hole printed as a red squiggle on his face. The backdrop and that
#      wall shadow are both neutral (max-min of 14 and 23); skin is not (60+).
neutral = (C.max(2) - C.min(2)) < 30
pale = (np.abs(C - BACKDROP).max(2) < 105) & neutral
bg = bg | (pale & ~ero(~bg, 40))

# 3 ── A real matte: hard outside, hard inside, a ramp in the band between.
inner, outer = ero(~bg, 4), dil(~bg, 2)
band = outer & ~inner
dist = np.abs(C - BACKDROP).max(2)
alpha = np.where(inner, 1.0, 0.0)
alpha[band] = np.clip(dist[band] / 150.0, 0.0, 1.0)
alpha[~outer] = 0.0
alpha = np.array(
    Image.fromarray((alpha * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(0.7))
).astype(np.float32) / 255.0

# 4 ── Keep the body only.
#
#      Threshold tuning could not remove the last artefact: a vertical wall
#      edge behind his shoulder, mid-toned enough to survive every colour test
#      and touching his arm near the bottom of the frame, so it also survived a
#      largest-component pass. It printed as a white stripe beside him.
#
#      The depth guard in step 2 turned out to be what actually removes it, so
#      this pass is now only a despeckler: it drops runs of a few pixels and
#      nothing else. It was briefly set much stricter, which cleared the wall
#      but also sliced horizontal notches out of the hair — the strands on the
#      outside of a curl are exactly the short runs it was throwing away.
solid = alpha > 0.1
keep = np.zeros_like(solid)
for y in range(H):
    row = solid[y]
    if not row.any(): continue
    edges = np.flatnonzero(np.diff(np.concatenate(([0], row.view(np.int8), [0]))))
    starts, ends = edges[0::2], edges[1::2]
    lengths = ends - starts
    longest = lengths.max()
    for st, en, ln in zip(starts, ends, lengths):
        if ln >= max(0.02 * longest, 4):
            keep[y, st:en] = True
print(f'body {int(keep.sum())} px; dropped {int(solid.sum() - keep.sum())} px of stray runs')
alpha = np.where(keep, alpha, 0.0)

# 4b ── Fill enclosed gaps. Any transparent island the border cannot reach is a
#       hole in him — and because the die-cut edge is generated FROM the alpha,
#       every hole becomes a stripe of red printed across his shoulder.
holes = alpha < 0.35
seen = np.zeros_like(holes)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if holes[y, x] and not seen[y, x]:
            seen[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if holes[y, x] and not seen[y, x]:
            seen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
        if 0 <= ny < H and 0 <= nx < W and holes[ny, nx] and not seen[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
enclosed = holes & ~seen
print(f'filled {int(enclosed.sum())} enclosed px')
alpha = np.where(enclosed, 1.0, alpha)

# 5 ── Despill. Un-premultiply the soft edge against the backdrop it was shot
#      on, or every one of those pixels keeps a cream halo on black.
a3 = np.dstack([alpha] * 3)
F = np.clip(np.where(a3 > 0.02, (C - (1.0 - a3) * BACKDROP) / np.maximum(a3, 0.02), C), 0, 255)

img = Image.fromarray(np.dstack([F, alpha * 255]).astype(np.uint8), 'RGBA')
img = img.crop(img.split()[3].getbbox())
img.save(OUT, quality=90, method=6)
print(f'{OUT}  {img.size}  aspect {img.width/img.height:.3f}  {os.path.getsize(OUT)//1024} KB')

if '--preview' in sys.argv:
    card = Image.new('RGBA', img.size, (20, 21, 20, 255)); card.alpha_composite(img)
    card.convert('RGB').resize((img.width // 2, img.height // 2), Image.LANCZOS).save('tools/out/cutout-final.png')
