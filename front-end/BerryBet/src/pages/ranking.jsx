import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Ranking() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('balance');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filter, setFilter] = useState('');
    const [filterColumn, setFilterColumn] = useState('all');
    const pageSize = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
            window.location.reload();
            return;
        }
        fetch('http://localhost:8080/api/ranking', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async res => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/', { replace: true });
                    window.location.reload();
                    return { data: [] };
                }
                return res.json();
            })
            .then(data => {
                setRanking(data.data || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [navigate]);

    // Ordenação profissional
    const sortedRanking = [...ranking].sort((a, b) => {
        let valA = a[sortBy] ?? 0;
        let valB = b[sortBy] ?? 0;
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Filtro profissional com seleção de coluna
    const filteredRanking = sortedRanking.filter(player => {
        if (!filter) return true;
        const f = filter.toLowerCase().trim();
        const filterAsNumber = !isNaN(Number(f)) && f !== '' ? Number(f) : null;

        // Função para checar se todos os valores de uma coluna são iguais ao filtro
        const allColumnEqual = (col, value) => sortedRanking.every(p => (p[col] ?? 0) === value);

        if (filterColumn === 'all') {
            return (
                (player.username || '').toLowerCase().includes(f) ||
                (player.balance?.toFixed(2) || '').includes(f) ||
                (player.total_bets?.toString() || '').includes(f) ||
                (player.total_wins?.toString() || '').includes(f) ||
                (player.total_losses?.toString() || '').includes(f) ||
                (player.total_profit?.toFixed(2) || '').includes(f) ||
                (player.total_amount_bet?.toFixed(2) || '').includes(f)
            );
        }
        if (filterColumn === 'username') return (player.username || '').toLowerCase().includes(f);
        if (filterColumn === 'balance') return (player.balance?.toFixed(2) || '').includes(f);
        if (filterColumn === 'total_bets') {
            if (filterAsNumber !== null && allColumnEqual('total_bets', filterAsNumber)) return true;
            if (filterAsNumber !== null) return player.total_bets === filterAsNumber;
            return (player.total_bets?.toString() || '').includes(f);
        }
        if (filterColumn === 'total_wins') {
            if (filterAsNumber !== null && allColumnEqual('total_wins', filterAsNumber)) return true;
            if (filterAsNumber !== null) return player.total_wins === filterAsNumber;
            return (player.total_wins?.toString() || '').includes(f);
        }
        if (filterColumn === 'total_losses') {
            if (filterAsNumber !== null && allColumnEqual('total_losses', filterAsNumber)) return true;
            if (filterAsNumber !== null) return player.total_losses === filterAsNumber;
            return (player.total_losses?.toString() || '').includes(f);
        }
        if (filterColumn === 'total_profit') return (player.total_profit?.toFixed(2) || '').includes(f);
        if (filterColumn === 'total_amount_bet') return (player.total_amount_bet?.toFixed(2) || '').includes(f);
        return true;
    });

    const totalPages = Math.ceil(filteredRanking.length / pageSize);
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const currentRanking = filteredRanking.slice(startIdx, endIdx);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setPage(1);
    };

    const sortIcon = (field) => sortBy === field ? (sortOrder === 'asc' ? '▲' : '▼') : '';

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #101820 0%, #0a2e12 60%, #fff700 180%)',
            backgroundAttachment: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '40px 0 0 0',
        }}>
            <header
                style={{
                    padding: 24,
                    textAlign: 'center',
                    position: 'relative',
                    minHeight: 60,
                    background: 'linear-gradient(90deg, #232946 0%, #181c1f 100%)',
                    borderBottom: '2.5px solid #43e97b',
                    boxShadow: '0 2px 16px 0 #43e97b44, 0 1.5px 0 #fff700',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    width: '100%',
                    zIndex: 10
                }}
                onClick={() => { navigate('/dashboard'); window.location.reload(); }}
            >
                <span style={{ fontWeight: 900, fontSize: 32, color: '#fff', letterSpacing: 1, textShadow: '0 2px 8px #43e97b88', userSelect: 'none' }}>BerryBet</span>
            </header>
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
            <div style={{
                width: '100%',
                maxWidth: 900,
                background: 'rgba(16,24,32,0.98)',
                borderRadius: 20,
                boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055',
                padding: 36,
                border: '2px solid #43e97b',
                backdropFilter: 'blur(6px)',
            }}>
                <h2 style={{
                    textAlign: 'center',
                    color: '#fff700',
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    textShadow: '0 2px 12px #43e97b99, 0 0 8px #fff70088',
                    fontWeight: 900,
                    fontSize: 28,
                    letterSpacing: 1,
                    marginBottom: 28,
                }}>Ranking dos Melhores Jogadores</h2>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18, gap: 12 }}>
                    <select
                        value={filterColumn}
                        onChange={e => setFilterColumn(e.target.value)}
                        style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '2px solid #43e97b',
                            fontSize: 16,
                            color: '#232946',
                            background: '#fff',
                            fontWeight: 600,
                            outline: 'none',
                            boxShadow: '0 2px 8px #43e97b22',
                            transition: 'border 0.2s, box-shadow 0.2s',
                        }}
                    >
                        <option value="all">Todos</option>
                        <option value="username">Nome</option>
                        <option value="balance">Saldo</option>
                        <option value="total_bets">Partidas</option>
                        <option value="total_wins">Vitórias</option>
                        <option value="total_losses">Derrotas</option>
                        <option value="total_profit">Lucro</option>
                        <option value="total_amount_bet">Total Apostado</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Filtrar..."
                        value={filter}
                        onChange={e => { setFilter(e.target.value); setPage(1); }}
                        style={{
                            width: 220,
                            maxWidth: '100%',
                            padding: '10px 16px',
                            borderRadius: 10,
                            border: '2px solid #43e97b',
                            fontSize: 16,
                            color: '#232946',
                            background: '#fff',
                            fontWeight: 600,
                            outline: 'none',
                            boxShadow: '0 2px 8px #43e97b22',
                            margin: '0 auto',
                            transition: 'border 0.2s, box-shadow 0.2s',
                        }}
                    />
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#fff' }}>Carregando...</div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto', marginBottom: 18 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(90deg, #232946 0%, #181c2b 100%)', color: '#fff700', fontWeight: 900, fontSize: 16 }}>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8 }}>#</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8 }}>Avatar</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('username')}>Nome {sortIcon('username')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('balance')}>Saldo {sortIcon('balance')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_bets')}>Partidas {sortIcon('total_bets')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_wins')}>Vitórias {sortIcon('total_wins')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_losses')}>Derrotas {sortIcon('total_losses')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_profit')}>Lucro {sortIcon('total_profit')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #43e97b', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_amount_bet')}>Total Apostado {sortIcon('total_amount_bet')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRanking.map((player, idx) => (
                                        <tr key={player.id} style={{
                                            background: idx === 0 && page === 1 ? 'linear-gradient(90deg, #fff70033 0%, #43e97b22 100%)' : 'transparent',
                                            borderRadius: idx === 0 && page === 1 ? 12 : 0,
                                            boxShadow: idx === 0 && page === 1 ? '0 2px 12px #fff70055' : 'none',
                                            fontWeight: idx === 0 && page === 1 ? 900 : 700,
                                            color: idx === 0 && page === 1 ? '#fff700' : '#fff',
                                            fontSize: 16,
                                            textAlign: 'center',
                                            transition: 'background 0.2s',
                                        }}>
                                            <td style={{ padding: '10px 6px', fontWeight: 900 }}>{startIdx + idx + 1}º</td>
                                            <td style={{ padding: '10px 6px' }}>
                                                <img src={player.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.username || 'Jogador')}`}
                                                    alt="avatar"
                                                    style={{ width: 38, height: 38, borderRadius: '50%', border: idx === 0 && page === 1 ? '2.5px solid #fff700' : '2px solid #232946', background: '#fff', objectFit: 'cover', boxShadow: idx === 0 && page === 1 ? '0 0 12px #fff70088' : 'none' }}
                                                />
                                            </td>
                                            <td style={{ padding: '10px 6px', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.username || 'Jogador'}</td>
                                            <td style={{ padding: '10px 6px', color: '#43e97b', fontWeight: 900 }}>R$ {player.balance?.toFixed(2) ?? '0,00'}</td>
                                            <td style={{ padding: '10px 6px' }}>{player.total_bets ?? 0}</td>
                                            <td style={{ padding: '10px 6px', color: '#fff700', fontWeight: 900 }}>{player.total_wins ?? 0}</td>
                                            <td style={{ padding: '10px 6px', color: '#ff4b2b', fontWeight: 900 }}>{player.total_losses ?? 0}</td>
                                            <td style={{ padding: '10px 6px', color: '#43e97b', fontWeight: 900 }}>R$ {player.total_profit?.toFixed(2) ?? '0,00'}</td>
                                            <td style={{ padding: '10px 6px', color: '#2575fc', fontWeight: 900 }}>R$ {player.total_amount_bet?.toFixed(2) ?? '0,00'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: page === 1 ? '#232946' : 'linear-gradient(90deg, #fff700 0%, #43e97b 100%)', color: page === 1 ? '#888' : '#101820', fontWeight: 700, fontSize: 16, cursor: page === 1 ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #43e97b55', transition: 'background 0.2s' }}
                            >Anterior</button>
                            <span style={{ alignSelf: 'center', fontWeight: 700, color: '#fff', fontSize: 16 }}>
                                Página {page} de {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: (page === totalPages || totalPages === 0) ? '#232946' : 'linear-gradient(90deg, #fff700 0%, #43e97b 100%)', color: (page === totalPages || totalPages === 0) ? '#888' : '#101820', fontWeight: 700, fontSize: 16, cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #43e97b55', transition: 'background 0.2s' }}
                            >Próxima</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Ranking;
