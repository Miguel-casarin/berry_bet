package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB(filepath string) {
	var err error
	DB, err = sql.Open("sqlite3", filepath)
	if err != nil {
		log.Fatal(err)
	}
	if err := DB.Ping(); err != nil {
		log.Fatal(err)
	}
	log.Println("Database connection established successfully")
}
