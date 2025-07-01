import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', cpf: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        <input name="username" placeholder="Usuário" value={form.username} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <input name="phone" placeholder="Telefone (opcional)" value={form.phone} onChange={handleChange} style={{ width: '100%', marginBottom: 8 }} />
        <button type="submit" style={{ width: '100%', padding: 8 }}>Registrar</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </div>
  );
}

export default Register;
