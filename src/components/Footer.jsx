import './Footer.css'

function Footer() {
  // We compute the current year so the copyright never goes stale.
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__links">
        <a href="https://github.com/lucifier950" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/advik-rajvansh-8a1b34343/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a href="mailto:advikrajvansh49@gmail.com">Email</a>
      </div>

      <p className="footer__text">
        © {year} Advik Rajvansh. Built with React &amp; Vite.
      </p>
    </footer>
  )
}

export default Footer
