package config

import (
	"database/sql"
	"log"
	_ "github.com/mattn/go-sqlite3"
)

func SetupDatabase() {
	db, err := sql.Open("sqlite3", "./data/berry_bet.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("Erro ao conectar ao banco de dados:", err)
	}
	log.Println("Banco de dados conectado com sucesso!")
}