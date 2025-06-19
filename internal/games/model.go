package games

import (
	"berry_bet/config"
	"database/sql"
	"strconv"
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
	rows, err := config.DB.Query("SELECT id, game_name, game_description, start_time, end_time, game_status, created_at FROM games LIMIT " + strconv.Itoa(count))

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

func AddGame(newGame Game) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("INSERT INTO games (game_name, game_description, start_time, end_time, game_status, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))")

	if err != nil {
		return false, err
	}

	defer stmt.Close()

	_, err = stmt.Exec(newGame.GameName, newGame.GameDescription, newGame.StartTime, newGame.EndTime, newGame.GameStatus)

	if err != nil {
		return false, err
	}
	tx.Commit()
	return true, nil
}

func UpdateGame(ourGame Game, id int64) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("UPDATE games SET game_name = ?, game_description = ?, start_time = ?, end_time = ?, game_status = ? WHERE id = ?")

	if err != nil {
		return false, err
	}

	defer stmt.Close()

	_, err = stmt.Exec(ourGame.GameName, ourGame.GameDescription, ourGame.StartTime, ourGame.EndTime, ourGame.GameStatus, id)

	if err != nil {
		return false, err
	}
	tx.Commit()
	return true, nil
}

func DeleteGame(gameId int) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("DELETE FROM games WHERE id = ?")

	if err != nil {
		return false, err
	}

	_, err = stmt.Exec(gameId)

	if err != nil {
		return false, err
	}
	tx.Commit()
	return true, nil
}
