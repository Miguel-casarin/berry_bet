CREATE TABLE IF NOT EXISTS outcomes (
    id INTEGER PRIMARY KEY,
    game_id INTEGER NOT NULL,
    outcome TEXT NOT NULL,
    settled_at TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id)
);