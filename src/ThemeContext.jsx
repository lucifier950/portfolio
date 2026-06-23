import { createContext, useContext, useState, useEffect } from 'react'

// 1. Create the Context object. This is the "channel" components
//    will use to share the theme. The argument is a default value.
const ThemeContext = createContext()

// 2. The Provider component. We wrap our whole <App /> in this.
//    Anything inside it can access the theme.
export function ThemeProvider({ children }) {
  // 3. State: the current theme. We try to read the user's last
  //    choice from localStorage; if none, default to 'light'.
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  // 4. Every time `theme` changes, do two things as a side effect:
  useEffect(() => {
    // a) Set <html data-theme="..."> so our CSS variables switch.
    document.documentElement.setAttribute('data-theme', theme)
    // b) Remember the choice so it survives a page refresh.
    localStorage.setItem('theme', theme)
  }, [theme]) // <-- only re-run when `theme` changes

  // 5. A helper to flip between the two themes.
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // 6. Hand the theme + toggle function to everyone inside.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 7. A custom hook so components can grab the theme in one line:
//    const { theme, toggleTheme } = useTheme()
export function useTheme() {
  return useContext(ThemeContext)
}
