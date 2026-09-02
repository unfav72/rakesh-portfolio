'use client'

import { motion, type Variants } from 'framer-motion'
import { site } from '@/config/site'
import { assets } from '@/config/assets'
import { ease, viewportOnce } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/hooks'
import TornEdge from '@/components/paper/TornEdge'
import ConnectCTA from './ConnectCTA'

/** Slower than the poster's marquee — this one is weather, not a headline. */
const DRIFT = '58s'
const COPIES = 3

/**
 * ---------------------------------------------------------------------------
 * THE LAST PAGE
 * ---------------------------------------------------------------------------
 * Not a footer. The final sheet of the portfolio: the same paper, the same
 * torn edges, the same ink — ending the way it began rather than handing the
 * visitor off to a row of link columns and a copyright notice.
 *
 * Four things carry it, in descending order of loudness:
 *
 *   the ask      LET'S CONNECT, at the scale of PORTFOLIO and HELLO, and it is
 *                the button itself
 *   the line     one sentence, warm, and then it stops
 *   the drift    the identity moving behind everything at a third of the
 *                poster's speed and 5.5% opacity — atmosphere that must lose
 *                every argument with the ask
 *   the sign-off the name in the same hand that writes on the photographs,
 *                a red tick, and the page physically tears away
 *
 * The tear at the bottom is the real ending: paper above, black below, and the
 * black runs to the edge of the browser. There is nothing after it, which is
 * the point.
 * ---------------------------------------------------------------------------
 */
export default function SiteFooter() {
  const reduced = usePrefersReducedMotion()
  const phrase = site.footer.marquee.join('  —  ')

  const group: Variants = {
    hidden: {},
    show: { transition: { delayChildren: reduced ? 0 : 0.06 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: 22 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.95, delay: i * 0.14, ease: ease.paper },
    }),
  }

  return (
    <footer id="contact" className="relative w-full" aria-label="Contact">
      <div className="relative overflow-hidden pb-[clamp(2.5rem,6vw,5rem)] pt-[clamp(4rem,11vw,9rem)]">
        {/* Behind everything, drifting. Same phase-stable CSS animation as the
            poster above — see `.marquee-track` in globals.css. */}
        <div
          className="footer-marquee pointer-events-none absolute inset-0 flex items-center"
          aria-hidden="true"
        >
          <div className="marquee-track" style={{ ['--marquee-duration' as string]: DRIFT }}>
            {Array.from({ length: COPIES }, (_, i) => (
              <span
                key={i}
                className="display whitespace-nowrap"
                style={{ fontSize: 'clamp(2.25rem, 8vw, 10rem)', letterSpacing: '-0.03em', paddingRight: '0.4em' }}
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          className="relative z-10 mx-auto max-w-[112rem] px-[max(1.5rem,7vw)]"
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {/* The ask leads. Both lines sit under it — the availability line
              first, then the invitation — and the entrance follows the same
              order, so the heading is what arrives and the copy is what
              explains it. */}
          <motion.h2 className="m-0" variants={item} custom={0}>
            <ConnectCTA />
          </motion.h2>

          <motion.p
            className="eyebrow m-0 mt-[1.15em] text-ink"
            style={{ fontSize: 'clamp(0.6875rem,1vw,0.875rem)', letterSpacing: '0.18em' }}
            variants={item}
            custom={1}
          >
            {site.firstName} {site.connect.status}.
          </motion.p>

          <motion.p
            className="body-copy copy m-0 mt-[0.85em] text-graphite"
            variants={item}
            custom={2}
          >
            {site.footer.sub}
          </motion.p>

          <motion.div
            className="mt-[clamp(3rem,8vw,6rem)] flex flex-wrap items-end justify-between gap-[clamp(1.5rem,4vw,3rem)]"
            variants={item}
            custom={3}
          >
            <Signature />
            <SocialRow />
          </motion.div>
        </motion.div>
      </div>

      {/* The page physically ends. */}
      <TornEdge side="top" seed={73} roughness={0.76} />
      <div className="on-noir bg-noir px-[max(1.5rem,7vw)] pb-[clamp(1.75rem,4vw,3rem)] pt-[clamp(0.5rem,1.5vw,1rem)]">
        <p
          className="meta m-0 text-white/45"
          style={{ fontSize: 'clamp(0.625rem,0.85vw,0.75rem)', letterSpacing: '0.14em' }}
        >
          © {site.year} {site.firstName}
        </p>
      </div>
    </footer>
  )
}

/**
 * The designer signing the last page — in the hand that writes on the
 * photographs, under a red tick. Deliberately not an avatar. Drop a signature
 * graphic into `assets.signature` and it takes this exact place.
 */
function Signature() {
  return (
    <div className="flex flex-col items-start gap-[0.5rem]">
      <span className="block h-[3px] w-[2.25rem] bg-signal" aria-hidden="true" />
      {assets.signature ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={assets.signature}
          alt={site.firstName}
          className="block h-[clamp(2.25rem,4.5vw,3.5rem)] w-auto"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          className="text-ink"
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: 'clamp(1.6rem,3.4vw,2.75rem)',
            lineHeight: 1,
          }}
        >
          {site.firstName}
        </span>
      )}
    </div>
  )
}

/**
 * Only the platforms with a real destination become links. The rest stay as
 * muted labels so the row keeps its shape without anybody inventing a URL —
 * add an href in `site.footer.links` and the label turns into a link.
 *
 * A profile opens in a new tab, because losing the portfolio to somebody's
 * Instagram is a poor way to end the visit. A mailto does not: it hands off to
 * a mail client and a blank tab left behind is just litter.
 */
function SocialRow() {
  return (
    <ul className="m-0 flex list-none flex-wrap items-center gap-[clamp(1rem,2.4vw,2rem)] p-0">
      {site.footer.links.map((link) => {
        const external = !!link.href && /^https?:/i.test(link.href)
        return (
        <li key={link.label}>
          {link.href ? (
            <a
              href={link.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="eyebrow group/link inline-flex items-center gap-[0.5em] text-ink transition-colors duration-300 hover:text-signal"
              style={{ fontSize: 'clamp(0.6875rem,1vw,0.8125rem)', letterSpacing: '0.14em' }}
            >
              {link.label}
              <span className="block h-px w-[0.9em] bg-current transition-transform duration-300 group-hover/link:translate-x-[3px]" />
            </a>
          ) : (
            <span
              className="eyebrow text-ink/35"
              style={{ fontSize: 'clamp(0.6875rem,1vw,0.8125rem)', letterSpacing: '0.14em' }}
              title="Link to be supplied"
            >
              {link.label}
            </span>
          )}
        </li>
        )
      })}
    </ul>
  )
}
