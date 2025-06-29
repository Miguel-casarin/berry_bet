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
        <div style={{ minHeight: '100vh', background: '#f4f7f6', padding: 0 }}>
            <header style={{ padding: 24, textAlign: 'center', position: 'relative', minHeight: 60, background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ fontWeight: 900, fontSize: 28, color: '#222', letterSpacing: 1, position: 'absolute', left: 32, top: 28, cursor: 'pointer', background: '#fff', borderRadius: '50%', border: '1px solid #e0e0e0', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001' }} onClick={() => navigate('/dashboard')} title="Voltar">
                    &#8592;
                </span>
                <span style={{ fontWeight: 900, fontSize: 28, color: '#222', letterSpacing: 1 }}>BerryBet</span>
            </header>
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 0 0 0', display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', minHeight: 600 }}>
                {/* Perfil Card */}
                <section style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #0001', padding: 36, minWidth: 340, maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e0e0e0' }}>
                    <div style={{ width: 170, height: 170, borderRadius: '50%', border: '4px solid #e0e0e0', overflow: 'hidden', marginBottom: 18, background: '#f5f6fa' }}>
                        <img
                            src={user?.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '')}`}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#222', marginBottom: 6, textAlign: 'center' }}>{user?.username}</div>
                    <div style={{ color: '#888', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>{user?.email}</div>
                    <div style={{ color: '#aaa', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>Membro desde: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</div>
                    <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 8 }}>
                        <a href="#" style={{ color: '#222', fontSize: 22, background: '#f4f7f6', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', transition: 'background 0.2s' }} title="Facebook"><i className="fa fa-facebook" /></a>
                        <a href="#" style={{ color: '#222', fontSize: 22, background: '#f4f7f6', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', transition: 'background 0.2s' }} title="LinkedIn"><i className="fa fa-linkedin" /></a>
                        <a href="#" style={{ color: '#222', fontSize: 22, background: '#f4f7f6', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', transition: 'background 0.2s' }} title="Instagram"><i className="fa fa-instagram" /></a>
                    </div>
                </section>
                {/* Conteúdo principal */}
                <section style={{ flex: 1, minWidth: 340, maxWidth: 650, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #0001', padding: '36px 32px', border: '1px solid #e0e0e0', marginBottom: 0 }}>
                        <div style={{ color: '#888', fontSize: 18, marginBottom: 8 }}>Olá!</div>
                        <div style={{ fontWeight: 900, fontSize: 32, color: '#222', marginBottom: 12, lineHeight: 1.2, letterSpacing: 1 }}>
                            {user?.username ? `Eu sou ${user.username}, apostador BerryBet!` : 'Perfil do Usuário'}
                        </div>
                        <div style={{ color: '#666', fontSize: 18, marginBottom: 18 }}>
                            {user?.bio || 'Bem-vindo ao seu perfil. Aqui você pode acompanhar suas estatísticas e conquistas!'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                            <span style={{ color: '#43e97b', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontSize: 18, marginRight: 6 }}>●</span> Ativo
                            </span>
                            <span style={{ color: '#2575fc', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontSize: 18, marginRight: 6 }}>★</span> Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                            </span>
                        </div>
                        <button style={{ background: 'linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #2575fc22', marginTop: 8 }}>
                            Baixar Extrato
                        </button>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #0001', padding: '32px 32px', border: '1px solid #e0e0e0' }}>
                        <h2 style={{ color: '#2575fc', fontWeight: 800, marginBottom: 18, textAlign: 'left', fontSize: 22, letterSpacing: 1 }}>Suas Estatísticas</h2>
                        <div style={{ display: 'flex', gap: 32, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                            <StatCard label="Saldo" value={`R$ ${stats?.balance?.toFixed(2) ?? '0,00'}`} icon="💰" color="#6a11cb" />
                            <StatCard label="Apostas" value={stats?.total_bets ?? 0} icon="🎲" color="#2575fc" />
                            <StatCard label="Vitórias" value={stats?.total_wins ?? 0} icon="🏆" color="#43e97b" />
                            <StatCard label="Derrotas" value={stats?.total_losses ?? 0} icon="💔" color="#ff4b2b" />
                        </div>
                    </div>
                </section>
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
