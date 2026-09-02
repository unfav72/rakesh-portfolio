'use client'

import { useState } from 'react'
import { site } from '@/config/site'

/**
 * The heading IS the button.
 *
 * There is no rectangle around it and no fill behind it — asked for a "large
 * CTA button", the honest answer in this design language is a piece of
 * typography you can press. Everything that happens on hover happens to the
 * type: it steps 5px right, a red rule draws underneath, and the arrow turns
 * from → to ↗ and leaves in the direction it now points.
 *
 * It renders as an `<a>` the moment `site.footer.href` is set, and as a
 * `<button>` until then — same look, same interaction, correct semantics
 * either way. No destination is invented: without an href the press is simply
 * acknowledged, the heading flipping to "See you there" for a couple of
 * seconds. Point it at a mailto:, a Calendly link or a contact route and that
 * acknowledgement steps aside for the real navigation.
 */
export default function ConnectCTA() {
  const [acknowledged, setAcknowledged] = useState(false)
  const { heading, href } = site.footer
  const label = acknowledged ? site.footer.acknowledged : heading

  /**
   * The arrow is bound to the last word so it can never widow onto a line of
   * its own — which is exactly what it did on a phone, where "CONNECT" fits
   * the measure and "CONNECT →" does not. Tying them makes the pair wrap
   * together instead, and it holds for any label length.
   */
  const words = label.split(' ')
  const last = words.pop() ?? ''
  const lead = words.join(' ')

  const inner = (
    <>
      <span className="connect-cta__word">
        {lead ? `${lead} ` : ''}
        <span className="whitespace-nowrap">
          {last}
          <Arrow />
        </span>
      </span>
      <span className="connect-cta__rule" aria-hidden="true" />
    </>
  )

  const shared = {
    className: 'connect-cta display m-0',
    style: {
      fontSize: 'clamp(3rem, 8.2vw, 10rem)',
      letterSpacing: '-0.045em',
      lineHeight: 0.92,
    },
  }

  if (href) {
    return (
      <a {...shared} href={href}>
        {inner}
      </a>
    )
  }

  return (
    <button
      {...shared}
      type="button"
      aria-live="polite"
      onClick={() => {
        setAcknowledged(true)
        window.setTimeout(() => setAcknowledged(false), 2400)
      }}
    >
      {inner}
    </button>
  )
}

/** Same slight bow as the scroll cue and the floating note — one hand. */
function Arrow() {
  return (
    <svg
      className="connect-cta__arrow"
      viewBox="0 0 24 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 8 C 8 7.7, 15 8.3, 22 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M15.5 2 C 17.6 4, 19.8 6.4, 22 8 C 19.8 9.6, 17.6 12, 15.5 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
