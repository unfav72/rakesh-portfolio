/**
 * ---------------------------------------------------------------------------
 * PAPER
 * ---------------------------------------------------------------------------
 * The background is not a colour, it is a stack of four things:
 *
 *   1. warm stock          a flat, slightly yellowed white
 *   2. printed grid        ruled lines, masked by low-frequency noise so the
 *                          ink density varies the way real graph paper does
 *   3. crumple             feTurbulence run through feDiffuseLighting, which
 *                          produces genuine soft creases rather than a texture
 *                          photo — and costs one rasterisation, once
 *   4. fibre               fine grain, tiled small
 *
 * Everything is generated as a data URI so it is deterministic, weightless,
 * and never fetches a JPEG of somebody else's paper.
 * ---------------------------------------------------------------------------
 */

function url(svg: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`
}

/**
 * Soft crease lighting. `stitchTiles` makes the noise continue across the tile
 * boundary, so this can repeat at its native 1200px instead of being stretched
 * to fit — which means one sheet can run the height of the whole document at a
 * constant crease scale.
 */
export function crumple(seed: number, frequency = 0.0055, octaves = 5) {
  return url(`
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'>
      <filter id='c' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
        <feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch' result='t'/>
        <feDiffuseLighting in='t' lighting-color='#ffffff' surfaceScale='3.4' diffuseConstant='1'>
          <feDistantLight azimuth='232' elevation='63'/>
        </feDiffuseLighting>
      </filter>
      <rect width='1200' height='1200' filter='url(#c)'/>
    </svg>`)
}

/** Fine paper fibre. Small tile, cheap, sits at very low opacity. */
export function fibre(seed: number, size = 180) {
  return url(`
    <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
      <filter id='g' color-interpolation-filters='sRGB'>
        <feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' seed='${seed}' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
      </filter>
      <rect width='${size}' height='${size}' filter='url(#g)'/>
    </svg>`)
}

/**
 * Alpha mask applied to the ruled grid. Low frequency, biased bright, so most
 * of the grid prints and some of it fades — which is the single detail that
 * stops the ruling reading as a CSS background.
 */
export function inkMask(seed: number) {
  return url(`
    <svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'>
      <filter id='m' color-interpolation-filters='sRGB'>
        <feTurbulence type='fractalNoise' baseFrequency='0.0042' numOctaves='3' seed='${seed}'/>
        <feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.8 0 0 0 0.42'/>
      </filter>
      <rect width='900' height='900' filter='url(#m)'/>
    </svg>`)
}

/**
 * Inverted crease map: near-black, with the creases as the only bright pixels.
 * Screen-blended it textures a black sheet and does almost nothing to a white
 * one — which lets a single overlay run across a torn composite where paper
 * and black paper are interleaved.
 */
export function crumpleDark(seed: number, frequency = 0.013) {
  return url(`
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'>
      <filter id='d' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
        <feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='5' seed='${seed}' stitchTiles='stitch' result='t'/>
        <feDiffuseLighting in='t' lighting-color='#ffffff' surfaceScale='3' diffuseConstant='1' result='l'>
          <feDistantLight azimuth='232' elevation='58'/>
        </feDiffuseLighting>
        <feColorMatrix in='l' type='matrix' values='-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 0 1'/>
      </filter>
      <rect width='1200' height='1200' filter='url(#d)'/>
    </svg>`)
}
