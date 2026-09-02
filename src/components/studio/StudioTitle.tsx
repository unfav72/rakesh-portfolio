'use client'

import { motion, type Variants } from 'framer-motion'

/**
 * THE STU — abbreviated on purpose, and left that way.
 *
 * Centred, and sized off the reference: cap height measures 18.5px on a 749px
 * page, which is 3.6vw — between the section headings and HELLO. It sits in
 * the gap the middle photograph leaves by dropping, so the outer two rise past
 * it on either side.
 */
export default function StudioTitle({ text, variants }: { text: string; variants: Variants }) {
  return (
    <motion.h2
      className="display m-0 text-center text-ink"
      style={{ fontSize: 'clamp(1.75rem, 3.6vw, 4.5rem)', letterSpacing: '-0.035em' }}
      variants={variants}
    >
      {text}
    </motion.h2>
  )
}
