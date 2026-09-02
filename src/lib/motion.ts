import type { Transition } from 'framer-motion'

/**
 * Motion vocabulary. Four curves, used everywhere, so the whole site moves
 * with one hand. Nothing overshoots; paper does not bounce.
 */
export const ease = {
  /** Long decelerating settle — the house curve. */
  paper: [0.16, 1, 0.3, 1] as const,
  /** Shorter, firmer. For ink landing. */
  ink: [0.25, 0.8, 0.3, 1] as const,
  /** Symmetric. For things that leave. */
  soft: [0.4, 0, 0.2, 1] as const,
  /** Breath — used for the slow idle loops. */
  breath: [0.45, 0, 0.55, 1] as const,
}

/**
 * The page-load score, in seconds. Written as one object because the timing
 * relationships matter more than any single value — this is the edit list.
 */
export const cue = {
  paper: 0.0,
  grid: 0.18,
  eyebrow: 0.44,
  word: 0.6,
  letterStagger: 0.058,
  /** The word assembles with a hole in it; the face is then placed into it. */
  face: 1.45,
  firstBlink: 2.15,
  year: 2.0,
  name: 2.45,
  scroll: 2.95,
} as const

export const t = {
  slow: { duration: 1.1, ease: ease.paper } satisfies Transition,
  base: { duration: 0.78, ease: ease.paper } satisfies Transition,
  quick: { duration: 0.45, ease: ease.ink } satisfies Transition,
}

/** Reveal used by every scroll-triggered block in the document. */
export const riseIn = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: t.base },
}

export const viewportOnce = { once: true, amount: 0.28 } as const
