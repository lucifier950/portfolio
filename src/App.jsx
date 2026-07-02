import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import { MotionConfig } from 'framer-motion'
import Reveal from './components/Reveal.jsx'
import GalaxyBackground from './components/effects/GalaxyBackground.jsx'
import Cursor from './components/effects/Cursor.jsx'
import ScrollProgress from './components/effects/ScrollProgress.jsx'
import KonamiEasterEgg from './components/effects/KonamiEasterEgg.jsx'
import useSmoothScroll from './hooks/useSmoothScroll.js'
import './App.css'

function App() {
  // Inertia smooth-scroll for the whole document — the cinematic foundation.
  useSmoothScroll()

  return (
    // reducedMotion="user" makes EVERY Framer Motion animation below
    // automatically honor the OS "reduce motion" setting — one switch for
    // accessibility instead of guarding each component.
    <MotionConfig reducedMotion="user">
      {/* 3D galaxy journey on capable devices (scroll dives through it),
          canvas warp-starfield fallback elsewhere. Fixed behind all content;
          deep-blue base gradient lives on <html> in index.css. */}
      <GalaxyBackground />

      {/* Custom blend-mode cursor (auto-disables on touch). */}
      <Cursor />

      {/* Top scroll-progress bar. */}
      <ScrollProgress />

      {/* Hidden Konami-code confetti easter egg (↑↑↓↓←→←→ B A). */}
      <KonamiEasterEgg />

      {/* The navbar sits at the very top and stays pinned. */}
      <Navbar />

      {/* An invisible anchor at the very top, so the brand's
          "#top" link has somewhere to scroll back to. */}
      <span id="top"></span>

      {/* The big first-impression section */}
      <Hero />

      {/* Each section is its own component. The id on each is
          what the navbar links smooth-scroll to. */}
      {/* Each section is wrapped in <Reveal> so it fades + slides
          in as you scroll it into view. */}
      <main>
        <Reveal>
          <About />
        </Reveal>

        <Reveal>
          <Skills />
        </Reveal>

        {/* Projects is NOT wrapped in <Reveal>: it pins via position:sticky,
            which breaks inside a transformed ancestor. Its scroll-scrubbed
            horizontal slide is its own entrance animation. */}
        <Projects />

        <Reveal>
          <Education />
        </Reveal>

        <Reveal>
          <Contact />
        </Reveal>
      </main>

      <Footer />
    </MotionConfig>
  )
}

export default App
