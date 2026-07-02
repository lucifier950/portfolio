import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * useSmoothScroll
 * ---------------
 * Replaces the browser's native (linear, instant) scroll with Lenis —
 * inertia-based momentum scrolling. THIS is the single biggest reason
 * award sites "feel" expensive: motion has weight and easing instead of
 * snapping. Every scroll-driven animation downstream inherits that smoothness.
 *
 * WHY a hook (not a provider): Lenis drives the real document scroll
 * position, so Framer Motion's useScroll / IntersectionObserver keep working
 * unchanged. We just need to spin it up once and pump its rAF loop.
 *
 * Accessibility: if the user asked the OS for reduced motion, we DON'T
 * hijack scrolling — native scroll is the safe, expected behavior.
 */
export default function useSmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.15, // seconds to settle — higher = more "luxury glide"
      // Custom easing: a strong ease-out so fast flicks decelerate cinematically.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    // Pump Lenis on every animation frame. requestAnimationFrame gives us
    // a timestamp Lenis uses to compute its inertia.
    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Expose globally so other modules (e.g. nav links) can lenis.scrollTo().
    window.__lenis = lenis

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}
