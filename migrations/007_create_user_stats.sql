CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    total_bets INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_amount_bet REAL DEFAULT 0.0,
    total_profit REAL DEFAULT 0.0,
    balance REAL DEFAULT 0.0,
    consecutive_losses INTEGER DEFAULT 0,
    last_bet_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);