import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// SF Pro is the reference typeface; only Apple platforms ship it.
if (/Mac|iPhone|iPad/.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent)) {
  document.documentElement.classList.add('is-apple')
}

// Canvas decals (truck branding, dock signs) are drawn with Inter, so give the
// web font a moment to arrive before the first frame. Never block for long.
const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load('700 64px Inter'),
    document.fonts.load('500 32px Inter'),
  ]).catch(() => undefined),
  new Promise((resolve) => setTimeout(resolve, 1500)),
])

fontsReady.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
