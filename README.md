# GIREESH — Portfolio 2026

A portfolio built as a piece of paper rather than as a page: one continuous
sheet of warm graph stock, with a black sheet torn across it and everything
else printed on top.

```bash
npm install
npm run dev        # http://localhost:3000
```

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion ·
Lenis. Archivo is self-hosted in `public/fonts`, so the build has no network
dependency and the first paint has no third-party round trip.

---

## What is built

| | |
|---|---|
| **01 · Cover** | Graph paper, `DESIGNER / ILLUSTRATOR`, `PORTFOLIO` assembling letter by letter with the illustrated face placed into the gap where the second **O** should be, `2026`. Then, only once you scroll: a drawn arrow, a red mark, and `G K REDDY`. |
| **02 · Hello** | The video plate, introduction, education, skills, experience — the reference's three-column composition. |
| **03 · The moving poster** | Black torn paper, `PORTFOLIO GIREESH` drifting slowly left to right off both edges, the die-cut portrait standing still in front of it. |
| **04 · THE STU** | Three Polaroids laid on the paper at different angles, handwritten notes underneath, click to enlarge. |
| **05 · The last page** | `LET'S CONNECT` at cover scale — the heading *is* the button — the identity drifting behind it, a signature, and the paper tearing away. |

Selected Work, Process and Experiments are not
built yet. They drop into the list in `src/app/page.tsx` and inherit the paper
automatically — nothing above them changes.

---

## Replacing the placeholders

**Everything routes through [`src/config/assets.ts`](src/config/assets.ts).**
Drop the file into `public/assets/…`, set the path, done. No component edits.

Every placeholder already holds the exact box its final asset will occupy —
aspect ratio, position, crop behaviour, border, shadow, animation, z-order — so
the layout does not move when the real files land.

| Asset | Where it goes | Shape it must fill |
|---|---|---|
| `heroFace` | inside the word `PORTFOLIO` | ~210 × 213 (very nearly square — the hair is wider than the head is tall) |
| `frame.video` | section 02, left column | 144 : 335 plate. Portrait clip; `cover` trims the empty backdrop either side and keeps the full head-to-feet height |
| `frame.key` | — | the luminance band where the clip's own background dissolves into the paper. Re-measure per clip |
| `frame.poster` | behind the video while it loads | its own first frame — regenerate whenever the clip changes |
| `nameCutout.src` | section 03, in front of the type | **supplied** — extracted from the studio JPEG by `tools/extract-cutout.py` |
| `nameCutout.sticker` | — | generates the red die-cut edge from the image's own alpha. Turn off if your artwork already carries its own outline |
| `avatar` | the floating contact note | **supplied** — head crop from the same studio portrait as the cut-out |
| `studio[0..2]` | section 04, left to right | **supplied** — desk, the eyes, at work. 4:3 sources, cropped `cover` into the 1.24 plate; originals in `reference/studio-source/` |
| `skills[].src` | section 02, right column | roughly square. Each file keeps its own background treatment; `scale` is an optical nudge for glyphs that carry no container |

### The face, specifically

`heroFace` takes either form:

```ts
// One flat image. Renders perfectly, breathes, but cannot blink.
heroFace: { flat: '/assets/hero-face.png', layers: null }

// Four parts on ONE shared canvas — same width, same height, nothing
// re-cropped. This drives the full rig.
heroFace: {
  flat: null,
  layers: {
    base:  '/assets/face/base.png',   // head, hair, brows, nose, beard — everything static
    eyes:  '/assets/face/eyes.png',   // eye whites + irises only
    lids:  '/assets/face/lids.png',   // the closed-eye shape, drawn over `eyes`
    mouth: '/assets/face/mouth.png',  // neutral mouth only
  },
}
```

Until then it renders a hand-drawn SVG portrait with the whole rig live —
that is the placeholder you are looking at, and it is the easiest way to see
what the blink, the squint and the iris tracking actually do.

---

## Where the numbers came from

The reference artwork was measured pixel by pixel rather than eyeballed, and
the measurements live in [`src/config/tokens.ts`](src/config/tokens.ts) with
their derivations. On a 1397px-wide reference:

```
PORTFOLIO ink   159 → 1242   (1083 wide = 77.5% of the viewport)
cap height      101px,  baseline y 433
face ink        x 760 → 969,  y 266 → 478
the gap it sits in, F's ink to L's ink: 193px
eyebrow         cap 20px, baseline 14px above the cap line
2026            cap 31px — its cap TOP aligns with the eyebrow's, so it hangs lower
```

Type was then matched to those ratios rather than picked by eye. Archivo at
width 118% with −0.02em tracking gives ink-span ÷ cap-height = 10.725; the
reference measures 10.723. The display size is solved, not chosen: ink span is
7.400 × font-size at that width, and 0.775 ÷ 7.400 = **10.47vw**.

**The face is a glyph, not an overlay.** Its slot is an inline-block of zero
height, so its bottom edge lands exactly on the text baseline, and the
illustration hangs off that edge in `em`. It cannot drift out of the word at
any viewport or any asset size.

---

## How things are put together

```
src/
  app/            layout, page, globals.css (design system + cascade layers)
  components/
    paper/        PaperRun · Sheet · TornEdge
    hero/         Hero · HeroTypography · AnimatedPortfolio · AnimatedFace
                  faceGeometry · NameSignature · ScrollIndicator
    intro/        IntroSection · VideoArtFrame · SkillsGrid
    name/         NameStrip
    ui/           ConnectCard · StickerCutout · Cursor · SmoothScroll
  lib/            paper (textures) · tear (torn edges) · motion (the score)
                  hooks · random
  config/         site (all copy) · assets (all files) · tokens (all geometry)
```

**Paper** is not a colour, it is four generated SVG layers — warm stock, ruled
grid masked by low-frequency noise so the ink density varies, `feDiffuseLighting`
creases, and fine fibre. One sheet runs the height of the whole document
(`PaperRun`); the black page in section 03 is a second sheet lying on top of it,
and the tear is how you see the first one again underneath. Two sheets meeting
would produce a dead straight tonal seam across the page, which is the one
thing physical paper never does.

**Torn edges** are generated, not drawn: a slow sweep, a medium tremor, a fine
fray and occasional sudden notches (`lib/tear.ts`), then a fractal displacement
filter that frays the silhouette at the pixel level, plus a white fibre rim and
the shadow the upper sheet casts on the one below. Change a `seed` and you get
a different, equally plausible tear.

**The red die-cut edge** uses `feMorphology`, not stacked drop-shadows: a true
dilation, so the outline stays even around concave shapes, and its square
kernel leaves exactly the slightly faceted cut-with-scissors edge the reference
has. It reads `SourceAlpha`, so it works on the placeholder today and on a
transparent PNG tomorrow with no change.

**Motion** is four easing curves and one timing score (`lib/motion.ts`). Nothing
overshoots; paper does not bounce. The parallax is three layers moving against
each other by single-digit pixels, driven by CSS custom properties from one rAF
loop that parks itself the moment the pointer stops — no React render is
involved, and nothing spins in the background.

### The skills logos

Six real logos, in `public/assets/skills/`, listed in `site.skills.items`.
They are the elements — there is no tile, no card and no invented container
behind them, and no filter on any of them. Which means the set is deliberately
not uniform: four rounded tiles, one square black tile, one bare glyph, exactly
as each file was supplied. The originals are kept untouched in
`reference/skills-source/`.

The only processing was trimming the flat padding some export files carried, by
flooding inward from the edges rather than keying a colour — a flood only
removes background that is actually connected to the edge, so white *inside* a
mark can never be punched out by accident. Nothing was recoloured, restyled or
redrawn.

Every cell is a square and every logo is contained in it, so they share a
footprint without any being stretched. `scale` is the one exception and it is
optical, not dimensional: a bare glyph reads smaller than a filled tile of the
same height, and a square tile reads larger than a rounded one.

---

## The cover's second layer

The cover arrives clean — word, face, year, and a great deal of empty paper.
Everything else is a layer the visitor **uncovers by moving**: a curved
hand-drawn arrow descending from under the face, a small red mark, and the
signature `G K REDDY`.

**It is scrubbed, not triggered.** Every value is a `useTransform` off the
hero's own scroll progress, so the ink follows the wheel rather than being
fired by it — stop half way and the arrow stays half drawn; scroll back up and
it un-draws in your hand. A `scroll` listener that kicks off a timeline looks
identical for one second and then stops obeying, which is the whole difference
between an animation and an interaction. Measured across the range:

```
rest   path 0.00 drawn   mark 0    name 0
15%    path 0.11         mark 0    name 0
35%    path 0.85         mark 0    name 0
42%    path 1.00         mark 0.5  name 0
55%    path 1.00         mark 1    name 0.77, rising
back   path 0.00         mark 0    name 0
```

The arrow is a single path — sweep first, arrowhead second — so normalising it
to `pathLength: 1` makes the head the last thing to draw at no extra cost. The
face keeps blinking through all of it; nothing here touches it.

The old bouncing scroll cue and the load-time `GIREESH` signature are gone. A
generic indicator and a hand-drawn gesture doing the same job is one job too
many — **but note that the cover now carries no scroll affordance at all until
you scroll.** That is what "the hero should initially feel clean" asks for;
say the word if you would rather have a quiet cue back.

`site.signatureName` holds `G K REDDY`, kept separate from `firstName` — the
introduction, the poster and the contact note all still say GIREESH.

---

## The video plate

Section 02's left frame holds a moving picture, and the point is that it does
not read as one. No border, no corners, no card shadow — **no rectangle at
all**. There is no play button, no timeline and no controls; it autoplays
muted, loops and plays inline everywhere.

The whole thing turns on one move: **the clip's studio backdrop is keyed out on
luminance**, so the paper is not *behind* the artwork, it is *inside* it. The
real graph ruling, the real creases and the real fibre show through around the
figure because they are the page's own, at the page's own scale and phase —
nothing faked, aligned or copied.

That is also why it is a luminance key and not the more obvious
`mix-blend-mode: multiply`. Blending only reaches the nearest isolated group,
and between the video and the sheet there are half a dozen stacking contexts:
the reveal's opacity, the parallax transform, the z-index that lifts the plate
over the torn edge below. Any one of them silently breaks a blend. Alpha does
not care — it composites all the way down.

**The band is measured, not guessed.** In this clip skin peaks at 0.567
luminance and the darkest backdrop is 0.782, so the transition sits at
0.62 → 0.78: the figure is untouched, the backdrop is gone, and the luminance
between them becomes a soft edge that no rectangle survives. Sampling the
rendered page across the invisible box confirms it — paper inside versus paper
outside differs by 0.1–1.4 out of 255, below perceptual threshold.

The rest is restraint. A soft, wide darkening low in the box puts back the
contact shadow the key took with the floor. One hairline and one red tick are
printed on the paper beside it. Cursor parallax is capped at 4px — about 1.4%
of the box, well inside "you feel it, you don't see it". It surfaces on scroll
with opacity and a breath of scale, no travel: a plate that slides in is a
card, a plate that fades up out of the grain was always in the paper.

Playback is viewport-aware: nothing is fetched until the plate is within a
screen, and it pauses again once it leaves. If a browser refuses the autoplay
it retries on the first interaction rather than showing an error state — the
poster holds the composition meanwhile.

To change the clip, change `assets.frame.video`, regenerate the poster, and
re-measure the key band (sample the brightest part of the subject and the
darkest part of its background, and put the band between them):

```bash
ffmpeg -ss 0 -i public/assets/videos/frame-artwork.mp4 -frames:v 1   -vf scale=540:-1 -q:v 4 public/assets/videos/frame-artwork-poster.jpg -y
```

Set `frame.key` to `null` for footage that already carries an alpha channel.

`<VideoArtFrame />` takes `video`, `poster`, `image`, `aspect`, `objectFit`,
`objectPosition`, `keyBand`, `feather`, `drift`, `ground` and `alt`, so the
same component holds any plate anywhere on the site.

---

## The moving poster

Section 03 is built on one contrast: **the type moves, the person does not.**
The portrait gets an entrance and then holds absolutely steady while the poster
behind it keeps travelling. Animate both and it becomes a carousel; animate
neither and it is a photograph.

Layering does the rest — black paper, then the drifting type, then the cut-out
on top with transparent surroundings, so the letters genuinely pass *behind*
the body rather than being hidden by a rectangle. A copy of the phrase runs
about 1.26 screens wide, so at the right moment it splits either side of the
figure and reads `PORTFOLIO — person — GIREESH`, which is the reference's whole
composition. Cap height lands at 18% of the strip; the reference measures 18.5%.

### Why the drift is CSS and not JavaScript

The hard requirement is that the marquee **never restarts**. Scroll into it,
resize the window, re-render React, hover it — the phase has to survive all of
it or the strip stops reading as one continuous physical object. A plain CSS
animation on a stable node makes every one of those fall away structurally
rather than by workaround:

| hazard | why it cannot bite |
|---|---|
| scroll / entering view | CSS animations do not care where the viewport is, so the marquee is never gated on an observer |
| React re-render | the node is not remounted and `animation-name` never changes, so the running animation is untouched |
| resize | travel is a **percentage** of the track, so a new viewport changes the distance but not the progress — it re-lays-out mid-stride instead of jumping. And because the type is sized in `vw`, the track scales with the viewport, so one fixed duration already gives a constant perceived speed at every width. Nothing to recompute, therefore nothing to jump |
| hover | there is no hover handler at all |

Measured over scroll, resize and hover, the animation's `currentTime` climbs
monotonically from 3.7s to 13.4s with no reset, and the track's `x` increases
throughout — left to right, one continuous phase.

Three copies rather than two: the loop shifts by exactly one copy, and three
keeps the viewport covered at the reset even where the clamp caps the type on a
very wide screen. Under `prefers-reduced-motion` the drift stops and the
typography stays exactly where it is — the setting should stop movement, not
delete a section.

### The cut-out

`public/assets/name-cutout.webp` was cut off its studio backdrop by
`tools/extract-cutout.py`, which is re-runnable and never touches the source in
`reference/portrait-cutout-source.jpg`. The surroundings have to be genuinely
transparent or the letters get covered by a rectangle instead of passing behind
the body.

Four things in that script are load-bearing, and each one is there because the
simpler version visibly failed:

- **Dense border seeding at a low threshold.** One global tolerance cannot work
  here: the white shirt is chromatically closer to the backdrop than to
  anything else in the picture, so any threshold wide enough to clear the
  backdrop also floods the shirt through the collar. Seeding every 24px along
  the border lets each region flood against its own local tone instead.
- **A depth guard, not just a colour test.** The shirt is backdrop-ish too — it
  survives because it sits ~150px from any backdrop, and depth protects it
  where colour cannot.
- **A saturation guard.** Widening the colour test far enough to catch the wall
  shadow behind his shoulder also caught lit skin at the silhouette edge, and
  since the die-cut edge is generated *from* the alpha, every hole printed as a
  red squiggle on his face. The backdrop and that shadow are neutral; skin is
  not.
- **Despill.** The soft edge is un-premultiplied against the cream it was shot
  on. Without it every semi-transparent pixel keeps a halo the moment it lands
  on black.

The red die-cut edge is generated in CSS from the image's own alpha, so it
follows the hair rather than a rectangle. Set `nameCutout.sticker` to `false`
if you later supply artwork that already carries its own outline.

**He is sandwiched between two sheets, and that is what stops it reading as a
passport photo.** The black sheet is behind him; the white sheet below is in
front, masked over his lower body with the *same* rip that draws the torn edge
— same seed, same roughness, same authored width, both stretched with
`preserveAspectRatio="none"`, so the two curves are the same curve.

The reason is structural, not decorative. His suit does not end because his
body ends; it ends because the photograph was cropped there. Left visible, the
die-cut closes underneath him in a straight line and the silhouette becomes a
rectangle with a rounded top — the exact thing a cut-out must not look like.
Running him under the paper removes the false edge entirely.

One trap worth knowing if you swap the asset: the image carries explicit
`width`/`height` from `assets.nameCutout`. Without them a lazily-loaded
`h-auto` image deadlocks — no reserved height means the browser never counts it
as near the viewport, so it never loads, so it never gets a height, and the
portrait silently disappears. `tools/extract-cutout.py` prints the numbers on
every run.

---

## THE STU

The quiet after the black sheet — warm paper, three photographs, a hand writing
under each. The contrast with the section above is the point: big, black and
moving, into white, still and personal.

Geometry is measured off the reference and expressed in card-relative units, so
a Polaroid scales as one object:

```
card    1 : 1.19        border  4% of card width, three sides
photo   1.24 landscape  caption band takes the remainder, ~41%
```

Each card is its own **container**, so the handwriting is sized in `cqw` and
tracks the card exactly at every breakpoint — no media query touches it. The
caption is sized against the *longest* quote, not the average, and carries
`min-height: 0`: without it, one long caption is a flex item that cannot shrink
below its content, so it silently pushes its card taller and the row stops
being a row.

The title sits in the gap the middle photograph leaves by dropping, so the
outer two rise past it on either side. That is why the row carries a negative
top margin on desktop and none below 1024px, where it becomes a scrapbook
column — alternating left, centre, right — rather than three shrunken columns.
Three columns at tablet width would technically preserve the layout and destroy
the thing the layout is for: the handwriting fell to 13px. In the column it
stays at 20px.

**The imperfection is controlled, not random.** Every angle, vertical drop,
shadow weight, slant of handwriting and horizontal drift is a value in
`site.studio.items`. Randomness reads as a bug; a decision reads as a hand.

Interaction is three nested transforms on three different clocks — stagger is
static config, tilt is a rAF loop reading the cursor, lift is a CSS transition.
Hovering straightens the card toward neutral (−5° → −2°), lifts it 6px,
deepens the shadow and scales the photograph 3%, while the other two step back
to 92% opacity. Clicking opens a larger view; give a card an `href` in config
and it becomes a link to the piece instead, with no visual change.

The photographs are in, ordered to their captions the way the reference pairs
them: the desk under Tiago Forte, the eyes under Lil Yachty, the work-in-
progress under Nietzsche. Only the middle one needed a crop nudge —
`objectPosition: '56% 38%'`, because the eyes sit high and right of centre and
a dead-centre crop puts the frame edge through them.
`Architects Daughter` is self-hosted in `public/fonts` — upright, rounded,
letters separated, which is what the reference captions actually are rather
than a decorative cursive.

---

## The last page

Not a footer. The final sheet: same paper, same torn edges, same ink, ending
the way it began rather than handing the visitor to a row of link columns.

**The heading is the button.** Asked for a large CTA, the honest answer in this
language is a piece of typography you press — no rectangle, no fill, no hover
box. Everything happens to the type: it steps 5px right, a red rule draws
underneath, and the arrow turns from → to ↗ and leaves in the direction it now
points. Transform and colour only; the rule grows on `scaleX`, so nothing
touches layout.

It renders as an `<a>` the moment `site.footer.href` is set and as a `<button>`
until then — same look, correct semantics either way. It now points at the
inbox; swap it for a Calendly or a contact route whenever you have one, and the
"See you there" acknowledgement (which only runs when there is no destination)
steps aside on its own.

The social row follows the same rule: a `null` href renders as a muted label
holding the composition, a real URL turns it into a link. LinkedIn, Instagram
and Email are live; **Behance is not listed because there is no URL for it** —
add one line to `site.footer.links` and it lights up. Profile links open in a
new tab (`rel="noopener noreferrer"`), because losing the portfolio to somebody
else's Instagram is a poor way to end the visit; the mailto does not, since a
blank tab left behind is just litter. The share-sheet tracking parameters
(`igsi`, `utm_source=share_via`) are stripped — they are artefacts of the share
button, not part of the address.

Behind it the identity drifts at a third of the poster's speed and 5.5%
opacity — the same phase-stable CSS animation, dialled down to weather. The
signature is the name in the hand that writes on the photographs, under a red
tick; `assets.signature` takes that exact place when you have a graphic.

In-page links now travel rather than jump: a native hash navigation sets the
scroll in one frame, which on a weighted page reads as the document being
yanked, and then fights the smoother. `SmoothScroll` hands the target to Lenis
instead, so the floating note's "Let's connect" carries you down to this page.

Two fixes landed here that affect every torn edge on the site:

- **The rips overfill by 24 units.** The fray filter displaces the whole shape
  including the straight edge that closes it, so closing exactly on the
  boundary opened a hairline of daylight — a dashed seam across the width of
  the page wherever a tear met a sheet.
- **`TornEdge` defaults to the noir token** rather than a hard-coded black, so
  a rip and the sheet it joins can never drift to two different blacks. They
  now measure identically across the boundary.

---

## Responsive

Desktop reproduces the reference. Phones and tablets get their own
compositions rather than a scaled-down one:

- **Phone** — the word takes more of the width, the labels move into normal
  flow above it with real space (both hit their legibility floors at that size,
  and an em-derived gap that small puts them on top of the letters), and the
  lock-up rides higher so the signature and scroll cue have somewhere to live.
- **Tablet** — the portrait keeps its place to the left of `HELLO`, and skills
  and experience sit side by side underneath.

## Reduced motion

`prefers-reduced-motion: reduce` stops the loops, the drift, the parallax, the
smooth scrolling and the custom cursor, and resolves every reveal instantly.
Two things are worth knowing if you touch this:

- Use `usePrefersReducedMotion` from `lib/hooks`, **not** Framer's
  `useReducedMotion` — Framer's returns `null` on the first render, which is
  the only render that matters for a mount animation, so every
  `reduced ? … : …` branch silently takes the animated path.
- Never let the preference reach the `initial` prop. `initial` is serialised
  into the SSR style attribute, and React does not patch style mismatches on
  hydration — the element stays invisible forever. Branch on `transition` and
  `animate` instead.

## Accessibility

Semantic headings, a skip link, focus-visible outlines that invert on the dark
sheet, alt text and `sr-only` labels on every decorative graphic, and the
display word carries `aria-label="PORTFOLIO"` so the per-letter spans are never
read out one at a time.

---

## Screenshots

`tools/shoot.mjs` renders the page at a given size and scroll position, after
walking the document top to bottom so every scroll-triggered reveal has fired:

```bash
npm run shoot -- hero 1440 900 0 4200        # name, width, height, scrollY, wait(ms)
npm run shoot -- whole 1440 900 0 4200 full  # full-page capture
```

Optional. `npm uninstall playwright && rm -rf tools` if you would rather not
carry it.
