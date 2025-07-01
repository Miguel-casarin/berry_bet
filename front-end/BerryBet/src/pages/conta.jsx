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
    const [showAvatarPopup, setShowAvatarPopup] = useState(false);
    const [pendingSave, setPendingSave] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPasswordField, setNewPasswordField] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordChangeMsg, setPasswordChangeMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
            window.location.reload();
            return;
        }
        fetch('http://localhost:8080/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/', { replace: true });
                    window.location.reload();
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
            .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
                navigate('/', { replace: true });
                window.location.reload();
            });
    }, [navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSaveClick = () => {
        // Só pede senha se algum campo editável mudou
        if (
            form.username !== user.username ||
            form.email !== user.email ||
            form.phone !== user.phone ||
            (newPassword && newPassword.length > 0)
        ) {
            setPendingSave(true);
            setShowPassword(true);
        } else {
            setEditing(false);
        }
    };

    const handlePasswordConfirm = async () => {
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
                setMessage('Dados atualizados com sucesso!');
                setEditing(false);
                setShowPassword(false);
                setPassword('');
                setNewPassword('');
                // Atualiza user local
                setUser({ ...user, ...form });
            }
        } catch {
            setMessage('Erro ao atualizar dados');
        }
        setLoading(false);
        setPendingSave(false);
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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordChangeMsg('');
        if (!currentPassword || !newPasswordField || !confirmNewPassword) {
            setPasswordChangeMsg('Preencha todos os campos.');
            return;
        }
        if (newPasswordField !== confirmNewPassword) {
            setPasswordChangeMsg('As novas senhas não coincidem.');
            return;
        }
        if (newPasswordField.length < 6) {
            setPasswordChangeMsg('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (currentPassword === newPasswordField) {
            setPasswordChangeMsg('A nova senha deve ser diferente da atual.');
            return;
        }
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:8080/api/users/change_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPasswordField }),
            });
            if (!res.ok) {
                const err = await res.json();
                setPasswordChangeMsg(err.message || 'Erro ao trocar senha');
            } else {
                setPasswordChangeMsg('Senha alterada com sucesso!');
                setShowPasswordChange(false);
                setCurrentPassword('');
                setNewPasswordField('');
                setConfirmNewPassword('');
            }
        } catch {
            setPasswordChangeMsg('Erro ao trocar senha');
        }
        setLoading(false);
    };

    if (user === null) {
        return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Não foi possível carregar os dados do usuário.</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #101820 0%, #0a2e12 60%, #fff700 180%)',
            backgroundAttachment: 'fixed',
            padding: 0
        }}>
            <header
                style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    flex: 1,
                    letterSpacing: 2,
                    color: '#fff',
                    userSelect: 'none',
                    lineHeight: '56px',
                    marginLeft: 0,
                    marginRight: 0,
                    textShadow: '0 2px 8px #fff70088, 0 0px 2px #43e97b55',
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    filter: 'drop-shadow(0 0 8px #43e97b55)',
                    background: 'linear-gradient(90deg, #181c2b 0%, #232946 100%)',
                    borderBottom: '2.5px solid #fff700',
                    boxShadow: '0 4px 24px 0 #00ff8577, 0 1.5px 0 #fff700',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    minHeight: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    zIndex: 10,
                    position: 'relative',
                    padding: 0,
                }}
            >
                <span
                    style={{
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: 32,
                        color: '#fff',
                        letterSpacing: 1,
                        textShadow: '0 2px 8px #43e97b88',
                        userSelect: 'none',
                    }}
                    onClick={() => navigate('/dashboard')}
                >
                    Berry.Bet
                </span>
            </header>
            <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0 0 0', display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', minHeight: 600 }}>
                {/* Avatar e info */}
                <section style={{ background: 'rgba(16,24,32,0.98)', borderRadius: 20, boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055', padding: 38, minWidth: 320, maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #43e97b', position: 'relative', backdropFilter: 'blur(6px)' }}>
                    <div
                        style={{ width: 110, height: 110, borderRadius: '50%', border: '4px solid #fff700', overflow: 'hidden', marginBottom: 18, background: '#23272b', position: 'relative', cursor: editing ? 'pointer' : 'default', transition: 'box-shadow 0.2s' }}
                        onClick={() => editing && setShowAvatarPopup(true)}
                        title={editing ? 'Clique para trocar a foto' : ''}
                    >
                        <img
                            src={avatarPreview || (user.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`)}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: editing ? 'brightness(0.95)' : 'none', borderRadius: '50%' }}
                        />
                        {editing && (
                            <span style={{ position: 'absolute', bottom: 8, right: 8, background: '#43e97b', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, boxShadow: '0 2px 8px #43e97b33', zIndex: 2 }}>
                                ✏️
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4, textAlign: 'center', textShadow: '0 2px 8px #43e97b33' }}>{user.username}</div>
                    <div style={{ color: '#b0b8c1', fontSize: 15, marginBottom: 8, textAlign: 'center' }}>{user.email}</div>
                    <div style={{ color: '#43e97b', fontSize: 14, marginBottom: 0, textAlign: 'center', fontWeight: 700 }}>CPF: {user.cpf || '-'}</div>
                </section>
                {/* Formulário principal */}
                <section style={{ flex: 1, minWidth: 340, maxWidth: 600, background: 'rgba(16,24,32,0.98)', borderRadius: 20, boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055', border: '2px solid #43e97b', padding: '36px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', color: '#fff', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                    <form onSubmit={e => e.preventDefault()} style={{ width: '100%', marginTop: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>Nome de usuário</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #43e97b', marginTop: 4, fontSize: 16, background: editing ? '#23272b' : '#181c1f', color: '#fff', transition: 'background 0.2s, border 0.2s' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #43e97b', marginTop: 4, fontSize: 16, background: editing ? '#23272b' : '#181c1f', color: '#fff', transition: 'background 0.2s, border 0.2s' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>Telefone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #43e97b', marginTop: 4, fontSize: 16, background: editing ? '#23272b' : '#181c1f', color: '#fff', transition: 'background 0.2s, border 0.2s' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>CPF</label>
                                <input
                                    type="text"
                                    name="cpf"
                                    value={form.cpf}
                                    onChange={handleChange}
                                    disabled
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #43e97b', marginTop: 4, fontSize: 16, background: '#181c1f', color: '#888', cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>
                        {message && <div style={{ color: message.includes('sucesso') ? '#43e97b' : '#ff4b2b', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>{message}</div>}
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                            <button
                                type="button"
                                onClick={editing ? handleSaveClick : () => setEditing(true)}
                                style={{ background: editing ? '#43e97b' : '#2575fc', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 48px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: editing ? '0 2px 8px #43e97b22' : '0 2px 8px #2575fc22', letterSpacing: 1, transition: 'background 0.2s' }}
                            >
                                {editing ? 'Salvar' : 'Editar'}
                            </button>
                        </div>
                    </form>
                    {showPassword && pendingSave && (
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
                                <button onClick={handlePasswordConfirm} disabled={loading || !password} style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #2575fc22' }}>Confirmar</button>
                                <button onClick={() => { setShowPassword(false); setPassword(''); setPendingSave(false); }} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #aaa2' }}>Cancelar</button>
                            </div>
                        </div>
                    )}
                    {/* Botão para abrir modal de troca de senha */}
                    {editing && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                            <button
                                type="button"
                                onClick={() => setShowPasswordChange(true)}
                                style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #2575fc22', letterSpacing: 1 }}
                            >
                                Alterar senha
                            </button>
                        </div>
                    )}
                    {/* Modal de troca de senha */}
                    {showPasswordChange && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60, paddingLeft: 0, paddingRight: 0 }}>
                            <form onSubmit={handlePasswordChange} style={{ background: 'linear-gradient(120deg, #23272b 60%, #181c1f 100%)', borderRadius: 18, boxShadow: '0 8px 32px #43e97b33', padding: 24, minWidth: 320, maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative', border: '2px solid #43e97b', color: '#fff' }}>
                                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#fff', textAlign: 'center' }}>Alterar senha</div>
                                <input
                                    type="password"
                                    placeholder="Senha atual"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #43e97b', fontSize: 15, background: '#23272b', color: '#fff', marginBottom: 4 }}
                                    autoFocus
                                />
                                <input
                                    type="password"
                                    placeholder="Nova senha"
                                    value={newPasswordField}
                                    onChange={e => setNewPasswordField(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #43e97b', fontSize: 15, background: '#23272b', color: '#fff', marginBottom: 4 }}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirmar nova senha"
                                    value={confirmNewPassword}
                                    onChange={e => setConfirmNewPassword(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #43e97b', fontSize: 15, background: '#23272b', color: '#fff', marginBottom: 4 }}
                                />
                                {passwordChangeMsg && <div style={{ color: passwordChangeMsg.includes('sucesso') ? '#43e97b' : '#ff4b2b', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{passwordChangeMsg}</div>}
                                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                    <button type="submit" disabled={loading} style={{ background: '#43e97b', color: '#181c1f', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #43e97b22', transition: 'background 0.2s' }}>Salvar</button>
                                    <button type="button" onClick={() => { setShowPasswordChange(false); setCurrentPassword(''); setNewPasswordField(''); setConfirmNewPassword(''); setPasswordChangeMsg(''); }} style={{ background: '#23272b', color: '#fff', border: '1.5px solid #aaa', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #aaa2', transition: 'background 0.2s, border 0.2s' }}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    )}
                </section>
            </main>
            {/* Modal de troca de avatar fora do fluxo principal para garantir sobreposição */}
            {showAvatarPopup && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(16,24,32,0.92)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        background: 'rgba(16,24,32,0.98)',
                        borderRadius: 20,
                        boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055',
                        padding: 38,
                        minWidth: 340,
                        maxWidth: 370,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        border: '2px solid #43e97b',
                        zIndex: 10000,
                        position: 'relative',
                        color: '#fff',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, color: '#fff', textAlign: 'center', letterSpacing: 1 }}>Trocar foto de perfil</div>
                        <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '3px solid #fff700', marginBottom: 16, background: '#23272b', boxShadow: '0 0 16px #fff70033, 0 0 0 6px #43e97b33' }}>
                            <img
                                src={avatarPreview || (user.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`)}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        </div>
                        <input type="file" accept="image/*" onChange={onAvatarChange} style={{ marginBottom: 16, color: '#fff', background: 'none', border: '1.5px solid #43e97b', borderRadius: 8, padding: 8, width: '100%' }} />
                        <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center' }}>
                            <button onClick={async (e) => { e.preventDefault(); await handleAvatarUpload(e); setShowAvatarPopup(false); }} style={{ background: 'linear-gradient(90deg, #43e97b 0%, #fff700 100%)', color: '#101820', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #43e97b22', letterSpacing: 1 }}>Confirmar</button>
                            <button onClick={() => { setShowAvatarPopup(false); setAvatarPreview(null); }} style={{ background: '#23272b', color: '#fff', border: '1.5px solid #aaa', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #aaa2' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Botão de voltar compacto no canto superior esquerdo */}
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    position: 'fixed',
                    top: 20,
                    left: 20,
                    zIndex: 1000,
                    background: 'linear-gradient(90deg, #fff700 0%, #43e97b 100%)',
                    color: '#101820',
                    fontWeight: 700,
                    fontSize: 15,
                    border: 'none',
                    borderRadius: 7,
                    padding: '6px 16px 6px 12px',
                    minWidth: 0,
                    minHeight: 0,
                    height: 36,
                    lineHeight: '20px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #43e97b55',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    maxWidth: 120,
                }}
            >
                <span style={{ fontSize: 18, fontWeight: 900, marginRight: 2 }}>←</span> Voltar
            </button>
        </div>
    );
}

export default Conta;
