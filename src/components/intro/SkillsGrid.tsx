'use client'

import { motion, type Variants } from 'framer-motion'
import { site } from '@/config/site'
import { ease } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * Three across, two down, exactly as in the reference — and the grid geometry
 * is unchanged from when these were placeholders, so nothing above or below it
 * moved when the real artwork landed.
 *
 * The logos ARE the elements. No tile, no card, no invented container: each
 * file carries its own background treatment and keeps it, which is why the set
 * is deliberately not uniform — four rounded tiles, one square black tile, one
 * bare glyph. Brand colour is untouched and there is no filter on any of them.
 *
 * Every cell is a square and every logo is contained inside it, so they share
 * a footprint without any of them being stretched. `scale` is the one
 * exception, and it is optical rather than dimensional: a bare glyph at the
 * same height as a filled tile reads slightly smaller than it measures.
 */
export default function SkillsGrid() {
  const reduced = usePrefersReducedMotion()

  /**
   * Variants rather than its own `whileInView`: the logos inherit the
   * section's reveal through Framer's context, so they settle as part of one
   * composition instead of firing on their own observer.
   */
  const tile: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.6, delay: 0.42 + i * 0.055, ease: ease.paper },
    }),
  }

  return (
    <ul className="m-0 grid max-w-[17.5rem] list-none grid-cols-3 gap-[clamp(0.7rem,1.55vw,1.4rem)] p-0 lg:max-w-none">
      {site.skills.items.map((skill, i) => (
        <motion.li key={skill.label} variants={tile} custom={i}>
          <span className="block aspect-square transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:scale-[1.03]">
            {skill.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={skill.src}
                alt={skill.label}
                title={skill.label}
                className="h-full w-full object-contain"
                style={skill.scale === 1 ? undefined : { transform: `scale(${skill.scale})` }}
                loading="lazy"
                decoding="async"
              />
            ) : (
              /* Only reached if a logo is removed from the config. */
              <span
                className="flex h-full w-full items-center justify-center rounded-[18%] border border-ink/25"
                title={skill.label}
              >
                <span
                  className="display text-ink/70"
                  style={{ fontSize: 'clamp(0.9rem,1.85vw,1.7rem)', textTransform: 'none' }}
                  aria-hidden="true"
                >
                  {skill.short}
                </span>
                <span className="sr-only">{skill.label}</span>
              </span>
            )}
          </span>
        </motion.li>
      ))}
    </ul>
  )
}
