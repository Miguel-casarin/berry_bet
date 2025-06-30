import React from 'react';

function RankingPreview() {
    const [ranking, setRanking] = React.useState([]);
    React.useEffect(() => {
        fetch('http://localhost:8080/api/ranking')
            .then(res => res.json())
            .then(data => {
                const sorted = (data.data || []).sort((a, b) => (b.total_profit ?? 0) - (a.total_profit ?? 0));
                setRanking(sorted.slice(0, 5));
            });
    }, []);
    return (
        <div style={{
            width: '100%',
            maxWidth: 500,
            background: 'rgba(16,24,32,0.98)',
            borderRadius: 20,
            boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055',
            padding: 18,
            border: '2px solid #43e97b',
            backdropFilter: 'blur(6px)'
        }}>
            <h3 style={{
                textAlign: 'center',
                color: '#fff700',
                fontFamily: 'Montserrat, Arial, sans-serif',
                textShadow: '0 2px 12px #43e97b99, 0 0 8px #fff70088',
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: 1,
                marginBottom: 18,
            }}>Top 5 Jogadores</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none' }}>
                    <thead>
                        <tr style={{ background: 'linear-gradient(90deg, #232946 0%, #181c2b 100%)', color: '#fff700', fontWeight: 900, fontSize: 15 }}>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #43e97b', borderRadius: 8 }}>#</th>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #43e97b', borderRadius: 8 }}>Avatar</th>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #43e97b', borderRadius: 8 }}>Nome</th>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #43e97b', borderRadius: 8 }}>Saldo</th>
                            <th style={{ padding: '8px 4px', borderBottom: '2px solid #43e97b', borderRadius: 8 }}>Lucro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.map((player, idx) => (
                            <tr key={player.id} style={{
                                background: idx === 0 ? 'linear-gradient(90deg, #fff70033 0%, #43e97b22 100%)' : 'transparent',
                                borderRadius: idx === 0 ? 12 : 0,
                                boxShadow: idx === 0 ? '0 2px 12px #fff70055' : 'none',
                                fontWeight: idx === 0 ? 900 : 700,
                                color: idx === 0 ? '#fff700' : '#fff',
                                fontSize: 15,
                                textAlign: 'center',
                                transition: 'background 0.2s',
                            }}>
                                <td style={{ padding: '8px 4px', fontWeight: 900 }}>{idx + 1}º</td>
                                <td style={{ padding: '8px 4px' }}>
                                    <img src={player.avatar_url ? (player.avatar_url.startsWith('http') ? player.avatar_url : `http://localhost:8080${player.avatar_url}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(player.username || 'Jogador')}`}
                                        alt="avatar"
                                        style={{ width: 28, height: 28, borderRadius: '50%', border: idx === 0 ? '2.5px solid #fff700' : '2px solid #232946', background: '#fff', objectFit: 'cover', boxShadow: idx === 0 ? '0 0 12px #fff70088' : 'none' }}
                                    />
                                </td>
                                <td style={{ padding: '8px 4px', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: idx === 0 ? 900 : 700, color: idx === 0 ? '#fff700' : '#fff' }}>{player.username || 'Jogador'}</td>
                                <td style={{ padding: '8px 4px', color: '#43e97b', fontWeight: 900 }}>R$ {player.balance?.toFixed(2) ?? '0,00'}</td>
                                <td style={{ padding: '8px 4px', color: '#43e97b', fontWeight: 900 }}>R$ {player.total_profit?.toFixed(2) ?? '0,00'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
                <a href="/ranking" style={{
                    color: '#fff700',
                    fontWeight: 900,
                    fontSize: 16,
                    textDecoration: 'none',
                    background: 'linear-gradient(90deg, #232946 0%, #43e97b 100%)',
                    padding: '7px 22px',
                    borderRadius: 10,
                    boxShadow: '0 2px 8px #43e97b55',
                    border: '2px solid #43e97b',
                    display: 'inline-block',
                    transition: 'background 0.2s, color 0.2s',
                }}
                >Ver ranking completo</a>
            </div>
        </div>
    );
}

export default RankingPreview;
