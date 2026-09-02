/**
 * ---------------------------------------------------------------------------
 * ASSET REGISTRY
 * ---------------------------------------------------------------------------
 * One place to swap placeholders for finals. Every entry is `null` today; the
 * component that consumes it already reserves the exact box the real asset
 * will occupy, so setting a path here changes pixels, never layout.
 *
 *   1. Drop the file into /public/assets/…
 *   2. Set the path below.
 *   3. Done. No component edits, no reflow.
 * ---------------------------------------------------------------------------
 */

export const assets = {
  /**
   * Hero face illustration living inside the word PORTFOLIO.
   *
   * `layers` is the preferred hand-off: export the illustration as four
   * transparent PNG/SVGs sharing ONE canvas (same width/height, nothing
   * re-cropped) and the blink / smile / eye-dart rig drives them directly.
   *
   *   base   — head, hair, brows, nose, beard. Everything that never moves.
   *   eyes   — the eye whites + irises only.
   *   lids   — the eyelid shape used for the blink (drawn over `eyes`).
   *   mouth  — neutral mouth only; the smile is a transform of this layer.
   *
   * `flat` is the fallback: a single image. It renders perfectly but can only
   * breathe (micro parallax + drift) — it cannot blink.
   */
  heroFace: {
    flat: null as string | null,
    layers: null as { base: string; eyes: string; lids: string; mouth: string } | null,
  },

  /**
   * Section 02, left frame.
   *
   * A video wins over a still; the frame's geometry comes from tokens.ts
   * either way, so swapping between them moves nothing on the page. To change
   * the artwork later, change `video` (and regenerate `poster` from its first
   * frame) — nothing else on the site refers to the file.
   *
   * The current clip is 720 x 1280 and the frame is 144 : 335, so `cover`
   * trims about 12% off each side — empty backdrop either side of the figure,
   * and the full head-to-feet height is kept.
   */
  frame: {
    video: '/assets/videos/frame-artwork.mp4' as string | null,
    poster: '/assets/videos/frame-artwork-poster.png' as string | null,
    image: null as string | null,
    fit: 'cover' as 'cover' | 'contain',
    /** The figure drifts between 50% and 56% across the clip. */
    position: '52% 50%',
    /**
     * The luminance band over which the clip's own backdrop dissolves into the
     * paper, so the page's real ruling and creases show through around the
     * figure instead of a video rectangle.
     *
     * Measured off this footage, not guessed: skin peaks at 0.567 and the
     * darkest backdrop is 0.782, which leaves a wide, safe gap. Re-measure if
     * you change the clip — sample the brightest part of the subject and the
     * darkest part of its background, and put the band between them. Set to
     * `null` for footage that already carries an alpha channel.
     */
    key: { low: 0.62, high: 0.78 } as { low: number; high: number } | null,
  },

  /**
   * Cut-out bust for the black strip, standing in front of the moving type.
   *
   * Supply a transparent PNG — the surroundings must be transparent, not
   * white, or the letters will be covered by a rectangle instead of passing
   * behind the body.
   *
   * `sticker` generates the reference's red die-cut edge from the image's own
   * alpha. Turn it off if the artwork you supply already carries its own
   * outline or red treatment, so it does not get a second one.
   */
  nameCutout: {
    src: '/assets/name-cutout.png' as string | null,
    /**
     * The asset's own pixel size, so the box is reserved before the file
     * arrives. Without it a lazily-loaded `h-auto` image deadlocks: no
     * reserved height means the browser never counts it as near the viewport,
     * so it never loads, so it never gets a height. `tools/extract-cutout.py`
     * prints these on every run.
     */
    width: 1076,
    height: 1121,
    sticker: true,
  },

  /**
   * Small round avatar inside the floating contact note.
   *
   * Cropped from the same studio portrait the section-03 cut-out came from —
   * head centred, a little wider than the skull so the face still reads at
   * 48px. The original backdrop is kept rather than the transparent cut-out:
   * inside a 48px circle a floating head on a beige disc reads as a mistake,
   * a photograph reads as a photograph.
   */
  avatar: '/assets/avatar.png' as string | null,

  /**
   * THE STU — three photographs, left to right. Drop files into
   * /public/assets/projects/ and list them here.
   *
   * The Polaroid geometry is fixed by the card, not by the image: 1.24
   * landscape, cropped with object-fit: cover. Nudge `objectPosition` in
   * site.studio.items if a subject sits off centre.
   */
  studio: [
    '/assets/projects/studio-01.webp',
    '/assets/projects/studio-02.webp',
    '/assets/projects/studio-03.webp',
  ] as (string | null)[],

  /**
   * Signature graphic for the footer — the designer signing the last page.
   * Until it arrives, the name is set in the hand font with a red tick, so
   * the page is already signed and the slot already has its place.
   */
  signature: null as string | null,
} as const
