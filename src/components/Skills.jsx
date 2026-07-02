import { lazy, Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import './Skills.css'

// 3D planet system loads lazily, only on capable devices.
const SkillsGalaxy = lazy(() => import('./effects/SkillsGalaxy.jsx'))

// Six category planets. Order MUST line up with the NODES constellation in
// SkillsGalaxy.jsx. `techs` become the moons that orbit each planet when the
// galaxy expands; the overview label shows the first few.
const skillCategories = [
  { title: 'Programming Languages', techs: ['Python', 'C++', 'SQL', 'Java'] },
  { title: 'Frontend', techs: ['React', 'JavaScript', 'HTML', 'CSS'] },
  { title: 'Backend', techs: ['Flask', 'REST APIs', 'TF-IDF', 'BM25'] },
  { title: 'AI / ML', techs: ['Scikit-Learn', 'Pandas', 'NumPy', 'Random Forest'] },
  { title: 'Databases', techs: ['MySQL', 'SQL', 'DBMS'] },
  { title: 'Tools', techs: ['Git & GitHub', 'Jupyter', 'Google Colab', 'VS Code'] },
]

// Proficiency bars — a self-assessment snapshot with a colored gradient each.
const proficiency = [
  { label: 'Python', value: 90, grad: 'linear-gradient(90deg,#f5c451,#f0a93c)' },
  { label: 'C++', value: 85, grad: 'linear-gradient(90deg,#b98cff,#8b5cf6)' },
  { label: 'Machine Learning', value: 80, grad: 'linear-gradient(90deg,#57d977,#22c55e)' },
  { label: 'SQL', value: 78, grad: 'linear-gradient(90deg,#38bdf8,#0ea5e9)' },
  { label: 'DSA', value: 80, grad: 'linear-gradient(90deg,#4f9bff,#3b82f6)' },
  { label: 'Pandas / NumPy', value: 85, grad: 'linear-gradient(90deg,#f0894f,#ea6a2c)' },
]

const stats = [
  { icon: 'rocket', value: '20+', label: 'Technologies' },
  { icon: 'code', value: '3', label: 'Projects Built' },
  { icon: 'target', value: '200+', label: 'LeetCode Solved' },
]

const StatIcon = ({ name }) => {
  if (name === 'rocket')
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    )
  if (name === 'code')
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  )
}

const lead = 'Technologies, tools and concepts I work with to build powerful solutions.'

// Accent color per category planet (mirrors the NODES colors in SkillsGalaxy),
// so the focused-planet card matches the planet you clicked.
const categoryColors = ['#f5c451', '#b98cff', '#f0894f', '#57d977', '#38bdf8', '#4f9bff']

// The right-hand panel is context-aware:
//  - focused === a category  → show ONLY that planet's skills
//  - otherwise (overview / galaxy) → show the global Proficiency bars
function Proficiency({ className = '', onExpand, focused = null, focusColor, showCta = true }) {
  if (focused) {
    return (
      <aside className={`proficiency glass ${className}`}>
        <h3 className="proficiency__head" style={{ color: focusColor }}>
          <span className="proficiency__dot" style={{ background: focusColor }} />
          {focused.title}
        </h3>
        <ul className="planetskills">
          {focused.techs.map((t) => (
            <li className="planetskill" key={t}>
              <span className="planetskill__dot" style={{ background: focusColor }} />
              {t}
            </li>
          ))}
        </ul>
        <p className="proficiency__note">ESC or Back to return</p>
      </aside>
    )
  }
  return (
    <aside className={`proficiency glass ${className}`}>
      <h3 className="proficiency__head">
        <span className="proficiency__spark" aria-hidden="true">✦</span> Proficiency
      </h3>
      <ul className="proficiency__list">
        {proficiency.map((p) => (
          <li className="prof" key={p.label}>
            <div className="prof__row">
              <span className="prof__label">{p.label}</span>
              <span className="prof__value">{p.value}%</span>
            </div>
            <div className="prof__track">
              <motion.div
                className="prof__fill"
                style={{ background: p.grad }}
                initial={{ width: 0 }}
                whileInView={{ width: `${p.value}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
      {showCta && (
        <button type="button" className="proficiency__cta" onClick={onExpand}>
          View All Skills
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </button>
      )}
    </aside>
  )
}

function StatCards({ className = '' }) {
  return (
    <div className={`skills__stats ${className}`}>
      {stats.map((s) => (
        <div className="statcard glass" key={s.label}>
          <span className="statcard__icon">
            <StatIcon name={s.icon} />
          </span>
          <span className="statcard__text">
            <span className="statcard__value">{s.value}</span>
            <span className="statcard__label">{s.label}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function Skills() {
  const [show3d, setShow3d] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [focusIndex, setFocusIndex] = useState(null)

  // Immersed = the chrome (intro + stats) steps aside; the panel stays but its
  // content swaps to the focused planet's skills.
  const immersed = expanded || focusIndex != null
  const focusedCategory = focusIndex != null ? skillCategories[focusIndex] : null
  const exitToOverview = () => {
    setExpanded(false)
    setFocusIndex(null)
  }

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wide = window.innerWidth > 1024
    let webgl = false
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl') || c.getContext('experimental-webgl'))
    } catch {
      webgl = false
    }
    if (fine && wide && !reduce && webgl) setShow3d(true)
  }, [])

  // ---------- Fallback (mobile / reduced motion / no WebGL) ----------
  if (!show3d) {
    return (
      <section id="skills" className="skills skills--fallback">
        <span className="skills__eyebrow">What I Know</span>
        <h2 className="section-title">Skills</h2>
        <p className="skills__lead">{lead}</p>

        <div className="skills__grid">
          {skillCategories.map((category) => (
            <div className="skill-card" key={category.title}>
              <h3 className="skill-card__title">{category.title}</h3>
              <ul className="skill-card__list">
                {category.techs.map((skill) => (
                  <li className="skill-pill" key={skill}>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Proficiency className="proficiency--static" showCta={false} />
        <StatCards className="skills__stats--static" />
      </section>
    )
  }

  // ---------- Cinematic scene (capable desktops) ----------
  return (
    <section id="skills" className="skills skills--scene">
      <div className={`skills__scene ${immersed ? 'skills__scene--immersed' : ''}`}>
        <div className="skills__canvas">
          <Suspense fallback={null}>
            <SkillsGalaxy
              categories={skillCategories}
              expanded={expanded}
              focusIndex={focusIndex}
              setFocusIndex={setFocusIndex}
              onExit={exitToOverview}
            />
          </Suspense>
        </div>

        {/* Top-left intro column — steps aside while immersed */}
        <div className="skills__intro skills__overlay">
          <span className="skills__eyebrow">What I Know</span>
          <h2 className="section-title skills__title">Skills</h2>
          <p className="skills__lead">{lead}</p>
          <a className="skills__scrolllink" href="#projects">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="2" width="12" height="20" rx="6" />
              <line x1="12" y1="7" x2="12" y2="11" />
            </svg>
            Scroll to explore
          </a>
        </div>

        <StatCards className="skills__overlay" />

        {/* Panel stays visible in every mode; its content swaps to the focused
            planet's skills, or the global Proficiency bars otherwise. */}
        <Proficiency
          onExpand={() => setExpanded(true)}
          focused={focusedCategory}
          focusColor={focusIndex != null ? categoryColors[focusIndex] : undefined}
        />

        {/* Immersive-mode control. Portaled to <body> so it escapes the
            <Reveal> transform/filter containing block and stays fixed on
            screen regardless of scroll or stacking context. */}
        {immersed &&
          createPortal(
            <button type="button" className="skills__back" onClick={exitToOverview}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to overview
            </button>,
            document.body
          )}

        <p className="skills__hint">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="2" width="12" height="20" rx="6" />
            <line x1="12" y1="7" x2="12" y2="11" />
          </svg>
          {focusIndex != null
            ? 'Viewing one planet · ESC or Back to return'
            : expanded
            ? 'Click a planet to fly in · Drag to rotate · ESC to exit'
            : 'Hover or click a planet — or view all skills to explore the galaxy'}
        </p>
      </div>
    </section>
  )
}

export default Skills
