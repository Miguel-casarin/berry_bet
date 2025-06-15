package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	var err error
	DB, err = sql.Open("sqlite3", "./data/database.db")
	if err != nil {
		log.Fatal(err)
	}

	createTables()
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			nickname TEXT UNIQUE NOT NULL,
			age INTEGER,
			cpf TEXT UNIQUE,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			phone TEXT,
			balance REAL DEFAULT 0.0
		);`,
		`CREATE TABLE IF NOT EXISTS game_sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			bet_amount REAL,
			result TEXT,
			reward REAL,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);`,
	}

	for _, query := range queries {
		if _, err := DB.Exec(query); err != nil {
			log.Fatal("Error creating tables:", err)
		}
	}
}

func CreateUser(name, nickname string, age int, cpf, email, password, phone string) error {
	_, err := DB.Exec(`INSERT INTO users (name, nickname, age, cpf, email, password, phone) 
		VALUES (?, ?, ?, ?, ?, ?, ?)`, name, nickname, age, cpf, email, password, phone)
	return err
}

func AuthenticateUser(email, password string) (int, error) {
	row := DB.QueryRow(`SELECT id FROM users WHERE email = ? AND password = ?`, email, password)
	var id int
	err := row.Scan(&id)
	return id, err
}

func UpdateBalance(userID int, delta float64) error {
	_, err := DB.Exec(`UPDATE users SET balance = balance + ? WHERE id = ?`, delta, userID)
	return err
}

func LogGameSession(userID int, bet float64, result string, reward float64) (int64, error) {
	res, err := DB.Exec(`INSERT INTO game_sessions (user_id, bet_amount, result, reward) 
		VALUES (?, ?, ?, ?)`, userID, bet, result, reward)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}
