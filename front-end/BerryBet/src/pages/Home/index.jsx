import minhaImagem from '../../assets/imagemBackground.png'
import './style.css'
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react'

function Home() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', cpf: '', phone: '' })
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value })
  }

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '')
    if (cpf.length !== 11 || /^( {11}|(\d)\1{10})$/.test(cpf)) return false
    let soma = 0,
      resto
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(9, 10))) return false
    soma = 0
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(10, 11))) return false
    return true
  }

  // Função para gerar CPF válido
  function gerarCPF() {
    let n = [];
    for (let i = 0; i < 9; i++) n.push(Math.floor(Math.random() * 10));
    let d1 = 0, d2 = 0;
    for (let i = 0; i < 9; i++) d1 += n[i] * (10 - i);
    d1 = 11 - (d1 % 11);
    if (d1 >= 10) d1 = 0;
    for (let i = 0; i < 9; i++) d2 += n[i] * (11 - i);
    d2 += d1 * 2;
    d2 = 11 - (d2 % 11);
    if (d2 >= 10) d2 = 0;
    return `${n[0]}${n[1]}${n[2]}.${n[3]}${n[4]}${n[5]}.${n[6]}${n[7]}${n[8]}-${d1}${d2}`;
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const value = form.usernameOrEmail
      const payload = value.includes('@')
        ? { email: value, username: value, password: form.password }
        : { username: value, email: value, password: form.password }
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao fazer login.')
      setSuccess('Login realizado com sucesso!')
      localStorage.setItem('token', data.data.token)
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault()
    setRegisterError('')
    setRegisterSuccess('')
    if (!validarCPF(registerForm.cpf)) {
      setRegisterError('CPF inválido!')
      return
    }
    try {
      const res = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar.')
      setRegisterSuccess('Usuário registrado com sucesso!')
      setTimeout(() => {
        setShowRegister(false)
        setRegisterForm({ username: '', email: '', password: '', cpf: '', phone: '' })
      }, 1500)
    } catch (err) {
      setRegisterError(err.message)
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${minhaImagem})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px) brightness(0.7)',
          zIndex: 1,
        }}
      />
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className='container'>
          <form onSubmit={handleSubmit}>
            <h1>Bem-vindo ao BerryBet!</h1>
            <h2>Faça seu login</h2>
            <div className='input-container'>
              <label htmlFor="usernameOrEmail">Usuário ou Email:</label>
              <input type="text" id="usernameOrEmail" name="usernameOrEmail" placeholder="Digite seu usuário ou email" required value={form.usernameOrEmail} onChange={handleChange} />
            </div>
            <div className='input-container'>
              <label htmlFor="password">Senha:</label>
              <input type="password" id="password" name="password" placeholder="Digite sua senha" required value={form.password} onChange={handleChange} />
            </div>
            <button type="submit">Entrar</button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
            <p>Não tem uma conta? <button type="button" style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={() => setShowRegister(true)}>Cadastre-se</button></p>
            <p><a href="/forgot-password">Esqueci minha senha</a></p>
          </form>
        </div>
        {showRegister && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 400 }}>
              <h2>Registrar</h2>
              <form onSubmit={handleRegisterSubmit}>
                <input name="username" placeholder="Usuário" value={registerForm.username} onChange={handleRegisterChange} required style={{ width: '100%', marginBottom: 8 }} />
                <input name="email" placeholder="Email" value={registerForm.email} onChange={handleRegisterChange} required style={{ width: '100%', marginBottom: 8 }} />
                <input name="password" type="password" placeholder="Senha" value={registerForm.password} onChange={handleRegisterChange} required style={{ width: '100%', marginBottom: 8 }} />
                <input name="cpf" placeholder="CPF" value={registerForm.cpf} onChange={handleRegisterChange} required style={{ width: '100%', marginBottom: 8 }} />
                <input name="phone" placeholder="Telefone" value={registerForm.phone} onChange={handleRegisterChange} required style={{ width: '100%', marginBottom: 8 }} />
                <button type="submit" style={{ width: '100%', padding: 8 }}>Registrar</button>
                <button type="button" style={{ width: '100%', marginTop: 8 }} onClick={() => setRegisterForm({
                  username: 'usuarioTeste' + Math.floor(Math.random() * 10000),
                  email: 'teste' + Math.floor(Math.random() * 10000) + '@exemplo.com',
                  password: 'Senha123!',
                  cpf: gerarCPF(),
                  phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
                })}>
                  Preencher com dados fictícios
                </button>
              </form>
              {registerError && <div style={{ color: 'red', marginTop: 8 }}>{registerError}</div>}
              {registerSuccess && <div style={{ color: 'green', marginTop: 8 }}>{registerSuccess}</div>}
              <button onClick={() => setShowRegister(false)} style={{ marginTop: 12, width: '100%' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
