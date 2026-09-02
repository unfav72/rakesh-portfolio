# The brief

The design direction this portfolio was built to, and the rules that fell out
of it. `README.md` covers *how* it is built; this covers *why it looks like
this*, so a future change can be judged against something.

---

## The one sentence

A portfolio built as a **piece of paper**, not as a page. One continuous sheet
of warm graph stock, with a black sheet torn across it, and everything else
printed on top.

The test at every decision: does this read as something physical that was
designed, or as a website? If a treatment could appear on any SaaS landing
page, it is wrong here.

---

## What it must never become

Stated up front in the original brief and worth keeping visible:

- a generic SaaS or developer portfolio
- a simple scrolling website, or a template
- excessive gradients, glassmorphism, rounded cards, heavy shadows
- random animation — anything moving without a reason
- decorative elements that exist because they could

The imperfections are deliberate. The whitespace is the composition. Empty
areas do not get filled because they are empty.

---

## The material

| | |
|---|---|
| stock | warm off-white, never pure `#fff` — `#f3f1eb` |
| ink | never pure black — `#121211` |
| black paper | `#0c0d0c` base, lifted to the reference's measured (20,22,21) by the screened crease and fibre on top |
| accent | `#eb1926`, sampled off the reference artwork |
| ruling | 45px on a 1397px reference; fixed px, because printed grids do not scale with the browser |
| type | Archivo, self-hosted, two axes — weight 100–900 and **width 62–125%** |
| hand | Architects Daughter, self-hosted — upright, rounded, letters separated |

Paper is not a colour. It is four generated SVG layers: stock, ruled grid
masked by low-frequency noise so the ink density varies, `feDiffuseLighting`
creases, and fine fibre. **One sheet runs the height of the whole document.**
Two sheets meeting produce a dead straight tonal seam at the section boundary,
which is the one thing physical paper never does.

---

## Measured, not eyeballed

The reference artwork was read pixel by pixel. Every ratio below is in
`src/config/tokens.ts` with its derivation, and the type was matched to the
ratios rather than picked by eye.

```
PORTFOLIO ink   159 → 1242 on a 1397px reference (1083 wide = 77.5% of viewport)
cap height      101px,  baseline y 433
face ink        x 760 → 969, y 266 → 478 — very nearly square
the gap it sits in, F's ink to L's ink: 193px
eyebrow         cap 20px, baseline 14px above the cap line
2026            cap 31px — its cap TOP aligns with the eyebrow's, so it hangs lower
```

Archivo at width **118%** with **−0.02em** tracking gives ink-span ÷ cap-height
= 10.725; the reference measures 10.723. The display size is solved, not
chosen: ink span is 7.400 × font-size at that width, and 0.775 ÷ 7.400 =
**10.47vw**.

The face is a **glyph, not an overlay**. Its slot is an inline-block of zero
height, so its bottom edge lands exactly on the text baseline and the
illustration hangs off that edge in `em`. It cannot come loose from the word at
any viewport or any asset size.

---

## Motion

Four easing curves and one timing score, in `src/lib/motion.ts`. Nothing
overshoots. **Paper does not bounce.**

- **Slow.** Nothing frantic.
- **Physical.** Things behave like paper, ink, photographs.
- **Editorial.** A magazine coming alive, not a UI reacting.
- **Intentional.** Every animation has a reason.
- **No gimmicks.** Nothing animates because it can.

Parallax is three layers moving against each other by **single-digit pixels**.
Too small to notice, just enough that the sheet reads as a physical thing under
the type. It runs on CSS custom properties from one rAF loop that parks itself
the moment the pointer stops — no React render is involved, and nothing spins
in the background.

`prefers-reduced-motion` stops the loops, the drift, the parallax, the smooth
scrolling and the custom cursor, and resolves every reveal instantly. It never
removes content.

---

## The sections

**01 · Cover.** The poster. Four fifths of the sheet is empty paper and that
emptiness is the composition. `PORTFOLIO` assembles letter by letter over a 7%
grey proof of itself, leaving a hole where the second **O** should be; the face
is placed into it a beat later. Then, only once you scroll, a second layer: a
drawn arrow, a red mark, `G K REDDY` — scrubbed to scroll progress, so it
un-draws if you scroll back up.

**02 · Hello.** Three columns where hierarchy does all the work: HELLO
enormous, a bold line, grey body copy, two headings at one shared size. No
cards, no rules, no icons on the education entries. The left frame holds a
moving picture whose studio backdrop is **keyed out on luminance**, so the
paper is not behind the artwork — it is inside it.

**03 · The moving poster.** Built on one contrast: **the type moves, the
person does not.** The portrait is sandwiched between two sheets — black
behind, white in front — so his lower body goes under the torn edge rather
than stopping at the bottom of its own photograph.

**04 · THE STU.** The quiet after the black sheet. Three Polaroids at
different angles with a hand writing under each. Every angle, drop, shadow
weight and slant is a value in config — **a hand, not a seed.** Randomness
reads as a bug; a decision reads as a person.

**05 · The last page.** Not a footer. `LET'S CONNECT` at cover scale, and the
heading *is* the button — no rectangle, no fill. Then the page physically
tears away.

---

## Placeholders

Every placeholder holds the **exact box** its final asset will occupy — aspect
ratio, position, crop behaviour, border, shadow, animation, z-order — so
nothing moves on hand-off. They are drawn in the language of the rest of the
sheet (crop marks, registration marks, printer's furniture), never a grey box.

Everything routes through `src/config/assets.ts`. Drop a file into
`public/assets/…`, set the path, done.

---

## Rules learned the hard way

Each of these cost a visible defect before it was understood. They are worth
keeping.

1. **Never let the motion preference reach a rendered attribute.** `initial`
   and `data-*` are serialised into the SSR markup, and React does not patch
   style mismatches on hydration — the element stays invisible forever. Branch
   on `transition` and `animate` instead.

2. **Do not use Framer's `useReducedMotion`.** It returns `null` on the first
   render, which is the only render that matters for a mount animation, so
   every `reduced ? … : …` silently takes the animated path. Use
   `usePrefersReducedMotion` from `lib/hooks`.

3. **Framer leaves inline styles behind.** An element it animated carries
   `opacity: 1` inline afterwards, which beats any stylesheet rule. Put
   dependent CSS on a node Framer does not touch.

4. **Round generated geometry before it reaches an attribute.** `Math.sin` and
   `Math.cos` disagree at the last bit between Node and Chrome, and one ULP is
   a hydration mismatch.

5. **Torn edges must overfill.** The fray filter displaces the straight edge
   that closes the shape, so closing on the boundary opens a hairline seam
   across the page.

6. **Reserve the box on lazily-loaded images.** No reserved height means the
   browser never counts it as near the viewport, so it never loads, so it never
   gets a height — and the image silently vanishes.

7. **Scroll-linked means scrubbed.** A `scroll` listener that starts a timeline
   looks identical for one second and then stops obeying. Map progress with
   `useTransform`.

8. **Cascade layers.** Unlayered CSS outranks all of Tailwind's layers, so an
   unlayered `.paper-sheet { position: relative }` silently beats
   `class="absolute"`. The design system lives in `@layer components`.

---

## Working on this

Run one dev server and check which port it actually took — a stale server
holding port 3000 will serve an old build and send you hunting for bugs that
are not there. Never run `next build` while `next dev` is running: they share
`.next` and the result is a broken mixture.
