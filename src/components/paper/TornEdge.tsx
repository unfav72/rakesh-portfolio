import { tearPoints, tearCurve, fillBelow, fillAbove } from '@/lib/tear'

const VB_W = 1600

type Props = {
  /**
   * Which edge of the dark sheet this is.
   *   'top'    — dark fills below the rip
   *   'bottom' — dark fills above it
   */
  side: 'top' | 'bottom'
  /** Defaults to the noir token, so the rip and the sheet it joins can never
   *  drift to two different blacks and show a step where they meet. */
  color?: string
  /** Unique per instance: it seeds the rip AND the SVG filter ids. */
  seed: number
  /** Height of the band the rip is authored inside, in viewBox units. */
  height?: number
  /** Rendered height. The band stretches to it, so the rip scales with the page. */
  bandHeight?: string
  roughness?: number
  className?: string
}

/**
 * A hand-torn edge.
 *
 * Three things are doing the work, and all three are needed — drop any one and
 * it collapses back into an SVG divider:
 *
 *   1. the wandering line     (see lib/tear.ts — sweep + tremor + notches)
 *   2. a displacement filter  fractal noise pushed hard on the vertical axis,
 *                             which frays the silhouette at the pixel level
 *                             the way separated paper fibres actually look
 *   3. the white rim          exposed fibre catching the light, plus the soft
 *                             shadow the upper sheet casts onto the one below
 */
export default function TornEdge({
  side,
  color = 'var(--color-noir)',
  seed,
  height = 110,
  bandHeight = 'clamp(2.5rem, 7.5vw, 8.125rem)',
  roughness = 0.72,
  className = '',
}: Props) {
  const pts = tearPoints({ width: VB_W, height, seed, roughness, detail: 150 })
  const shape = side === 'top' ? fillBelow(pts, VB_W, height) : fillAbove(pts, VB_W)
  const line = tearCurve(pts)

  const fray = `fray-${seed}`
  const blur = `soften-${seed}`
  const rimShift = side === 'top' ? -2.6 : 2.6
  const shadeShift = side === 'top' ? -9 : 9

  return (
    <svg
      className={`block w-full ${className}`}
      viewBox={`0 0 ${VB_W} ${height}`}
      style={{ height: bandHeight }}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={fray} x="-4%" y="-40%" width="108%" height="180%" colorInterpolationFilters="sRGB">
          {/* Stretched frequency: fine across x, coarse across y, so the noise
              pulls the edge sideways into fibres instead of blurring it. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.028 0.6" numOctaves="4" seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={blur} x="-4%" y="-40%" width="108%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* The sheet above casts a soft shadow onto the sheet below. */}
      <path
        d={line}
        fill="none"
        stroke="rgba(48, 42, 32, 0.20)"
        strokeWidth="9"
        transform={`translate(0 ${shadeShift})`}
        filter={`url(#${blur})`}
      />

      <g filter={`url(#${fray})`}>
        {/* Exposed fibre, mostly hidden under the dark shape — only the ragged
            sliver that escapes it reads, which is exactly the real effect. */}
        <path
          d={line}
          fill="none"
          stroke="#fffdf7"
          strokeWidth="4"
          strokeOpacity="0.95"
          transform={`translate(0 ${rimShift})`}
        />
        <path d={shape} fill={color} />
      </g>
    </svg>
  )
}
