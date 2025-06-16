package db

import (
	"database/sql"
	"embed"
	"fmt"
	"io/fs"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

func Open(path string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}

	// Ativa foreign keys
	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return nil, err
	}

	if err := runMigrations(db); err != nil {
		return nil, err
	}

	fmt.Println("Banco iniciado com sucesso.")
	return db, nil
}

func runMigrations(db *sql.DB) error {
	entries, err := fs.ReadDir(migrationFiles, "migrations")
	if err != nil {
		return err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue // ignora subdiretórios
		}
		sqlBytes, err := migrationFiles.ReadFile("migrations/" + entry.Name())
		if err != nil {
			return err
		}
		_, err = db.Exec(string(sqlBytes))
		if err != nil {
			return fmt.Errorf("erro ao aplicar %s: %w", entry.Name(), err)
		}
	}
	return nil
}
