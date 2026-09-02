'use client'

import { useEffect, useRef } from 'react'

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]'

/**
 * A 9px dot that lags the pointer by a few frames and opens into a ring over
 * anything clickable. That is the entire feature. It exists to make the click
 * targets feel physical, not to become the thing you remember about the site.
 *
 * Never shown on touch, and never shown under reduced motion — a trailing
 * element is precisely what that setting is asking you to remove.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dot.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('custom-cursor')

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let cx = tx
    let cy = ty
    let frame = 0
    let running = false
    let visible = false

    const tick = () => {
      cx += (tx - cx) * 0.2
      cy += (ty - cy) * 0.2
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) translate(-50%, -50%)`
      if (Math.abs(tx - cx) > 0.15 || Math.abs(ty - cy) > 0.15) {
        frame = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      if (!visible) {
        visible = true
        el.dataset.on = 'true'
      }
      if (!running) {
        running = true
        frame = requestAnimationFrame(tick)
      }
    }

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null
      el.dataset.hover = target?.closest?.(INTERACTIVE) ? 'true' : 'false'
    }

    const onLeave = () => {
      visible = false
      el.dataset.on = 'false'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
      document.documentElement.classList.remove('custom-cursor')
    }
  }, [])

  return <div ref={dot} className="cursor-dot" data-on="false" data-hover="false" aria-hidden="true" />
}
