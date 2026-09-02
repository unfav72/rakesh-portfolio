'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Weighted scrolling. The whole conceit of the site is that you are handling
 * paper, and paper has mass — a native wheel jump undoes that in one gesture.
 * Off entirely under prefers-reduced-motion, where the native scroll is the
 * correct behaviour rather than a compromise.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.05,
      easing: (x: number) => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      autoRaf: false,
    })

    let frame = 0
    const loop = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    /**
     * In-page links travel instead of jumping. A native hash navigation sets
     * the scroll position in one frame, which on a weighted page reads as the
     * document being yanked — and it fights the smoother, which then drags it
     * back. Handing the target to Lenis makes the floating note's "Let's
     * connect" actually carry you down to the last page.
     */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      const hash = link?.getAttribute('href')
      if (!hash || hash === '#') return
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement, { duration: 1.6 })
      history.pushState(null, '', hash)
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return null
}
