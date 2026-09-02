'use client'

import { useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { usePrefersReducedMotion, useElementPointer } from '@/lib/hooks'
import PolaroidImage from './PolaroidImage'
import PolaroidCaption from './PolaroidCaption'

export type Polaroid = {
  quote: string
  author: string
  /** Resting angle, in degrees. */
  rotation: number
  /** Vertical stagger, as a percentage of the card's own height. */
  drop: number
  /** Shadow weight, 0–1. Varied per card so the three do not sit at one depth. */
  shade: number
  /** Slant on the written block, in degrees. */
  skew: number
  /** Horizontal drift on the written block, as a percentage. */
  indent: number
  src?: string | null
  objectPosition?: string
  /** Wire this up when the work section exists; without it the card opens the view. */
  href?: string | null
}

type Props = {
  item: Polaroid
  index: number
  variants: Variants
  onOpen: (index: number) => void
}

/**
 * One photograph on the paper.
 *
 * Three nested elements because three different clocks are running: the
 * stagger is static config, the tilt is a rAF loop reading the cursor, and the
 * lift is a CSS transition on hover. Put them on one element and the
 * transition smooths the already-smoothed tilt into lag.
 *
 * The card is a button — clicking opens the larger view — but it carries no
 * button chrome whatsoever. Give it an `href` later and it becomes a link to
 * the piece instead, with no change to anything visual.
 */
export default function PolaroidCard({ item, index, variants, onOpen }: Props) {
  const reduced = usePrefersReducedMotion()
  const place = useRef<HTMLDivElement>(null)
  useElementPointer(place, !reduced)

  const inner = (
    <>
      <PolaroidImage
        src={item.src}
        alt={`Studio photograph ${index + 1}`}
        index={index}
        objectPosition={item.objectPosition}
      />
      <PolaroidCaption
        quote={item.quote}
        author={item.author}
        skew={item.skew}
        indent={item.indent}
      />
    </>
  )

  return (
    /* The stagger sits on its own wrapper. Framer drives a transform on the
       element it animates, so a static transform on the same node would be
       overwritten the moment the entrance runs. */
    <div className="polaroid-slot" style={{ transform: `translateY(${item.drop}%)` }}>
      <motion.div ref={place} className="polaroid-place" variants={variants} custom={index}>
        <div className="polaroid-tilt">
          {item.href ? (
            <a href={item.href} className="polaroid-card block" style={cardVars(item)}>
              {inner}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onOpen(index)}
              aria-label={`Open photograph ${index + 1}: ${item.quote}`}
              className="polaroid-card w-full cursor-pointer appearance-none border-0 text-left"
              style={cardVars(item)}
            >
              {inner}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function cardVars(item: Polaroid) {
  return {
    ['--rot' as string]: `${item.rotation}deg`,
    ['--shade' as string]: item.shade,
  }
}
