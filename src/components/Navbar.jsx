import { useTheme } from '../ThemeContext.jsx'
import './Navbar.css'

// The list of links. Each `href` points to a section id we'll
// create in App.jsx (e.g. href="#about" jumps to id="about").
// Keeping them in an array means we render them with one loop
// instead of copy-pasting the same <a> tag four times.
const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
]

function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="navbar">
      {/* Brand / logo on the left. Clicking it jumps to the top. */}
      <a href="#top" className="navbar__brand">
        Advik Rajvansh
      </a>

      {/* The nav links in the middle/right. */}
      <ul className="navbar__links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>

      {/* Theme toggle button, now living in the navbar. */}
      <button
        className="navbar__toggle"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </nav>
  )
}

export default Navbar
