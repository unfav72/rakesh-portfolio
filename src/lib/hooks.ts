'use client'

import { useEffect, useState } from 'react'

import type { RefObject } from 'react'

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Whether the visitor has asked for reduced motion.
 *
 * Not Framer's `useReducedMotion`: that one lazily initialises a module-level
 * value and reads it with `useState`, so on the first render — the only render
 * that matters for a mount animation — it returns `null`. Every
 * `reduced ? … : …` branch downstream then silently takes the animated path
 * and the setting does nothing at all.
 *
 * This reads matchMedia in a lazy `useState` initialiser instead, so it is
 * `false` on the server and correct from the client's very first render.
 * Nothing that depends on it may reach the SSR markup — see the note on
 * `initial` in the motion components — but transitions and effects are free to
 * use it immediately.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCE_QUERY).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(REDUCE_QUERY)
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}

/**
 * Writes a smoothed, viewport-normalised pointer vector onto the root element
 * as `--px` / `--py`, both in the range -1…1.
 *
 * On the root rather than on a section, because the layers that consume it —
 * the sheet, the lock-up, the face — no longer live inside one another.
 *
 * Deliberately never touches React state: the parallax is pure CSS custom
 * properties driving transforms, so a mouse move costs no render and no
 * layout. The rAF loop also parks itself once the value has settled — nothing
 * spins in the background while the pointer is still.
 */
export function usePointerVector(enabled = true) {
  useEffect(() => {
    const el = document.documentElement
    if (!enabled) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let raf = 0
    let running = false

    const tick = () => {
      cx += (tx - cx) * 0.065
      cy += (ty - cy) * 0.065
      el.style.setProperty('--px', cx.toFixed(4))
      el.style.setProperty('--py', cy.toFixed(4))
      if (Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015) {
        raf = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1
      ty = (e.clientY / window.innerHeight) * 2 - 1
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    const onLeave = () => {
      tx = 0
      ty = 0
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [enabled])
}

/**
 * Writes a pointer vector relative to one element's own centre onto that
 * element as `--tx` / `--ty`, both roughly -1…1, falling off with distance.
 *
 * Distinct from `usePointerVector`, which is normalised to the viewport: an
 * object sitting on the page should lean toward where your hand actually is
 * relative to *it*, not relative to the window. Same discipline otherwise —
 * custom properties only, no React state, and the loop parks itself the
 * moment the value settles.
 */
export function useElementPointer(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let rect = el.getBoundingClientRect()
    const measure = () => {
      rect = el.getBoundingClientRect()
    }

    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let frame = 0
    let running = false

    const tick = () => {
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      el.style.setProperty('--tx', cx.toFixed(4))
      el.style.setProperty('--ty', cy.toFixed(4))
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
        frame = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }

    const clamp = (n: number) => Math.max(-1, Math.min(1, n))

    const onMove = (e: PointerEvent) => {
      const mx = rect.left + rect.width / 2
      const my = rect.top + rect.height / 2
      tx = clamp((e.clientX - mx) / Math.max(rect.width * 0.95, 220))
      ty = clamp((e.clientY - my) / Math.max(rect.height * 0.7, 220))
      if (!running) {
        running = true
        frame = requestAnimationFrame(tick)
      }
    }

    const onLeave = () => {
      tx = 0
      ty = 0
      if (!running) {
        running = true
        frame = requestAnimationFrame(tick)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [ref, enabled])
}
