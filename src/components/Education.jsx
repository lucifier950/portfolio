import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, useScroll, useTransform, useInView, useMotionValue, animate } from 'framer-motion'
import './Education.css'

/**
 * Education & Journey — four INDEPENDENT space-station "modules", each with its
 * own icon, accent color, glow and animations. They share the premium dark
 * aesthetic but never visually merge:
 *   🎓 Education (blue)  ·  🏆 Achievements (gold)
 *   🚀 Journey (cyan, an animated scroll-linked timeline)  ·  🛰 Workshops (purple)
 *
 * Motion budget: everything is Framer Motion + IntersectionObserver (useInView)
 * and one useScroll for the timeline fill — no manual scroll listeners, all
 * transforms/opacity so it stays on the compositor at 60fps.
 */

// ---------------- accent colors ----------------
const ACCENT = {
  education: '#4f9bff', // blue
  achievements: '#f5c451', // gold
  journey: '#38bdf8', // cyan
  workshops: '#b98cff', // purple
}

// ---------------- content ----------------
const education = {
  degree: 'B.Tech in Computer Science',
  place: 'Jaypee Institute of Information Technology (JIIT), Noida',
  period: 'July 2024 – July 2028 (Expected)',
  cgpa: '7.6 / 10',
  coursework: ['Data Structures & Algorithms', 'OOP in C++', 'DBMS', 'Operating Systems', 'Machine Learning Basics'],
}

const achievements = [
  { to: 200, suffix: '+', label: 'LeetCode Problems', sub: 'C++ · DSA fundamentals' },
  { to: 5, suffix: '', label: 'Projects Built', sub: 'Flask · C++ · React' },
  { to: 20, suffix: '+', label: 'Technologies', sub: 'Languages, libs & tools' },
  { to: 2, suffix: '', label: 'Certifications & Workshops', sub: 'IIT Delhi · JIIT' },
]

const journey = [
  { year: '2022', title: 'Started Programming', detail: 'Wrote my first lines of code and fell for logic building and problem-solving.' },
  { year: '2023', title: 'Mastered C++ & DSA', detail: 'Built strong fundamentals — 200+ problems, OOP, and core data structures.' },
  { year: '2024', title: 'Dived into AI / ML', detail: 'Python, Pandas, NumPy and Scikit-Learn — training real models on real data.' },
  { year: '2024', title: 'Explored Web Development', detail: 'Flask backends and a React frontend, connecting models to real interfaces.' },
  { year: '2025', title: 'Built Full-Stack Projects', detail: 'Shipped Mann-o-meter, this portfolio, and more end-to-end builds.' },
]

const workshops = [
  { title: 'Deep Learning Certification', place: 'IIT Delhi (Online)', period: '2025', detail: 'Neural networks and modern ML techniques — the foundations of deep learning.' },
  { title: 'RAG & LLMs Workshop', place: 'JIIT', period: '2025', detail: 'Hands-on Retrieval-Augmented Generation and Large Language Models.' },
]

// ---------------- icons ----------------
const Icon = ({ name }) => {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'education')
    return (
      <svg {...p}>
        <path d="M22 10 12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
      </svg>
    )
  if (name === 'achievements')
    return (
      <svg {...p}>
        <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" />
        <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
      </svg>
    )
  if (name === 'journey')
    return (
      <svg {...p}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    )
  // workshops — satellite
  return (
    <svg {...p}>
      <path d="M13 7 9 3 3 9l4 4M17 11l4 4-6 6-4-4" />
      <path d="m8 12 4 4M16 8l2-2M18 4a2.8 2.8 0 0 1 2 2" />
    </svg>
  )
}

// ---------------- shared hooks / components ----------------
// A subtle 3D-tilt handler that returns motion values + pointer handlers,
// composed into whatever card uses it (parallax on hover, req #5).
function useTilt(max = 8) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max)
  }
  const onLeave = () => {
    animate(rx, 0, { duration: 0.4, ease: 'easeOut' })
    animate(ry, 0, { duration: 0.4, ease: 'easeOut' })
  }
  return { rx, ry, onMove, onLeave }
}

// Generic card: reveal-once (opacity/translateY/scale + stagger) + hover lift + tilt.
function EduCard({ className = '', index = 0, children, ...rest }) {
  const { rx, ry, onMove, onLeave } = useTilt()
  return (
    <motion.div
      className={`edu-card ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

// Count-up number that animates 0 → value ONCE when scrolled into view (req #8).
function CountUp({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to])
  return (
    <span ref={ref} className="ach__value">
      {val}
      {suffix}
    </span>
  )
}

// Section heading: glowing accent icon chip + eyebrow + title.
function Head({ icon, eyebrow, title }) {
  return (
    <motion.div
      className="edu-head"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="edu-head__icon">
        <Icon name={icon} />
      </span>
      <div>
        <span className="edu-head__eyebrow">{eyebrow}</span>
        <h3 className="edu-head__title">{title}</h3>
      </div>
    </motion.div>
  )
}

// ---------------- Journey timeline ----------------
function JourneyItem({ item, index }) {
  const ref = useRef(null)
  const reached = useInView(ref, { once: true, margin: '0px 0px -22% 0px' })
  const active = useInView(ref, { amount: 0.75 })
  const { rx, ry, onMove, onLeave } = useTilt()
  return (
    <div className="journey__item" ref={ref}>
      <span className={`journey__node ${reached ? 'is-reached' : ''} ${active ? 'is-active' : ''}`} aria-hidden="true" />
      <motion.div
        className={`edu-card journey__card ${active ? 'is-active' : ''}`}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={reached ? { opacity: 1, y: 0, scale: active ? 1.03 : 1 } : { opacity: 0, y: 30, scale: 0.96 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <span className="journey__year">{item.year}</span>
        <h4 className="journey__title">{item.title}</h4>
        <p className="journey__detail">{item.detail}</p>
      </motion.div>
    </div>
  )
}

function JourneyBlock() {
  const railRef = useRef(null)
  // Scroll progress through the timeline → fills the vertical line + progress rail.
  const { scrollYProgress } = useScroll({ target: railRef, offset: ['start 0.72', 'end 0.55'] })
  const headTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section className="edu-block edu-block--journey" style={{ '--accent': ACCENT.journey }}>
      <Head icon="journey" eyebrow="My growth over time" title="Journey" />
      <div className="journey" ref={railRef}>
        {/* Scroll progress indicator beside the timeline (req #9) */}
        <div className="journey__rail" aria-hidden="true">
          <motion.div className="journey__fill" style={{ scaleY: scrollYProgress }} />
          <motion.div className="journey__head" style={{ top: headTop }} />
        </div>
        <div className="journey__items">
          {journey.map((item, i) => (
            <JourneyItem key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------- ambient space layer (behind cards) ----------------
function SpaceLayer() {
  // Positions/durations are stable across renders (useMemo) — cheap CSS-driven
  // drift on the compositor, rendered strictly behind the cards.
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: `${(i * 61) % 100}%`,
        top: `${(i * 37 + 8) % 100}%`,
        size: 1.5 + ((i * 7) % 3),
        dur: 7 + ((i * 3) % 8),
        delay: (i % 6) * 0.8,
        o: 0.28 + ((i % 4) * 0.12),
      })),
    []
  )
  return (
    <div className="edu-space" aria-hidden="true">
      <span className="edu-neb edu-neb--a" />
      <span className="edu-neb edu-neb--b" />
      {particles.map((p, i) => (
        <span
          key={i}
          className="edu-particle"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, '--dur': `${p.dur}s`, '--delay': `${p.delay}s`, '--o': p.o }}
        />
      ))}
      <span className="edu-shoot edu-shoot--a" />
      <span className="edu-shoot edu-shoot--b" />
    </div>
  )
}

function Education() {
  return (
    <section id="education" className="education">
      <SpaceLayer />

      <div className="education__inner">
        {/* 1 · Education (blue) — academics only */}
        <section className="edu-block edu-block--education" style={{ '--accent': ACCENT.education }}>
          <Head icon="education" eyebrow="Where I study" title="Education" />
          <EduCard className="edu-degree">
            <div className="edu-degree__top">
              <div>
                <h4 className="edu-degree__title">{education.degree}</h4>
                <p className="edu-degree__place">{education.place}</p>
                <span className="edu-degree__period">{education.period}</span>
              </div>
              <div className="edu-degree__cgpa">
                <span className="edu-degree__cgpaValue">{education.cgpa}</span>
                <span className="edu-degree__cgpaLabel">CGPA</span>
              </div>
            </div>
            <div className="edu-degree__course">
              <span className="edu-degree__courseLabel">Relevant coursework</span>
              <ul className="edu-degree__chips">
                {education.coursework.map((c) => (
                  <li key={c} className="edu-chip">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </EduCard>
        </section>

        {/* 2 · Achievements (gold) — animated counters */}
        <section className="edu-block edu-block--achievements" style={{ '--accent': ACCENT.achievements }}>
          <Head icon="achievements" eyebrow="What I've done" title="Achievements" />
          <div className="ach-grid">
            {achievements.map((a, i) => (
              <EduCard className="ach-card" index={i} key={a.label}>
                <CountUp to={a.to} suffix={a.suffix} />
                <span className="ach__label">{a.label}</span>
                <span className="ach__sub">{a.sub}</span>
              </EduCard>
            ))}
          </div>
        </section>

        {/* 3 · Journey (cyan) — animated scroll timeline */}
        <JourneyBlock />

        {/* 4 · Workshops & Certifications (purple) — independent cards */}
        <section className="edu-block edu-block--workshops" style={{ '--accent': ACCENT.workshops }}>
          <Head icon="workshops" eyebrow="Where I've upskilled" title="Workshops & Certifications" />
          <div className="work-grid">
            {workshops.map((w, i) => (
              <EduCard className="work-card" index={i} key={w.title}>
                <span className="work-card__period">{w.period}</span>
                <h4 className="work-card__title">{w.title}</h4>
                <p className="work-card__place">{w.place}</p>
                <p className="work-card__detail">{w.detail}</p>
              </EduCard>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Education
