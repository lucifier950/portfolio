import './About.css'

// The stats strip data. Each object = one stat card.
// Stored as an array so we can render them with .map().
const stats = [
  { value: '7.6', label: 'CGPA / 10' },
  { value: '200+', label: 'LeetCode Solved' },
  { value: '5', label: 'Projects Built' },
  { value: '1', label: 'IIT Delhi Cert' },
]

function About() {
  return (
    <section id="about" className="about">
      <h2 className="section-title">About Me</h2>

      <div className="about__body">
        {/* Intro paragraphs, based on your resume summary */}
        <p>
          I'm a 3rd-year B.Tech Computer Science student at JIIT, Noida,
          with a strong foundation in <strong>C++</strong>,{' '}
          <strong>Python</strong>, <strong>Machine Learning</strong>, and{' '}
          <strong>SQL</strong>. I enjoy turning ideas into real, working
          software.
        </p>
        <p>
          My hands-on work spans Flask deployment, TF-IDF + BM25 retrieval
          systems, and Random Forest models. Alongside building projects, I
          keep my problem-solving sharp through DSA practice and a solid
          grasp of OOP principles.
        </p>

        {/* The stats strip */}
        <div className="about__stats">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span className="stat-card__value">{stat.value}</span>
              <span className="stat-card__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
