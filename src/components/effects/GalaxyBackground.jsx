import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import Starfield from './Starfield.jsx'
import './GalaxyBackground.css'

// Code-split: the three.js galaxy only downloads on capable devices.
const GalaxyJourney = lazy(() => import('./GalaxyJourney.jsx'))

/**
 * GalaxyBackground — device-appropriate cosmic backdrop, fixed behind content.
 *   - capable (desktop, wide, WebGL, motion OK) → 3D R3F galaxy journey,
 *     with the canvas warp-starfield as the Suspense fallback while loading.
 *   - else → the lightweight canvas warp-starfield.
 *
 * READABILITY: the backdrop is vivid at the hero, then FADES on scroll so the
 * bright galaxy never washes out the content sections below. We ease the
 * wrapper's opacity from 1 (top) down to ~0.65 across the first two viewports,
 * so the cosmos stays clearly visible while scrolling.
 */
export default function GalaxyBackground() {
  const [mode, setMode] = useState('canvas')
  const wrapRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wide = window.innerWidth > 820
    let webgl = false
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl') || c.getContext('experimental-webgl'))
    } catch {
      webgl = false
    }
    if (fine && wide && !reduce && webgl) setMode('r3f')
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const f = Math.min(1, window.scrollY / (window.innerHeight * 2))
      if (wrapRef.current) wrapRef.current.style.opacity = String(1 - f * 0.35)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="galaxy-bg" ref={wrapRef} aria-hidden="true">
      {mode === 'r3f' ? (
        <Suspense fallback={<Starfield />}>
          <GalaxyJourney />
        </Suspense>
      ) : (
        <Starfield />
      )}
    </div>
  )
}
