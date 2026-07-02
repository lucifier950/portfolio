import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import './Cursor.css'

/**
 * Cursor
 * ------
 * Replaces the OS pointer with two elements:
 *   - a crisp DOT that tracks the mouse 1:1 (the precise hit point)
 *   - a larger RING that LAGS behind via a spring (the "weight" that makes
 *     it feel physical, not robotic)
 *
 * Both use mix-blend-mode: difference, so the cursor inverts whatever is
 * under it — white on dark, dark on light — always visible, always premium.
 *
 * States that reward interaction:
 *   - hover over a link/button → ring expands + softens
 *   - mouse down → everything contracts (a satisfying "press")
 *
 * Only mounts on fine-pointer (mouse) devices; touch users keep their
 * native behavior and we never hide their (nonexistent) cursor.
 */
export default function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  // Spring config tuned for a graceful trailing lag (not sluggish, not stiff).
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.55 })
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.55 })

  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    document.documentElement.classList.add('has-custom-cursor')

    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    // Detect "interactive" targets via event delegation (one listener, not many).
    const interactiveSel = 'a, button, input, textarea, [data-cursor="hover"]'
    const over = (e) => {
      if (e.target.closest?.(interactiveSel)) setHovering(true)
    }
    const out = (e) => {
      if (e.target.closest?.(interactiveSel)) setHovering(false)
    }
    const down = () => setClicking(true)
    const up = () => setClicking(false)

    window.addEventListener('pointermove', move)
    document.addEventListener('pointerover', over)
    document.addEventListener('pointerout', out)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)

    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', out)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ x, y }}
        animate={{ scale: clicking ? 0.5 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: hovering ? 1.8 : clicking ? 0.8 : 1,
          opacity: hovering ? 0.4 : 0.9,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />
    </>
  )
}
