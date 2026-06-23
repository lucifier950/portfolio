import { useRef, useEffect, useState } from 'react'
import './Reveal.css'

// A reusable wrapper: anything placed inside <Reveal>...</Reveal>
// starts hidden and fades+slides in when it scrolls into view.
function Reveal({ children }) {
  // useRef gives us a "box" to hold a reference to a real DOM node.
  // ref.current will point to the <div> below once it's on screen.
  const ref = useRef(null)

  // Track whether this element has entered the viewport yet.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // IntersectionObserver watches an element and runs our callback
    // whenever it enters or leaves the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        // entries[0].isIntersecting is true when the element is visible.
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.unobserve(node) // animate once, then stop watching
        }
      },
      { threshold: 0.15 } // fire when ~15% of the element is visible
    )

    observer.observe(node)

    // CLEANUP: if this component is ever removed, stop observing
    // so we don't leak memory. React runs this on unmount.
    return () => observer.disconnect()
  }, []) // empty deps = set up the observer once, on mount

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal--visible' : ''}`}
    >
      {children}
    </div>
  )
}

export default Reveal
