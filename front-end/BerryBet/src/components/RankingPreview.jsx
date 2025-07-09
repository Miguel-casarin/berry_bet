import React from 'react';
import { useNavigate } from 'react-router-dom';

function RankingPreview() {
    const [ranking, setRanking] = React.useState([]);
    const navigate = useNavigate();
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        fetch('http://localhost:8080/api/ranking', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) return { data: [] };
                return res.json();
            })
            .then(data => {
                const sorted = (data.data || []).sort((a, b) => (b.total_profit ?? 0) - (a.total_profit ?? 0));
                setRanking(sorted.slice(0, 5));
            })
            .catch(() => {
                setRanking([]);
            });
    }, []);
    return (
        <div className="lightbar-card" style={{
            width: '100%',
            maxWidth: 500,
            background: '#1a1a1a',
            borderRadius: 20,
            boxShadow: '0 0 20px rgba(81, 248, 147, 0.3)',
            padding: 18,
            border: '2px solid #51F893',
            height: '100%', // altura responsiva
            maxHeight: '450px', // altura máxima igual à Your Card
            minHeight: '300px', // altura mínima igual à Your Card
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // evita overflow
        }}>
            <h3 style={{
                textAlign: 'center',
                color: '#51F893',
                fontFamily: 'Arial, sans-serif',
                textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: 1,
                marginBottom: 18,
            }}>Top 5 Jogadores</h3>
            <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none', flex: 1 }}>
                    <thead>
                        <tr style={{ background: '#333', color: '#51F893', fontWeight: 900, fontSize: 15 }}>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #51F893', borderRadius: 8 }}>#</th>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #51F893', borderRadius: 8 }}>Avatar</th>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #51F893', borderRadius: 8 }}>Nome</th>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #51F893', borderRadius: 8 }}>Saldo</th>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #51F893', borderRadius: 8 }}>Lucro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.map((player, idx) => (
                            <tr key={player.id} style={{
                                background: idx === 0 ? 'rgba(81, 248, 147, 0.1)' : 'transparent',
                                borderRadius: idx === 0 ? 12 : 0,
                                boxShadow: idx === 0 ? '0 0 15px rgba(81, 248, 147, 0.3)' : 'none',
                                fontWeight: idx === 0 ? 900 : 700,
                                color: idx === 0 ? '#51F893' : '#fff',
                                fontSize: 15,
                                textAlign: 'center',
                                transition: 'background 0.2s',
                            }}>
                                <td style={{ padding: '8px 4px', fontWeight: 900 }}>{idx + 1}º</td>
                                <td style={{ padding: '8px 4px' }}>
                                    <img src={player.avatar_url ? (player.avatar_url.startsWith('http') ? player.avatar_url : `http://localhost:8080${player.avatar_url}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(player.username || 'Jogador')}`}
                                        alt="avatar"
                                        style={{ width: 28, height: 28, borderRadius: '50%', border: idx === 0 ? '2.5px solid #51F893' : '2px solid #333', background: '#fff', objectFit: 'cover', boxShadow: idx === 0 ? '0 0 12px rgba(81, 248, 147, 0.8)' : 'none' }}
                                    />
                                </td>
                                <td style={{ padding: '8px 4px', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: idx === 0 ? 900 : 700, color: idx === 0 ? '#51F893' : '#fff' }}>{player.username || 'Jogador'}</td>
                                <td style={{ padding: '8px 4px', color: '#51F893', fontWeight: 900 }}>R$ {player.balance?.toFixed(2) ?? '0,00'}</td>
                                <td style={{ padding: '8px 4px', color: '#51F893', fontWeight: 900 }}>R$ {player.total_profit?.toFixed(2) ?? '0,00'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button 
                    onClick={() => navigate('/ranking')}
                    style={{
                        color: '#000',
                        fontWeight: 900,
                        fontSize: 16,
                        textDecoration: 'none',
                        background: '#51F893',
                        padding: '7px 22px',
                        borderRadius: 10,
                        boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
                        border: '2px solid #51F893',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#45E080';
                        e.target.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#51F893';
                        e.target.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
                    }}
                >Ver ranking completo</button>
            </div>
        </div>
    );
}

export default RankingPreview;
