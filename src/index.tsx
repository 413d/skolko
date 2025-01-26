import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const root = document.getElementById('root');
if (root === null) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <main>
      <h1>Skolko</h1>
    </main>
  </StrictMode>,
)
