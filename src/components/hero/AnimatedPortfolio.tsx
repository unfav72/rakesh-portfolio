'use client'

import { motion } from 'framer-motion'
import { hero } from '@/config/tokens'
import { cue, ease } from '@/lib/motion'
import { mulberry32 } from '@/lib/random'
import AnimatedFace from './AnimatedFace'
import { usePrefersReducedMotion } from '@/lib/hooks'

/** Hand-set type is never perfectly square. Seeded so SSR and client agree. */
const wobble = (() => {
  const rand = mulberry32(7351)
  return Array.from({ length: 24 }, () => (rand() - 0.5) * 1.15)
})()

type Props = {
  word: string
  /** Index of the character the face illustration stands in for, or null to disable. */
  faceIndex?: number | null
}

/**
 * ---------------------------------------------------------------------------
 * PORTFOLIO
 * ---------------------------------------------------------------------------
 * Two things are happening here.
 *
 * 1. THE ASSEMBLY. Each letter exists first as a ghost — a 7% grey proof of
 *    the whole word, printed before anything else — and then the solid letter
 *    is struck over it: faint, drifting, blurred, then black and still. That
 *    is the sequence the brief asks for, and it is also what a poster coming
 *    off a press actually looks like. The word finishes assembling with a hole
 *    where the O should be; the face is placed into it a beat later.
 *
 * 2. THE HOLE. The face is not positioned over the word — it IS a glyph in it.
 *    Its slot is an inline-block of zero height, so its bottom edge lands
 *    exactly on the text baseline, and the illustration is hung off that edge
 *    in em: 1.27em wide, 1.69em tall, dropping 0.354em below the baseline.
 *    Those three numbers are measured off the reference artwork and live in
 *    config/tokens.ts. Because they are em, the face cannot drift out of the
 *    word at any viewport, and swapping in the final illustration moves
 *    nothing.
 * ---------------------------------------------------------------------------
 */
export default function AnimatedPortfolio({ word, faceIndex }: Props) {
  const reduced = usePrefersReducedMotion()
  const chars = word.split('')
  const { face } = hero

  return (
    <h1
      aria-label={word}
      className="display relative m-0 select-none"
      style={{
        fontSize: '1em',
        fontStretch: hero.displayStretch,
        letterSpacing: hero.displayTracking,
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      {/* The proof. Sits under everything, never moves, and is animated in
          CSS so it is on the paper at first paint rather than at hydration. */}
      <span aria-hidden="true" className="word-ghost pointer-events-none absolute inset-0 text-ink">
        {chars.map((c, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: faceIndex != null && i === faceIndex ? `${face.slot}em` : undefined,
              visibility: faceIndex != null && i === faceIndex ? 'hidden' : undefined,
            }}
          >
            {c}
          </span>
        ))}
      </span>

      <span aria-hidden="true" className="relative">
        {chars.map((char, i) => {
          if (faceIndex != null && i === faceIndex) {
            return (
              <span
                key={i}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: `${face.slot}em`,
                  height: 0,
                  verticalAlign: 'baseline',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: `${-(face.width - face.slot) / 2}em`,
                    right: `${-(face.width - face.slot) / 2}em`,
                    bottom: `${-face.belowBaseline}em`,
                    height: `${face.height}em`,
                  }}
                >
                  <AnimatedFace />
                </span>
              </span>
            )
          }

          return (
            <motion.span
              key={i}
              className="inline-block will-change-transform"
              initial={{ opacity: 0, y: '0.085em', scale: 1.04, rotate: wobble[i], filter: 'blur(7px)' }}
              /* Not a keyframe array under reduced motion: with initial={false}
                 Framer resolves a keyframe target to its FIRST value, which
                 would leave every letter parked at opacity 0. */
              animate={
                reduced
                  ? { opacity: 1, y: '0em', scale: 1, rotate: 0, filter: 'blur(0px)' }
                  : {
                      opacity: [0, 0.16, 0.16, 1],
                      y: ['0.085em', '0.05em', '0.022em', '0em'],
                      scale: [1.04, 1.02, 1.008, 1],
                      rotate: [wobble[i], wobble[i] * 0.6, wobble[i] * 0.25, 0],
                      filter: ['blur(7px)', 'blur(3.5px)', 'blur(1.2px)', 'blur(0px)'],
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: 0.92,
                      delay: cue.word + i * cue.letterStagger,
                      ease: ease.paper,
                      times: [0, 0.28, 0.52, 1],
                    }
              }
            >
              {char}
            </motion.span>
          )
        })}
      </span>
    </h1>
  )
}
