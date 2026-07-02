import Magnetic from './effects/Magnetic.jsx'
import './Navbar.css'

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
]

function Navbar() {
  // Route nav clicks through Lenis so jumping to a section uses the SAME
  // inertia as wheel scrolling — the page glides there cinematically instead
  // of teleporting. If Lenis isn't active (reduced motion), we let the native
  // CSS smooth-scroll anchor behavior take over.
  const handleNav = (e, href) => {
    if (!window.__lenis) return
    e.preventDefault()
    const target = href === '#top' ? 0 : href
    window.__lenis.scrollTo(target, { offset: -70, duration: 1.4 })
  }

  return (
    <nav className="navbar">
      <Magnetic strength={0.25}>
        <a
          href="#top"
          className="navbar__brand"
          onClick={(e) => handleNav(e, '#top')}
        >
          Advik Rajvansh
        </a>
      </Magnetic>

      <ul className="navbar__links">
        {links.map((link) => (
          <li key={link.href}>
            <Magnetic strength={0.3}>
              <a href={link.href} onClick={(e) => handleNav(e, link.href)}>
                {link.label}
              </a>
            </Magnetic>
          </li>
        ))}
      </ul>

    </nav>
  )
}

export default Navbar
