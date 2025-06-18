package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func SetupDatabase() {
	db, err := sql.Open("sqlite3", "./data/berry_bet.db")
	if err != nil {
		log.Fatal(err)
	}

	DB = db

	migrations := []string{
		"./migrations/001_create_users.sql",
		"./migrations/002_create_games.sql",
		"./migrations/003_create_bets.sql",
	}

	for _, migrationFile := range migrations {
		migration, err := os.ReadFile(migrationFile)
		if err != nil {
			log.Fatalf("Erro ao ler o arquivo de migração %s: %v", migrationFile, err)
		}
		_, err = db.Exec(string(migration))
		if err != nil {
			log.Fatalf("Erro ao executar a migração %s: %v", migrationFile, err)
		}
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Erro ao conectar ao banco de dados:", err)
	}
	log.Println("Migrações concluídas e banco de dados conectado com sucesso.")
}
