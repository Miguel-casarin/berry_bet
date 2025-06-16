CREATE TABLE IF NOT EXISTS bets (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER NOT NULL,
  game      TEXT    NOT NULL,
  amount    REAL    NOT NULL,
  odds      REAL    NOT NULL DEFAULT 1,
  outcome    TEXT    NOT NULL DEFAULT 'pending', 
  payout    REAL    NOT NULL DEFAULT 0,          
  placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
