'use client'

type Props = {
  quote: string
  author: string
  /**
   * A degree or so of slant on the written block. Handwriting on a photograph
   * is never square to the edge, and this is the cheapest honest way to say so.
   */
  skew?: number
  /** Small horizontal drift, so the three hands do not start on one plumb line. */
  indent?: number
}

/**
 * The written note under a photograph.
 *
 * Left-aligned quote, right-aligned attribution, exactly as in the reference —
 * and the whole block is nudged off square. The imperfection is controlled:
 * one degree, one or two percent, set per card in config rather than random,
 * because randomness reads as a bug and a decision reads as a hand.
 */
export default function PolaroidCaption({ quote, author, skew = 0, indent = 0 }: Props) {
  return (
    <figcaption className="polaroid-caption">
      <span
        className="block"
        style={{ transform: `rotate(${skew}deg)`, marginLeft: `${indent}%` }}
      >
        {quote}
        <span className="mt-[0.15em] block text-right">— {author}</span>
      </span>
    </figcaption>
  )
}
