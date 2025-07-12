// Utilitários para o dashboard avançado do perfil

// Função para formatar moeda em real brasileiro
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value || 0);
};

// Função para formatar porcentagem
export const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
};

// Função para formatar data
export const formatDate = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Função para formatar data e hora
export const formatDateTime = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Função para obter cor baseada no valor de lucro
export const getProfitColor = (value) => {
    if (value > 0) return '#43e97b';
    if (value < 0) return '#ff4b2b';
    return '#b0b8c1';
};

// Função para calcular métricas derivadas
export const calculateMetrics = (dashboardData) => {
    if (!dashboardData) return {};

    const winRate = dashboardData.total_bets > 0 ?
        ((dashboardData.total_wins / dashboardData.total_bets) * 100).toFixed(1) : 0;

    const lossRate = dashboardData.total_bets > 0 ?
        ((dashboardData.total_losses / dashboardData.total_bets) * 100).toFixed(1) : 0;

    const roi = dashboardData.total_amount_bet > 0 ?
        ((dashboardData.total_profit / dashboardData.total_amount_bet) * 100).toFixed(1) : 0;

    const averageBet = dashboardData.total_bets > 0 ?
        (dashboardData.total_amount_bet / dashboardData.total_bets).toFixed(2) : 0;

    const profitMargin = dashboardData.total_profit > 0 ?
        ((dashboardData.total_profit / (dashboardData.total_amount_bet + dashboardData.total_profit)) * 100).toFixed(1) : 0;

    return {
        winRate,
        lossRate,
        roi,
        averageBet,
        profitMargin
    };
};

// Função para obter ícone do jogo
export const getGameIcon = (gameType) => {
    const gameIcons = {
        'roleta': '🎰',
        'crash': '🚀',
        'blackjack': '🃏',
        'poker': '♠️',
        'slots': '🎰',
        'bingo': '🎱',
        'dice': '🎲',
        'wheel': '🎡'
    };

    return gameIcons[gameType?.toLowerCase()] || '🎮';
};

// Função para obter cor do jogo
export const getGameColor = (gameType) => {
    const gameColors = {
        'roleta': '#43e97b',
        'crash': '#ff4b2b',
        'blackjack': '#2575fc',
        'poker': '#fff700',
        'slots': '#9b59b6',
        'bingo': '#e74c3c',
        'dice': '#f39c12',
        'wheel': '#1abc9c'
    };

    return gameColors[gameType?.toLowerCase()] || '#43e97b';
};

// Função para obter ícone de atividade
export const getActivityIcon = (type) => {
    const activityIcons = {
        'win': '🏆',
        'loss': '💔',
        'bet': '🎲',
        'deposit': '💰',
        'withdraw': '💸',
        'bonus': '🎁',
        'jackpot': '💎'
    };

    return activityIcons[type?.toLowerCase()] || '📋';
};

// Função para obter cor da atividade
export const getActivityColor = (type) => {
    const activityColors = {
        'win': '#43e97b',
        'loss': '#ff4b2b',
        'bet': '#2575fc',
        'deposit': '#43e97b',
        'withdraw': '#ff4b2b',
        'bonus': '#fff700',
        'jackpot': '#9b59b6'
    };

    return activityColors[type?.toLowerCase()] || '#b0b8c1';
};

// Função para formatar números grandes
export const formatLargeNumber = (value) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
};

// Função para calcular tendência
export const calculateTrend = (data) => {
    if (!data || data.length < 2) return 0;

    const recent = data.slice(-3);
    const older = data.slice(0, -3);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, item) => sum + item.profit, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.profit, 0) / older.length;

    return recentAvg - olderAvg;
};

// Função para obter descrição da tendência
export const getTrendDescription = (trend) => {
    if (trend > 0) return { text: 'Tendência positiva', color: '#43e97b', icon: '📈' };
    if (trend < 0) return { text: 'Tendência negativa', color: '#ff4b2b', icon: '📉' };
    return { text: 'Estável', color: '#b0b8c1', icon: '➡️' };
};

// Função para validar dados do dashboard
export const validateDashboardData = (data) => {
    if (!data) return false;

    const requiredFields = ['total_bets', 'total_wins', 'total_losses'];
    return requiredFields.every(field => data.hasOwnProperty(field));
};

// Função para obter classificação do jogador
export const getPlayerRank = (winRate, totalBets) => {
    if (totalBets < 10) return { rank: 'Novato', color: '#b0b8c1', icon: '🌱' };
    if (winRate >= 70) return { rank: 'Lenda', color: '#fff700', icon: '👑' };
    if (winRate >= 60) return { rank: 'Mestre', color: '#9b59b6', icon: '💎' };
    if (winRate >= 50) return { rank: 'Veterano', color: '#43e97b', icon: '🏆' };
    if (winRate >= 40) return { rank: 'Intermediário', color: '#2575fc', icon: '🎯' };
    return { rank: 'Iniciante', color: '#ff4b2b', icon: '🎲' };
};

// Constantes para configuração do dashboard
export const DASHBOARD_CONFIG = {
    CHART_COLORS: {
        primary: '#43e97b',
        secondary: '#fff700',
        danger: '#ff4b2b',
        info: '#2575fc',
        warning: '#f39c12',
        success: '#43e97b'
    },
    ANIMATION_DURATION: 300,
    REFRESH_INTERVAL: 30000, // 30 segundos
    MAX_ACTIVITIES: 50,
    MAX_CHART_POINTS: 30
};

// Função para gerar dados mock para desenvolvimento
export const generateMockData = () => {
    return {
        dashboard: {
            total_bets: 150,
            total_wins: 75,
            total_losses: 75,
            total_amount_bet: 1500.00,
            total_profit: 250.00,
            biggest_win: 100.00,
            biggest_loss: -50.00,
            win_streak: 3,
            best_win_streak: 8,
            worst_loss_streak: 5,
            bets_today: 5,
            profit_today: 25.00,
            days_active: 30,
            game_stats: [
                {
                    game_type: 'roleta',
                    total_bets: 80,
                    total_wins: 40,
                    total_losses: 40,
                    total_amount_bet: 800.00,
                    total_profit: 120.00
                },
                {
                    game_type: 'crash',
                    total_bets: 70,
                    total_wins: 35,
                    total_losses: 35,
                    total_amount_bet: 700.00,
                    total_profit: 130.00
                }
            ]
        },
        weekly_data: [
            { date: '2025-07-01', profit: 50.00, bets: 10 },
            { date: '2025-07-02', profit: -20.00, bets: 8 },
            { date: '2025-07-03', profit: 30.00, bets: 12 },
            { date: '2025-07-04', profit: 70.00, bets: 15 },
            { date: '2025-07-05', profit: -10.00, bets: 6 },
            { date: '2025-07-06', profit: 45.00, bets: 9 },
            { date: '2025-07-07', profit: 25.00, bets: 7 }
        ],
        recent_activity: [
            {
                type: 'win',
                amount: 50.00,
                game_type: 'roleta',
                description: 'Vitória na roleta',
                timestamp: '2025-07-06T10:30:00Z'
            },
            {
                type: 'loss',
                amount: -25.00,
                game_type: 'crash',
                description: 'Perda no crash',
                timestamp: '2025-07-06T09:15:00Z'
            },
            {
                type: 'win',
                amount: 30.00,
                game_type: 'roleta',
                description: 'Vitória na roleta',
                timestamp: '2025-07-06T08:45:00Z'
            }
        ]
    };
};
