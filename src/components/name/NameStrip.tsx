'use client'

import { motion } from 'framer-motion'
import { site } from '@/config/site'
import { assets } from '@/config/assets'
import { crumpleDark, fibre } from '@/lib/paper'
import { ease, viewportOnce } from '@/lib/motion'
import TornEdge from '@/components/paper/TornEdge'
import { tearMask } from '@/lib/tear'
import StickerCutout from '@/components/ui/StickerCutout'
import { usePrefersReducedMotion } from '@/lib/hooks'

/** One full cycle — the track travels exactly one copy's width. */
const CYCLE = '22s'
/** Copies in the track. Three, so the reset is covered at any viewport. */
const COPIES = 3

/** Bottom rip: one seed, one band height, shared by the edge and the mask. */
const BOTTOM_SEED = 31
const BOTTOM_ROUGH = 0.7
/** Authored height of the rip band, in the viewBox both of them stretch from. */
const BAND = 112
/** Rendered height of the band. Must match TornEdge's default. */
const BAND_CSS = 'clamp(2.5rem, 7.5vw, 8.125rem)'

/**
 * ---------------------------------------------------------------------------
 * PAGE 03 — THE MOVING POSTER
 * ---------------------------------------------------------------------------
 * A second, near-black sheet torn along both edges, with the identity drifting
 * slowly left to right across it and the cut-out standing still in front.
 *
 * The whole section is built on one contrast: **the type moves, the person
 * does not.** The portrait gets an entrance and then holds absolutely steady
 * while the poster behind it keeps travelling. Animate both and it turns into
 * a carousel; animate neither and it is a photograph.
 *
 * Layering is the other half of it — black paper, then the moving type, then
 * the cut-out on top with transparent surroundings, so the letters genuinely
 * pass *behind* the body rather than being covered by a rectangle. The type is
 * sized so a copy runs about 1.3 screens wide: past the edges on both sides,
 * as a poster should be, while still leaving most of the phrase readable at
 * any moment.
 *
 * See `.marquee-track` in globals.css for why the drift is a CSS animation
 * and not a JS one — it is entirely about the phase surviving scroll, resize
 * and re-render.
 * ---------------------------------------------------------------------------
 */
export default function NameStrip() {
  const reduced = usePrefersReducedMotion()

  const identity = [site.displayWord, site.firstName, site.lastName].filter(Boolean).join(' ')

  return (
    <section
      className="relative z-0 -mt-[clamp(1rem,3.5vw,3.5rem)] w-full pb-[clamp(5rem,13vw,11rem)]"
      aria-label={identity}
    >
      <div className="relative z-10">
        <TornEdge side="top" seed={17} roughness={0.74} />

        <div
          className="on-noir relative overflow-hidden bg-noir"
          style={{ height: 'clamp(9rem, 36vw, 30rem)' }}
        >
          {/* Black paper creases. The map is inverted and screened, so it
              prints on the dark and leaves the paper above untouched.

              Kept low on purpose: screen lifts blacks disproportionately, and
              the reference sheet measures (20,22,21). Texture that pushes it
              to charcoal has stopped being black paper. */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.17]"
            style={{
              backgroundImage: crumpleDark(44),
              backgroundSize: '1200px 1200px',
              backgroundRepeat: 'repeat',
              mixBlendMode: 'screen',
            }}
          />
          {/* Fibre, screened — but barely. Screen lifts blacks fast, and this
              sheet has to stay near-black or it stops being paper and starts
              being a grey box. */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: fibre(58), mixBlendMode: 'screen' }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(130% 115% at 50% 0%, rgba(255,255,255,0.03), transparent 62%)',
            }}
          />

          {/* Oversized and rotated, so the tilt never exposes a corner. */}
          <div
            className="pointer-events-none absolute inset-[-6%] flex items-center"
            style={{ transform: 'rotate(-1.4deg)' }}
            aria-hidden="true"
          >
            <div className="marquee-track" style={{ ['--marquee-duration' as string]: CYCLE }}>
              {Array.from({ length: COPIES }, (_, i) => (
                <span
                  key={i}
                  className="display whitespace-nowrap"
                  style={{
                    /* One copy runs ~1.2 screens, so at the right moment the
                       phrase splits either side of the cut-out and reads
                       PORTFOLIO — person — GIREESH, which is the reference's
                       whole composition. Cap height lands at 18% of the strip;
                       the reference measures 18.5%. */
                    fontSize: 'clamp(2rem, 9.6vw, 12rem)',
                    color: '#e7e6e2',
                    letterSpacing: '-0.04em',
                    paddingRight: '0.5em',
                  }}
                >
                  {identity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <TornEdge side="bottom" seed={BOTTOM_SEED} roughness={BOTTOM_ROUGH} height={BAND} bandHeight={BAND_CSS} />

        {/* In front of the type and of the black sheet — but BEHIND the white
            one below it.

            That last part is the whole trick, and getting it wrong is what
            makes a cut-out read as a passport photo: his suit does not end
            because his body ends, it ends because the photograph was cropped
            there. Left visible, the die-cut closes underneath him in a
            straight line and the silhouette becomes a rectangle with a rounded
            top. So the lower sheet is masked over him with the same rip that
            draws the torn edge — he goes under the paper instead of stopping
            on it, exactly as in the reference. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center"
          style={{
            maskImage: `${tearMask({ seed: BOTTOM_SEED, height: BAND, roughness: BOTTOM_ROUGH })}, linear-gradient(#000, #000)`,
            WebkitMaskImage: `${tearMask({ seed: BOTTOM_SEED, height: BAND, roughness: BOTTOM_ROUGH })}, linear-gradient(#000, #000)`,
            maskSize: `100% ${BAND_CSS}, 100% calc(100% - ${BAND_CSS})`,
            WebkitMaskSize: `100% ${BAND_CSS}, 100% calc(100% - ${BAND_CSS})`,
            maskPosition: 'bottom, top',
            WebkitMaskPosition: 'bottom, top',
            maskRepeat: 'no-repeat, no-repeat',
            WebkitMaskRepeat: 'no-repeat, no-repeat',
          }}
        >
          <motion.div
            className="relative w-[clamp(12rem,42vw,38rem)]"
            style={{ marginBottom: '-7%' }}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={viewportOnce}
            transition={reduced ? { duration: 0 } : { duration: 1.1, delay: 0.1, ease: ease.paper }}
          >
            {/* Where it meets the paper. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[8%] bottom-[-3%] h-[7%]"
              style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 74%)' }}
            />

            <StickerCutout id="name-cutout" ratio={0.028} enabled={assets.nameCutout.sticker}>
              {assets.nameCutout.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={assets.nameCutout.src}
                  alt={`${site.firstName}, cut out`}
                  width={assets.nameCutout.width}
                  height={assets.nameCutout.height}
                  className="block h-auto w-full"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <BustPlaceholder />
              )}
            </StickerCutout>
          </motion.div>
        </div>
      </div>

      {/* The marquee is decorative repetition; this is the heading that is
          actually announced. */}
      <h2 className="sr-only">{identity}</h2>
    </section>
  )
}

/**
 * Holds the footprint the final cut-out will fill: 340 x 300, the reference's
 * 46 : 41 proportion — a bust is wider than it is tall once the shoulders are
 * in it, and getting that backwards is what makes a placeholder look wrong.
 *
 * Opaque on purpose. feMorphology dilates SourceAlpha, so a translucent
 * silhouette would let the red flood read straight through the figure instead
 * of sitting behind it.
 */
function BustPlaceholder() {
  /**
   * Head-dominant, because the reference cut-out is: the head and hair are
   * 59% of the shoulder width and 76% of the total height. A small head on
   * wide shoulders is what turns a bust placeholder into a login avatar.
   */
  const shape =
    'M 170 6 C 226 6, 270 52, 270 118 C 270 173, 246 216, 210 233 ' +
    'C 263 245, 306 263, 320 289 C 323 294, 325 297, 326 300 L 14 300 ' +
    'C 15 297, 17 294, 20 289 C 34 263, 77 245, 130 233 ' +
    'C 94 216, 70 173, 70 118 C 70 52, 114 6, 170 6 Z'

  return (
    <svg viewBox="0 0 340 300" className="block h-auto w-full" role="img" aria-label="Cut-out portrait placeholder">
      <defs>
        <clipPath id="bust-clip">
          <path d={shape} />
        </clipPath>
      </defs>
      <g clipPath="url(#bust-clip)">
        <rect width="340" height="300" fill="#31322a" />
        <g stroke="#f3f1eb" strokeWidth="1" opacity="0.09">
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`v${i}`} x1={i * 18} y1="0" x2={i * 18} y2="300" />
          ))}
          {Array.from({ length: 18 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 18} x2="340" y2={i * 18} />
          ))}
        </g>
      </g>
      <path d={shape} fill="none" stroke="#f3f1eb" strokeOpacity="0.3" strokeWidth="2" />

      {/* Labelled, not disguised. A featureless bust silhouette reads as a
          login avatar however it is drawn, so this stops pretending to be a
          person and says what it is: a reserved plate holding the exact
          footprint, z-order and die-cut edge of the photograph to come. */}
      <g
        fill="#f3f1eb"
        fillOpacity="0.5"
        fontSize="15"
        fontWeight="800"
        letterSpacing="4.5"
        textAnchor="middle"
        fontFamily="var(--font-display)"
      >
        <text x="170" y="112">PORTRAIT</text>
        <text x="170" y="136">CUT-OUT</text>
      </g>
    </svg>
  )
}
