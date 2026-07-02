import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Magnetic
 * --------
 * Wrap any element to give it "gravity": while the cursor is over it, the
 * element is pulled toward the pointer by `strength`, then springs back to
 * rest on leave. This is the hover physics you feel on Awwwards CTAs — it
 * makes buttons feel like physical objects reacting to your hand.
 *
 * Implementation: we translate by a fraction of the cursor's offset from the
 * element's CENTER, and route it through a spring so the motion has elastic
 * follow-through instead of snapping.
 */
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Magnetic({
  children,
  strength = 0.4,
  className,
  as: Tag = 'div',
}) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.5 })

  const handleMove = (e) => {
    if (prefersReduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const MotionTag = motion[Tag] || motion.div
  return (
    <MotionTag
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </MotionTag>
  )
}
