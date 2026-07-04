import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyFont, cachedFont } from './font'

// Apply the last-used admin font before first paint to avoid a flash.
applyFont(cachedFont())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
