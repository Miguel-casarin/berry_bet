package bets

import (
	"berry_bet/config"
	"database/sql"
	"errors"

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
	rows, err := config.DB.Query("SELECT id, user_id, amount, odds, bet_status, profit_loss, game_id, rigging_level, created_at FROM bets LIMIT ?", count)

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

// AddBet adiciona uma nova aposta ao banco de dados após validação dos dados.
func AddBet(newBet Bet) (bool, error) {
	if newBet.UserID <= 0 {
		return false, errors.New("invalid user id")
	}
	if newBet.Amount <= 0 {
		return false, errors.New("bet amount must be greater than zero")
	}
	if newBet.Odds <= 1 {
		return false, errors.New("odds must be greater than 1")
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

	stmt, err := config.DB.Prepare("INSERT INTO bets (user_id, amount, odds, bet_status, profit_loss, game_id, rigging_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(newBet.UserID, newBet.Amount, newBet.Odds, newBet.BetStatus, newBet.ProfitLoss, newBet.GameID, newBet.RiggingLevel)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		return false, err
	}

	return true, nil
}

// UpdateBet atualiza uma aposta existente após validação dos dados.
func UpdateBet(ourBet Bet, id int64) (bool, error) {
	if ourBet.UserID <= 0 {
		return false, errors.New("user_id inválido")
	}
	if ourBet.Amount <= 0 {
		return false, errors.New("valor da aposta deve ser maior que zero")
	}
	if ourBet.Odds <= 1 {
		return false, errors.New("odds deve ser maior que 1")
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

	stmt, err := config.DB.Prepare("UPDATE bets SET user_id = ?, amount = ?, odds = ?, bet_status = ?, profit_loss = ?, game_id = ?, rigging_level = ? WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(ourBet.UserID, ourBet.Amount, ourBet.Odds, ourBet.BetStatus, ourBet.ProfitLoss, ourBet.GameID, ourBet.RiggingLevel, id)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		return false, err
	}

	return true, nil
}

// DeleteBet remove uma aposta do banco de dados pelo ID, usando transação e rollback em caso de erro.
func DeleteBet(betId int) (bool, error) {
	tx, err := config.DB.Begin()
	if err != nil {
		return false, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	stmt, err := config.DB.Prepare("DELETE FROM bets WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(betId)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		return false, err
	}

	return true, nil
}

// GetBetsByUserID busca todas as apostas de um usuário específico
func GetBetsByUserID(userID int64, limit int) ([]Bet, error) {
	rows, err := config.DB.Query(`
		SELECT id, user_id, amount, odds, bet_status, profit_loss, game_id, rigging_level, created_at 
		FROM bets 
		WHERE user_id = ? 
		ORDER BY created_at DESC 
		LIMIT ?`, userID, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bets := make([]Bet, 0)
	for rows.Next() {
		var bet Bet
		err := rows.Scan(&bet.ID, &bet.UserID, &bet.Amount, &bet.Odds, &bet.BetStatus, &bet.ProfitLoss, &bet.GameID, &bet.RiggingLevel, &bet.CreatedAt)
		if err != nil {
			return nil, err
		}
		bets = append(bets, bet)
	}

	return bets, rows.Err()
}

// GetBetsByGameID busca todas as apostas de um jogo específico
func GetBetsByGameID(gameID int64) ([]Bet, error) {
	rows, err := config.DB.Query(`
		SELECT id, user_id, amount, odds, bet_status, profit_loss, game_id, rigging_level, created_at 
		FROM bets 
		WHERE game_id = ?`, gameID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bets := make([]Bet, 0)
	for rows.Next() {
		var bet Bet
		err := rows.Scan(&bet.ID, &bet.UserID, &bet.Amount, &bet.Odds, &bet.BetStatus, &bet.ProfitLoss, &bet.GameID, &bet.RiggingLevel, &bet.CreatedAt)
		if err != nil {
			return nil, err
		}
		bets = append(bets, bet)
	}

	return bets, rows.Err()
}

// GetPendingBetsByGameID busca apostas pendentes de um jogo específico
func GetPendingBetsByGameID(gameID int64) ([]Bet, error) {
	rows, err := config.DB.Query(`
		SELECT id, user_id, amount, odds, bet_status, profit_loss, game_id, rigging_level, created_at 
		FROM bets 
		WHERE game_id = ? AND bet_status = 'pending'`, gameID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bets := make([]Bet, 0)
	for rows.Next() {
		var bet Bet
		err := rows.Scan(&bet.ID, &bet.UserID, &bet.Amount, &bet.Odds, &bet.BetStatus, &bet.ProfitLoss, &bet.GameID, &bet.RiggingLevel, &bet.CreatedAt)
		if err != nil {
			return nil, err
		}
		bets = append(bets, bet)
	}

	return bets, rows.Err()
}

// UpdateBetStatus atualiza o status de uma aposta e seu lucro/prejuízo
func UpdateBetStatus(betID int64, status string, profitLoss float64) error {
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
		UPDATE bets 
		SET bet_status = ?, profit_loss = ? 
		WHERE id = ?`, status, profitLoss, betID)

	if err != nil {
		return err
	}

	return tx.Commit()
}

// ResolveBetsForGame resolve todas as apostas pendentes para um jogo
func ResolveBetsForGame(gameID int64, winningOutcome string) error {
	// Esta função será usada para resolver apostas baseada no resultado do jogo
	// Por exemplo, em roleta, winningOutcome pode ser "red", "black", número específico, etc.

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Buscar apostas pendentes para este jogo
	rows, err := tx.Query(`
		SELECT id, user_id, amount, odds, rigging_level 
		FROM bets 
		WHERE game_id = ? AND bet_status = 'pending'`, gameID)

	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var betID, userID, riggingLevel int64
		var amount, odds float64

		err := rows.Scan(&betID, &userID, &amount, &odds, &riggingLevel)
		if err != nil {
			return err
		}

		// TODO: Implementar lógica específica do jogo para determinar se a aposta ganhou
		// Por agora, deixamos como estrutura para ser implementada
		var isWin bool
		var profitLoss float64

		// Placeholder para lógica do jogo
		_ = winningOutcome
		_ = riggingLevel

		if isWin {
			profitLoss = amount * (odds - 1)
			_, err = tx.Exec(`UPDATE bets SET bet_status = 'won', profit_loss = ? WHERE id = ?`, profitLoss, betID)
		} else {
			profitLoss = -amount
			_, err = tx.Exec(`UPDATE bets SET bet_status = 'lost', profit_loss = ? WHERE id = ?`, profitLoss, betID)
		}

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
