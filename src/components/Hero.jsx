import './Hero.css'

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__content">
        {/* A small greeting line above the name */}
        <p className="hero__greeting">Hi, my name is</p>

        {/* The big name — the star of the page */}
        <h1 className="hero__name">Advik Rajvansh</h1>

        {/* The role, in muted color */}
        <h2 className="hero__role">CSE Student &amp; ML Developer</h2>

        {/* A one-line tagline describing what you do */}
        <p className="hero__tagline">
          2nd-year B.Tech CSE student at JIIT, building real-world projects
          with Machine Learning, Flask, and C++. Passionate about AI,
          data, and strong DSA fundamentals.
        </p>

        {/* Call-to-action buttons */}
        <div className="hero__actions">
          {/* Primary button: jumps to the Projects section */}
          <a href="#projects" className="btn btn--primary">
            View Projects
          </a>

          {/* Secondary button: downloads the resume PDF.
              The `download` attribute tells the browser to save
              the file instead of opening it. We'll add the actual
              PDF file in a later step. */}
          <a href="/resume.pdf" className="btn btn--outline" download>
            Download Resume
          </a>

          {/* Link out to GitHub. target="_blank" opens a NEW tab;
              rel="noreferrer" is a security best-practice for that. */}
          <a
            href="https://github.com/lucifier950"
            className="btn btn--outline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
