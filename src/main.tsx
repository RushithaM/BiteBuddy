import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { dataService } from './services/data'

const root = createRoot(document.getElementById('root')!)
dataService.init().finally(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
