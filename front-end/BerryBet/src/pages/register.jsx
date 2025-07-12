import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import minhaImagem from '../assets/imagemBackground.png';

function Register() {
  const [form, setForm] = useState({ 
    username: '', 
    name: '', 
    email: '', 
    password: '123456', 
    cpf: '', 
    phone: '', 
    date_birth: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '')
    if (cpf.length !== 11 || /^( {11}|(\d)\1{10})$/.test(cpf)) return false
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

  const handleChange = (e) => {
    if (e.target.name === 'password') {
      setForm({ ...form, password: '123456' });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validarCPF(form.cpf)) {
      setError('CPF inválido!');
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar.');
      setSuccess('Usuário registrado com sucesso!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

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
        <div style={{
          background: 'rgba(0, 0, 0, 0.85)',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          padding: '1.5rem 1.5rem',
          maxWidth: '400px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            color: '#51F893', 
            textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
            marginBottom: '5px',
            textAlign: 'center',
            fontSize: '24px'
          }}>Bem-vindo ao BerryBet!</h1>
          <h2 style={{ 
            color: '#fff',
            marginBottom: '15px',
            textAlign: 'center',
            fontSize: '18px'
          }}>Faça seu cadastro</h2>
          <form onSubmit={handleSubmit}>
            {/* Nome completo */}
            <div style={{ marginBottom: '0.8rem', width: '100%' }}>
              <label htmlFor="name" style={{ color: '#fff', display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Nome completo:</label>
              <input 
                name="name" 
                id="name"
                placeholder="Digite seu nome completo" 
                value={form.name} 
                onChange={handleChange} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem'
                }} 
              />
            </div>
            
            {/* Username */}
            <div style={{ marginBottom: '0.8rem', width: '100%' }}>
              <label htmlFor="username" style={{ color: '#fff', display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Usuário:</label>
              <input 
                name="username" 
                id="username"
                placeholder="Digite seu usuário" 
                value={form.username} 
                onChange={handleChange} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem'
                }} 
              />
            </div>
            
            {/* Email */}
            <div style={{ marginBottom: '0.8rem', width: '100%' }}>
              <label htmlFor="email" style={{ color: '#fff', display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Email:</label>
              <input 
                name="email" 
                id="email"
                type="email"
                placeholder="Digite seu email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem'
                }} 
              />
            </div>
            
            {/* Senha */}
            <div style={{ marginBottom: '0.8rem', width: '100%' }}>
              <label htmlFor="password" style={{ color: '#fff', display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Senha:</label>
              <input 
                name="password" 
                id="password"
                type="password" 
                placeholder="Senha" 
                value={form.password} 
                readOnly 
                required 
                style={{ 
                  width: '100%', 
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem',
                  background: '#f5f5f5',
                  color: '#888'
                }} 
              />
            </div>
            
            {/* CPF e Telefone em linha */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="cpf" style={{ color: '#fff', display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>CPF:</label>
                <input 
                  name="cpf" 
                  id="cpf"
                  placeholder="CPF" 
                  value={form.cpf} 
                  onChange={handleChange} 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '0.9rem'
                  }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="phone" style={{ color: '#fff', display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Telefone:</label>
                <input 
                  name="phone" 
                  id="phone"
                  placeholder="Telefone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  style={{ 
                    width: '100%', 
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '0.9rem'
                  }} 
                />
              </div>
            </div>
            
            {/* Data de nascimento */}
            <div style={{ marginBottom: '0.8rem', width: '100%' }}>
              <label htmlFor="date_birth" style={{ color: '#fff', display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Data de nascimento:</label>
              <input 
                name="date_birth" 
                id="date_birth"
                type="date" 
                value={form.date_birth} 
                onChange={handleChange} 
                style={{ 
                  width: '100%', 
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem'
                }} 
              />
            </div>
            {/* Botões em linha */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <button 
                type="submit" 
                style={{ 
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#51F893',
                  color: '#000',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#45E080';
                  e.target.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#51F893';
                  e.target.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
                }}
              >
                Registrar
              </button>
              <button 
                type="button"
                onClick={() => setForm({
                  name: 'Usuário de Teste',
                  username: 'usuarioTeste' + Math.floor(Math.random() * 10000),
                  email: 'teste' + Math.floor(Math.random() * 10000) + '@exemplo.com',
                  password: '123456',
                  cpf: gerarCPF(),
                  phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
                  date_birth: '1990-01-01'
                })}
                style={{ 
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#FF6B35',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 10px rgba(255, 107, 53, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FF5722';
                  e.target.style.boxShadow = '0 0 15px rgba(255, 107, 53, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FF6B35';
                  e.target.style.boxShadow = '0 0 10px rgba(255, 107, 53, 0.3)';
                }}
              >
                Dados Teste
              </button>
            </div>
            {error && <div style={{ color: '#ff4444', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#51F893', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', textShadow: '0 0 8px rgba(81, 248, 147, 0.6)' }}>{success}</div>}
            <p style={{ textAlign: 'center', margin: 0, color: '#fff', fontSize: '0.9rem' }}>
              Já tem uma conta? {' '}
              <button 
                type="button" 
                onClick={() => navigate('/')}
                style={{
                  color: '#51F893',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  textShadow: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  margin: 0,
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  fontFamily: 'inherit',
                  width: 'auto',
                  borderRadius: 0,
                  transition: 'none',
                  transform: 'none'
                }}
              >
                Faça login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
