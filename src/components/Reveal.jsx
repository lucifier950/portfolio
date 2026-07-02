import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * Reveal
 * ------
 * Wraps a section so it doesn't merely "fade in" — it EMERGES FROM DEPTH:
 * the block starts pushed back and tilted on the X axis (rotateX), blurred,
 * and below its resting spot, then rises, straightens, and snaps into focus.
 * Combined with a perspective parent, it reads like a card swinging up toward
 * the camera — the "cinematic reveal" the brief asks for.
 *
 * API is unchanged (<Reveal>{children}</Reveal>) so App.jsx is untouched.
 * Optional `delay` lets callers cascade multiple reveals.
 *
 * useInView with once:true means it animates a single time; the negative
 * bottom margin starts the reveal slightly BEFORE the block hits the
 * viewport edge, so content is already arriving as you scroll to it.
 */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })

  return (
    // Perspective on the parent is what turns rotateX into real 3D depth
    // instead of a flat vertical squash.
    <div ref={ref} style={{ perspective: 1200 }}>
      <motion.div
        initial={{ opacity: 0, y: 64, rotateX: 12, filter: 'blur(10px)' }}
        animate={
          inView
            ? { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }
            : {}
        }
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
        style={{
          transformOrigin: 'center top',
          willChange: 'transform, filter, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default Reveal
