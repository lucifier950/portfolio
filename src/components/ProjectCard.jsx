// This component RECEIVES props — data passed in from its parent.
// We destructure them straight out of the props object in the
// parentheses: ({ title, description, ... }).
function ProjectCard({ title, period, description, tech, repo }) {
  return (
    <article className="project-card">
      <div className="project-card__header">
        <h3 className="project-card__title">{title}</h3>
        <span className="project-card__period">{period}</span>
      </div>

      <p className="project-card__desc">{description}</p>

      {/* The tech tags — `tech` is an array prop, so we .map() it */}
      <ul className="project-card__tech">
        {tech.map((item) => (
          <li className="tech-tag" key={item}>
            {item}
          </li>
        ))}
      </ul>

      {/* Link out to the source code on GitHub */}
      <a
        className="project-card__link"
        href={repo}
        target="_blank"
        rel="noreferrer"
      >
        View Source →
      </a>
    </article>
  )
}

export default ProjectCard
