/**
 * ---------------------------------------------------------------------------
 * GEOMETRY TOKENS — measured off the reference artwork, not estimated
 * ---------------------------------------------------------------------------
 * The reference hero is 1397px wide. Every number below was read out of it by
 * scanning the actual ink:
 *
 *   PORTFOLIO   ink 159 → 1242 (1083 wide = 77.5% of viewport)
 *   cap height  101px, baseline y 433, cap top y 333
 *   face ink    x 760 → 969 (210), y 266 → 478 (213) — very nearly square
 *   the gap it sits in, F's ink to L's ink: 193px
 *   eyebrow     cap 20px, baseline y 319 — 14px above the word's cap line
 *   2026        cap 31px, and its cap TOP aligns with the eyebrow's, which is
 *               why it hangs lower than it
 *
 * Ratios, not pixels: everything is stated against the display font-size in
 * em, so the lock-up scales as one drawn object and the face cannot come
 * loose from the word at any viewport or any final asset size.
 *
 * Type was then matched to those ratios rather than eyeballed. Archivo at
 * width 118% with -0.02em tracking gives ink-span ÷ cap-height = 10.725; the
 * reference measures 10.723.
 * ---------------------------------------------------------------------------
 */

/** Archivo: cap height as a fraction of the em. Measured, not assumed. */
export const CAP = 0.69

export const hero = {
  /**
   * Solved, not chosen: ink span is 7.400 x font-size at this width and
   * tracking, and the reference gives the word 77.5% of the viewport, so
   * 0.775 / 7.400 = 10.47vw. Applied by `.lockup` in globals.css, which owns
   * it because it changes at the 768px breakpoint.
   */
  displayStretch: '118%',
  displayTracking: '-0.02em',

  face: {
    /** Width of the hole in the word — F's ink to L's ink, less side bearings. */
    slot: 1.257,
    /** The illustration itself, which overhangs the hole on both sides. */
    width: 1.4345,
    height: 1.4552,
    /** How far the beard drops past the baseline. */
    belowBaseline: 0.3077,
  },

  /** 20 / 101 cap → 0.198em. Floored so it stays legible on a phone. */
  eyebrowSize: 'clamp(0.6875rem, 0.198em, 2.6rem)',
  /** 31 / 101 cap → 0.307em. */
  yearSize: 'clamp(0.8125rem, 0.3em, 4rem)',
  /**
   * The eyebrow and the year align on their cap tops, not their baselines, so
   * the larger year hangs 12px lower at reference scale (--year-drop), and the
   * eyebrow's baseline lands 14px above the cap line (--label-gap). Both are
   * applied by `.lockup` in globals.css.
   */
} as const

export const intro = {
  /** 144 x 335 in the reference — tall enough for a whole person. */
  portraitAspect: 144 / 335,
} as const
