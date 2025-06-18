package bets

import (
	"berry_bet/config"
	"database/sql"
	"strconv"

	_ "github.com/mattn/go-sqlite3"
)

type Bet struct {
	ID         int64   `json:"id"`
	UserID     int64   `json:"user_id"`
	Amount     float64 `json:"amount"`
	Odds       float64 `json:"odds"`
	BetStatus  string  `json:"bet_status"`
	ProfitLoss float64 `json:"profit_loss"`
	GameID     int64   `json:"game_id"`
	CreatedAt  string  `json:"created_at"`
}

func GetBets(count int) ([]Bet, error) {
	rows, err := config.DB.Query("SELECT id, user_id, amount, odds, bet_status, profit_loss, game_id, created_at FROM bets LIMIT " + strconv.Itoa(count))

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	bets := make([]Bet, 0)

	for rows.Next() {
		singleBet := Bet{}
		err := rows.Scan(&singleBet.ID, &singleBet.UserID, &singleBet.Amount, &singleBet.Odds, &singleBet.BetStatus, &singleBet.ProfitLoss, &singleBet.GameID, &singleBet.CreatedAt)

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

func GetBetByID(id string) (Bet, error) {
	stmt, err := config.DB.Prepare("SELECT id, user_id, amount, odds, bet_status, profit_loss, game_id, created_at FROM bets WHERE id = ?")

	if err != nil {
		return Bet{}, err
	}

	bet := Bet{}

	sqlErr := stmt.QueryRow(id).Scan(&bet.ID, &bet.UserID, &bet.Amount, &bet.Odds, &bet.BetStatus, &bet.ProfitLoss, &bet.GameID, &bet.CreatedAt)

	if sqlErr != nil {
		if sqlErr == sql.ErrNoRows {
			return Bet{}, nil
		}
		return Bet{}, sqlErr
	}
	return bet, nil
}
