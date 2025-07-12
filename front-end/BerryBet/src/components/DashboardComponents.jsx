import React, { useState, useEffect } from 'react';
import { generateMockData } from '../utils/dashboardUtils';

// Hook personalizado para gerenciar dados do dashboard
export const useDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Token não encontrado');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Tentar buscar dados reais da API
            const response = await fetch('http://localhost:8080/api/dashboard/complete', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const apiData = await response.json();
                setData(apiData.data);
            } else {
                // Se API não estiver disponível, usar dados mock
                console.warn('API não disponível, usando dados mock');
                setData(generateMockData());
            }
        } catch (err) {
            console.warn('Erro ao buscar dados da API, usando dados mock:', err);
            // Usar dados mock como fallback
            setData(generateMockData());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return { data, loading, error, refetch: fetchDashboardData };
};

// Componente de loading personalizado
export const DashboardLoader = () => (
    <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #101820 0%, #0a2e12 60%, #fff700 180%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '20px'
    }}>
        <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid #43e97b',
            borderTop: '4px solid #fff700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <div style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center'
        }}>
            <div style={{ marginBottom: '10px' }}>📊</div>
            Carregando Dashboard...
        </div>
        <div style={{
            color: '#b0b8c1',
            fontSize: '16px',
            textAlign: 'center'
        }}>
            Preparando suas estatísticas avançadas
        </div>
    </div>
);

// Componente de erro personalizado
export const DashboardError = ({ error, onRetry }) => (
    <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #101820 0%, #0a2e12 60%, #fff700 180%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px'
    }}>
        <div style={{
            color: '#ff4b2b',
            fontSize: '64px',
            marginBottom: '20px'
        }}>
            ⚠️
        </div>
        <div style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '10px'
        }}>
            Erro ao Carregar Dashboard
        </div>
        <div style={{
            color: '#b0b8c1',
            fontSize: '16px',
            textAlign: 'center',
            maxWidth: '500px',
            marginBottom: '30px'
        }}>
            {error || 'Não foi possível carregar suas estatísticas. Verifique sua conexão e tente novamente.'}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
            <button
                onClick={onRetry}
                style={{
                    background: 'linear-gradient(90deg, #fff700 0%, #43e97b 100%)',
                    color: '#101820',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                🔄 Tentar Novamente
            </button>
            <button
                onClick={() => window.location.reload()}
                style={{
                    background: 'transparent',
                    color: '#43e97b',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '2px solid #43e97b',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                🔄 Recarregar Página
            </button>
        </div>
    </div>
);

// Componente de estado vazio
export const EmptyDashboard = () => (
    <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#b0b8c1'
    }}>
        <div style={{
            fontSize: '72px',
            marginBottom: '24px'
        }}>
            📊
        </div>
        <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#fff'
        }}>
            Bem-vindo ao BerryBet!
        </div>
        <div style={{
            fontSize: '18px',
            maxWidth: '500px',
            margin: '0 auto 32px auto',
            lineHeight: '1.6'
        }}>
            Suas estatísticas aparecerão aqui assim que você começar a apostar.
            Explore nossos jogos e acompanhe sua performance em tempo real!
        </div>
        <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
        }}>
            <div style={{
                background: 'rgba(67, 233, 123, 0.1)',
                padding: '16px 24px',
                borderRadius: '12px',
                border: '1px solid #43e97b',
                minWidth: '200px'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎰</div>
                <div style={{ color: '#43e97b', fontWeight: 'bold' }}>Jogos Disponíveis</div>
                <div style={{ fontSize: '14px' }}>Roleta, Crash, Blackjack</div>
            </div>
            <div style={{
                background: 'rgba(255, 247, 0, 0.1)',
                padding: '16px 24px',
                borderRadius: '12px',
                border: '1px solid #fff700',
                minWidth: '200px'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
                <div style={{ color: '#fff700', fontWeight: 'bold' }}>Estatísticas</div>
                <div style={{ fontSize: '14px' }}>ROI, Win Rate, Histórico</div>
            </div>
            <div style={{
                background: 'rgba(37, 117, 252, 0.1)',
                padding: '16px 24px',
                borderRadius: '12px',
                border: '1px solid #2575fc',
                minWidth: '200px'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
                <div style={{ color: '#2575fc', fontWeight: 'bold' }}>Conquistas</div>
                <div style={{ fontSize: '14px' }}>Sequências, Recordes</div>
            </div>
        </div>
    </div>
);

// Componente para mostrar dicas de uso
export const DashboardTips = () => {
    const [currentTip, setCurrentTip] = useState(0);

    const tips = [
        {
            icon: '💡',
            title: 'Dica: Acompanhe seu ROI',
            description: 'O Return on Investment (ROI) mostra o quanto você está ganhando ou perdendo em relação ao que apostou.'
        },
        {
            icon: '📊',
            title: 'Dica: Analise por jogo',
            description: 'Veja qual jogo tem melhor performance para você na aba "Por Jogo".'
        },
        {
            icon: '🎯',
            title: 'Dica: Controle suas apostas',
            description: 'Use as estatísticas para definir limites e jogar de forma responsável.'
        },
        {
            icon: '🔥',
            title: 'Dica: Sequências',
            description: 'Monitore suas sequências de vitórias e derrotas para entender seus padrões.'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % tips.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            background: 'rgba(16, 24, 32, 0.98)',
            borderRadius: '16px',
            padding: '20px',
            border: '2px solid #43e97b',
            margin: '20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.5s ease'
        }}>
            <div style={{ fontSize: '48px' }}>
                {tips[currentTip].icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{
                    color: '#43e97b',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '4px'
                }}>
                    {tips[currentTip].title}
                </div>
                <div style={{
                    color: '#b0b8c1',
                    fontSize: '16px',
                    lineHeight: '1.5'
                }}>
                    {tips[currentTip].description}
                </div>
            </div>
            <div style={{
                display: 'flex',
                gap: '4px'
            }}>
                {tips.map((_, index) => (
                    <div
                        key={index}
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: index === currentTip ? '#43e97b' : '#b0b8c1',
                            transition: 'background 0.3s ease'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// Componente de notificação
export const DashboardNotification = ({ type, message, onClose }) => {
    const getColor = () => {
        switch (type) {
            case 'success': return '#43e97b';
            case 'error': return '#ff4b2b';
            case 'warning': return '#fff700';
            default: return '#2575fc';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'rgba(16, 24, 32, 0.95)',
            borderRadius: '12px',
            padding: '16px 20px',
            border: `2px solid ${getColor()}`,
            boxShadow: `0 4px 16px ${getColor()}33`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '400px',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ fontSize: '24px' }}>
                {getIcon()}
            </div>
            <div style={{
                color: '#fff',
                fontSize: '16px',
                flex: 1
            }}>
                {message}
            </div>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: getColor(),
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px'
                }}
            >
                ×
            </button>
        </div>
    );
};

export default {
    useDashboard,
    DashboardLoader,
    DashboardError,
    EmptyDashboard,
    DashboardTips,
    DashboardNotification
};
