import { useEffect, useRef } from 'react'
import './KonamiEasterEgg.css'

// The legendary sequence. Case-insensitive on the final B, A.
const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

/**
 * KonamiEasterEgg
 * ---------------
 * Listens for the Konami code anywhere on the page. On success it fires a
 * physics-driven confetti burst from screen center — hand-rolled on a 2D
 * canvas (gravity + drag + rotation + life-fade), no library.
 *
 * A reward for the curious; purely decorative, so it's aria-hidden and
 * scales its particle count down under reduced-motion.
 */
export default function KonamiEasterEgg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let particles = []
    let raf = null

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#38bdf8', '#2563eb', '#7c3aed', '#1e3a8a', '#ffffff']
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const burst = () => {
      const count = reduce ? 60 : 240
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 4 + Math.random() * 9
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4, // bias upward for a fountain feel
          size: 3 + Math.random() * 5,
          color: colors[(Math.random() * colors.length) | 0],
          life: 1,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
        })
      }
      if (!raf) raf = requestAnimationFrame(loop)
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.vy += 0.18 // gravity
        p.vx *= 0.99 // air drag
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.012
        p.rot += p.vr
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }
      particles = particles.filter((p) => p.life > 0 && p.y < canvas.height + 50)
      if (particles.length) {
        raf = requestAnimationFrame(loop)
      } else {
        cancelAnimationFrame(raf)
        raf = null
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Match the typed keys against the sequence, tolerating restarts.
    let idx = 0
    const onKey = (e) => {
      const key = e.key
      if (key.toLowerCase() === SEQUENCE[idx].toLowerCase()) {
        idx++
        if (idx === SEQUENCE.length) {
          idx = 0
          burst()
        }
      } else {
        idx = key.toLowerCase() === SEQUENCE[0].toLowerCase() ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className="konami-canvas" aria-hidden="true" />
}
