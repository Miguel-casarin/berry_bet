package dashboard

import (
	"database/sql"
	"time"
)

// BetHistory representa o histórico detalhado de apostas
type BetHistory struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id"`
	GameType   string    `json:"game_type"`
	BetAmount  float64   `json:"bet_amount"`
	WinAmount  float64   `json:"win_amount"`
	ProfitLoss float64   `json:"profit_loss"`
	Result     string    `json:"result"`
	Details    string    `json:"details"`
	CreatedAt  time.Time `json:"created_at"`
}

// GameStats representa as estatísticas por jogo
type GameStats struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	GameType        string    `json:"game_type"`
	TotalBets       int       `json:"total_bets"`
	TotalWins       int       `json:"total_wins"`
	TotalLosses     int       `json:"total_losses"`
	TotalDraws      int       `json:"total_draws"`
	TotalAmountBet  float64   `json:"total_amount_bet"`
	TotalProfit     float64   `json:"total_profit"`
	BiggestWin      float64   `json:"biggest_win"`
	BiggestLoss     float64   `json:"biggest_loss"`
	CurrentStreak   int       `json:"current_streak"`
	BestWinStreak   int       `json:"best_win_streak"`
	WorstLossStreak int       `json:"worst_loss_streak"`
	LastPlayedAt    time.Time `json:"last_played_at"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// DailyMetrics representa as métricas diárias
type DailyMetrics struct {
	ID             int       `json:"id"`
	UserID         int       `json:"user_id"`
	Date           time.Time `json:"date"`
	BetsCount      int       `json:"bets_count"`
	TotalBetAmount float64   `json:"total_bet_amount"`
	TotalProfit    float64   `json:"total_profit"`
	WinsCount      int       `json:"wins_count"`
	LossesCount    int       `json:"losses_count"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// DashboardData representa os dados completos do dashboard
type DashboardData struct {
	TotalBets       int         `json:"total_bets"`
	TotalWins       int         `json:"total_wins"`
	TotalLosses     int         `json:"total_losses"`
	TotalAmountBet  float64     `json:"total_amount_bet"`
	TotalProfit     float64     `json:"total_profit"`
	BiggestWin      float64     `json:"biggest_win"`
	BiggestLoss     float64     `json:"biggest_loss"`
	WinStreak       int         `json:"win_streak"`
	BestWinStreak   int         `json:"best_win_streak"`
	WorstLossStreak int         `json:"worst_loss_streak"`
	BetsToday       int         `json:"bets_today"`
	ProfitToday     float64     `json:"profit_today"`
	DaysActive      int         `json:"days_active"`
	GameStats       []GameStats `json:"game_stats"`
}

// WeeklyData representa os dados semanais
type WeeklyData struct {
	Date   time.Time `json:"date"`
	Profit float64   `json:"profit"`
	Bets   int       `json:"bets"`
}

// ActivityData representa uma atividade recente
type ActivityData struct {
	Type        string    `json:"type"`
	Amount      float64   `json:"amount"`
	GameType    string    `json:"game_type"`
	Description string    `json:"description"`
	Timestamp   time.Time `json:"timestamp"`
}

// Completedashboard representa a resposta completa do dashboard
type CompleteDashboard struct {
	Dashboard      DashboardData  `json:"dashboard"`
	WeeklyData     []WeeklyData   `json:"weekly_data"`
	RecentActivity []ActivityData `json:"recent_activity"`
}

// CreateBetHistory cria um novo registro de histórico de apostas
func CreateBetHistory(db *sql.DB, history *BetHistory) error {
	query := `
		INSERT INTO bet_history (user_id, game_type, bet_amount, win_amount, profit_loss, result, details)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	_, err := db.Exec(query, history.UserID, history.GameType, history.BetAmount,
		history.WinAmount, history.ProfitLoss, history.Result, history.Details)
	return err
}

// GetBetHistory recupera o histórico de apostas do usuário
func GetBetHistory(db *sql.DB, userID int, limit int) ([]BetHistory, error) {
	query := `
		SELECT id, user_id, game_type, bet_amount, win_amount, profit_loss, result, details, created_at
		FROM bet_history
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT ?
	`
	rows, err := db.Query(query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []BetHistory
	for rows.Next() {
		var h BetHistory
		err := rows.Scan(&h.ID, &h.UserID, &h.GameType, &h.BetAmount, &h.WinAmount,
			&h.ProfitLoss, &h.Result, &h.Details, &h.CreatedAt)
		if err != nil {
			return nil, err
		}
		history = append(history, h)
	}
	return history, nil
}

// UpdateGameStats atualiza as estatísticas de um jogo específico
func UpdateGameStats(db *sql.DB, userID int, gameType string, betAmount, profitLoss float64, result string) error {
	// Primeiro, verifica se já existe um registro
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM game_stats WHERE user_id = ? AND game_type = ?)`
	err := db.QueryRow(checkQuery, userID, gameType).Scan(&exists)
	if err != nil {
		return err
	}

	if !exists {
		// Criar novo registro
		insertQuery := `
			INSERT INTO game_stats (user_id, game_type, total_bets, total_wins, total_losses, 
				total_amount_bet, total_profit, biggest_win, biggest_loss, current_streak, 
				best_win_streak, worst_loss_streak, last_played_at)
			VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		`
		wins := 0
		losses := 0
		streak := 0
		bestWin := 0.0
		worstLoss := 0.0

		if result == "win" {
			wins = 1
			streak = 1
			bestWin = profitLoss
		} else if result == "loss" {
			losses = 1
			streak = -1
			worstLoss = 1
		}

		_, err = db.Exec(insertQuery, userID, gameType, wins, losses, betAmount, profitLoss,
			bestWin, worstLoss, streak, abs(streak), abs(streak))
		return err
	}

	// Atualizar registro existente
	updateQuery := `
		UPDATE game_stats SET
			total_bets = total_bets + 1,
			total_wins = total_wins + ?,
			total_losses = total_losses + ?,
			total_amount_bet = total_amount_bet + ?,
			total_profit = total_profit + ?,
			biggest_win = CASE WHEN ? > biggest_win THEN ? ELSE biggest_win END,
			biggest_loss = CASE WHEN ? < biggest_loss THEN ? ELSE biggest_loss END,
			current_streak = ?,
			best_win_streak = CASE WHEN ? > 0 AND ? > best_win_streak THEN ? ELSE best_win_streak END,
			worst_loss_streak = CASE WHEN ? < 0 AND ? > worst_loss_streak THEN ? ELSE worst_loss_streak END,
			last_played_at = CURRENT_TIMESTAMP
		WHERE user_id = ? AND game_type = ?
	`

	// Calcular nova sequência
	var currentStreak int
	streakQuery := `SELECT current_streak FROM game_stats WHERE user_id = ? AND game_type = ?`
	err = db.QueryRow(streakQuery, userID, gameType).Scan(&currentStreak)
	if err != nil {
		return err
	}

	newStreak := calculateNewStreak(currentStreak, result)

	wins := 0
	losses := 0
	if result == "win" {
		wins = 1
	} else if result == "loss" {
		losses = 1
	}

	_, err = db.Exec(updateQuery, wins, losses, betAmount, profitLoss,
		profitLoss, profitLoss, profitLoss, profitLoss, newStreak,
		newStreak, newStreak, newStreak,
		newStreak, abs(newStreak), abs(newStreak),
		userID, gameType)
	return err
}

// GetGameStats recupera as estatísticas por jogo do usuário
func GetGameStats(db *sql.DB, userID int) ([]GameStats, error) {
	query := `
		SELECT id, user_id, game_type, total_bets, total_wins, total_losses, total_draws,
			total_amount_bet, total_profit, biggest_win, biggest_loss, current_streak,
			best_win_streak, worst_loss_streak, last_played_at, created_at, updated_at
		FROM game_stats
		WHERE user_id = ?
		ORDER BY total_bets DESC
	`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []GameStats
	for rows.Next() {
		var s GameStats
		err := rows.Scan(&s.ID, &s.UserID, &s.GameType, &s.TotalBets, &s.TotalWins,
			&s.TotalLosses, &s.TotalDraws, &s.TotalAmountBet, &s.TotalProfit,
			&s.BiggestWin, &s.BiggestLoss, &s.CurrentStreak, &s.BestWinStreak,
			&s.WorstLossStreak, &s.LastPlayedAt, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

// UpdateDailyMetrics atualiza as métricas diárias
func UpdateDailyMetrics(db *sql.DB, userID int, betAmount, profitLoss float64, result string) error {
	today := time.Now().Format("2006-01-02")

	// Verificar se já existe um registro para hoje
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM daily_metrics WHERE user_id = ? AND date = ?)`
	err := db.QueryRow(checkQuery, userID, today).Scan(&exists)
	if err != nil {
		return err
	}

	wins := 0
	losses := 0
	if result == "win" {
		wins = 1
	} else if result == "loss" {
		losses = 1
	}

	if !exists {
		// Criar novo registro
		insertQuery := `
			INSERT INTO daily_metrics (user_id, date, bets_count, total_bet_amount, total_profit, wins_count, losses_count)
			VALUES (?, ?, 1, ?, ?, ?, ?)
		`
		_, err = db.Exec(insertQuery, userID, today, betAmount, profitLoss, wins, losses)
		return err
	}

	// Atualizar registro existente
	updateQuery := `
		UPDATE daily_metrics SET
			bets_count = bets_count + 1,
			total_bet_amount = total_bet_amount + ?,
			total_profit = total_profit + ?,
			wins_count = wins_count + ?,
			losses_count = losses_count + ?
		WHERE user_id = ? AND date = ?
	`
	_, err = db.Exec(updateQuery, betAmount, profitLoss, wins, losses, userID, today)
	return err
}

// Função auxiliar para calcular nova sequência
func calculateNewStreak(currentStreak int, result string) int {
	if result == "win" {
		if currentStreak >= 0 {
			return currentStreak + 1
		}
		return 1
	} else if result == "loss" {
		if currentStreak <= 0 {
			return currentStreak - 1
		}
		return -1
	}
	return 0
}

// Função auxiliar para valor absoluto
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}
