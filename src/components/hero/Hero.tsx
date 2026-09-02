'use client'

import { useRef } from 'react'
import HeroTypography from './HeroTypography'
import ScrollReveal from './ScrollReveal'

/**
 * ---------------------------------------------------------------------------
 * PAGE 01 — THE COVER
 * ---------------------------------------------------------------------------
 * A poster with a lot of nothing in it. The reference gives roughly four
 * fifths of the sheet to empty paper, and that emptiness is the composition —
 * it is what makes the word land. Nothing gets added to fill it.
 *
 * Nothing else is on the sheet at rest. The curved arrow, the mark and the
 * signature are scrubbed in by the visitor's own scrolling, which is why the
 * old bouncing scroll cue and the load-time signature are gone: a generic
 * indicator and a hand-drawn gesture doing the same job is one job too many.
 *
 * The parallax is three layers moving against each other by single-digit
 * pixels: paper +7 (owned by PaperRun), type -2.5, face -6. Far too small to
 * notice and just enough that the sheet reads as a physical thing sitting
 * under the type rather than a background image behind it. It runs on CSS
 * custom properties driven by one rAF loop that parks itself the moment the
 * pointer stops — no React render is involved in any of it.
 * ---------------------------------------------------------------------------
 */
export default function Hero() {
  const hero = useRef<HTMLElement>(null)

  return (
    <section ref={hero} className="relative min-h-svh w-full" aria-label="Cover">
      <div className="relative z-10 flex min-h-svh w-full items-center justify-center px-[4vw]">
        <div
          style={{
            transform:
              'translate3d(calc(var(--px, 0) * -2.5px), calc(var(--lockup-shift) + var(--py, 0) * -2px), 0)',
            willChange: 'transform',
          }}
        >
          <HeroTypography />
        </div>
      </div>

      {/* Nothing here on arrival. The gesture and the name are the layer the
          visitor uncovers by scrolling — see ScrollReveal. */}
      <ScrollReveal target={hero} />
    </section>
  )
}
