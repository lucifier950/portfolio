import { motion, useScroll, useSpring } from 'framer-motion'
import './ScrollProgress.css'

/**
 * ScrollProgress
 * --------------
 * A thin gradient bar pinned to the top that fills as you scroll the page.
 * scrollYProgress is a 0→1 motion value; we pipe it through a spring so the
 * bar eases rather than tracking scroll 1:1 — a small touch that feels alive.
 * scaleX is GPU-cheap (transform only, no layout).
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  })
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}
