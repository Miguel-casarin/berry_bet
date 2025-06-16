package db

import (
	"database/sql"
	"embed"
	"io/fs"

	_ "github.com/mattn/go-sqlite3" // Importa o driver SQLite3 para uso com database/sql
)

// migrations irá armazenar os arquivos de migração embutidos no binário.
// Você precisa adicionar uma diretiva //go:embed para especificar os arquivos.
// Exemplo: //go:embed migrations/*.sql
var migrations embed.FS

// Open abre (ou cria) um banco de dados SQLite no caminho especificado.
// Também executa as migrações encontradas no embed.FS.
func Open(path string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", path) // Abre conexão com o banco SQLite
	if err != nil {
		return nil, err // Retorna erro se falhar ao abrir
	}
	if err := migrate(db); err != nil { // Executa as migrações
		db.Close() // Fecha o banco em caso de erro na migração
		return nil, err
	}
	return db, nil // Retorna a conexão aberta
}

// migrate executa todos os arquivos de migração encontrados no embed.FS.
func migrate(db *sql.DB) error {
	entries, err := fs.ReadDir(migrations, ".") // Lista arquivos no embed.FS
	if err != nil {
		return err
	}
	for _, e := range entries {
		content, err := migrations.ReadFile(e.Name()) // Lê o conteúdo do arquivo de migração
		if err != nil {
			return err
		}
		if _, err := db.Exec(string(content)); err != nil { // Executa o SQL da migração
			return err
		}
	}
	return nil // Retorna nil se todas as migrações forem aplicadas com sucesso
}
