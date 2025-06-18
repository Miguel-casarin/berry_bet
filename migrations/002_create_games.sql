CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    game_name TEXT NOT NULL,
    game_description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    game_status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);