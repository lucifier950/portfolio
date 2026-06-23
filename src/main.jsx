import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import './index.css'

// Find the empty <div id="root"> from index.html...
ReactDOM.createRoot(document.getElementById('root')).render(
  // ...and render our whole <App /> inside it.
  // <React.StrictMode> turns on extra warnings during development.
  <React.StrictMode>
    {/* ThemeProvider wraps App, so EVERY component inside App
        can use useTheme() to read or change the theme. */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
