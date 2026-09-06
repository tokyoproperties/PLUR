import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// GitHub Pages SPA fallback: public/404.html stores the requested path,
// then lands here. Restore it before the router mounts.
try {
  const stored = sessionStorage.getItem('ee-redirect-path')
  if (stored) {
    sessionStorage.removeItem('ee-redirect-path')
    window.history.replaceState(null, '', stored)
  }
} catch (e) { /* private mode — deep-link restore skipped */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
