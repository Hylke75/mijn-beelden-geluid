import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource-variable/dm-sans'
import './index.css'
import App from './App'
import { DemoProvider } from './demo/store'
import { UIProvider } from './demo/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DemoProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </DemoProvider>
    </BrowserRouter>
  </StrictMode>,
)
