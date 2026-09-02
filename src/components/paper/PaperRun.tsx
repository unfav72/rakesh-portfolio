'use client'

import { usePointerVector } from '@/lib/hooks'
import Sheet from './Sheet'

/**
 * ---------------------------------------------------------------------------
 * THE SHEET
 * ---------------------------------------------------------------------------
 * One piece of graph paper, the height of the whole document, with everything
 * else laid on top of it.
 *
 * This started as a sheet per section and that was wrong — not subtly wrong,
 * visibly wrong: two sheets meeting produce a dead straight tonal seam across
 * the page at the section boundary, which is the one thing a physical sheet
 * never does. It also gets the model backwards. There is one sheet. The black
 * page in section 03 is a second sheet lying on top of it, and the tear is how
 * you see the first one again underneath.
 *
 * The crease map tiles seamlessly (stitchTiles) so running it 2500px tall
 * costs nothing and keeps the creases at a constant physical scale from top to
 * bottom, instead of stretching them into streaks.
 *
 * It also owns the pointer vector, since it is the outermost thing that reacts
 * to it.
 * ---------------------------------------------------------------------------
 */
export default function PaperRun({ children }: { children: React.ReactNode }) {
  usePointerVector()

  return (
    <div className="relative overflow-x-clip">
      {/* Oversized, so the drift never exposes an edge. */}
      <div
        className="absolute inset-x-[-2.5%] inset-y-0 -z-10"
        style={{
          transform: 'translate3d(calc(var(--px, 0) * 7px), calc(var(--py, 0) * 5px), 0)',
          willChange: 'transform',
        }}
      >
        <Sheet
          seed={3}
          crease={0.5}
          grain={0.05}
          vignette={false}
          className="h-full w-full"
          reveal
          revealDelay={0.18}
        />
      </div>
      {children}
    </div>
  )
}
