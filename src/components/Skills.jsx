import { lazy, Suspense, useEffect, useState } from 'react'
import './Skills.css'

// 3D planet system loads lazily, only on capable devices.
const SkillsGalaxy = lazy(() => import('./effects/SkillsGalaxy.jsx'))

// An array of categories. Each category has a title and its OWN
// array of skill names. This nested shape (array inside an object
// inside an array) is what lets us do a nested .map() below.
const skillCategories = [
  {
    title: 'Languages',
    skills: ['C++', 'Python', 'SQL', 'Java', 'Unix/Linux'],
  },
  {
    title: 'Libraries & Frameworks',
    skills: ['Pandas', 'NumPy', 'Scikit-Learn', 'Matplotlib', 'Flask'],
  },
  {
    title: 'Machine Learning & Data',
    skills: [
      'EDA',
      'Feature Engineering',
      'Classification',
      'Regression',
      'Clustering',
      'Model Evaluation',
    ],
  },
  {
    title: 'Core CS',
    skills: ['DSA', 'OOP', 'DBMS', 'Operating Systems'],
  },
  {
    title: 'Tools',
    skills: ['Jupyter Notebook', 'Git & GitHub', 'Google Colab'],
  },
]

function Skills() {
  // Show the 3D planet system on capable devices; the grid below is always
  // present (accessible content + mobile/reduced-motion fallback).
  const [show3d, setShow3d] = useState(false)
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wide = window.innerWidth > 820
    let webgl = false
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl') || c.getContext('experimental-webgl'))
    } catch {
      webgl = false
    }
    if (fine && wide && !reduce && webgl) setShow3d(true)
  }, [])

  return (
    <section id="skills" className="skills">
      <h2 className="section-title">Skills</h2>

      {show3d && (
        <div className="skills__galaxy">
          <Suspense fallback={null}>
            <SkillsGalaxy categories={skillCategories} />
          </Suspense>
          <p className="skills__hint">Hover a planet to explore</p>
        </div>
      )}

      <div className="skills__grid">
        {/* OUTER map: one card per category */}
        {skillCategories.map((category) => (
          <div className="skill-card" key={category.title}>
            <h3 className="skill-card__title">{category.title}</h3>

            <ul className="skill-card__list">
              {/* INNER map: one pill per skill inside THIS category */}
              {category.skills.map((skill) => (
                <li className="skill-pill" key={skill}>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
