import { mulberry32 } from '@/lib/random'

/**
 * ---------------------------------------------------------------------------
 * FACE GEOMETRY
 * ---------------------------------------------------------------------------
 * The drawing's own coordinate space, centred on x = 110. The viewBox is cut
 * to the ink and its proportion matches the face box in tokens.ts — which is
 * the proportion measured off the reference, 210 x 213: very nearly square,
 * because the hair is wider than the head is tall. Get that one relationship
 * wrong and the silhouette stops reading, however good the features are.
 *
 * The vertical proportions are read off the reference illustration as
 * percentages of the face box, because this is where a drawn face goes wrong:
 *
 *     hairline 41%   eyes 57%   nose base 68%   mouth 76%   chin 92%
 *
 * Features sitting even 8% low is the entire difference between a face that
 * looks composed and one that looks defeated.
 *
 * Construction follows the reference: a solid hair mass whose lower edge IS
 * the hairline, an opaque head hung beneath it, ears with curls behind them,
 * and a curl-textured beard running the jaw. Hair and beard are filled,
 * everything else is stroked, so it holds up at the size it actually gets
 * used at — roughly one letter tall.
 * ---------------------------------------------------------------------------
 */
export const FACE_VB = '2 -2 216 219'

const CX = 110
/** Mirrors an x across the centre line. */
const m = (x: number) => 2 * CX - x

/**
 * Rounds to three decimals before the number ever reaches an attribute.
 *
 * Math.sin/Math.cos are implementation-defined at the last bit, and Node and
 * Chrome disagree on it — so a curl generated on the server serialises as
 * 63.70410964743948 and the same curl on the client as ...47, and React
 * reports a hydration mismatch for a difference of one ULP. Rounding removes
 * the disagreement without moving anything by a visible amount.
 */
const q = (n: number) => Math.round(n * 1000) / 1000

/** Curls around the outer edge of the hair. Seeded, so SSR and client agree. */
export const topCurls = (() => {
  const rand = mulberry32(4181)
  return Array.from({ length: 22 }, (_, i) => {
    const t = i / 21
    const a = Math.PI * (1.02 + t * 0.96)
    return {
      cx: q(CX + Math.cos(a) * (92 + (rand() - 0.5) * 9)),
      cy: q(66 + Math.sin(a) * (54 + (rand() - 0.5) * 8)),
      r: q(10 + rand() * 5),
    }
  })
})()

/** Curls on the sideburn strip. Drawn before the ears so they sit behind them. */
export const sideCurls = (() => {
  const rand = mulberry32(2287)
  const left: [number, number][] = [
    [31, 110], [27, 129], [32, 147],
  ]
  return [...left, ...left.map(([x, y]) => [m(x), y] as [number, number])].map(([cx, cy]) => ({
    cx,
    cy,
    r: 6.5 + rand() * 3,
  }))
})()

/**
 * Beard curls, riding the outer edge of the filled beard beneath them.
 *
 * The radius range is wide and the positions are jittered off the arc on
 * purpose: evenly spaced circles of equal size stop reading as hair and start
 * reading as a string of beads, which is the failure mode this shape has.
 */
export const beardCurls = (() => {
  const rand = mulberry32(6011)
  return Array.from({ length: 19 }, (_, i) => {
    const t = i / 18
    const a = Math.PI * (0.17 + t * 0.66)
    const rx = 58 + (rand() - 0.5) * 9
    const ry = 80 + (rand() - 0.5) * 9
    return {
      cx: q(CX + Math.cos(a) * rx),
      cy: q(122 + Math.sin(a) * ry),
      r: q(4.5 + rand() * 5.5),
    }
  })
})()

/** A few paper-coloured specks so the hair mass is not a flat silhouette. */
export const specks = (() => {
  const rand = mulberry32(90210)
  return Array.from({ length: 10 }, () => {
    const a = rand() * Math.PI * 2
    const d = Math.sqrt(rand())
    return {
      cx: q(CX + Math.cos(a) * d * 58),
      cy: q(44 + Math.sin(a) * d * 24),
      r: q(0.8 + rand() * 1.1),
    }
  })
})()

export const path = {
  /**
   * Opaque head. Without this the illustration is a transparent cut-out and
   * the letters it overlaps read straight through the cheeks.
   */
  headFill:
    'M 48 98 C 44 126, 50 154, 64 174 C 78 193, 95 203, 110 203 ' +
    'C 125 203, 142 193, 156 174 C 170 154, 176 126, 172 98 ' +
    'C 170 88, 160 78, 146 72 C 136 67, 122 69, 110 69 ' +
    'C 98 69, 84 67, 74 72 C 60 78, 50 88, 48 98 Z',

  /** The lower edge of this shape is the hairline. */
  hair:
    'M 30 96 C 16 84, 12 58, 24 38 C 36 18, 62 4, 92 2 C 124 0, 160 6, 182 22 ' +
    'C 204 38, 212 66, 202 88 C 197 99, 188 106, 178 108 ' +
    'C 176 90, 166 76, 150 70 C 136 65, 122 67, 110 67 ' +
    'C 98 67, 84 65, 70 70 C 54 76, 44 90, 42 108 C 34 106, 32 101, 30 96 Z',

  jaw:
    'M 48 98 C 44 126, 50 154, 64 174 C 78 193, 95 203, 110 203 ' +
    'C 125 203, 142 193, 156 174 C 170 154, 176 126, 172 98',

  earL: 'M 50 118 C 40 114, 33 122, 35 134 C 37 146, 45 156, 52 154',
  earR: 'M 170 118 C 180 114, 187 122, 185 134 C 183 146, 175 156, 168 154',
  earInnerL: 'M 46 126 C 40 128, 40 138, 44 144',
  earInnerR: 'M 174 126 C 180 128, 180 138, 176 144',

  /** Filled beard mass. The curls above give it its edge; this gives it body. */
  beardBase:
    'M 50 124 C 52 160, 70 192, 110 201 C 150 192, 168 160, 170 124 ' +
    'C 164 158, 146 184, 110 191 C 74 184, 56 158, 50 124 Z',

  /**
   * Sideburn strip, joining the hair mass to the beard down past the ear.
   * Without it the side curls read as three loose dots beside the head.
   */
  sideburnL: 'M 44 96 C 33 108, 27 128, 31 147 C 34 159, 41 166, 49 167 C 43 157, 39 144, 38 129 C 37 114, 41 103, 44 96 Z',
  sideburnR: 'M 176 96 C 187 108, 193 128, 189 147 C 186 159, 179 166, 171 167 C 177 157, 181 144, 182 129 C 183 114, 179 103, 176 96 Z',

  /** Closed so the ear can be filled with paper and read against the hair. */
  earFillL: 'M 50 118 C 40 114, 33 122, 35 134 C 37 146, 45 156, 52 154 C 48 142, 47 128, 50 118 Z',
  earFillR: 'M 170 118 C 180 114, 187 122, 185 134 C 183 146, 175 156, 168 154 C 172 142, 173 128, 170 118 Z',

  /**
   * Heavy and angular, dropping toward the nose. The whole expression of the
   * reference illustration lives in these two shapes — reverse the slope and
   * the same face reads as worried.
   */
  browL: 'M 54 93 C 68 93, 87 100, 102 113 C 100 119, 94 120, 89 117 C 77 109, 65 104, 53 102 Z',
  browR: 'M 166 93 C 152 93, 133 100, 118 113 C 120 119, 126 120, 131 117 C 143 109, 155 104, 167 102 Z',

  /** Outer path is the lid weight; inner path is the white it encloses. */
  eyeOuterL: 'M 62 126 C 69 113, 89 111, 102 122 C 96 134, 73 136, 62 126 Z',
  eyeInnerL: 'M 67 125 C 74 116, 89 115, 97 123 C 91 131, 75 132, 67 125 Z',
  eyeOuterR: 'M 158 126 C 151 113, 131 111, 118 122 C 124 134, 147 136, 158 126 Z',
  eyeInnerR: 'M 153 125 C 146 116, 131 115, 123 123 C 129 131, 145 132, 153 125 Z',

  nose: 'M 110 110 C 109 126, 106 138, 100 146 C 105 151, 112 152, 119 149',
  nostrilL: 'M 100 146 C 97 148, 96 152, 98 154',
  nostrilR: 'M 121 145 C 124 147, 125 151, 123 153',

  mustache:
    'M 110 158 C 101 152, 87 154, 79 162 C 90 161, 101 162, 110 166 ' +
    'C 119 162, 130 161, 141 162 C 133 154, 119 152, 110 158 Z',

  mouthNeutral: 'M 95 173 C 102 171, 118 171, 125 173',
  mouthSmile: 'M 93 170 C 102 180, 118 180, 127 170',

  /** Soul patch, run into the goatee rather than floating under the lip. */
  goatee:
    'M 104 179 C 100 181, 99 185, 101 188 C 94 190, 90 195, 90 201 ' +
    'C 93 208, 100 213, 110 215 C 120 213, 127 208, 130 201 ' +
    'C 130 195, 126 190, 119 188 C 121 185, 120 181, 116 179 ' +
    'C 114 183, 113 185, 110 185 C 107 185, 106 183, 104 179 Z',

  /** Only visible while the face is smiling. */
  cheekL: 'M 72 150 C 69 158, 70 165, 74 170',
  cheekR: 'M 148 150 C 151 158, 150 165, 146 170',
} as const

export const eye = {
  left: { cx: 82, cy: 124 },
  right: { cx: 138, cy: 124 },
  iris: 6.6,
} as const
