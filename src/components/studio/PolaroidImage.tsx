'use client'

type Props = {
  src?: string | null
  alt: string
  /** Shown on the placeholder so the three are distinguishable at a glance. */
  index: number
  objectPosition?: string
}

/**
 * The photograph inside a Polaroid. The box is declared by the card's
 * geometry, never by the image, so the composition is identical empty and
 * filled — dropping a photograph in changes nothing but the pixels.
 */
export default function PolaroidImage({ src, alt, index, objectPosition = '50% 50%' }: Props) {
  return (
    <div className="polaroid-photo">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} style={{ objectPosition }} loading="lazy" decoding="async" />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(46,42,34,0.14) 0 1px, transparent 1px 100%), linear-gradient(to bottom, rgba(46,42,34,0.14) 0 1px, transparent 1px 100%)',
              backgroundSize: '14px 14px',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 100% at 50% 28%, rgba(255,255,255,0.34), transparent 68%), linear-gradient(to bottom, transparent 55%, rgba(40,35,26,0.14))',
            }}
          />
          <span
            className="eyebrow absolute bottom-[7%] left-[7%] text-ink/50"
            style={{ fontSize: '5.2cqw', letterSpacing: '0.24em' }}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  )
}
