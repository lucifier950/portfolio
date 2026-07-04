import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import ProjectCard from './ProjectCard.jsx'
import './Projects.css'

// The project data, pulled from your resume. Each object becomes
// one <ProjectCard>. `tech` is an array, `repo` is the GitHub URL.
const projects = [
  {
    title: 'Heart Disease & Cardiovascular Risk Prediction',
    period: '2026',
    description:
      'An end-to-end machine learning pipeline predicting cardiovascular risk on 8,700+ patient records. Engineered domain-driven features and benchmarked Logistic Regression, Random Forest, and XGBoost — reaching 88.5% accuracy and a 0.877 F1-score, with SMOTE to handle class imbalance.',
    tech: ['Python', 'Scikit-Learn', 'XGBoost', 'Pandas', 'SMOTE', 'EDA'],
    repo: 'https://github.com/lucifier950/Heart-Disease-Heart-Attack-Risk-Prediction',
  },
  {
    title: 'SkillPath – EdTech Learning Platform',
    period: '2026',
    description:
      'A responsive multi-page React app with client-side routing (React Router v7). Features Google OAuth 2.0 sign-in and Firebase phone-number authentication with OTP verification, controlled validated forms, and a custom neumorphic UI built with Tailwind CSS.',
    tech: ['React', 'React Router', 'Tailwind CSS', 'Firebase Auth', 'Google OAuth', 'Vite'],
    repo: 'https://github.com/lucifier950/SKILLPATH',
  },
  {
    title: 'Mann-o-meter',
    period: 'Nov 2025 – Dec 2025',
    description:
      'An AI-based mental health support system built with Flask. It pairs an information-retrieval chatbot (TF-IDF + BM25) for answering mental-health FAQs with an ML stress analyzer using Random Forest regression and classification.',
    tech: ['Python', 'Flask', 'Scikit-Learn', 'TF-IDF', 'BM25', 'Random Forest'],
    repo: 'https://github.com/lucifier950/Mann-o-meter',
  },
  {
    title: 'Railway Reservation System',
    period: '2025',
    description:
      'A console-based railway reservation system in C++ that simulates ticket booking and passenger record handling. Features train selection, seat booking, and ticket generation, structured with modular functions and input validation.',
    tech: ['C++', 'OOP', 'Console App'],
    repo: 'https://github.com/lucifier950/Railway-Reservation-System',
  },
  {
    title: 'Gym Management System',
    period: '2025',
    description:
      'A gym management system built with C++ using OOP principles. Handles member details and gym workflows through a class-based structure, with basic membership operations and file handling.',
    tech: ['C++', 'OOP', 'File Handling'],
    repo: 'https://github.com/lucifier950',
  },
]

function Projects() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  // How far the cards must travel horizontally = track width minus the
  // viewport. We measure it (and re-measure on resize) so the scrub lands the
  // last card flush at the edge on ANY screen, instead of guessing percentages.
  const [maxX, setMaxX] = useState(0)
  // Horizontal mode is for wide, motion-OK screens; otherwise fall back to grid.
  const [horizontal, setHorizontal] = useState(true)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onResize = () => {
      setHorizontal(!reduce && window.innerWidth >= 760)
      if (trackRef.current) {
        setMaxX(Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 64))
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Map vertical scroll progress through the section onto horizontal travel.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX])

  // --- Fallback: the original responsive grid (mobile / reduced motion) ---
  if (!horizontal) {
    return (
      <section id="projects" className="projects">
        <h2 className="section-title">Projects</h2>
        <div className="projects__grid">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </section>
    )
  }

  // --- Pinned horizontal carousel ---
  // Outer section is tall (viewport + travel distance); the inner panel sticks
  // for the full duration while the track slides left.
  return (
    <section
      id="projects"
      ref={sectionRef}
      className="projects-h"
      style={{ height: `calc(100vh + ${maxX}px)` }}
    >
      <div className="projects-h__sticky">
        <div className="projects-h__head">
          <h2 className="section-title">Projects</h2>
          <span className="projects-h__hint">Scroll →</span>
        </div>
        <motion.div ref={trackRef} className="projects-h__track" style={{ x }}>
          {projects.map((project) => (
            <div className="projects-h__item" key={project.title}>
              <ProjectCard {...project} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Projects
