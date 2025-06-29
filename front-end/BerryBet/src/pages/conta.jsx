import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Conta() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ username: '', email: '', phone: '', cpf: '' });
    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        fetch('http://localhost:8080/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (res.status === 401) {
                    navigate('/');
                    return;
                }
                if (!res.ok) throw new Error('Erro ao buscar usuário');
                const data = await res.json();
                setUser(data.data);
                setForm({
                    username: data.data.username || '',
                    email: data.data.email || '',
                    phone: data.data.phone || '',
                    cpf: data.data.cpf || '',
                });
            })
            .catch(() => setUser(null));
    }, [navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:8080/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...form, password }),
            });
            if (res.status === 401) {
                navigate('/');
                return;
            }
            if (!res.ok) {
                const err = await res.json();
                setMessage(err.message || 'Erro ao atualizar dados');
            } else {
                setMessage('Dados atualizados com sucesso! Faça login novamente.');
                setEditing(false);
                setShowPassword(false);
                setPassword('');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    navigate('/');
                }, 1500);
            }
        } catch {
            setMessage('Erro ao atualizar dados');
        }
        setLoading(false);
    };

    if (user === null) {
        return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Não foi possível carregar os dados do usuário.</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', padding: 0 }}>
            <header style={{ padding: 24, textAlign: 'center', position: 'relative', minHeight: 60 }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        position: 'absolute',
                        left: 24,
                        top: 24,
                        width: 56,
                        height: 56,
                        background: 'linear-gradient(135deg, #fff 60%, #6a11cb 100%)',
                        border: '4px solid #2575fc',
                        borderRadius: '50%',
                        boxShadow: '0 4px 16px #0003',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        color: '#2575fc',
                        cursor: 'pointer',
                        zIndex: 2,
                        padding: 0,
                        lineHeight: 1,
                        transition: 'box-shadow 0.2s, background 0.2s, color 0.2s',
                    }}
                    title="Voltar para o dashboard"
                >
                    <span style={{ fontWeight: 900, fontSize: 36 }}>&#8592;</span>
                </button>
                <h1 style={{ color: '#fff', fontSize: 40, fontWeight: 900, letterSpacing: 2, textShadow: '0 2px 12px #0008', margin: 0 }}>
                    Conta
                </h1>
            </header>
            <main style={{ maxWidth: 500, margin: '0 auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #0002', padding: 32, marginTop: -32 }}>
                <form onSubmit={e => { e.preventDefault(); setShowPassword(true); }}>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontWeight: 700 }}>Nome de usuário</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            disabled={!editing}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 4, marginBottom: 12 }}
                        />
                        <label style={{ fontWeight: 700 }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={!editing}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 4, marginBottom: 12 }}
                        />
                        <label style={{ fontWeight: 700 }}>Telefone</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={!editing}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 4, marginBottom: 12 }}
                        />
                        <label style={{ fontWeight: 700 }}>CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            value={form.cpf}
                            onChange={handleChange}
                            disabled={!editing}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 4, marginBottom: 12 }}
                        />
                    </div>
                    {message && <div style={{ color: message.includes('sucesso') ? 'green' : 'red', marginBottom: 16 }}>{message}</div>}
                    {!editing ? (
                        <button type="button" onClick={() => setEditing(true)} style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>
                            Editar
                        </button>
                    ) : (
                        <>
                            <button type="submit" disabled={loading} style={{ background: '#43e97b', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginRight: 12 }}>
                                Salvar alterações
                            </button>
                            <button type="button" onClick={() => { setEditing(false); setForm({ username: user.username, email: user.email, phone: user.phone, cpf: user.cpf }); setMessage(''); }} style={{ background: '#ff4b2b', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>
                                Cancelar
                            </button>
                        </>
                    )}
                </form>
                {showPassword && (
                    <div style={{ marginTop: 24, background: '#f5f6fa', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #0001' }}>
                        <div style={{ marginBottom: 12, fontWeight: 700 }}>Confirme sua senha para salvar as alterações:</div>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 12 }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={handleSave} disabled={loading || !password} style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Confirmar</button>
                            <button onClick={() => { setShowPassword(false); setPassword(''); }} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Conta;
