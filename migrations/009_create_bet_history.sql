-- Migração para criar tabela de histórico de apostas detalhado
-- Esta tabela armazena informações detalhadas sobre cada aposta para o dashboard

CREATE TABLE IF NOT EXISTS bet_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    bet_amount REAL NOT NULL,
    win_amount REAL DEFAULT 0.0,
    profit_loss REAL NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
    details TEXT, -- JSON com detalhes específicos do jogo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_bet_history_user_id ON bet_history(user_id);
CREATE INDEX IF NOT EXISTS idx_bet_history_game_type ON bet_history(game_type);
CREATE INDEX IF NOT EXISTS idx_bet_history_created_at ON bet_history(created_at);
CREATE INDEX IF NOT EXISTS idx_bet_history_user_game ON bet_history(user_id, game_type);

-- Tabela para estatísticas por jogo
CREATE TABLE IF NOT EXISTS game_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    total_bets INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_draws INTEGER DEFAULT 0,
    total_amount_bet REAL DEFAULT 0.0,
    total_profit REAL DEFAULT 0.0,
    biggest_win REAL DEFAULT 0.0,
    biggest_loss REAL DEFAULT 0.0,
    current_streak INTEGER DEFAULT 0,
    best_win_streak INTEGER DEFAULT 0,
    worst_loss_streak INTEGER DEFAULT 0,
    last_played_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, game_type)
);

-- Criar índices para game_stats
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_game_type ON game_stats(game_type);
CREATE INDEX IF NOT EXISTS idx_game_stats_user_game ON game_stats(user_id, game_type);

-- Tabela para métricas diárias (cache de performance)
CREATE TABLE IF NOT EXISTS daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    bets_count INTEGER DEFAULT 0,
    total_bet_amount REAL DEFAULT 0.0,
    total_profit REAL DEFAULT 0.0,
    wins_count INTEGER DEFAULT 0,
    losses_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
);

-- Criar índices para daily_metrics
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_id ON daily_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON daily_metrics(user_id, date);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_game_stats_updated_at
    AFTER UPDATE ON game_stats
    FOR EACH ROW
    BEGIN
        UPDATE game_stats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_daily_metrics_updated_at
    AFTER UPDATE ON daily_metrics
    FOR EACH ROW
    BEGIN
        UPDATE daily_metrics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
