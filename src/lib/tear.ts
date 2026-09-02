import { mulberry32 } from './random'

export type TearPoint = { x: number; y: number; sharp: boolean }

type TearOptions = {
  /** viewBox width the path is authored in. */
  width: number
  /** viewBox height. The line wanders inside the middle of this band. */
  height: number
  seed: number
  /** How violent the rip is, 0–1 of the available height. */
  roughness?: number
  /** Sample count. More points = the tear survives being stretched wide. */
  detail?: number
}

/**
 * Builds the wandering line of a hand-torn paper edge.
 *
 * Real torn paper is not a wave. It is a slow sweep (where the hand travelled),
 * a medium tremor (where the fibres resisted), a fine fray, and every so often
 * a sudden notch where the sheet gave way all at once. All four are layered
 * here — that combination is what stops it reading as a repeating SVG divider.
 */
export function tearPoints({
  width,
  height,
  seed,
  roughness = 0.62,
  detail = 120,
}: TearOptions): TearPoint[] {
  const rand = mulberry32(seed)
  const mid = height * 0.5
  const amp = height * 0.5 * roughness

  // Slow sweep — two low-frequency waves at unrelated phases so they never
  // resolve into anything periodic-looking.
  const s1 = { f: 0.7 + rand() * 0.6, p: rand() * Math.PI * 2, a: 0.5 }
  const s2 = { f: 1.9 + rand() * 1.4, p: rand() * Math.PI * 2, a: 0.3 }
  const s3 = { f: 4.1 + rand() * 3.0, p: rand() * Math.PI * 2, a: 0.16 }

  // A handful of sudden give-way notches.
  const notchCount = 3 + Math.floor(rand() * 4)
  const notches = Array.from({ length: notchCount }, () => ({
    at: rand(),
    dir: rand() > 0.45 ? 1 : -1,
    depth: 0.45 + rand() * 0.55,
    width: 0.008 + rand() * 0.022,
  }))

  const pts: TearPoint[] = []
  for (let i = 0; i <= detail; i++) {
    const t = i / detail
    const x = t * width

    let y =
      mid +
      amp *
        (s1.a * Math.sin(t * Math.PI * 2 * s1.f + s1.p) +
          s2.a * Math.sin(t * Math.PI * 2 * s2.f + s2.p) +
          s3.a * Math.sin(t * Math.PI * 2 * s3.f + s3.p))

    // Fine fray.
    y += (rand() - 0.5) * amp * 0.22

    let sharp = false
    for (const n of notches) {
      const d = Math.abs(t - n.at)
      if (d < n.width) {
        const falloff = 1 - d / n.width
        y += n.dir * amp * n.depth * falloff * falloff
        if (d < n.width * 0.35) sharp = true
      }
    }

    // Rounded here for the same reason the face geometry is: Math.sin
    // disagrees with itself across runtimes at the last bit, and that is a
    // hydration mismatch.
    pts.push({
      x: Math.round(x * 100) / 100,
      y: Math.round(Math.max(2, Math.min(height - 2, y)) * 100) / 100,
      sharp,
    })
  }

  // Pin the ends inside the band so the corners never clip.
  pts[0].y = mid + (pts[0].y - mid) * 0.5
  pts[pts.length - 1].y = mid + (pts[pts.length - 1].y - mid) * 0.5

  return pts
}

/**
 * Catmull-Rom through the points, emitted as cubic beziers — except across
 * `sharp` points, which stay as hard corners. Smooth curve + occasional angular
 * rip is exactly how a real tear reads.
 */
export function tearCurve(pts: TearPoint[], moveTo = true): string {
  if (pts.length < 2) return ''
  let d = moveTo ? `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}` : ''

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? pts[i + 1]

    if (p1.sharp || p2.sharp) {
      d += ` L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
      continue
    }

    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

/**
 * How far the solid side is closed PAST the band, in viewBox units.
 *
 * The fray filter displaces the whole shape by up to ±7, including the
 * straight edge that closes it. Closed exactly on the boundary, that
 * displacement pulls the edge inward in places and opens a hairline of
 * daylight between the tear and the sheet it sits against — a dashed seam
 * running the width of the page. Overfilling puts the closing edge outside
 * the viewBox, where the SVG viewport clips it and displacement cannot reach.
 */
const OVERFILL = 24

/** Curve, then close downwards — the sheet below the tear is solid. */
export function fillBelow(pts: TearPoint[], width: number, height: number): string {
  const b = height + OVERFILL
  return `${tearCurve(pts)} L ${width} ${b} L 0 ${b} Z`
}

/** Curve, then close upwards — the sheet above the tear is solid. */
export function fillAbove(pts: TearPoint[], width: number): string {
  const reversed = [...pts].reverse()
  const head = reversed[0]
  const t = -OVERFILL
  return `M 0 ${t} L ${width} ${t} L ${head.x.toFixed(2)} ${head.y.toFixed(2)} ${tearCurve(reversed, false)} Z`
}

/**
 * The same rip, as a CSS mask.
 *
 * Section 03 layers the portrait between two sheets: the black one behind him,
 * and the white one in front, so his lower body disappears under the torn edge
 * rather than stopping at the bottom of its own photograph. Without this the
 * die-cut closes underneath him in a straight line and the whole thing reads
 * as a rectangular photo with a rounded top — which is exactly what a cut-out
 * must not look like.
 *
 * Same seed, same roughness, same authored width as the `TornEdge` it hides
 * behind, and both are stretched with preserveAspectRatio="none", so the two
 * curves are the same curve.
 */
export function tearMask({
  seed,
  height,
  roughness = 0.7,
  width = 1600,
}: {
  seed: number
  height: number
  roughness?: number
  width?: number
}): string {
  const pts = tearPoints({ width, height, seed, roughness, detail: 150 })
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}' preserveAspectRatio='none'>
      <defs>
        <filter id='f' x='-4%' y='-40%' width='108%' height='180%' color-interpolation-filters='sRGB'>
          <feTurbulence type='fractalNoise' baseFrequency='0.028 0.6' numOctaves='4' seed='${seed}' result='n'/>
          <feDisplacementMap in='SourceGraphic' in2='n' scale='7' xChannelSelector='R' yChannelSelector='G'/>
        </filter>
      </defs>
      <path d='${fillAbove(pts, width)}' fill='#fff' filter='url(#f)'/>
    </svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`
}
