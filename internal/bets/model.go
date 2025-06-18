package bets

import (
	"berry_bet/config"
	"database/sql"
	"strconv"

	_ "github.com/mattn/go-sqlite3"
)

// Bet representa uma aposta no sistema
type Bet struct {
	ID           int64   `json:"id"`
	UserID       int64   `json:"user_id"`
	Amount       float64 `json:"amount"`
	Odds         float64 `json:"odds"`
	BetStatus    string  `json:"bet_status"`
	ProfitLoss   float64 `json:"profit_loss"`
	GameID       int64   `json:"game_id"`
	RiggingLevel int64   `json:"rigging_level"`
	CreatedAt    string  `json:"created_at"`
}

// Busca as apostas do banco de dados, limitando o número de resultados retornados

func GetBets(count int) ([]Bet, error) {
	rows, err := config.DB.Query("SELECT id, user_id, amount, odds, bet_status, profit_loss, game_id, rigging_level, created_at FROM bets LIMIT " + strconv.Itoa(count))

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	bets := make([]Bet, 0)

	for rows.Next() {
		singleBet := Bet{}
		err := rows.Scan(&singleBet.ID, &singleBet.UserID, &singleBet.Amount, &singleBet.Odds, &singleBet.BetStatus, &singleBet.ProfitLoss, &singleBet.GameID, &singleBet.RiggingLevel, &singleBet.CreatedAt)

		if err != nil {
			return nil, err
		}

		bets = append(bets, singleBet)
	}

	err = rows.Err()

	if err != nil {
		return nil, err
	}

	return bets, err
}

// Busca uma aposta pelo ID no banco de dados

func GetBetByID(id string) (Bet, error) {
	stmt, err := config.DB.Prepare("SELECT id, user_id, amount, odds, bet_status, profit_loss, game_id, rigging_level, created_at FROM bets WHERE id = ?")

	if err != nil {
		return Bet{}, err
	}

	bet := Bet{}

	sqlErr := stmt.QueryRow(id).Scan(&bet.ID, &bet.UserID, &bet.Amount, &bet.Odds, &bet.BetStatus, &bet.ProfitLoss, &bet.GameID, &bet.RiggingLevel, &bet.CreatedAt)

	if sqlErr != nil {
		if sqlErr == sql.ErrNoRows {
			return Bet{}, nil
		}
		return Bet{}, sqlErr
	}
	return bet, nil
}

// Adiciona uma nova aposta ao banco de dados

func AddBet(newBet Bet) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("INSERT INTO bets (user_id, amount, odds, bet_status, profit_loss, game_id, rigging_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))")

	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(newBet.UserID, newBet.Amount, newBet.Odds, newBet.BetStatus, newBet.ProfitLoss, newBet.GameID, newBet.RiggingLevel)

	if err != nil {
		return false, err
	}

	tx.Commit()

	return true, nil
}

// Atualiza uma aposta existente no banco de dados

func UpdateBet(ourBet Bet, id int64) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("UPDATE bets SET user_id = ?, amount = ?, odds = ?, bet_status = ?, profit_loss = ?, game_id = ?, rigging_level = ? WHERE id = ?")

	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(ourBet.UserID, ourBet.Amount, ourBet.Odds, ourBet.BetStatus, ourBet.ProfitLoss, ourBet.GameID, ourBet.RiggingLevel, id)

	if err != nil {
		return false, err
	}

	tx.Commit()

	return true, nil
}

// Deleta uma aposta do banco de dados pelo ID

func DeleteBet(betId int) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("DELETE FROM bets WHERE id = ?")

	if err != nil {
		return false, err
	}

	_, err = stmt.Exec(betId)
	if err != nil {
		return false, err
	}

	tx.Commit()

	return true, nil
}
