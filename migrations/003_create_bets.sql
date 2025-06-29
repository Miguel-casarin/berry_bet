CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    odds REAL NOT NULL,
    bet_status TEXT NOT NULL DEFAULT 'pending' CHECK (bet_status IN ('pending', 'won', 'lost')),
    profit_loss REAL DEFAULT 0.0,
    game_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);