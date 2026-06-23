import './Education.css'

// Each entry on the timeline. `type` is just a small tag label.
const timeline = [
  {
    type: 'Education',
    title: 'B.Tech in Computer Science',
    place: 'Jaypee Institute of Information Technology (JIIT), Noida',
    period: 'July 2024 – July 2028 (Expected)',
    detail:
      'CGPA: 7.6 / 10. Relevant coursework: Data Structures & Algorithms, OOP in C++, DBMS, Operating Systems, and Machine Learning Basics.',
  },
  {
    type: 'Certification',
    title: 'Deep Learning Certification',
    place: 'IIT Delhi (Online)',
    period: '2025',
    detail:
      'Completed an online certification in Deep Learning, building foundations in neural networks and modern ML techniques.',
  },
  {
    type: 'Workshop',
    title: 'RAG & LLMs Workshop',
    place: 'JIIT',
    period: '2025',
    detail:
      'Attended a hands-on workshop on Retrieval-Augmented Generation (RAG) and Large Language Models.',
  },
  {
    type: 'Achievement',
    title: '200+ LeetCode Problems Solved',
    place: 'LeetCode (C++)',
    period: 'Ongoing',
    detail:
      'Strengthened problem-solving skills and DSA fundamentals by solving 200+ C++ problems.',
  },
]

function Education() {
  return (
    <section id="education" className="education">
      <h2 className="section-title">Education & Journey</h2>

      <div className="timeline">
        {timeline.map((item) => (
          <div className="timeline__item" key={item.title}>
            {/* The dot is drawn in CSS; this div is the content. */}
            <span className="timeline__tag">{item.type}</span>
            <h3 className="timeline__title">{item.title}</h3>
            <p className="timeline__place">{item.place}</p>
            <span className="timeline__period">{item.period}</span>
            <p className="timeline__detail">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Education
