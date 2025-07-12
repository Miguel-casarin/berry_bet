// Exemplo de como usar o dashboard com dados mock
// Este arquivo pode ser usado para testar o dashboard localmente

import React from 'react';
import { generateMockData } from '../utils/dashboardUtils';

// Função para simular dados de usuário
const mockUser = {
    id: 1,
    username: 'testuser',
    name: 'Usuário de Teste',
    email: 'test@berrybet.com',
    avatar_url: null,
    created_at: '2025-01-01T00:00:00Z',
    bio: 'Jogador entusiasta do BerryBet!'
};

// Função para simular dados básicos de estatísticas
const mockStats = {
    balance: 1250.75,
    total_bets: 150,
    total_wins: 75,
    total_losses: 75
};

// Exemplo de como usar o dashboard com dados mock
export const DashboardMockExample = () => {
    const mockData = generateMockData();

    console.log('Dados Mock do Dashboard:', mockData);

    // Exemplo de métricas calculadas
    const calculateMetrics = (dashboardData) => {
        if (!dashboardData) return {};

        const winRate = dashboardData.total_bets > 0 ?
            ((dashboardData.total_wins / dashboardData.total_bets) * 100).toFixed(1) : 0;

        const roi = dashboardData.total_amount_bet > 0 ?
            ((dashboardData.total_profit / dashboardData.total_amount_bet) * 100).toFixed(1) : 0;

        return { winRate, roi };
    };

    const metrics = calculateMetrics(mockData.dashboard);

    return (
        <div style={{ padding: '20px', color: '#fff', background: '#101820' }}>
            <h1>Dashboard Mock Test</h1>

            <div style={{ marginBottom: '20px' }}>
                <h2>Usuário Mock:</h2>
                <pre style={{ background: '#23272b', padding: '10px', borderRadius: '8px' }}>
                    {JSON.stringify(mockUser, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2>Estatísticas Mock:</h2>
                <pre style={{ background: '#23272b', padding: '10px', borderRadius: '8px' }}>
                    {JSON.stringify(mockStats, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2>Dashboard Mock:</h2>
                <pre style={{ background: '#23272b', padding: '10px', borderRadius: '8px' }}>
                    {JSON.stringify(mockData.dashboard, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2>Métricas Calculadas:</h2>
                <pre style={{ background: '#23272b', padding: '10px', borderRadius: '8px' }}>
                    {JSON.stringify(metrics, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2>Dados Semanais:</h2>
                <pre style={{ background: '#23272b', padding: '10px', borderRadius: '8px' }}>
                    {JSON.stringify(mockData.weekly_data, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2>Atividade Recente:</h2>
                <pre style={{ background: '#23272b', padding: '10px', borderRadius: '8px' }}>
                    {JSON.stringify(mockData.recent_activity, null, 2)}
                </pre>
            </div>
        </div>
    );
};

// Função para testar formatação de dados
export const testFormatting = () => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    console.log('Testes de Formatação:');
    console.log('Moeda:', formatCurrency(1250.75));
    console.log('Data:', formatDate('2025-07-06T10:30:00Z'));
    console.log('Porcentagem:', `${(67.5).toFixed(1)}%`);
};

// Função para testar cores baseadas em valores
export const testValueColors = () => {
    const getProfitColor = (value) => {
        if (value > 0) return '#43e97b';
        if (value < 0) return '#ff4b2b';
        return '#b0b8c1';
    };

    console.log('Testes de Cores:');
    console.log('Lucro positivo:', getProfitColor(50));
    console.log('Lucro negativo:', getProfitColor(-25));
    console.log('Lucro zero:', getProfitColor(0));
};

// Função para testar ícones de jogos
export const testGameIcons = () => {
    const getGameIcon = (gameType) => {
        const gameIcons = {
            'roleta': '🎰',
            'crash': '🚀',
            'blackjack': '🃏',
            'poker': '♠️'
        };
        return gameIcons[gameType?.toLowerCase()] || '🎮';
    };

    console.log('Testes de Ícones:');
    console.log('Roleta:', getGameIcon('roleta'));
    console.log('Crash:', getGameIcon('crash'));
    console.log('Blackjack:', getGameIcon('blackjack'));
    console.log('Desconhecido:', getGameIcon('unknown'));
};

// Executar todos os testes
export const runAllTests = () => {
    console.log('=== INICIANDO TESTES DO DASHBOARD ===');

    testFormatting();
    testValueColors();
    testGameIcons();

    const mockData = generateMockData();
    console.log('Dashboard Mock Data:', mockData);

    console.log('=== TESTES CONCLUÍDOS ===');
};

// Exemplo de uso no console do navegador:
// import { runAllTests } from './DashboardTest';
// runAllTests();

export default {
    DashboardMockExample,
    testFormatting,
    testValueColors,
    testGameIcons,
    runAllTests
};
