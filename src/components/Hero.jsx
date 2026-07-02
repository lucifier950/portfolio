import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion'
import Magnetic from './effects/Magnetic.jsx'
import './Hero.css'

const NAME = 'Advik Rajvansh'

// Headline stack — pulled from the resume. Floats + reacts to hover.
const SKILLS = ['Python', 'C++', 'Machine Learning', 'Flask', 'SQL', 'Pandas', 'Scikit-Learn', 'Git']

// --- Entrance variants ---
// The content container orchestrates the order; children inherit and stagger.
const contentVariants = {
  hidden: {},
  show: { transition: { delayChildren: 0.15, staggerChildren: 0.1 } },
}
// Each non-name line rises and fades in.
const lineVariants = {
  hidden: { y: 26, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}
// The H1 is its own orchestrator so its LETTERS stagger independently.
const nameVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
}
// Each letter slides up from behind a mask (overflow:hidden wrapper).
const letterVariants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

function Hero() {
  const ref = useRef(null)

  // Scroll-driven EXIT: as the hero scrolls away, it recedes like a film
  // shot pulling focus — fades, shrinks, drifts up, and blurs.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const yOut = useTransform(scrollYProgress, [0, 1], [0, 120])
  const blur = useTransform(scrollYProgress, [0, 0.75], [0, 8])
  const filter = useMotionTemplate`blur(${blur}px)`

  // Mouse-parallax depth: the content leans toward the cursor, springed for
  // weight. Kept on an INNER layer so it never fights the scroll-exit transform.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.4 })
  const py = useSpring(my, { stiffness: 120, damping: 18, mass: 0.4 })
  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 28) // ±14px
    my.set(((e.clientY - r.top) / r.height - 0.5) * 28)
  }
  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <section
      id="hero"
      className="hero"
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {/* Layer 1: scroll-exit transform */}
      <motion.div
        className="hero__scroll-wrap"
        style={{ opacity, scale, y: yOut, filter }}
      >
        {/* Layer 2: mouse parallax + entrance stagger */}
        <motion.div
          className="hero__content"
          style={{ x: px, y: py }}
          variants={contentVariants}
          initial="hidden"
          animate="show"
        >
          <motion.p className="hero__greeting" variants={lineVariants}>
            Hi, my name is
          </motion.p>

          {/* Letter-by-letter masked reveal. aria-label keeps it one word
              to screen readers while we split the glyphs visually. */}
          <motion.h1
            className="hero__name"
            aria-label={NAME}
            variants={nameVariants}
          >
            {NAME.split('').map((ch, i) => (
              <span className="hero__letter-mask" key={i} aria-hidden="true">
                <motion.span className="hero__letter" variants={letterVariants}>
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.h2 className="hero__role" variants={lineVariants}>
            CSE Student &amp; ML Developer
          </motion.h2>

          <motion.p className="hero__tagline" variants={lineVariants}>
            2nd-year B.Tech CSE student at JIIT, building real-world projects
            with Machine Learning, Flask, and C++. Passionate about AI,
            data, and strong DSA fundamentals.
          </motion.p>

          {/* Floating tech badges: each idles with a looping bob and lifts
              on hover. The whole row reveals as one item in the stagger. */}
          <motion.ul className="hero__badges" variants={lineVariants}>
            {SKILLS.map((skill, i) => (
              <motion.li
                key={skill}
                className="hero__badge"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.22,
                }}
                whileHover={{ y: -8, scale: 1.07 }}
              >
                {skill}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div className="hero__actions" variants={lineVariants}>
            <Magnetic strength={0.5}>
              <a href="#projects" className="btn btn--primary">
                View Projects
              </a>
            </Magnetic>
            <Magnetic strength={0.5}>
              <a href="/resume.pdf" className="btn btn--outline" download>
                Download Resume
              </a>
            </Magnetic>
            <Magnetic strength={0.5}>
              <a
                href="https://github.com/lucifier950"
                className="btn btn--outline"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Animated scroll cue */}
      <motion.div
        className="hero__scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        aria-hidden="true"
      >
        <span className="hero__scroll-text">Scroll</span>
        <span className="hero__scroll-line" />
      </motion.div>
    </section>
  )
}

export default Hero
