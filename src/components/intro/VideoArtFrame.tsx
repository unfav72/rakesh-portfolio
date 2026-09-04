'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePrefersReducedMotion, useElementPointer } from '@/lib/hooks'

type Props = {
  /** Moving artwork. Takes precedence over `image`. */
  video?: string | null
  /** First frame, held while the file loads. */
  poster?: string | null
  /** Still fallback for when there is no video. */
  image?: string | null
  /** Width ÷ height of the invisible frame. Never derived from the media. */
  aspect: number
  objectFit?: 'cover' | 'contain'
  /** Nudge the crop when the subject is not dead centre. */
  objectPosition?: string
  /**
   * Luminance band, 0–1, over which the artwork's own background dissolves
   * into the page. Everything brighter than `high` goes fully transparent,
   * everything darker than `low` stays fully opaque, and the gap between them
   * is the soft edge. Set `null` for footage that is already transparent.
   */
  keyBand?: { low: number; high: number } | null
  /** Perimeter softening, as a percentage. Insurance against a lit backdrop. */
  feather?: number
  /** Cursor parallax, in px. Capped low — this is a printed page, not a card. */
  drift?: number
  /** The contact shadow that sits the figure on the sheet. */
  ground?: boolean
  alt?: string
  className?: string
}

/**
 * ---------------------------------------------------------------------------
 * VIDEO ART FRAME
 * ---------------------------------------------------------------------------
 * A moving picture printed into the sheet. Not a player, and deliberately not
 * a frame either — no border, no corners, no card shadow, no rectangle at all.
 *
 * The whole thing turns on one move: the clip's studio backdrop is keyed out
 * on luminance, so the paper is not *behind* the artwork, it is *inside* it.
 * The real graph ruling, the real creases and the real fibre show through the
 * figure's surroundings because they are the page's own, at the page's own
 * scale and phase — nothing faked, aligned or copied.
 *
 * That is also why this is a luminance key and not the more obvious
 * `mix-blend-mode: multiply`. Blending only reaches the nearest isolated
 * group, and between this video and the sheet there are half a dozen stacking
 * contexts — the reveal's opacity, the parallax transform, the z-index that
 * lifts the plate over the torn edge below. Any one of them silently breaks a
 * blend. Alpha does not care: it composites all the way down.
 *
 * The band is measured, not guessed. In this clip skin peaks at 0.567 and the
 * darkest backdrop is 0.782, so the transition sits at 0.62 → 0.78: the figure
 * is untouched, the backdrop is gone, and the luminance between them becomes a
 * soft edge that no rectangle survives.
 *
 * The invisible frame still owns width, height, position, crop and responsive
 * behaviour, so swapping the clip moves nothing on the page.
 * ---------------------------------------------------------------------------
 */
export default function VideoArtFrame({
  video = null,
  poster = null,
  image = null,
  aspect,
  objectFit = 'cover',
  objectPosition = '50% 50%',
  keyBand = { low: 0.62, high: 0.78 },
  feather = 4,
  drift = 4,
  ground = true,
  alt = '',
  className = '',
}: Props) {
  const reduced = usePrefersReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const filterId = `paper-key-${uid}`

  const root = useRef<HTMLElement>(null) as React.RefObject<HTMLElement | null>
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)

  useElementPointer(root, drift > 0 && !reduced)

  /* ------------------------------------------------- viewport-aware playback */
  useEffect(() => {
    const el = root.current
    if (!el || !video) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting)
      },
      {
        // A screen of margin: ready before it is ever looked at.
        rootMargin: '100% 0px',
        threshold: 0,
      },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [video])

  /* ----------------------------------------------- continuous seamless loop playback */
  useEffect(() => {
    const el = videoRef.current
    if (!el || !video) return

    if (!active) {
      el.pause()
      return
    }

    let cancelled = false
    const playVideo = () => {
      if (cancelled) return
      el.play().catch(() => {
        if (cancelled) return
        // Autoplay refused. Retry on the first visitor interaction
        const retry = () => {
          el.play().catch(() => {})
        }
        window.addEventListener('pointerdown', retry, { once: true })
        window.addEventListener('keydown', retry, { once: true })
        window.addEventListener('touchstart', retry, { once: true })
        window.addEventListener('scroll', retry, { once: true })
      })
    }

    playVideo()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active) {
        playVideo()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [active, video])

  /* Seamless loop helpers: reset before EOF buffer freeze */
  const handleTimeUpdate = () => {
    const el = videoRef.current
    if (el && el.duration && el.currentTime >= el.duration - 0.08) {
      el.currentTime = 0
      el.play().catch(() => {})
    }
  }

  const handleEnded = () => {
    const el = videoRef.current
    if (el) {
      el.currentTime = 0
      el.play().catch(() => {})
    }
  }

  /* ----------------------------------------------------------------- treatment */
  // alpha = 1 − luminance, then steepened so only the backdrop band dissolves.
  const slope = keyBand ? 1 / Math.max(keyBand.high - keyBand.low, 0.01) : 0
  const intercept = keyBand ? -(1 - keyBand.high) * slope : 0

  const treatment = [
    keyBand ? `url(#${filterId})` : '',
    // Half a step of warmth and bite, so the ink belongs to this stock.
    'saturate(0.95) contrast(1.03)',
  ]
    .filter(Boolean)
    .join(' ')

  const edge = `linear-gradient(to right, transparent 0, #000 ${feather}%, #000 ${100 - feather}%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 ${(feather * 0.7).toFixed(1)}%, #000 ${(100 - feather * 0.7).toFixed(1)}%, transparent 100%)`

  const softEdge = feather
    ? {
        maskImage: edge,
        WebkitMaskImage: edge,
        maskComposite: 'intersect' as const,
        WebkitMaskComposite: 'source-in',
      }
    : undefined

  const mediaStyle = { objectFit, objectPosition, filter: treatment }

  return (
    <figure ref={root} className={`relative m-0 ${className}`}>
      {keyBand && (
        <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
          <defs>
            <filter
              id={filterId}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              {/* Keep RGB, replace alpha with 1 − luminance. */}
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -0.2126 -0.7152 -0.0722 0 1"
              />
              {/* Steepen it into a key: backdrop out, figure untouched. */}
              <feComponentTransfer>
                <feFuncA type="linear" slope={slope.toFixed(4)} intercept={intercept.toFixed(4)} />
              </feComponentTransfer>
            </filter>
          </defs>
        </svg>
      )}

      {ground && <Ground />}

      {/* The frame is invisible and still does its whole job: it sets the box. */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: String(aspect),
          transform: `translate3d(calc(var(--tx, 0) * ${drift}px), calc(var(--ty, 0) * ${(drift * 0.75).toFixed(2)}px), 0)`,
          willChange: drift ? 'transform' : undefined,
          ...softEdge,
        }}
      >
        {video ? (
          <video
            ref={videoRef}
            src={video}
            poster={poster ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            controls={false}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            aria-label={alt || undefined}
            className="h-full w-full"
            style={mediaStyle}
          />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={alt}
            className="h-full w-full"
            style={mediaStyle}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="sr-only">Media placeholder</span>
        )}
      </div>
    </figure>
  )
}

/**
 * What sits the figure on the sheet.
 *
 * The key takes the studio floor with it, so this puts back the one thing that
 * was load-bearing: a soft, wide darkening low in the box. No offset, no card
 * shadow — just the ground going darker where something stands on it. Then one
 * hairline and one red tick, printed on the paper beside it.
 */
function Ground() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
      <span
        className="absolute left-1/2 top-[89%] h-[5%] w-[64%] -translate-x-1/2"
        style={{ background: 'radial-gradient(closest-side, rgba(34,29,20,0.20), transparent 74%)' }}
      />
      <span className="absolute left-0 top-[calc(100%+16px)] h-px w-[46%] bg-ink/20" />
      <span className="absolute left-0 top-[calc(100%+16px)] h-px w-[10px] bg-signal/70" />
    </span>
  )
}
