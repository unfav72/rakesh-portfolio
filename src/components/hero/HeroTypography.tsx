'use client'

import { motion } from 'framer-motion'
import { site } from '@/config/site'
import { hero } from '@/config/tokens'
import { cue, ease } from '@/lib/motion'
import AnimatedPortfolio from './AnimatedPortfolio'
import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * The title block. One font-size is declared on `.lockup` and everything else
 * — eyebrow, year, face slot, tracking — is stated in em against it, so the
 * whole thing scales as a single drawn object.
 *
 * On desktop the label row is out of flow deliberately: it must not be able to
 * widen the block. The block's width is the word's width and nothing else,
 * which is what keeps DESIGNER / ILLUSTRATOR flush with the P and 2026 flush
 * with the final O at every viewport. On phones it drops back into flow — see
 * `.lockup` in globals.css for why.
 */
export default function HeroTypography() {
  const reduced = usePrefersReducedMotion()

  return (
    <div className="lockup relative mx-auto w-fit">
      <div className="lockup-labels">
        <motion.p
          className="eyebrow m-0 text-ink"
          style={{ fontSize: hero.eyebrowSize }}
          initial={{ opacity: 0, y: '0.5em', clipPath: 'inset(0 0 100% 0)' }}
          animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 -20% 0)' }}
          transition={reduced ? { duration: 0 } : { duration: 0.9, delay: cue.eyebrow, ease: ease.paper }}
        >
          {site.eyebrow}
        </motion.p>

        {/* The drop lives on a static wrapper so it survives the reveal, and
            resolves against the display size rather than the year's own. */}
        <div style={{ transform: 'translateY(var(--year-drop))' }}>
          <motion.p
            className="meta m-0 text-ink"
            style={{ fontSize: hero.yearSize }}
            initial={{ opacity: 0, y: '0.35em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.85, delay: cue.year, ease: ease.paper }}
          >
            {site.year}
          </motion.p>
        </div>
      </div>

      <AnimatedPortfolio word={site.displayWord} faceIndex={site.faceLetterIndex} />
    </div>
  )
}
