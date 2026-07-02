import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * ProjectCard — the premium, interactive case-study card.
 *
 * Four layered interactions, each with a purpose:
 *   1. 3D TILT  — the card rotates toward the cursor (springed) so it feels
 *      like a physical object you're handling, not a flat div.
 *   2. SPOTLIGHT — a soft glow tracks the pointer via CSS vars (--mx/--my),
 *      drawing the eye and giving the glass surface real depth.
 *   3. BORDER GLOW — a conic gradient sweeps the edge on hover (animated
 *      @property angle), the signature "this is a live surface" award detail.
 *   4. CLICK RIPPLE — a material-style ripple rewards the press itself.
 */
function ProjectCard({ title, period, description, tech, repo }) {
  const ref = useRef(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  // Spring the rotation so the tilt eases in/out instead of tracking raw mouse.
  const sRotateX = useSpring(rotateX, { stiffness: 150, damping: 15, mass: 0.4 })
  const sRotateY = useSpring(rotateY, { stiffness: 150, damping: 15, mass: 0.4 })

  const [ripples, setRipples] = useState([])

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width // 0..1 across card
    const py = (e.clientY - r.top) / r.height
    if (!prefersReduced) {
      rotateY.set((px - 0.5) * 16) // tilt left/right
      rotateX.set(-(py - 0.5) * 16) // tilt up/down (inverted = natural)
    }
    // Feed the spotlight position to CSS.
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const handlePointerDown = (e) => {
    const r = ref.current.getBoundingClientRect()
    const id = e.timeStamp // unique enough per event
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - r.left, y: e.clientY - r.top },
    ])
    // Remove the ripple after its animation so the DOM stays clean.
    setTimeout(() => {
      setRipples((prev) => prev.filter((rp) => rp.id !== id))
    }, 650)
  }

  return (
    <motion.article
      ref={ref}
      className="project-card glass"
      style={{
        rotateX: sRotateX,
        rotateY: sRotateY,
        transformPerspective: 900, // makes the rotation read as real 3D depth
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerDown={handlePointerDown}
    >
      {/* Cursor-tracked spotlight + animated edge glow (decorative). */}
      <span className="project-card__spotlight" aria-hidden="true" />
      <span className="project-card__border" aria-hidden="true" />

      {/* Click ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="project-card__ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      <div className="project-card__header">
        <h3 className="project-card__title">{title}</h3>
        <span className="project-card__period">{period}</span>
      </div>

      <p className="project-card__desc">{description}</p>

      <ul className="project-card__tech">
        {tech.map((item) => (
          <li className="tech-tag" key={item}>
            {item}
          </li>
        ))}
      </ul>

      <a
        className="project-card__link"
        href={repo}
        target="_blank"
        rel="noreferrer"
      >
        View Source →
      </a>
    </motion.article>
  )
}

export default ProjectCard
