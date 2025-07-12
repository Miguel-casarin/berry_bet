import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css'; // Importa CSS para remover contornos

function Ranking() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('balance');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filter, setFilter] = useState('');
    const [filterColumn, setFilterColumn] = useState('all');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState(null);
    const pageSize = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
            window.location.reload();
            return;
        }

        // Buscar informações do usuário
        fetch('http://localhost:8080/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(async res => {
            if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/', { replace: true });
                window.location.reload();
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (data) {
                setUser(data.data);
                setIsLogged(true);
            }
        })
        .catch(() => {
            setIsLogged(false);
        });

        // Buscar ranking
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
        <div className="dashboard-container" style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0',
        }}>
            {/* Header baseado no dashboard */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'sticky',
                    top: 0,
                    background: '#111',
                    height: 64,
                    marginBottom: 20,
                    zIndex: 200,
                    borderBottom: '1px solid #333',
                    width: '100%',
                }}
            >
                {/* Espaço à esquerda (invisível) para balancear */}
                <div style={{ flex: 1 }}></div>
                
                <header
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        letterSpacing: 2,
                        color: '#fff',
                        userSelect: 'none',
                        lineHeight: '56px',
                        fontFamily: 'Montserrat, Arial, sans-serif',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
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
                
                {/* Saldo e Perfil à direita */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginRight: 24 }}>
                    {/* Saldo à esquerda do bloco do perfil */}
                    {isLogged && (
                        user ? (
                            <span
                                style={{
                                    fontWeight: 900,
                                    color: '#000',
                                    fontSize: 20,
                                    background: '#51F893',
                                    borderRadius: 14,
                                    padding: '6px 22px',
                                    boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
                                    minWidth: 100,
                                    textAlign: 'center',
                                    height: 42,
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: 16,
                                    letterSpacing: 1,
                                    fontFamily: 'Arial, sans-serif',
                                    border: 'none',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                title={`R$ ${user.balance?.toFixed(2) ?? '0,00'}`}
                                onClick={() => navigate('/dashboard')}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#45E080';
                                    e.target.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#51F893';
                                    e.target.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
                                }}
                            >
                                <span style={{ fontWeight: 900, fontSize: 20 }}>
                                    R$ {user.balance?.toFixed(2) ?? '0,00'}
                                </span>
                            </span>
                        ) : (
                            <span style={{
                                width: 100,
                                height: 42,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#51F893',
                                borderRadius: 14,
                                marginRight: 16,
                                fontWeight: 900,
                                color: '#000',
                                fontSize: 20,
                                opacity: 0.7
                            }}>
                                ...
                            </span>
                        )
                    )}
                    {isLogged && (
                        user ? (
                            <div
                                onClick={() => setShowProfileMenu((v) => !v)}
                                style={{
                                    zIndex: 100,
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 48,
                                    cursor: 'pointer',
                                    borderRadius: 24,
                                    background: showProfileMenu ? '#333' : '#1a1a1a',
                                    boxShadow: showProfileMenu ? '0 0 15px rgba(81, 248, 147, 0.6)' : '0 0 10px rgba(81, 248, 147, 0.3)',
                                    border: showProfileMenu ? '2px solid #51F893' : '2px solid #333',
                                    padding: '2px 18px 2px 12px',
                                    transition: 'all 0.3s ease',
                                    gap: 10,
                                    minWidth: 0,
                                    position: 'relative',
                                    marginRight: 0,
                                    marginLeft: 0,
                                }}
                                title="Abrir menu do perfil"
                            >
                                {(() => {
                                    const avatarSrc = user.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`;
                                    
                                    return (
                                        <img
                                            src={avatarSrc}
                                            alt="avatar"
                                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#51F893', boxShadow: '0 0 8px rgba(81, 248, 147, 0.5)', border: 'none' }}
                                        />
                                    );
                                })()}
                                <span
                                    style={{ fontWeight: 700, color: '#fff', fontSize: 18, maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    title={user.username}
                                >
                                    {user.username}
                                </span>
                                <span style={{ fontSize: 20, color: '#51F893', marginLeft: 2, display: 'flex', alignItems: 'center' }}>
                                    {showProfileMenu ? '▲' : '▼'}
                                </span>
                                {showProfileMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 48,
                                        right: 0,
                                        background: '#1a1a1a',
                                        color: '#fff',
                                        border: '2px solid #51F893',
                                        borderRadius: 18,
                                        boxShadow: '0 0 20px rgba(81, 248, 147, 0.3)',
                                        minWidth: 180,
                                        padding: 0,
                                        zIndex: 1000,
                                        marginTop: 10,
                                        opacity: showProfileMenu ? 1 : 0,
                                        transform: showProfileMenu ? 'translateY(0)' : 'translateY(-10px)',
                                        transition: 'opacity 0.25s, transform 0.25s',
                                        pointerEvents: showProfileMenu ? 'auto' : 'none',
                                    }}>
                                        <button
                                            className="profile-menu-button"
                                            style={{
                                                width: '100%',
                                                padding: '14px 20px',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: 17,
                                                color: '#fff',
                                                transition: 'background 0.18s, color 0.18s, transform 0.18s',
                                                fontWeight: 600,
                                                outline: 'none'
                                            }}
                                            title="Ver seu perfil"
                                            onMouseOver={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#51F893'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff'; }}
                                            onClick={e => { e.stopPropagation(); setShowProfileMenu(false); navigate('/perfil'); }}
                                        >Perfil</button>
                                        <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #333' }} />
                                        <button
                                            className="profile-menu-button"
                                            style={{
                                                width: '100%',
                                                padding: '14px 20px',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: 17,
                                                color: '#fff',
                                                transition: 'background 0.18s, color 0.18s, transform 0.18s',
                                                fontWeight: 600,
                                                outline: 'none'
                                            }}
                                            title="Gerenciar sua conta"
                                            onMouseOver={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#51F893'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff'; }}
                                            onClick={e => { e.stopPropagation(); setShowProfileMenu(false); navigate('/conta'); }}
                                        >Conta</button>
                                        <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #333' }} />
                                        <button
                                            className="profile-menu-button"
                                            style={{
                                                width: '100%',
                                                padding: '14px 20px',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: 17,
                                                color: '#fff',
                                                transition: 'background 0.18s, color 0.18s, transform 0.18s',
                                                fontWeight: 600,
                                                outline: 'none'
                                            }}
                                            title="Voltar ao dashboard"
                                            onMouseOver={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#51F893'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff'; }}
                                            onClick={e => { e.stopPropagation(); setShowProfileMenu(false); navigate('/dashboard'); }}
                                        >Dashboard</button>
                                        <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #333' }} />
                                        <button
                                            className="profile-menu-button"
                                            style={{
                                                width: '100%',
                                                padding: '14px 20px',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: 17,
                                                color: '#d32f2f',
                                                fontWeight: 'bold',
                                                transition: 'background 0.18s, color 0.18s, transform 0.18s',
                                                outline: 'none'
                                            }}
                                            title="Sair da sua conta"
                                            onMouseOver={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#ff4444'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#d32f2f'; }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                localStorage.removeItem('token');
                                                navigate('/', { replace: true });
                                                window.location.reload();
                                            }}
                                        >Sair</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                background: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
                                border: '2px solid #333',
                                marginRight: 0,
                                marginLeft: 0,
                                opacity: 0.7
                            }}>
                                <span style={{ fontSize: 28, color: '#51F893' }}>...</span>
                            </div>
                        )
                    )}
                </div>
            </div>
            
            
            <div style={{
                width: '100%',
                maxWidth: 900,
                background: '#111',
                borderRadius: 20,
                boxShadow: '0 0 20px rgba(81, 248, 147, 0.3)',
                padding: 36,
                border: '2px solid #51F893',
                margin: '20px 20px 40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <h2 style={{
                    textAlign: 'center',
                    color: '#51F893',
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
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
                            border: '2px solid #51F893',
                            fontSize: 16,
                            color: '#000',
                            background: '#fff',
                            fontWeight: 600,
                            outline: 'none',
                            boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
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
                            border: '2px solid #51F893',
                            fontSize: 16,
                            color: '#000',
                            background: '#fff',
                            fontWeight: 600,
                            outline: 'none',
                            boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
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
                                    <tr style={{ background: '#1a1a1a', color: '#51F893', fontWeight: 900, fontSize: 16 }}>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8 }}>#</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8 }}>Avatar</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('username')}>Nome {sortIcon('username')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('balance')}>Saldo {sortIcon('balance')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_bets')}>Partidas {sortIcon('total_bets')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_wins')}>Vitórias {sortIcon('total_wins')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_losses')}>Derrotas {sortIcon('total_losses')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_profit')}>Lucro {sortIcon('total_profit')}</th>
                                        <th style={{ padding: '10px 6px', borderBottom: '2px solid #51F893', borderRadius: 8, cursor: 'pointer' }} onClick={() => handleSort('total_amount_bet')}>Total Apostado {sortIcon('total_amount_bet')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRanking.map((player, idx) => (
                                        <tr key={player.id} style={{
                                            background: idx === 0 && page === 1 ? 'rgba(81, 248, 147, 0.1)' : 'transparent',
                                            borderRadius: idx === 0 && page === 1 ? 12 : 0,
                                            boxShadow: idx === 0 && page === 1 ? '0 0 15px rgba(81, 248, 147, 0.3)' : 'none',
                                            fontWeight: idx === 0 && page === 1 ? 900 : 700,
                                            color: idx === 0 && page === 1 ? '#51F893' : '#fff',
                                            fontSize: 16,
                                            textAlign: 'center',
                                            transition: 'background 0.2s',
                                        }}>
                                            <td style={{ padding: '10px 6px', fontWeight: 900 }}>{startIdx + idx + 1}º</td>
                                            <td style={{ padding: '10px 6px' }}>
                                                <img src={player.avatar_url ? (player.avatar_url.startsWith('http') ? player.avatar_url : `http://localhost:8080${player.avatar_url}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(player.username || 'Jogador')}`}
                                                    alt="avatar"
                                                    style={{ width: 38, height: 38, borderRadius: '50%', border: idx === 0 && page === 1 ? '2px solid #51F893' : '2px solid #333', background: '#fff', objectFit: 'cover', boxShadow: idx === 0 && page === 1 ? '0 0 10px rgba(81, 248, 147, 0.5)' : 'none' }}
                                                />
                                            </td>
                                            <td style={{ padding: '10px 6px', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.username || 'Jogador'}</td>
                                            <td style={{ padding: '10px 6px', color: '#51F893', fontWeight: 900 }}>R$ {player.balance?.toFixed(2) ?? '0,00'}</td>
                                            <td style={{ padding: '10px 6px' }}>{player.total_bets ?? 0}</td>
                                            <td style={{ padding: '10px 6px', color: '#51F893', fontWeight: 900 }}>{player.total_wins ?? 0}</td>
                                            <td style={{ padding: '10px 6px', color: '#ff4444', fontWeight: 900 }}>{player.total_losses ?? 0}</td>
                                            <td style={{ padding: '10px 6px', color: '#51F893', fontWeight: 900 }}>R$ {player.total_profit?.toFixed(2) ?? '0,00'}</td>
                                            <td style={{ padding: '10px 6px', color: '#51F893', fontWeight: 900 }}>R$ {player.total_amount_bet?.toFixed(2) ?? '0,00'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{ 
                                    padding: '8px 22px', 
                                    borderRadius: 8, 
                                    border: 'none', 
                                    background: page === 1 ? '#333' : '#51F893', 
                                    color: page === 1 ? '#888' : '#000', 
                                    fontWeight: 700, 
                                    fontSize: 16, 
                                    cursor: page === 1 ? 'not-allowed' : 'pointer', 
                                    boxShadow: page === 1 ? 'none' : '0 0 10px rgba(81, 248, 147, 0.3)', 
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (page !== 1) {
                                        e.target.style.background = '#45E080';
                                        e.target.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (page !== 1) {
                                        e.target.style.background = '#51F893';
                                        e.target.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
                                    }
                                }}
                            >Anterior</button>
                            <span style={{ alignSelf: 'center', fontWeight: 700, color: '#fff', fontSize: 16 }}>
                                Página {page} de {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                style={{ 
                                    padding: '8px 22px', 
                                    borderRadius: 8, 
                                    border: 'none', 
                                    background: (page === totalPages || totalPages === 0) ? '#333' : '#51F893', 
                                    color: (page === totalPages || totalPages === 0) ? '#888' : '#000', 
                                    fontWeight: 700, 
                                    fontSize: 16, 
                                    cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', 
                                    boxShadow: (page === totalPages || totalPages === 0) ? 'none' : '0 0 10px rgba(81, 248, 147, 0.3)', 
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (page !== totalPages && totalPages !== 0) {
                                        e.target.style.background = '#45E080';
                                        e.target.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (page !== totalPages && totalPages !== 0) {
                                        e.target.style.background = '#51F893';
                                        e.target.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
                                    }
                                }}
                            >Próxima</button>
                        </div>
                    </>
                )}
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
        </div>
    );
}

export default Ranking;
