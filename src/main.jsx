import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { MenuProvider } from './lib/MenuContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MenuProvider>
        <App />
      </MenuProvider>
    </BrowserRouter>
  </StrictMode>,
)
