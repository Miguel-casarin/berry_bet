import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Dashboard from './pages/dashboard'
import JogoDoTigrinho from './pages/jogodoTigrinho'
import Deposito from './pages/deposito'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jogodoTigrinho" element={<JogoDoTigrinho />} />
        <Route path="/deposito" element={<Deposito />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
