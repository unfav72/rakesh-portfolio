import { crumple, fibre, inkMask } from '@/lib/paper'

type Props = {
  /** Drives the crease pattern. Give every sheet its own so no two repeat. */
  seed: number
  ruled?: boolean
  /** Crease strength. Lower it under dense copy, raise it in empty space. */
  crease?: number
  grain?: number
  /** Darkening toward the sheet's outer edge. */
  vignette?: boolean
  /** Fades the texture stack up on load. The stock colour is already on <body>,
   *  so what actually arrives is the ruling and the creases. */
  reveal?: boolean
  revealDelay?: number
  className?: string
  children?: React.ReactNode
}

/**
 * A physical sheet of paper: stock, ruling, creases, fibre — in that order,
 * because the ruling is printed onto the sheet and therefore has to sit
 * beneath the light that falls across it.
 *
 * All four layers are generated SVG, rasterised once by the compositor, and
 * marked pointer-events-none. Only the fibre moves, and it moves on transform.
 */
export default function Sheet({
  seed,
  ruled = true,
  crease = 0.5,
  grain = 0.05,
  vignette = true,
  reveal = false,
  revealDelay = 0,
  className = '',
  children,
}: Props) {
  return (
    <div
      className={`paper-sheet ${reveal ? 'sheet-in' : ''} ${className}`}
      style={reveal ? { animationDelay: `${revealDelay}s` } : undefined}
    >
      {ruled && (
        <div
          className="paper-layer paper-grid"
          style={{
            maskImage: inkMask(seed + 91),
            WebkitMaskImage: inkMask(seed + 91),
          }}
        />
      )}
      <div
        className="paper-layer paper-crumple"
        style={{ backgroundImage: crumple(seed), opacity: crease }}
      />
      <div
        className="paper-layer paper-fibre"
        style={{ backgroundImage: fibre(seed + 13), opacity: grain }}
      />
      {vignette && <div className="paper-layer paper-edge-shade" />}
      {children}
    </div>
  )
}
