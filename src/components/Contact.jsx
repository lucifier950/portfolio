import { useState } from 'react'
import './Contact.css'

// Paste YOUR Formspree endpoint here (looks like https://formspree.io/f/abcdwxyz).
// This is safe to keep in client-side code — Formspree endpoints are public by design.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'

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

  // Tracks where we are in the submit lifecycle so the UI can react:
  // 'idle' (default) | 'sending' | 'success' | 'error'
  const [status, setStatus] = useState('idle')

  // Runs on every keystroke in any input. e.target gives us the
  // element that changed — we read its `name` and `value`.
  const handleChange = (e) => {
    const { name, value } = e.target
    // Keep the other fields, overwrite just the one that changed.
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Runs when the form is submitted. `async` lets us use `await` below.
  const handleSubmit = async (e) => {
    e.preventDefault() // stop the browser's default page reload
    setStatus('sending') // disables the button + shows "Sending..."

    try {
      // Send the form data to Formspree as JSON over the network.
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json', // ask Formspree to reply with JSON, not a redirect
        },
        body: JSON.stringify(form), // turn our {name, email, message} object into a JSON string
      })

      if (response.ok) {
        setStatus('success')
        setForm({ name: '', email: '', message: '' }) // clear the form
      } else {
        setStatus('error') // Formspree responded, but with an error status
      }
    } catch {
      setStatus('error') // network failed entirely (offline, blocked, etc.)
    }
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
        <button
          type="submit"
          className="btn btn--primary"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>

        {/* Feedback shown after a submit attempt */}
        {status === 'success' && (
          <p className="contact__status contact__status--ok">
            Thanks! Your message has been sent — I'll get back to you soon.
          </p>
        )}
        {status === 'error' && (
          <p className="contact__status contact__status--err">
            Something went wrong. Please email me directly at advikrajvansh49@gmail.com.
          </p>
        )}
      </form>
    </section>
  )
}

export default Contact
