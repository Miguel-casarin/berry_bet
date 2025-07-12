import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Dashboard from './pages/dashboard'
import JogoDoTigrinho from './jogofuncional/jogodoTigrinho'
import Deposito from './pages/deposito'
import ApostaEsportiva from './pages/apostaEsportiva'
import Register from './pages/register'
import './index.css'
import './global.css'
import Saque from './pages/saque'
import Perfil from './pages/perfil'
import Conta from './pages/conta'
import Ranking from './pages/ranking'
import Aviso from './pages/aviso'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jogodoTigrinho" element={<JogoDoTigrinho />} />
        <Route path="/deposito" element={<Deposito />} />
        <Route path="/apostaEsportiva" element={<ApostaEsportiva />} />
        <Route path="/register" element={<Register />} />

        <Route path="/saque" element={<Saque />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/conta" element={<Conta />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/aviso" element={<Aviso />} />
      </Routes>

    </BrowserRouter>
  </StrictMode>,
)
