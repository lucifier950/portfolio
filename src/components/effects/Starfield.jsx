import { useEffect, useRef } from 'react'
import './Starfield.css'

/**
 * Starfield — a scroll-driven warp-dive through the Milky Way.
 *
 * The signature "journey" effect: stars are simulated in 3D (x, y, z) and fly
 * toward the camera. At rest there's a slow drift (you're floating in space);
 * as you SCROLL, the forward speed ramps up with scroll velocity, so the stars
 * streak outward from the center like hyperspace — you're diving into the
 * galaxy. Soft nebula clouds (pre-rendered, additively blended) give the
 * cosmic-dust color.
 *
 * Pure 2D canvas → reliable, ~0 dependencies, GPU-cheap, 60fps. Reads
 * window.scrollY each frame, so it works with Lenis smooth scroll. Honors
 * reduced-motion (renders a calm, near-static field with no warp).
 */
export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let cx = 0
    let cy = 0
    let stars = []
    let nebula = null
    let raf = null

    const rand = (a, b) => a + Math.random() * (b - a)

    // --- Nebula clouds (cosmic dust), pre-rendered once per resize ---
    const buildNebula = () => {
      nebula = document.createElement('canvas')
      nebula.width = w
      nebula.height = h
      const n = nebula.getContext('2d')
      n.globalCompositeOperation = 'lighter'
      const clouds = [
        { x: 0.62, y: 0.42, c: 'rgba(46, 86, 180, 0.12)', r: 0.42 },
        { x: 0.72, y: 0.34, c: 'rgba(99, 102, 241, 0.10)', r: 0.34 },
        { x: 0.5, y: 0.55, c: 'rgba(38, 110, 200, 0.08)', r: 0.5 },
        { x: 0.8, y: 0.6, c: 'rgba(124, 92, 220, 0.07)', r: 0.3 },
        { x: 0.4, y: 0.3, c: 'rgba(56, 130, 246, 0.06)', r: 0.36 },
      ]
      for (const cl of clouds) {
        const px = cl.x * w
        const py = cl.y * h
        const radius = cl.r * w
        const g = n.createRadialGradient(px, py, 0, px, py, radius)
        g.addColorStop(0, cl.c)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        n.fillStyle = g
        n.beginPath()
        n.arc(px, py, radius, 0, Math.PI * 2)
        n.fill()
      }
    }

    const makeStar = (deep) => ({
      x: rand(-1, 1),
      y: rand(-1, 1),
      // z: distance from camera (small = close). New stars spawn far (deep).
      z: deep ? rand(0.6, 1) : rand(0.05, 1),
      o: rand(0.5, 1), // intrinsic brightness
    })

    const build = () => {
      w = canvas.width = window.innerWidth * DPR
      h = canvas.height = window.innerHeight * DPR
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      cx = w / 2
      cy = h / 2
      const count = Math.min(900, Math.floor((window.innerWidth * window.innerHeight) / 2200))
      stars = Array.from({ length: count }, () => makeStar(false))
      buildNebula()
    }
    build()
    window.addEventListener('resize', build)

    // Mouse parallax shifts the vanishing point slightly for depth.
    let tmx = 0
    let tmy = 0
    let mx = 0
    let my = 0
    const onMove = (e) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 0.6
      tmy = (e.clientY / window.innerHeight - 0.5) * 0.6
    }
    window.addEventListener('pointermove', onMove)

    // Forward speed: idle drift + a boost driven by scroll velocity.
    const BASE = reduce ? 0.0006 : 0.0016
    let speed = BASE
    let lastScroll = window.scrollY
    const focal = w * 0.5

    const project = (x, y, z) => ({
      sx: cx + (x / z) * focal + mx * 40 * DPR,
      sy: cy + (y / z) * focal + my * 40 * DPR,
    })

    const render = () => {
      // Scroll velocity → target speed (warp ramps up while scrolling).
      const s = window.scrollY
      const vel = Math.abs(s - lastScroll)
      lastScroll = s
      const target = reduce ? BASE : BASE + Math.min(vel * 0.0009, 0.05)
      speed += (target - speed) * 0.08
      mx += (tmx - mx) * 0.05
      my += (tmy - my) * 0.05

      // Clear transparently so the deep-blue <html> gradient shows through.
      // The per-star streak line (prev→cur) provides the warp trails, so we
      // don't need an opaque motion-blur fade.
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)

      // Nebula cosmic dust (additive glow) on the transparent canvas.
      if (nebula) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(nebula, mx * 18 * DPR, my * 18 * DPR)
      }

      ctx.globalCompositeOperation = 'lighter'
      for (const star of stars) {
        const prev = project(star.x, star.y, star.z + speed)
        star.z -= speed
        if (star.z < 0.02) {
          // Recycle: respawn far away with a fresh position.
          Object.assign(star, makeStar(true))
          continue
        }
        const cur = project(star.x, star.y, star.z)
        const depth = 1 - star.z // 0 far → ~1 close
        const size = Math.max(0.4, depth * 2.4) * DPR
        const alpha = Math.min(1, star.o * (0.3 + depth))

        ctx.strokeStyle = `rgba(206, 224, 255, ${alpha})`
        ctx.lineWidth = size
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(prev.sx, prev.sy)
        ctx.lineTo(cur.sx, cur.sy)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'

      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', build)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />
}
