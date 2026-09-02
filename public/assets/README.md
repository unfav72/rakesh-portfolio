# Assets

Drop files here, then point `src/config/assets.ts` at them. Nothing else needs
to change — every placeholder already holds the exact box its final asset will
occupy, so the layout does not move.

```
public/assets/
  hero-face.png        the illustration inside the word PORTFOLIO
  face/                or, for the full blink rig, four parts on one canvas:
    base.png             head, hair, brows, nose, beard — everything static
    eyes.png             eye whites + irises only
    lids.png             the closed-eye shape, drawn over eyes.png
    mouth.png            neutral mouth only
  videos/
    frame-artwork.mp4         section 02, the moving plate
    frame-artwork-poster.jpg  its first frame, shown while the clip loads
  name-cutout.webp     section 03, transparent; the red edge is generated from
                       its alpha. Rebuild with tools/extract-cutout.py
  avatar.webp          the contact note, square, rendered as a circle
  signature.*          the footer sign-off — a scan or SVG of the real thing,
                       ideally black on white with the paper cropped tight
  skills/              the six logos. Each keeps its own background
                       treatment; originals are in reference/skills-source/
  projects/            studio-01..03.webp — THE STU photographs, listed in
                       assets.studio. Later, SELECTED WORK too
```

Sizes and reasoning are in the root `README.md`.
