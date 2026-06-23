import ProjectCard from './ProjectCard.jsx'
import './Projects.css'

// The project data, pulled from your resume. Each object becomes
// one <ProjectCard>. `tech` is an array, `repo` is the GitHub URL.
const projects = [
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
  return (
    <section id="projects" className="projects">
      <h2 className="section-title">Projects</h2>

      <div className="projects__grid">
        {projects.map((project) => (
          // Pass each field of the project object IN as a prop.
          // The `key` is React's bookkeeping; the rest are real props.
          <ProjectCard
            key={project.title}
            title={project.title}
            period={project.period}
            description={project.description}
            tech={project.tech}
            repo={project.repo}
          />
        ))}
      </div>
    </section>
  )
}

export default Projects
