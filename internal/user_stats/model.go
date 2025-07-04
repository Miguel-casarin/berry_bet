package user_stats

import (
	"berry_bet/config"
	"database/sql"
	"errors"
)

type UserStats struct {
	ID                int64          `json:"id"`
	UserID            int64          `json:"user_id"`
	TotalBets         int64          `json:"total_bets"`
	TotalWins         int64          `json:"total_wins"`
	TotalLosses       int64          `json:"total_losses"`
	TotalAmountBet    float64        `json:"total_amount_bet"`
	TotalProfit       float64        `json:"total_profit"`
	Balance           float64        `json:"balance"`
	ConsecutiveLosses int64          `json:"consecutive_losses"`
	LastBetAt         sql.NullString `json:"last_bet_at"`
	CreatedAt         string         `json:"created_at"`
	UpdatedAt         string         `json:"updated_at"`
}

func GetUserStats(count int) ([]UserStats, error) {
	rows, err := config.DB.Query("SELECT id, user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, consecutive_losses, last_bet_at, created_at, updated_at FROM user_stats LIMIT ?", count)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	stats := make([]UserStats, 0)
	for rows.Next() {
		var s UserStats
		err := rows.Scan(&s.ID, &s.UserID, &s.TotalBets, &s.TotalWins, &s.TotalLosses, &s.TotalAmountBet, &s.TotalProfit, &s.Balance, &s.ConsecutiveLosses, &s.LastBetAt, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

func GetUserStatsByID(id string) (UserStats, error) {
	stmt, err := config.DB.Prepare("SELECT id, user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, consecutive_losses, last_bet_at, created_at, updated_at FROM user_stats WHERE user_id = ?")
	if err != nil {
		return UserStats{}, err
	}
	defer stmt.Close()
	var s UserStats
	sqlErr := stmt.QueryRow(id).Scan(&s.ID, &s.UserID, &s.TotalBets, &s.TotalWins, &s.TotalLosses, &s.TotalAmountBet, &s.TotalProfit, &s.Balance, &s.ConsecutiveLosses, &s.LastBetAt, &s.CreatedAt, &s.UpdatedAt)
	if sqlErr != nil {
		return UserStats{}, sqlErr
	}
	return s, nil
}

// AddUserStats adiciona estatísticas de usuário ao banco de dados após validação dos dados.
func AddUserStats(newStats UserStats) (bool, error) {
	if newStats.UserID <= 0 {
		return false, errors.New("invalid user id")
	}
	stmt, err := config.DB.Prepare("INSERT INTO user_stats (user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, last_bet_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(newStats.UserID, newStats.TotalBets, newStats.TotalWins, newStats.TotalLosses, newStats.TotalAmountBet, newStats.TotalProfit, newStats.Balance, newStats.LastBetAt)
	if err != nil {
		return false, err
	}
	return true, nil
}

// UpdateUserStats atualiza estatísticas de usuário após validação dos dados.
func UpdateUserStats(stats UserStats, id int64) (bool, error) {
	if stats.UserID <= 0 {
		return false, errors.New("user_id inválido")
	}
	stmt, err := config.DB.Prepare("UPDATE user_stats SET total_bets = ?, total_wins = ?, total_losses = ?, total_amount_bet = ?, total_profit = ?, balance = ?, consecutive_losses = ?, last_bet_at = ?, updated_at = datetime('now') WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(stats.TotalBets, stats.TotalWins, stats.TotalLosses, stats.TotalAmountBet, stats.TotalProfit, stats.Balance, stats.ConsecutiveLosses, stats.LastBetAt, id)
	if err != nil {
		return false, err
	}
	return true, nil
}

// DeleteUserStats remove estatísticas de usuário do banco de dados pelo ID.
func DeleteUserStats(statsId int) (bool, error) {
	stmt, err := config.DB.Prepare("DELETE FROM user_stats WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(statsId)
	if err != nil {
		return false, err
	}
	return true, nil
}

// UpdateUserStatsAfterBet atualiza estatísticas do usuário após uma aposta
func UpdateUserStatsAfterBet(userID int64, betAmount float64, isWin bool, profitLoss float64) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Calcular o balance atual do usuário baseado nas transações
	var balance float64
	rows, err := tx.Query(`SELECT type, amount FROM transactions WHERE user_id = ?`, userID)
	if err != nil {
		return err
	}
	for rows.Next() {
		var ttype string
		var amount float64
		if err := rows.Scan(&ttype, &amount); err != nil {
			rows.Close()
			return err
		}
		switch ttype {
		case "deposit", "win", "bonus":
			balance += amount
		case "bet", "withdraw":
			balance -= amount
		}
	}
	rows.Close()

	// Verificar se já existem estatísticas para o usuário
	var exists bool
	err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM user_stats WHERE user_id = ?)", userID).Scan(&exists)
	if err != nil {
		return err
	}

	if !exists {
		// Criar registro inicial
		_, err = tx.Exec(`
			INSERT INTO user_stats (user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, last_bet_at, created_at, updated_at) 
			VALUES (?, 1, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
			userID,
			map[bool]int{true: 1, false: 0}[isWin],
			map[bool]int{true: 0, false: 1}[isWin],
			betAmount,
			profitLoss,
			balance)
	} else {
		// Atualizar registro existente
		winsIncrement := 0
		lossesIncrement := 0
		if isWin {
			winsIncrement = 1
		} else {
			lossesIncrement = 1
		}

		_, err = tx.Exec(`
			UPDATE user_stats 
			SET total_bets = total_bets + 1,
				total_wins = total_wins + ?,
				total_losses = total_losses + ?,
				total_amount_bet = total_amount_bet + ?,
				total_profit = total_profit + ?,
				balance = ?,
				last_bet_at = datetime('now'),
				updated_at = datetime('now')
			WHERE user_id = ?`,
			winsIncrement, lossesIncrement, betAmount, profitLoss, balance, userID)
	}

	if err != nil {
		return err
	}

	return tx.Commit()
}

// UpdateUserBalance atualiza o balance do usuário para o valor informado
func UpdateUserBalance(userID int64, balance float64) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Verificar se já existem estatísticas para o usuário
	var exists bool
	err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM user_stats WHERE user_id = ?)", userID).Scan(&exists)
	if err != nil {
		return err
	}

	if !exists {
		// Criar registro inicial se não existir
		_, err = tx.Exec(`
			INSERT INTO user_stats (user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, created_at, updated_at) 
			VALUES (?, 0, 0, 0, 0.0, 0.0, ?, datetime('now'), datetime('now'))`,
			userID, balance)
	} else {
		// Atualizar apenas o balance
		_, err = tx.Exec(`
			UPDATE user_stats 
			SET balance = ?, updated_at = datetime('now')
			WHERE user_id = ?`,
			balance, userID)
	}

	if err != nil {
		return err
	}

	return tx.Commit()
}

// GetTopPlayersByProfit retorna os jogadores com maior lucro
func GetTopPlayersByProfit(limit int) ([]UserStats, error) {
	rows, err := config.DB.Query(`
		SELECT id, user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, last_bet_at, created_at, updated_at 
		FROM user_stats 
		WHERE total_bets > 0
		ORDER BY total_profit DESC 
		LIMIT ?`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stats := make([]UserStats, 0)
	for rows.Next() {
		var s UserStats
		err := rows.Scan(&s.ID, &s.UserID, &s.TotalBets, &s.TotalWins, &s.TotalLosses,
			&s.TotalAmountBet, &s.TotalProfit, &s.Balance, &s.LastBetAt, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}

	return stats, rows.Err()
}

// GetTopPlayersByWins retorna os jogadores com mais vitórias
func GetTopPlayersByWins(limit int) ([]UserStats, error) {
	rows, err := config.DB.Query(`
		SELECT id, user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, last_bet_at, created_at, updated_at 
		FROM user_stats 
		WHERE total_bets > 0
		ORDER BY total_wins DESC 
		LIMIT ?`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stats := make([]UserStats, 0)
	for rows.Next() {
		var s UserStats
		err := rows.Scan(&s.ID, &s.UserID, &s.TotalBets, &s.TotalWins, &s.TotalLosses,
			&s.TotalAmountBet, &s.TotalProfit, &s.Balance, &s.LastBetAt, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}

	return stats, rows.Err()
}

// GetUserBalance retorna o saldo atual de um usuário
func GetUserBalance(userID int64) (float64, error) {
	var balance float64
	err := config.DB.QueryRow("SELECT balance FROM user_stats WHERE user_id = ?", userID).Scan(&balance)
	if err != nil {
		// Se não existir registro de user_stats, calcular o balance das transações
		if err.Error() == "sql: no rows in result set" {
			// Calcular balance baseado nas transações
			rows, err := config.DB.Query(`SELECT type, amount FROM transactions WHERE user_id = ?`, userID)
			if err != nil {
				return 0, err
			}
			defer rows.Close()

			balance = 0
			for rows.Next() {
				var ttype string
				var amount float64
				if err := rows.Scan(&ttype, &amount); err != nil {
					return 0, err
				}
				switch ttype {
				case "deposit", "win", "bonus":
					balance += amount
				case "bet", "withdraw":
					balance -= amount
				}
			}
			return balance, rows.Err()
		}
		return 0, err
	}
	return balance, nil
}

// GetUserBalanceByID retorna o saldo de um usuário pelo ID (string)
func GetUserBalanceByID(userIDStr string) (float64, error) {
	var balance float64
	err := config.DB.QueryRow("SELECT balance FROM user_stats WHERE user_id = ?", userIDStr).Scan(&balance)
	if err != nil {
		// Se não existir registro de user_stats, calcular o balance das transações
		if err.Error() == "sql: no rows in result set" {
			// Calcular balance baseado nas transações
			rows, err := config.DB.Query(`SELECT type, amount FROM transactions WHERE user_id = ?`, userIDStr)
			if err != nil {
				return 0, err
			}
			defer rows.Close()

			balance = 0
			for rows.Next() {
				var ttype string
				var amount float64
				if err := rows.Scan(&ttype, &amount); err != nil {
					return 0, err
				}
				switch ttype {
				case "deposit", "win", "bonus":
					balance += amount
				case "bet", "withdraw":
					balance -= amount
				}
			}
			return balance, rows.Err()
		}
		return 0, err
	}
	return balance, nil
}

// IncrementUserTotalBets incrementa o número de partidas (TotalBets) do usuário em 1
func IncrementUserTotalBets(userID int64) error {
	stmt, err := config.DB.Prepare("UPDATE user_stats SET total_bets = total_bets + 1, updated_at = datetime('now') WHERE user_id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(userID)
	return err
}
