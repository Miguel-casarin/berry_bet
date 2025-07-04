import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    try {
      const res = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar.');
      setSuccess('Usuário registrado com sucesso!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Registrar</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="username" 
          placeholder="Nome de usuário" 
          value={form.username} 
          onChange={handleChange} 
          required 
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} 
        />
        <input 
          name="name" 
          placeholder="Nome completo" 
          value={form.name} 
          onChange={handleChange} 
          required 
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} 
        />
        <input 
          name="email" 
          type="email"
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
          required 
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Senha" 
          value={form.password} 
          readOnly 
          required 
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5', color: '#888' }} 
        />
        <input 
          name="cpf" 
          placeholder="CPF" 
          value={form.cpf} 
          onChange={handleChange} 
          required 
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} 
        />
        <input 
          name="phone" 
          placeholder="Telefone (opcional)" 
          value={form.phone} 
          onChange={handleChange} 
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} 
        />
        <input 
          name="date_birth" 
          type="date" 
          placeholder="Data de nascimento (opcional)" 
          value={form.date_birth} 
          onChange={handleChange} 
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} 
        />
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: 12, 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          Registrar
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </div>
  );
}

export default Register;
