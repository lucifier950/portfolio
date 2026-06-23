import { useState } from 'react'
import './Contact.css'

// Your contact methods, rendered as a row of links.
const contactLinks = [
  { label: 'Email', value: 'advikrajvansh49@gmail.com', href: 'mailto:advikrajvansh49@gmail.com' },
  { label: 'Phone', value: '+91-9870369632', href: 'tel:+919870369632' },
  { label: 'GitHub', value: 'lucifier950', href: 'https://github.com/lucifier950' },
  { label: 'LinkedIn', value: 'advik-rajvansh', href: 'https://www.linkedin.com/in/advik-rajvansh-8a1b34343/' },
]

function Contact() {
  // ONE piece of state holding all three fields as an object.
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  // Runs on every keystroke in any input. e.target gives us the
  // element that changed — we read its `name` and `value`.
  const handleChange = (e) => {
    const { name, value } = e.target
    // Keep the other fields, overwrite just the one that changed.
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Runs when the form is submitted.
  const handleSubmit = (e) => {
    e.preventDefault() // stop the browser's default page reload
    // Build a mailto: link pre-filled with the message.
    const subject = encodeURIComponent(`Portfolio message from ${form.name}`)
    const body = encodeURIComponent(
      `${form.message}\n\nFrom: ${form.name} (${form.email})`
    )
    window.location.href = `mailto:advikrajvansh49@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="contact">
      <h2 className="section-title">Get In Touch</h2>

      <p className="contact__intro">
        I'm open to internships, collaborations, and interesting projects.
        Feel free to reach out — I'll get back to you soon!
      </p>

      {/* Quick contact links */}
      <div className="contact__links">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="contact__link"
            target="_blank"
            rel="noreferrer"
          >
            <span className="contact__link-label">{link.label}</span>
            <span className="contact__link-value">{link.value}</span>
          </a>
        ))}
      </div>

      {/* The contact form */}
      <form className="contact__form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your message"
          rows="5"
          value={form.message}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn btn--primary">
          Send Message
        </button>
      </form>
    </section>
  )
}

export default Contact
