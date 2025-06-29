import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Conta() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ username: '', email: '', phone: '', cpf: '' });
    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showAvatarInput, setShowAvatarInput] = useState(false);
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
                body: JSON.stringify({ ...form, password: newPassword }),
            });
            if (res.status === 401) {
                navigate('/');
                return;
            }
            if (!res.ok) {
                const err = await res.json();
                setMessage(err.message || 'Erro ao atualizar dados');
            } else {
                // Só desloga se username, email ou senha mudaram
                if (
                    form.username !== user.username ||
                    form.email !== user.email ||
                    (newPassword && newPassword.length > 0)
                ) {
                    setMessage('Dados atualizados com sucesso! Faça login novamente.');
                    setEditing(false);
                    setShowPassword(false);
                    setPassword('');
                    setNewPassword('');
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        navigate('/');
                    }, 1500);
                } else {
                    setMessage('Dados atualizados com sucesso!');
                    setEditing(false);
                    setShowPassword(false);
                    setPassword('');
                    setNewPassword('');
                    // Atualiza user local
                    setUser({ ...user, ...form });
                }
            }
        } catch {
            setMessage('Erro ao atualizar dados');
        }
        setLoading(false);
    };

    // Função para preview da imagem
    function onAvatarChange(e) {
        const file = e.target.files[0];
        setAvatarFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(null);
        }
    }

    // Função para upload da imagem
    async function handleAvatarUpload(e) {
        e.preventDefault();
        if (!avatarFile) return;
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const res = await fetch('http://localhost:8080/api/users/avatar', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        if (res.ok) {
            // Após upload, busca novamente o usuário para garantir atualização do avatar
            fetch('http://localhost:8080/api/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(async (res) => {
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data.data);
                    }
                });
            setAvatarPreview(null);
            setShowAvatarInput(false);
            alert('Foto atualizada!');
        } else {
            alert('Erro ao enviar foto');
        }
    }

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
            <main style={{ maxWidth: 420, margin: '0 auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #0002', padding: '40px 32px 32px 32px', marginTop: -32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Avatar com lápis para editar */}
                <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 24 }}>
                    <img
                        src={avatarPreview || (user.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`)}
                        alt="Avatar"
                        style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #2575fc', background: '#f5f6fa', display: 'block', boxShadow: '0 2px 12px #2575fc33' }}
                    />
                    {editing && (
                        <button
                            type="button"
                            onClick={() => setShowAvatarInput(true)}
                            style={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                background: '#2575fc',
                                border: 'none',
                                borderRadius: '50%',
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px #0002',
                                zIndex: 2,
                                transition: 'background 0.2s',
                            }}
                            title="Alterar foto de perfil"
                        >
                            <span role="img" aria-label="Editar" style={{ color: '#fff', fontSize: 20 }}>✏️</span>
                        </button>
                    )}
                    {editing && showAvatarInput && (
                        <form onSubmit={handleAvatarUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', zIndex: 10, gap: 8, boxShadow: '0 2px 12px #2575fc33' }}>
                            <input type="file" accept="image/*" onChange={onAvatarChange} style={{ marginBottom: 8, width: '90%' }} />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer', fontWeight: 700 }}>Salvar Foto</button>
                                <button type="button" onClick={() => { setShowAvatarInput(false); setAvatarPreview(null); }} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer', fontWeight: 700 }}>Cancelar</button>
                            </div>
                        </form>
                    )}
                </div>
                <form onSubmit={e => { e.preventDefault(); setShowPassword(true); }} style={{ width: '100%' }}>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#222' }}>Nome de usuário</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            disabled={!editing}
                            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #bdbdbd', marginTop: 4, marginBottom: 16, fontSize: 16, background: editing ? '#f8faff' : '#f5f6fa', transition: 'background 0.2s' }}
                        />
                        <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#222' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={!editing}
                            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #bdbdbd', marginTop: 4, marginBottom: 16, fontSize: 16, background: editing ? '#f8faff' : '#f5f6fa', transition: 'background 0.2s' }}
                        />
                        <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#222' }}>Telefone</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={!editing}
                            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #bdbdbd', marginTop: 4, marginBottom: 16, fontSize: 16, background: editing ? '#f8faff' : '#f5f6fa', transition: 'background 0.2s' }}
                        />
                        <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#222' }}>CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            value={form.cpf}
                            onChange={handleChange}
                            disabled
                            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #bdbdbd', marginTop: 4, marginBottom: 16, fontSize: 16, background: '#f5f6fa', color: '#888', cursor: 'not-allowed' }}
                        />
                        {editing && (
                            <>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#222' }}>Nova senha</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Deixe em branco para não alterar"
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #bdbdbd', marginTop: 4, marginBottom: 16, fontSize: 16, background: '#f8faff' }}
                                />
                            </>
                        )}
                    </div>
                    {message && <div style={{ color: message.includes('sucesso') ? 'green' : 'red', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>{message}</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                        {!editing ? (
                            <button type="button" onClick={() => setEditing(true)} style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #2575fc22', letterSpacing: 1 }}>Editar</button>
                        ) : (
                            <>
                                <button type="button" disabled={loading} onClick={() => setShowPassword(true)} style={{ background: '#43e97b', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 0, boxShadow: '0 2px 8px #43e97b22', letterSpacing: 1 }}>Salvar alterações</button>
                                <button type="button" onClick={() => { setEditing(false); setForm({ username: user.username, email: user.email, phone: user.phone, cpf: user.cpf }); setMessage(''); setNewPassword(''); }} style={{ background: '#ff4b2b', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #ff4b2b22', letterSpacing: 1 }}>Cancelar</button>
                            </>
                        )}
                    </div>
                </form>
                {showPassword && (
                    <div style={{ marginTop: 24, background: '#f5f6fa', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #0001', width: '100%' }}>
                        <div style={{ marginBottom: 12, fontWeight: 700, color: '#222' }}>Confirme sua senha para salvar as alterações:</div>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #bdbdbd', marginBottom: 12, fontSize: 16, background: '#fff' }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button onClick={handleSave} disabled={loading || !password} style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #2575fc22' }}>Confirmar</button>
                            <button onClick={() => { setShowPassword(false); setPassword(''); }} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #aaa2' }}>Cancelar</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Conta;
