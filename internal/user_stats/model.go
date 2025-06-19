package user_stats

import (
	"berry_bet/config"
	"strconv"
)

type UserStats struct {
	ID             int64   `json:"id"`
	UserID         int64   `json:"user_id"`
	TotalBets      int64   `json:"total_bets"`
	TotalWins      int64   `json:"total_wins"`
	TotalLosses    int64   `json:"total_losses"`
	TotalAmountBet float64 `json:"total_amount_bet"`
	TotalProfit    float64 `json:"total_profit"`
	LastBetAt      string  `json:"last_bet_at"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

func GetUserStats(count int) ([]UserStats, error) {
	rows, err := config.DB.Query("SELECT id, user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, last_bet_at, created_at, updated_at FROM user_stats LIMIT " + strconv.Itoa(count))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	stats := make([]UserStats, 0)
	for rows.Next() {
		var s UserStats
		err := rows.Scan(&s.ID, &s.UserID, &s.TotalBets, &s.TotalWins, &s.TotalLosses, &s.TotalAmountBet, &s.TotalProfit, &s.LastBetAt, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

func GetUserStatsByID(id string) (UserStats, error) {
	stmt, err := config.DB.Prepare("SELECT id, user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, last_bet_at, created_at, updated_at FROM user_stats WHERE id = ?")
	if err != nil {
		return UserStats{}, err
	}
	defer stmt.Close()
	var s UserStats
	sqlErr := stmt.QueryRow(id).Scan(&s.ID, &s.UserID, &s.TotalBets, &s.TotalWins, &s.TotalLosses, &s.TotalAmountBet, &s.TotalProfit, &s.LastBetAt, &s.CreatedAt, &s.UpdatedAt)
	if sqlErr != nil {
		return UserStats{}, sqlErr
	}
	return s, nil
}

func AddUserStats(newStats UserStats) (bool, error) {
	stmt, err := config.DB.Prepare("INSERT INTO user_stats (user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, last_bet_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(newStats.UserID, newStats.TotalBets, newStats.TotalWins, newStats.TotalLosses, newStats.TotalAmountBet, newStats.TotalProfit, newStats.LastBetAt)
	if err != nil {
		return false, err
	}
	return true, nil
}

func UpdateUserStats(stats UserStats, id int64) (bool, error) {
	stmt, err := config.DB.Prepare("UPDATE user_stats SET total_bets = ?, total_wins = ?, total_losses = ?, total_amount_bet = ?, total_profit = ?, last_bet_at = ?, updated_at = datetime('now') WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(stats.TotalBets, stats.TotalWins, stats.TotalLosses, stats.TotalAmountBet, stats.TotalProfit, stats.LastBetAt, id)
	if err != nil {
		return false, err
	}
	return true, nil
}

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
