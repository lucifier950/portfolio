import { createContext, useContext, useEffect } from 'react'

// The site now uses a SINGLE locked theme: a blue night-sky look.
// We keep this context/hook so existing callers (App, Navbar) keep working,
// but it always reports 'dark' and there is no toggle.
const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const theme = 'dark'

  // Pin <html data-theme="dark"> so the shader + starfield + CSS all agree.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  // toggleTheme is a no-op now (kept so any lingering caller doesn't crash).
  const toggleTheme = () => {}

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
