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
            background: '#0a0a0a',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            padding: 0
        }}>
            <header
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1rem 2rem',
                    background: '#111',
                    borderBottom: '1px solid #333',
                    height: 64,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
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
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 0 20px', display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', minHeight: 600 }}>
                {/* Perfil Card */}
                <section style={{ 
                    background: '#111', 
                    borderRadius: 20, 
                    boxShadow: '0 0 20px rgba(81, 248, 147, 0.3)', 
                    padding: 38, 
                    minWidth: 340, 
                    maxWidth: 370, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    border: '2px solid #51F893' 
                }}>
                    <div style={{ 
                        width: 170, 
                        height: 170, 
                        borderRadius: '50%', 
                        border: '4px solid #51F893', 
                        overflow: 'hidden', 
                        marginBottom: 18, 
                        background: '#333', 
                        boxShadow: '0 0 15px rgba(81, 248, 147, 0.3)', 
                        position: 'relative', 
                        transition: 'box-shadow 0.3s' 
                    }}>
                        <img
                            src={user?.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '')}`}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#51F893', marginBottom: 6, textAlign: 'center', textShadow: '0 0 10px rgba(81, 248, 147, 0.7)' }}>{user?.name || user?.username}</div>
                    <div style={{ color: '#ccc', fontSize: 16, marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>@{user?.username}</div>
                    <div style={{ color: '#ccc', fontSize: 14, marginBottom: 8, textAlign: 'center', fontWeight: 400 }}>{user?.email}</div>
                    <button
                        onClick={() => navigate('/conta')}
                        style={{
                            marginTop: 18,
                            background: 'linear-gradient(90deg, #51F893 0%, #222 100%)',
                            color: '#111',
                            fontWeight: 700,
                            fontSize: 16,
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 28px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px #51F89355',
                            transition: 'all 0.2s',
                            letterSpacing: 1,
                            textShadow: '0 2px 8px #51F89333',
                            outline: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                        onMouseEnter={e => {
                            e.target.style.background = 'linear-gradient(90deg, #40E882 0%, #222 100%)';
                            e.target.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                            e.target.style.background = 'linear-gradient(90deg, #51F893 0%, #222 100%)';
                            e.target.style.color = '#111';
                        }}
                    >
                        <span style={{ fontSize: 18 }}>⚙️</span> Gerenciar Conta
                    </button>
                </section>
                {/* Conteúdo principal */}
                <section style={{ flex: 1, minWidth: 340, maxWidth: 650, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: '#111', borderRadius: 20, boxShadow: '0 4px 32px rgba(81, 248, 147, 0.3)', padding: '38px 34px', border: '2px solid #51F893', marginBottom: 0 }}>
                        <div style={{ color: '#ccc', fontSize: 18, marginBottom: 8 }}>Olá!</div>
                        <div style={{ fontWeight: 900, fontSize: 32, color: '#fff', marginBottom: 12, lineHeight: 1.2, letterSpacing: 1, textShadow: '0 2px 8px rgba(81, 248, 147, 0.3)' }}>
                            {user?.name ? `${user.name}, apostador BerryBet!` : 'Perfil do Usuário'}
                        </div>
                        <div style={{ color: '#ccc', fontSize: 18, marginBottom: 18 }}>
                            {user?.bio || 'Bem-vindo ao BerryBet! Onde transformamos seu dinheiro em experiências inesquecíveis... principalmente a experiência de perdê-lo!'}
                        </div>
                    </div>
                    <div style={{ background: '#111', borderRadius: 20, boxShadow: '0 4px 32px rgba(81, 248, 147, 0.3)', padding: '34px 34px', border: '2px solid #51F893' }}>
                        <h2 style={{ color: '#51F893', fontWeight: 800, marginBottom: 18, textAlign: 'left', fontSize: 22, letterSpacing: 1, textShadow: '0 2px 8px rgba(81, 248, 147, 0.3)' }}>Suas Estatísticas</h2>
                        <div style={{ display: 'flex', gap: 32, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                            <StatCard label="Saldo" value={`R$ ${stats?.balance?.toFixed(2) ?? '0,00'}`} icon="💰" color="#51F893" highlight />
                            <StatCard label="Apostas" value={stats?.total_bets ?? 0} icon="🎲" color="#51F893" />
                            <StatCard label="Vitórias" value={stats?.total_wins ?? 0} icon="🏆" color="#51F893" />
                            <StatCard label="Derrotas" value={stats?.total_losses ?? 0} icon="💔" color="#999" />
                        </div>
                    </div>
                </section>
            </main>
            {/* Botão de voltar compacto no canto superior esquerdo */}
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    position: 'fixed',
                    top: -5,
                    left: 20,
                    zIndex: 1000,
                    background: '#51F893',
                    color: '#000',
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
                    boxShadow: '0 2px 8px rgba(81, 248, 147, 0.5)',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    maxWidth: 120,
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#40E882';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = '#51F893';
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
            background: highlight ? '#333' : '#222',
            color: highlight ? '#51F893' : color,
            borderRadius: 18,
            boxShadow: highlight ? '0 4px 24px rgba(81, 248, 147, 0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
            padding: '24px 32px',
            minWidth: 120,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: highlight ? '2.5px solid #51F893' : `2px solid ${color}`,
            position: 'relative',
            transition: 'box-shadow 0.2s, border 0.2s',
        }}>
            <span style={{ fontSize: 36, marginBottom: 8 }}>{icon}</span>
            <span style={{ fontSize: 28, fontWeight: 900, textShadow: highlight ? '0 2px 8px rgba(81, 248, 147, 0.3)' : 'none' }}>{value}</span>
            <span style={{ fontSize: 16, marginTop: 4 }}>{label}</span>
        </div>
    );
}

export default Perfil;
