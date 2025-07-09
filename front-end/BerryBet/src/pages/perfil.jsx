import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Perfil() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
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
            })
            .catch((err) => {
                localStorage.removeItem('token');
                setUser(null);
                navigate('/', { replace: true });
                window.location.reload();
            });
        fetch('http://localhost:8080/api/user_stats/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/', { replace: true });
                    window.location.reload();
                    return;
                }
                if (!res.ok) throw new Error('Erro ao buscar estatísticas');
                const data = await res.json();
                setStats(data.data);
            })
            .catch(() => { });
    }, [navigate]);

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
            const data = await res.json();
            setUser((u) => ({ ...u, avatarUrl: data.avatarUrl }));
            setAvatarPreview(null);
            alert('Foto atualizada!');
        } else {
            alert('Erro ao enviar foto');
        }
    }

    // Listener para atualizar avatar em tempo real
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            const { avatarUrl } = event.detail;
            console.log('Perfil: Avatar atualizado via evento:', avatarUrl); // Debug
            setUser(prevUser => ({
                ...prevUser,
                avatar_url: avatarUrl
            }));
        };

        window.addEventListener('avatarUpdated', handleAvatarUpdate);
        return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    }, []);

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
                        color: '#51F893',
                        letterSpacing: 1,
                        textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
                        userSelect: 'none',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate('/dashboard')}
                    onMouseEnter={(e) => {
                        e.target.style.textShadow = '0 0 15px rgba(81, 248, 147, 0.9)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.textShadow = '0 0 10px rgba(81, 248, 147, 0.7)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    Berry.Bet
                </span>
            </header>
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 0 0 0', display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', minHeight: 600 }}>
                {/* Perfil Card */}
                <section style={{ background: 'rgba(16,24,32,0.98)', borderRadius: 20, boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055', padding: 38, minWidth: 340, maxWidth: 370, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #43e97b', backdropFilter: 'blur(6px)' }}>
                    <div style={{ width: 170, height: 170, borderRadius: '50%', border: '4px solid #fff700', overflow: 'hidden', marginBottom: 18, background: '#23272b', boxShadow: '0 0 24px #fff70033, 0 0 0 6px #43e97b33', position: 'relative', transition: 'box-shadow 0.3s' }}>
                        <img
                            src={user?.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '')}`}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.95)', borderRadius: '50%' }}
                        />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6, textAlign: 'center', textShadow: '0 2px 8px #43e97b33' }}>{user?.name || user?.username}</div>
                    <div style={{ color: '#b0b8c1', fontSize: 16, marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>@{user?.username}</div>
                    <div style={{ color: '#b0b8c1', fontSize: 14, marginBottom: 8, textAlign: 'center', fontWeight: 400 }}>{user?.email}</div>
                    <div style={{ color: '#43e97b', fontSize: 15, marginBottom: 18, textAlign: 'center', fontWeight: 700 }}>Membro desde: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</div>
                </section>
                {/* Conteúdo principal */}
                <section style={{ flex: 1, minWidth: 340, maxWidth: 650, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: 'rgba(16,24,32,0.98)', borderRadius: 20, boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055', padding: '38px 34px', border: '2px solid #43e97b', marginBottom: 0, backdropFilter: 'blur(6px)' }}>
                        <div style={{ color: '#b0b8c1', fontSize: 18, marginBottom: 8 }}>Olá!</div>
                        <div style={{ fontWeight: 900, fontSize: 32, color: '#fff', marginBottom: 12, lineHeight: 1.2, letterSpacing: 1, textShadow: '0 2px 8px #43e97b33' }}>
                            {user?.username ? `Eu sou ${user.username}, apostador BerryBet!` : 'Perfil do Usuário'}
                        </div>
                        <div style={{ color: '#b0b8c1', fontSize: 18, marginBottom: 18 }}>
                            {user?.bio || 'Bem-vindo ao seu perfil. Aqui você pode acompanhar suas estatísticas e conquistas!'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                            <span style={{ color: '#43e97b', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', textShadow: '0 2px 8px #43e97b33' }}>
                                <span style={{ fontSize: 18, marginRight: 6 }}>●</span> Ativo
                            </span>
                            <span style={{ color: '#fff700', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', textShadow: '0 2px 8px #fff70033' }}>
                                <span style={{ fontSize: 18, marginRight: 6 }}>★</span> Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                            </span>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(16,24,32,0.98)', borderRadius: 20, boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055', padding: '34px 34px', border: '2px solid #43e97b', backdropFilter: 'blur(6px)' }}>
                        <h2 style={{ color: '#43e97b', fontWeight: 800, marginBottom: 18, textAlign: 'left', fontSize: 22, letterSpacing: 1, textShadow: '0 2px 8px #fff70033' }}>Suas Estatísticas</h2>
                        <div style={{ display: 'flex', gap: 32, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                            <StatCard label="Saldo" value={`R$ ${stats?.balance?.toFixed(2) ?? '0,00'}`} icon="💰" color="#43e97b" highlight />
                            <StatCard label="Apostas" value={stats?.total_bets ?? 0} icon="🎲" color="#2575fc" />
                            <StatCard label="Vitórias" value={stats?.total_wins ?? 0} icon="🏆" color="#fff700" />
                            <StatCard label="Derrotas" value={stats?.total_losses ?? 0} icon="💔" color="#ff4b2b" />
                        </div>
                    </div>
                </section>
            </main>
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

function StatCard({ label, value, icon, color, highlight }) {
    return (
        <div style={{
            background: highlight ? 'linear-gradient(90deg, #23272b 0%, #43e97b 100%)' : 'rgba(24,28,31,0.85)',
            color: highlight ? '#fff700' : color,
            borderRadius: 18,
            boxShadow: highlight ? '0 4px 24px #43e97b77, 0 0 0 2px #fff70055' : '0 2px 8px #0001',
            padding: '24px 32px',
            minWidth: 120,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: highlight ? '2.5px solid #fff700' : `2px solid ${color}`,
            position: 'relative',
            transition: 'box-shadow 0.2s, border 0.2s',
        }}>
            <span style={{ fontSize: 36, marginBottom: 8 }}>{icon}</span>
            <span style={{ fontSize: 28, fontWeight: 900, textShadow: highlight ? '0 2px 8px #43e97b88, 0 0px 2px #fff70055' : 'none' }}>{value}</span>
            <span style={{ fontSize: 16, marginTop: 4 }}>{label}</span>
        </div>
    );
}

export default Perfil;
