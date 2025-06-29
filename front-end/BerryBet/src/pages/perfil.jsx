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
            })
            .catch((err) => {
                setUser(null);
            });
        fetch('http://localhost:8080/api/user_stats/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (res.status === 401) {
                    navigate('/');
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
                    onMouseOver={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #2575fc 60%, #6a11cb 100%)';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.boxShadow = '0 6px 24px #2575fc66';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fff 60%, #6a11cb 100%)';
                        e.currentTarget.style.color = '#2575fc';
                        e.currentTarget.style.boxShadow = '0 4px 16px #0003';
                    }}
                >
                    <span style={{ fontWeight: 900, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#8592;</span>
                </button>
                <h1 style={{ color: '#fff', fontSize: 40, fontWeight: 900, letterSpacing: 2, textShadow: '0 2px 12px #0008', margin: 0 }}>
                    Perfil do Usuário
                </h1>
            </header>
            <main style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #0002', padding: 32, marginTop: -32 }}>
                {user === null && (
                    <div style={{ color: 'red', textAlign: 'center', marginBottom: 24 }}>
                        Não foi possível carregar os dados do usuário. Faça login novamente.
                    </div>
                )}
                {user && (
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#6a11cb', marginBottom: 8 }}>
                            {user.username}
                        </div>
                        {/* Apenas exibe o avatar, sem opção de upload */}
                        <div style={{ marginBottom: 16 }}>
                            <img
                                src={user.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`}
                                alt="Avatar"
                                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #2575fc', marginBottom: 8 }}
                            />
                        </div>
                    </div>
                )}
                <div>
                    <h2 style={{ color: '#2575fc', fontWeight: 700, marginBottom: 16 }}>Suas Estatísticas</h2>
                    <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <StatCard label="Saldo" value={`R$ ${stats?.balance?.toFixed(2) ?? '0,00'}`} icon="💰" color="#6a11cb" />
                        <StatCard label="Apostas" value={stats?.total_bets ?? 0} icon="🎲" color="#2575fc" />
                        <StatCard label="Vitórias" value={stats?.total_wins ?? 0} icon="🏆" color="#43e97b" />
                        <StatCard label="Derrotas" value={stats?.total_losses ?? 0} icon="💔" color="#ff4b2b" />
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, icon, color, highlight }) {
    return (
        <div style={{
            background: highlight ? 'linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)' : '#f5f6fa',
            color: highlight ? '#fff' : color,
            borderRadius: 16,
            boxShadow: highlight ? '0 4px 24px #ff4b2b44' : '0 2px 8px #0001',
            padding: '24px 32px',
            minWidth: 120,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: highlight ? '3px solid #fff' : `2px solid ${color}`,
            position: 'relative',
        }}>
            <span style={{ fontSize: 36, marginBottom: 8 }}>{icon}</span>
            <span style={{ fontSize: 28, fontWeight: 900 }}>{value}</span>
            <span style={{ fontSize: 16, marginTop: 4 }}>{label}</span>
            {highlight && (
                <span style={{ position: 'absolute', top: 8, right: 12, fontSize: 18, fontWeight: 900, letterSpacing: 1, color: '#fff', textShadow: '0 2px 8px #ff4b2b88' }}>Berry Bet</span>
            )}
        </div>
    );
}

export default Perfil;
