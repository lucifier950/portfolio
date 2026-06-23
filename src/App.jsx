import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Reveal from './components/Reveal.jsx'
import './App.css'

function App() {
  return (
    <>
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

        <Reveal>
          <Projects />
        </Reveal>

        <Reveal>
          <Education />
        </Reveal>

        <Reveal>
          <Contact />
        </Reveal>
      </main>

      <Footer />
    </>
  )
}

export default App
