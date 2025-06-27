package games

import (
	"berry_bet/config"
	"database/sql"
	"errors"
)

type Game struct {
	ID              int64  `json:"id"`
	GameName        string `json:"game_name"`
	GameDescription string `json:"game_description"`
	StartTime       string `json:"start_time"`
	EndTime         string `json:"end_time"`
	GameStatus      string `json:"game_status"`
	CreatedAt       string `json:"created_at"`
}

func GetGames(count int) ([]Game, error) {
	rows, err := config.DB.Query("SELECT id, game_name, game_description, start_time, end_time, game_status, created_at FROM games LIMIT ?", count)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	games := make([]Game, 0)

	for rows.Next() {
		g := Game{}
		err := rows.Scan(&g.ID, &g.GameName, &g.GameDescription, &g.StartTime, &g.EndTime, &g.GameStatus, &g.CreatedAt)

		if err != nil {
			return nil, err
		}

		games = append(games, g)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return games, nil
}

func GetGameByID(id string) (Game, error) {
	stmt, err := config.DB.Prepare("SELECT id, game_name, game_description, start_time, end_time, game_status, created_at FROM games WHERE id = ?")

	if err != nil {
		return Game{}, err
	}

	defer stmt.Close()

	game := Game{}

	sqlErr := stmt.QueryRow(id).Scan(&game.ID, &game.GameName, &game.GameDescription, &game.StartTime, &game.EndTime, &game.GameStatus, &game.CreatedAt)

	if sqlErr != nil {
		if sqlErr == sql.ErrNoRows {
			return Game{}, nil
		}
		return Game{}, sqlErr
	}
	return game, nil
}

// AddGame adiciona um novo jogo ao banco de dados após validação dos dados.
func AddGame(newGame Game) (bool, error) {
	if len(newGame.GameName) < 3 {
		return false, errors.New("game name must have at least 3 characters")
	}
	if newGame.GameStatus == "" {
		return false, errors.New("game status cannot be empty")
	}

	tx, err := config.DB.Begin()
	if err != nil {
		return false, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	stmt, err := config.DB.Prepare("INSERT INTO games (game_name, game_description, start_time, end_time, game_status, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(newGame.GameName, newGame.GameDescription, newGame.StartTime, newGame.EndTime, newGame.GameStatus)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		return false, err
	}

	return true, nil
}

// UpdateGame atualiza um jogo existente após validação dos dados.
func UpdateGame(ourGame Game, id int64) (bool, error) {
	if len(ourGame.GameName) < 3 {
		return false, errors.New("nome do jogo deve ter pelo menos 3 caracteres")
	}
	if ourGame.GameStatus == "" {
		return false, errors.New("status do jogo não pode ser vazio")
	}

	tx, err := config.DB.Begin()
	if err != nil {
		return false, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	stmt, err := config.DB.Prepare("UPDATE games SET game_name = ?, game_description = ?, start_time = ?, end_time = ?, game_status = ? WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(ourGame.GameName, ourGame.GameDescription, ourGame.StartTime, ourGame.EndTime, ourGame.GameStatus, id)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		return false, err
	}

	return true, nil
}

// DeleteGame remove um jogo do banco de dados pelo ID, usando transação e rollback em caso de erro.
func DeleteGame(gameId int) (bool, error) {
	tx, err := config.DB.Begin()
	if err != nil {
		return false, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	stmt, err := config.DB.Prepare("DELETE FROM games WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(gameId)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		return false, err
	}

	return true, nil
}

// GetActiveGames busca jogos que estão ativos (disponíveis para apostas)
func GetActiveGames() ([]Game, error) {
	rows, err := config.DB.Query(`
		SELECT id, game_name, game_description, start_time, end_time, game_status, created_at 
		FROM games 
		WHERE game_status IN ('scheduled', 'active') 
		ORDER BY start_time ASC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	games := make([]Game, 0)
	for rows.Next() {
		var game Game
		err := rows.Scan(&game.ID, &game.GameName, &game.GameDescription, &game.StartTime, &game.EndTime, &game.GameStatus, &game.CreatedAt)
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}

	return games, rows.Err()
}

// GetGamesByStatus busca jogos por status específico
func GetGamesByStatus(status string) ([]Game, error) {
	rows, err := config.DB.Query(`
		SELECT id, game_name, game_description, start_time, end_time, game_status, created_at 
		FROM games 
		WHERE game_status = ? 
		ORDER BY created_at DESC`, status)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	games := make([]Game, 0)
	for rows.Next() {
		var game Game
		err := rows.Scan(&game.ID, &game.GameName, &game.GameDescription, &game.StartTime, &game.EndTime, &game.GameStatus, &game.CreatedAt)
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}

	return games, rows.Err()
}

// StartGame inicia um jogo (muda status para 'active')
func StartGame(gameID int64) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	_, err = tx.Exec(`
		UPDATE games 
		SET game_status = 'active', start_time = datetime('now') 
		WHERE id = ? AND game_status = 'scheduled'`, gameID)

	if err != nil {
		return err
	}

	return tx.Commit()
}

// EndGame finaliza um jogo (muda status para 'finished')
func EndGame(gameID int64) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	_, err = tx.Exec(`
		UPDATE games 
		SET game_status = 'finished', end_time = datetime('now') 
		WHERE id = ? AND game_status = 'active'`, gameID)

	if err != nil {
		return err
	}

	return tx.Commit()
}

// CreateRouletteGame cria um novo jogo de roleta
func CreateRouletteGame(description string) (int64, error) {
	tx, err := config.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	result, err := tx.Exec(`
		INSERT INTO games (game_name, game_description, game_status, created_at) 
		VALUES ('Roulette', ?, 'scheduled', datetime('now'))`, description)

	if err != nil {
		return 0, err
	}

	gameID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	return gameID, nil
}
