'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Must be unique on the page — it names the SVG filter. */
  id: string
  /** Outline thickness as a fraction of the element's width. */
  ratio?: number
  color?: string
  /** Off when the supplied artwork already carries its own edge treatment. */
  enabled?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * The red die-cut edge from the reference.
 *
 * Built on feMorphology rather than a stack of drop-shadows, for two reasons.
 * It is a true dilation, so the outline is even all the way round a concave
 * silhouette instead of thinning out in the notches. And its dilation is
 * square-kernelled, which leaves exactly the slightly faceted, cut-with-
 * scissors edge the reference has — the flaw is the feature.
 *
 * Because it reads SourceAlpha, it works on whatever is inside it: the
 * silhouette placeholder today, a transparent PNG of the real photograph
 * tomorrow. Nothing here needs to change on hand-off.
 *
 * The radius is re-derived from the element's width on resize so the edge
 * stays proportional instead of turning into a hairline on a large screen.
 */
export default function StickerCutout({
  id,
  ratio = 0.052,
  color = '#eb1926',
  enabled = true,
  className = '',
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [radius, setRadius] = useState(10)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setRadius(Math.max(3, Math.round(entry.contentRect.width * ratio)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ratio])

  if (!enabled) {
    return <div className={`relative ${className}`}>{children}</div>
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <filter id={id} x="-25%" y="-20%" width="150%" height="140%" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" operator="dilate" radius={radius} result="spread" />
            <feFlood floodColor={color} result="paint" />
            <feComposite in="paint" in2="spread" operator="in" result="edge" />
            <feMerge>
              <feMergeNode in="edge" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="h-full w-full" style={{ filter: `url(#${id})` }}>
        {children}
      </div>
    </div>
  )
}
