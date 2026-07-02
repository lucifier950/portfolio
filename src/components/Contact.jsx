import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValue, animate } from 'framer-motion'
import gsap from 'gsap'
import './Contact.css'

/**
 * Contact — "Mission Control": the grand finale of the journey through the
 * portfolio. A two-column communication terminal:
 *   LEFT  — channel cards on a glowing comm line (click to copy → toast)
 *   RIGHT — a futuristic transmission console (floating labels, glowing send)
 * Submitting runs a GSAP transmission sequence: a beam shoots to a satellite
 * that blinks on receipt, while the console reports Establishing → Encrypting →
 * Signal Sent. Background: nebula, distant planets, shooting stars, GPU stars
 * (global backdrop) + cosmic dust — all strictly behind the glass, never text.
 *
 * Formspree endpoint is public by design; paste yours below to send for real.
 */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'
const CONFIGURED = !FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')

const channels = [
  { key: 'email', label: 'Email', value: 'advikrajvansh49@gmail.com', href: 'mailto:advikrajvansh49@gmail.com', copy: 'advikrajvansh49@gmail.com', accent: '#4f9bff' },
  { key: 'phone', label: 'Phone', value: '+91 98703 69632', href: 'tel:+919870369632', copy: '+919870369632', accent: '#34d399' },
  { key: 'github', label: 'GitHub', value: 'lucifier950', href: 'https://github.com/lucifier950', copy: 'https://github.com/lucifier950', accent: '#b98cff' },
  { key: 'linkedin', label: 'LinkedIn', value: 'advik-rajvansh', href: 'https://www.linkedin.com/in/advik-rajvansh-8a1b34343/', copy: 'https://www.linkedin.com/in/advik-rajvansh-8a1b34343/', accent: '#38bdf8' },
]

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ChannelIcon = ({ name }) => {
  if (name === 'email')
    return (
      <svg {...svg} className="mc-ico mc-ico--email" width="24" height="24">
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path className="mc-ico__flap" d="M3.5 7 12 13l8.5-6" />
      </svg>
    )
  if (name === 'phone')
    return (
      <svg {...svg} className="mc-ico mc-ico--phone" width="24" height="24">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
      </svg>
    )
  if (name === 'github')
    return (
      <svg {...svg} className="mc-ico mc-ico--github" width="24" height="24">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 20 4.8a4.8 4.8 0 0 0-.1-3.5s-1.1-.3-3.6 1.4a12.3 12.3 0 0 0-6.6 0C7.2 1 6.1 1.3 6.1 1.3A4.8 4.8 0 0 0 6 4.8a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" />
      </svg>
    )
  return (
    <svg {...svg} className="mc-ico mc-ico--linkedin" width="24" height="24">
      <path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-4 0v6h-4v-6a6 6 0 0 1 6-6zM6 9H2v11h4zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  )
}

const RocketIcon = (props) => (
  <svg {...svg} viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
)

const PHASES = ['Establishing Connection…', 'Encrypting Transmission…', 'Signal Sent Successfully 🚀']

// 3D-tilt handler shared by the cards (subtle parallax on hover).
function useTilt(max = 9) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max)
  }
  const onLeave = () => {
    animate(rx, 0, { duration: 0.4, ease: 'easeOut' })
    animate(ry, 0, { duration: 0.4, ease: 'easeOut' })
  }
  return { rx, ry, onMove, onLeave }
}

function ChannelCard({ ch, index, onCopy }) {
  const { rx, ry, onMove, onLeave } = useTilt()
  return (
    <motion.div
      className={`mc-card mc-card--${ch.key}`}
      style={{ '--accent': ch.accent, rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* Stretched copy button = the whole card's primary action (keyboard
          accessible). The "open" link sits above it as a separate control, so
          we never nest interactive elements. */}
      <button type="button" className="mc-card__copy" onClick={() => onCopy(ch)} aria-label={`Copy ${ch.label}: ${ch.value}`} />
      <span className="mc-card__node" aria-hidden="true" />
      <span className="mc-card__icon">
        <ChannelIcon name={ch.key} />
      </span>
      <span className="mc-card__text">
        <span className="mc-card__label">{ch.label}</span>
        <span className="mc-card__value">{ch.value}</span>
      </span>
      <a className="mc-card__open" href={ch.href} target="_blank" rel="noreferrer" aria-label={`Open ${ch.label} in a new tab`}>
        <svg {...svg} width="15" height="15" viewBox="0 0 24 24">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </a>
      <span className="mc-card__hint">Click to copy</span>
    </motion.div>
  )
}

// Ambient cinematic background — lives BEHIND the glass (z-index 0).
function MCSpace({ signal, satRef }) {
  const dust = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        left: `${(i * 53 + 6) % 100}%`,
        top: `${(i * 41 + 5) % 100}%`,
        size: 1.5 + ((i * 5) % 3),
        dur: 8 + ((i * 3) % 9),
        delay: (i % 7) * 0.7,
        o: 0.25 + ((i % 4) * 0.12),
      })),
    []
  )
  return (
    <div className="mc-space" aria-hidden="true">
      <span className="mc-neb mc-neb--a" />
      <span className="mc-neb mc-neb--b" />
      <span className="mc-planet mc-planet--a" />
      <span className="mc-planet mc-planet--b" />
      {/* satellite — receives the transmission (pulse rings + antenna light) */}
      <span ref={satRef} className={`mc-sat ${signal ? 'is-signal' : ''}`}>
        <span className="mc-sat__pulse" />
        <span className="mc-sat__pulse mc-sat__pulse--b" />
        <svg className="mc-sat__svg" viewBox="0 0 104 60" width="76" height="44" fill="none">
          <defs>
            <linearGradient id="satBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef2ff" />
              <stop offset="1" stopColor="#8b9bc0" />
            </linearGradient>
            <linearGradient id="satPanel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2b5cc0" />
              <stop offset="1" stopColor="#173a86" />
            </linearGradient>
          </defs>
          {/* struts */}
          <path d="M28 30h14M62 30h14" stroke="#6a7ba0" strokeWidth="2" />
          {/* solar panels */}
          <g>
            <rect x="4" y="18" width="22" height="24" rx="1.5" fill="url(#satPanel)" stroke="#4f7fd6" strokeWidth="1" />
            <path d="M15 18v24M4 24h22M4 36h22" stroke="#6f9bec" strokeWidth="0.7" />
            <rect x="78" y="18" width="22" height="24" rx="1.5" fill="url(#satPanel)" stroke="#4f7fd6" strokeWidth="1" />
            <path d="M89 18v24M78 24h22M78 36h22" stroke="#6f9bec" strokeWidth="0.7" />
          </g>
          {/* body */}
          <rect x="42" y="18" width="20" height="24" rx="3" fill="url(#satBody)" stroke="#aab6d6" strokeWidth="1" />
          {/* dish arm + dish + antenna light */}
          <path d="M52 18V9" stroke="#aab6d6" strokeWidth="2" />
          <ellipse cx="52" cy="7" rx="9" ry="4.5" fill="#cdd8ef" stroke="#8fa0c4" strokeWidth="1" />
          <circle className="mc-sat__light" cx="52" cy="7" r="2.4" />
        </svg>
      </span>
      {dust.map((d, i) => (
        <span
          key={i}
          className="mc-dust"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size, '--dur': `${d.dur}s`, '--delay': `${d.delay}s`, '--o': d.o }}
        />
      ))}
      <span className="mc-shoot mc-shoot--a" />
      <span className="mc-shoot mc-shoot--b" />
    </div>
  )
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | transmitting | success | error
  const [phase, setPhase] = useState(0)
  const [toast, setToast] = useState(null)
  const [signal, setSignal] = useState(false)

  const sectionRef = useRef(null)
  const sendRef = useRef(null)
  const satRef = useRef(null)
  const beamLineRef = useRef(null)
  const beamPulseRef = useRef(null)
  const rocketRef = useRef(null)
  const rafRef = useRef(0)
  const toastTimer = useRef(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Click-to-copy with a toast confirmation.
  const handleCopy = useCallback(async (ch) => {
    try {
      await navigator.clipboard.writeText(ch.copy)
      setToast(`${ch.label} copied`)
    } catch {
      setToast(`${ch.label}: ${ch.value}`)
    }
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  // Subtle background parallax + "stars react to the mouse" (rAF-throttled).
  const handlePointer = (e) => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      const el = sectionRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
      el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (status === 'transmitting') return
    setStatus('transmitting')
    setPhase(0)
    setSignal(false)
    // Best-effort real send (only when a real endpoint is configured).
    if (CONFIGURED) {
      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => {})
    }
  }

  // GSAP transmission sequence — runs once the console is on-screen.
  useEffect(() => {
    if (status !== 'transmitting') return
    const tl = gsap.timeline()

    // Launch the rocket icon out of the button.
    if (rocketRef.current) {
      tl.fromTo(rocketRef.current, { y: 0, opacity: 1 }, { y: -120, opacity: 0, duration: 1.3, ease: 'power2.in' }, 0.2)
    }

    // Draw a beam from the button up to the satellite, with a glowing pulse
    // riding along it. Coords are measured relative to the section so the beam
    // lands on the satellite regardless of layout/scroll.
    const sec = sectionRef.current
    const btn = sendRef.current
    const sat = satRef.current
    const line = beamLineRef.current
    const pulse = beamPulseRef.current
    if (sec && btn && sat && line && pulse) {
      const s = sec.getBoundingClientRect()
      const b = btn.getBoundingClientRect()
      const a = sat.getBoundingClientRect()
      const x1 = b.left + b.width / 2 - s.left
      const y1 = b.top - s.top
      const x2 = a.left + a.width / 2 - s.left
      const y2 = a.top + a.height / 2 - s.top
      gsap.set(line, { attr: { x1, y1, x2: x1, y2: y1 }, opacity: 1 })
      gsap.set(pulse, { attr: { cx: x1, cy: y1 }, opacity: 1 })
      tl.to(line, { attr: { x2, y2 }, duration: 0.8, ease: 'power2.out' }, 0.1)
      tl.to(pulse, { attr: { cx: x2, cy: y2 }, duration: 0.8, ease: 'power2.out' }, 0.1)
      tl.add(() => setSignal(true), 0.9) // satellite lights up when the beam lands
      tl.to([line, pulse], { opacity: 0, duration: 0.6 }, 1.9)
    } else {
      tl.add(() => setSignal(true), 0.9)
    }

    tl.add(() => setPhase(1), 1.0)
    tl.add(() => setPhase(2), 2.0)
    tl.add(() => setStatus('success'), 2.55)
    return () => tl.kill()
  }, [status])

  const reset = () => {
    setStatus('idle')
    setPhase(0)
    setSignal(false)
    setForm({ name: '', email: '', message: '' })
  }

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const transmitting = status === 'transmitting'
  const success = status === 'success'

  return (
    <section id="contact" className="mc" ref={sectionRef} onPointerMove={handlePointer}>
      <MCSpace signal={signal} satRef={satRef} />

      {/* Transmission beam — drawn between the Send button and the satellite,
          behind the glass so it never crosses text. Coords set at transmit. */}
      <svg className="mc-beam-svg" aria-hidden="true">
        <line ref={beamLineRef} className="mc-beam-line" x1="0" y1="0" x2="0" y2="0" />
        <circle ref={beamPulseRef} className="mc-beam-pulse" r="5" cx="0" cy="0" />
      </svg>

      <div className="mc__inner">
        <motion.header
          className="mc__head"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mc__eyebrow">
            <span className="mc__ping" /> Incoming Transmission
          </span>
          <h2 className="section-title mc__title">Mission Control</h2>
          <p className="mc__subtitle">
            You've reached the end of the journey. Open a channel — I'm listening for internships, collaborations, and interesting missions.
          </p>
        </motion.header>

        <div className="mc__grid">
          {/* LEFT — channels on a glowing comm line */}
          <div className="mc__channels">
            <span className="mc__line" aria-hidden="true">
              <span className="mc__line-fill" />
            </span>
            {channels.map((ch, i) => (
              <ChannelCard key={ch.key} ch={ch} index={i} onCopy={handleCopy} />
            ))}
          </div>

          {/* RIGHT — transmission console */}
          <motion.div
            className="mc-console"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <div className="mc-console__bar">
              <span className="mc-console__dot" />
              <span className="mc-console__dot" />
              <span className="mc-console__dot" />
              <span className="mc-console__title">transmit.channel</span>
            </div>

            {!success && (
              <form className={`mc-form ${transmitting ? 'is-transmitting' : ''}`} onSubmit={handleSubmit}>
                <div className="mc-field">
                  <input id="mc-name" name="name" placeholder=" " value={form.name} onChange={handleChange} required disabled={transmitting} />
                  <label htmlFor="mc-name">Your Name</label>
                  <span className="mc-field__glow" />
                </div>
                <div className="mc-field">
                  <input id="mc-email" type="email" name="email" placeholder=" " value={form.email} onChange={handleChange} required disabled={transmitting} />
                  <label htmlFor="mc-email">Your Email</label>
                  <span className="mc-field__glow" />
                </div>
                <div className="mc-field mc-field--message">
                  <textarea id="mc-message" name="message" rows="5" placeholder=" " value={form.message} onChange={handleChange} required disabled={transmitting} />
                  <label htmlFor="mc-message">Your Message</label>
                  <span className="mc-field__glow" />
                </div>

                <button ref={sendRef} type="submit" className="mc-send" disabled={transmitting}>
                  <span className="mc-send__glow" aria-hidden="true" />
                  <span ref={rocketRef} className="mc-send__rocket">
                    <RocketIcon />
                  </span>
                  <span className="mc-send__label">{transmitting ? PHASES[phase] : 'Transmit Message'}</span>
                  {transmitting && <span className="mc-send__progress" style={{ '--p': `${(phase + 1) / PHASES.length}` }} />}
                  {[...Array(6)].map((_, i) => (
                    <span className="mc-send__spark" style={{ '--i': i }} key={i} aria-hidden="true" />
                  ))}
                </button>

                {transmitting && (
                  <ul className="mc-log">
                    {PHASES.map((p, i) => (
                      <li key={p} className={`mc-log__row ${i <= phase ? 'is-done' : ''}`}>
                        <span className="mc-log__tick">{i < phase ? '✓' : i === phase ? '›' : '·'}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </form>
            )}

            {success && (
              <motion.div
                className="mc-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mc-success__badge">
                  <RocketIcon />
                  <span className="mc-success__ring" />
                </div>
                <h3 className="mc-success__title">Transmission Sent Successfully</h3>
                <p className="mc-success__text">
                  Signal received at Mission Control{CONFIGURED ? '' : ' (demo)'}. I'll get back to you shortly, {form.name?.split(' ')[0] || 'explorer'}.
                </p>
                <button type="button" className="mc-success__again" onClick={reset}>
                  Send another transmission
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* copy toast — portaled to <body> to escape the section's transforms */}
      {toast &&
        createPortal(
          <div className="mc-toast" role="status">
            <span className="mc-toast__check">✓</span> {toast}
          </div>,
          document.body
        )}
    </section>
  )
}

export default Contact
