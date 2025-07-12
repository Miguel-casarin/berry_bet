package dashboard

import (
	"database/sql"
	"fmt"
	"time"
)

// Service representa o serviço do dashboard
type Service struct {
	db *sql.DB
}

// NewService cria uma nova instância do serviço
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// RecordBet registra uma nova aposta no sistema
func (s *Service) RecordBet(userID int, req *RecordBetRequest) error {
	// Validar a requisição
	if err := req.Validate(); err != nil {
		return err
	}

	// Iniciar transação
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Criar registro no histórico de apostas
	history := req.ToBetHistory(userID)
	if err := s.createBetHistoryTx(tx, history); err != nil {
		return err
	}

	// Atualizar estatísticas por jogo
	if err := s.updateGameStatsTx(tx, userID, req.GameType, req.BetAmount, req.ProfitLoss, req.Result); err != nil {
		return err
	}

	// Atualizar métricas diárias
	if err := s.updateDailyMetricsTx(tx, userID, req.BetAmount, req.ProfitLoss, req.Result); err != nil {
		return err
	}

	// Commit da transação
	return tx.Commit()
}

// GetCompleteDashboard retorna o dashboard completo do usuário
func (s *Service) GetCompleteDashboard(userID int) (*CompleteDashboardResponse, error) {
	// Obter dados do dashboard
	dashboard, err := s.GetDashboardData(userID)
	if err != nil {
		return nil, err
	}

	// Obter dados semanais
	weeklyData, err := s.GetWeeklyData(userID)
	if err != nil {
		return nil, err
	}

	// Obter atividade recente
	recentActivity, err := s.GetRecentActivity(userID, 20)
	if err != nil {
		return nil, err
	}

	return &CompleteDashboardResponse{
		Dashboard:      *dashboard,
		WeeklyData:     weeklyData,
		RecentActivity: recentActivity,
	}, nil
}

// GetDashboardData retorna os dados principais do dashboard
func (s *Service) GetDashboardData(userID int) (*DashboardResponse, error) {
	// Obter estatísticas gerais
	generalStats, err := s.getGeneralStats(userID)
	if err != nil {
		// Se as tabelas não existirem, retornar dados vazios
		return &DashboardResponse{
			TotalBets:       0,
			TotalWins:       0,
			TotalLosses:     0,
			TotalAmountBet:  0,
			TotalProfit:     0,
			WinRate:         0,
			ROI:             0,
			ProfitMargin:    0,
			BiggestWin:      0,
			BiggestLoss:     0,
			WinStreak:       0,
			BestWinStreak:   0,
			WorstLossStreak: 0,
			BetsToday:       0,
			ProfitToday:     0,
			DaysActive:      0,
			GameStats:       []GameStatsResponse{},
		}, nil
	}

	// Obter estatísticas de hoje
	todayStats, err := s.getTodayStats(userID)
	if err != nil {
		todayStats = &DailyMetrics{
			BetsCount:   0,
			TotalProfit: 0,
		}
	}

	// Obter sequências
	streaks, err := s.getStreaks(userID)
	if err != nil {
		streaks = &struct {
			CurrentStreak   int
			BestWinStreak   int
			WorstLossStreak int
		}{
			CurrentStreak:   0,
			BestWinStreak:   0,
			WorstLossStreak: 0,
		}
	}

	// Obter estatísticas por jogo
	gameStats, err := s.getGameStatsResponses(userID)
	if err != nil {
		gameStats = []GameStatsResponse{}
	}

	// Obter dias ativo
	daysActive, err := s.getDaysActive(userID)
	if err != nil {
		daysActive = 0
	}

	// Calcular métricas derivadas
	winRate := 0.0
	roi := 0.0
	profitMargin := 0.0

	if generalStats.TotalBets > 0 {
		winRate = (float64(generalStats.TotalWins) / float64(generalStats.TotalBets)) * 100
	}

	if generalStats.TotalAmountBet > 0 {
		roi = (generalStats.TotalProfit / generalStats.TotalAmountBet) * 100
	}

	if generalStats.TotalProfit > 0 {
		profitMargin = (generalStats.TotalProfit / (generalStats.TotalAmountBet + generalStats.TotalProfit)) * 100
	}

	return &DashboardResponse{
		TotalBets:       generalStats.TotalBets,
		TotalWins:       generalStats.TotalWins,
		TotalLosses:     generalStats.TotalLosses,
		TotalAmountBet:  generalStats.TotalAmountBet,
		TotalProfit:     generalStats.TotalProfit,
		WinRate:         winRate,
		ROI:             roi,
		ProfitMargin:    profitMargin,
		BiggestWin:      generalStats.BiggestWin,
		BiggestLoss:     generalStats.BiggestLoss,
		WinStreak:       streaks.CurrentStreak,
		BestWinStreak:   streaks.BestWinStreak,
		WorstLossStreak: streaks.WorstLossStreak,
		BetsToday:       todayStats.BetsCount,
		ProfitToday:     todayStats.TotalProfit,
		DaysActive:      daysActive,
		GameStats:       gameStats,
	}, nil
}

// GetWeeklyData retorna os dados dos últimos 7 dias
func (s *Service) GetWeeklyData(userID int) ([]WeeklyDataResponse, error) {
	query := `
		SELECT date, COALESCE(total_profit, 0) as profit, COALESCE(bets_count, 0) as bets
		FROM daily_metrics
		WHERE user_id = ? AND date >= date('now', '-7 days')
		ORDER BY date ASC
	`

	rows, err := s.db.Query(query, userID)
	if err != nil {
		// Retornar dados vazios se as tabelas não existirem
		return []WeeklyDataResponse{}, nil
	}
	defer rows.Close()

	var weeklyData []WeeklyDataResponse
	for rows.Next() {
		var data WeeklyDataResponse
		err := rows.Scan(&data.Date, &data.Profit, &data.Bets)
		if err != nil {
			continue
		}
		weeklyData = append(weeklyData, data)
	}

	return weeklyData, nil
}

// GetRecentActivity retorna as atividades recentes do usuário
func (s *Service) GetRecentActivity(userID int, limit int) ([]ActivityResponse, error) {
	query := `
		SELECT game_type, bet_amount, win_amount, profit_loss, result, created_at
		FROM bet_history
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT ?
	`

	rows, err := s.db.Query(query, userID, limit)
	if err != nil {
		// Retornar dados vazios se as tabelas não existirem
		return []ActivityResponse{}, nil
	}
	defer rows.Close()

	var activities []ActivityResponse
	for rows.Next() {
		var gameType string
		var betAmount, winAmount, profitLoss float64
		var result string
		var createdAt time.Time

		err := rows.Scan(&gameType, &betAmount, &winAmount, &profitLoss, &result, &createdAt)
		if err != nil {
			return nil, err
		}

		activity := ActivityResponse{
			Type:      result,
			Amount:    profitLoss,
			GameType:  gameType,
			Timestamp: createdAt,
		}

		// Gerar descrição baseada no resultado
		if result == "win" {
			activity.Description = fmt.Sprintf("Vitória em %s - Ganhou R$ %.2f", gameType, profitLoss)
		} else if result == "loss" {
			activity.Description = fmt.Sprintf("Perda em %s - Perdeu R$ %.2f", gameType, -profitLoss)
		} else {
			activity.Description = fmt.Sprintf("Empate em %s", gameType)
		}

		activities = append(activities, activity)
	}

	return activities, nil
}

// Métodos auxiliares privados

func (s *Service) createBetHistoryTx(tx *sql.Tx, history *BetHistory) error {
	query := `
		INSERT INTO bet_history (user_id, game_type, bet_amount, win_amount, profit_loss, result, details)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	_, err := tx.Exec(query, history.UserID, history.GameType, history.BetAmount,
		history.WinAmount, history.ProfitLoss, history.Result, history.Details)
	return err
}

func (s *Service) updateGameStatsTx(tx *sql.Tx, userID int, gameType string, betAmount, profitLoss float64, result string) error {
	// Verificar se já existe um registro
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM game_stats WHERE user_id = ? AND game_type = ?)`
	err := tx.QueryRow(checkQuery, userID, gameType).Scan(&exists)
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
			INSERT INTO game_stats (user_id, game_type, total_bets, total_wins, total_losses,
				total_amount_bet, total_profit, biggest_win, biggest_loss, current_streak,
				best_win_streak, worst_loss_streak, last_played_at)
			VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		`

		streak := 0
		biggestWin := 0.0
		biggestLoss := 0.0

		if result == "win" {
			streak = 1
			biggestWin = profitLoss
		} else if result == "loss" {
			streak = -1
			biggestLoss = profitLoss
		}

		bestWin := 0
		worstLoss := 0
		if streak > 0 {
			bestWin = streak
		} else if streak < 0 {
			worstLoss = -streak
		}

		_, err = tx.Exec(insertQuery, userID, gameType, wins, losses, betAmount, profitLoss,
			biggestWin, biggestLoss, streak, bestWin, worstLoss)
		return err
	}

	// Obter sequência atual
	var currentStreak int
	streakQuery := `SELECT current_streak FROM game_stats WHERE user_id = ? AND game_type = ?`
	err = tx.QueryRow(streakQuery, userID, gameType).Scan(&currentStreak)
	if err != nil {
		return err
	}

	newStreak := s.calculateNewStreak(currentStreak, result)

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

	absNewStreak := newStreak
	if absNewStreak < 0 {
		absNewStreak = -absNewStreak
	}

	_, err = tx.Exec(updateQuery, wins, losses, betAmount, profitLoss,
		profitLoss, profitLoss, profitLoss, profitLoss, newStreak,
		newStreak, newStreak, newStreak,
		newStreak, absNewStreak, absNewStreak,
		userID, gameType)
	return err
}

func (s *Service) updateDailyMetricsTx(tx *sql.Tx, userID int, betAmount, profitLoss float64, result string) error {
	today := time.Now().Format("2006-01-02")

	// Verificar se já existe um registro para hoje
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM daily_metrics WHERE user_id = ? AND date = ?)`
	err := tx.QueryRow(checkQuery, userID, today).Scan(&exists)
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
		_, err = tx.Exec(insertQuery, userID, today, betAmount, profitLoss, wins, losses)
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
	_, err = tx.Exec(updateQuery, betAmount, profitLoss, wins, losses, userID, today)
	return err
}

func (s *Service) getGeneralStats(userID int) (*struct {
	TotalBets      int
	TotalWins      int
	TotalLosses    int
	TotalAmountBet float64
	TotalProfit    float64
	BiggestWin     float64
	BiggestLoss    float64
}, error) {
	query := `
		SELECT 
			COALESCE(SUM(total_bets), 0) as total_bets,
			COALESCE(SUM(total_wins), 0) as total_wins,
			COALESCE(SUM(total_losses), 0) as total_losses,
			COALESCE(SUM(total_amount_bet), 0) as total_amount_bet,
			COALESCE(SUM(total_profit), 0) as total_profit,
			COALESCE(MAX(biggest_win), 0) as biggest_win,
			COALESCE(MIN(biggest_loss), 0) as biggest_loss
		FROM game_stats
		WHERE user_id = ?
	`

	stats := &struct {
		TotalBets      int
		TotalWins      int
		TotalLosses    int
		TotalAmountBet float64
		TotalProfit    float64
		BiggestWin     float64
		BiggestLoss    float64
	}{}

	err := s.db.QueryRow(query, userID).Scan(
		&stats.TotalBets, &stats.TotalWins, &stats.TotalLosses,
		&stats.TotalAmountBet, &stats.TotalProfit, &stats.BiggestWin, &stats.BiggestLoss)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

func (s *Service) getTodayStats(userID int) (*DailyMetrics, error) {
	today := time.Now().Format("2006-01-02")
	query := `
		SELECT COALESCE(bets_count, 0), COALESCE(total_profit, 0)
		FROM daily_metrics
		WHERE user_id = ? AND date = ?
	`

	stats := &DailyMetrics{}
	err := s.db.QueryRow(query, userID, today).Scan(&stats.BetsCount, &stats.TotalProfit)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	return stats, nil
}

func (s *Service) getStreaks(userID int) (*struct {
	CurrentStreak   int
	BestWinStreak   int
	WorstLossStreak int
}, error) {
	query := `
		SELECT 
			COALESCE(SUM(current_streak), 0) as current_streak,
			COALESCE(MAX(best_win_streak), 0) as best_win_streak,
			COALESCE(MAX(worst_loss_streak), 0) as worst_loss_streak
		FROM game_stats
		WHERE user_id = ?
	`

	streaks := &struct {
		CurrentStreak   int
		BestWinStreak   int
		WorstLossStreak int
	}{}

	err := s.db.QueryRow(query, userID).Scan(
		&streaks.CurrentStreak, &streaks.BestWinStreak, &streaks.WorstLossStreak)
	if err != nil {
		return nil, err
	}

	return streaks, nil
}

func (s *Service) getGameStatsResponses(userID int) ([]GameStatsResponse, error) {
	gameStats, err := GetGameStats(s.db, userID)
	if err != nil {
		return nil, err
	}

	var responses []GameStatsResponse
	for _, gs := range gameStats {
		responses = append(responses, gs.ToResponse())
	}

	return responses, nil
}

func (s *Service) getDaysActive(userID int) (int, error) {
	query := `
		SELECT COUNT(DISTINCT date)
		FROM daily_metrics
		WHERE user_id = ? AND bets_count > 0
	`

	var daysActive int
	err := s.db.QueryRow(query, userID).Scan(&daysActive)
	if err != nil && err != sql.ErrNoRows {
		return 0, err
	}

	return daysActive, nil
}

func (s *Service) calculateNewStreak(currentStreak int, result string) int {
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
