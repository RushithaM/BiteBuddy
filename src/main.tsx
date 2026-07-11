import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BootstrapLoader } from './components/BootstrapLoader'
import { dataService } from './services/data'
import { useBootstrapping } from './state/useAppData'

function Root() {
  const [initDone, setInitDone] = useState(false)
  const bootstrapping = useBootstrapping()

  useEffect(() => {
    dataService.init().finally(() => setInitDone(true))
  }, [])

  const showLoader = !initDone || bootstrapping

  return (
    <>
      {showLoader && <BootstrapLoader />}
      {initDone && (
        <StrictMode>
          <App />
        </StrictMode>
      )}
    </>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
