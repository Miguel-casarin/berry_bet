CREATE TABLE IF NOT EXISTS bet_limits (
    id INTEGER PRIMARY KEY,
    min_amount REAL NOT NULL,
    max_amount REAL NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO bet_limits (min_amount, max_amount) VALUES (1.0, 1000.0)
ON CONFLICT DO NOTHING;
