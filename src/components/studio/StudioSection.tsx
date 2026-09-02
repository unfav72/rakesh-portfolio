'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { site } from '@/config/site'
import { assets } from '@/config/assets'
import { ease, viewportOnce } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/hooks'
import StudioTitle from './StudioTitle'
import PolaroidCard, { type Polaroid } from './PolaroidCard'
import Lightbox from './Lightbox'

/**
 * ---------------------------------------------------------------------------
 * PAGE 04 — THE STU
 * ---------------------------------------------------------------------------
 * The quiet after the black sheet: warm paper, three photographs, and a hand
 * writing under each. The contrast with the section above is the point —
 * big, black and moving, into white, still and personal.
 *
 * Composition is measured off the reference. The three cards are staggered
 * vertically and the middle one drops furthest, which is what opens the gap
 * the title sits in: the outer two rise past it on either side. That is why
 * the row carries a negative top margin on desktop and none on a phone, where
 * the cards stack and there is no gap to sit in.
 *
 * The imperfection is controlled, not random. Every angle, drop, shadow weight
 * and slant of handwriting is a value in `site.studio.items` — a hand, not a
 * seed. Randomness reads as a bug; a decision reads as a person.
 * ---------------------------------------------------------------------------
 */
export default function StudioSection() {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState<number | null>(null)

  const items: Polaroid[] = site.studio.items.map((item, i) => ({
    ...item,
    src: assets.studio[i] ?? null,
  }))

  const group: Variants = {
    hidden: {},
    show: { transition: { delayChildren: reduced ? 0 : 0.05 } },
  }

  const title: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.9, ease: ease.paper },
    },
  }

  /**
   * Placed, not flown in: opacity and a few pixels of lift, one after another.
   * No spring, no rotation on entry — the resting angle is where each card
   * already is, so it settles rather than swings into position.
   */
  const card: Variants = {
    hidden: { opacity: 0, y: 26 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 1.05, delay: 0.28 + i * 0.16, ease: ease.paper },
    }),
  }

  return (
    <section
      id="studio"
      className="relative w-full pt-[clamp(1rem,4vw,4rem)] pb-[clamp(4rem,11vw,9rem)]"
      aria-label={site.studio.heading}
    >
      <motion.div
        className="relative z-10 mx-auto max-w-[112rem] px-[max(1.25rem,5vw)]"
        variants={group}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
      >
        <StudioTitle text={site.studio.heading} variants={title} />

        {/* Layout lives in `.studio-row` — it changes shape at 1024px and that
            is a media query’s job, not a class list’s. */}
        <div className="studio-row">
          {items.map((item, i) => (
            <PolaroidCard key={item.quote} item={item} index={i} variants={card} onOpen={setOpen} />
          ))}
        </div>
      </motion.div>

      <Lightbox items={items} open={open} onClose={() => setOpen(null)} />
    </section>
  )
}
