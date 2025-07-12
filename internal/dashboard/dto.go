package dashboard

import (
	"fmt"
	"time"
)

// RecordBetRequest representa a requisição para registrar uma aposta
type RecordBetRequest struct {
	GameType   string  `json:"game_type" validate:"required"`
	BetAmount  float64 `json:"bet_amount" validate:"required,gt=0"`
	WinAmount  float64 `json:"win_amount"`
	ProfitLoss float64 `json:"profit_loss" validate:"required"`
	Result     string  `json:"result" validate:"required,oneof=win loss draw"`
	Details    string  `json:"details"`
}

// DashboardResponse representa a resposta do dashboard
type DashboardResponse struct {
	TotalBets       int                 `json:"total_bets"`
	TotalWins       int                 `json:"total_wins"`
	TotalLosses     int                 `json:"total_losses"`
	TotalAmountBet  float64             `json:"total_amount_bet"`
	TotalProfit     float64             `json:"total_profit"`
	WinRate         float64             `json:"win_rate"`
	ROI             float64             `json:"roi"`
	ProfitMargin    float64             `json:"profit_margin"`
	BiggestWin      float64             `json:"biggest_win"`
	BiggestLoss     float64             `json:"biggest_loss"`
	WinStreak       int                 `json:"win_streak"`
	BestWinStreak   int                 `json:"best_win_streak"`
	WorstLossStreak int                 `json:"worst_loss_streak"`
	BetsToday       int                 `json:"bets_today"`
	ProfitToday     float64             `json:"profit_today"`
	DaysActive      int                 `json:"days_active"`
	GameStats       []GameStatsResponse `json:"game_stats"`
}

// GameStatsResponse representa as estatísticas de um jogo
type GameStatsResponse struct {
	GameType        string    `json:"game_type"`
	TotalBets       int       `json:"total_bets"`
	TotalWins       int       `json:"total_wins"`
	TotalLosses     int       `json:"total_losses"`
	TotalAmountBet  float64   `json:"total_amount_bet"`
	TotalProfit     float64   `json:"total_profit"`
	WinRate         float64   `json:"win_rate"`
	ROI             float64   `json:"roi"`
	BiggestWin      float64   `json:"biggest_win"`
	BiggestLoss     float64   `json:"biggest_loss"`
	CurrentStreak   int       `json:"current_streak"`
	BestWinStreak   int       `json:"best_win_streak"`
	WorstLossStreak int       `json:"worst_loss_streak"`
	LastPlayedAt    time.Time `json:"last_played_at"`
}

// WeeklyDataResponse representa os dados semanais
type WeeklyDataResponse struct {
	Date   string  `json:"date"`
	Profit float64 `json:"profit"`
	Bets   int     `json:"bets"`
}

// ActivityResponse representa uma atividade recente
type ActivityResponse struct {
	Type        string    `json:"type"`
	Amount      float64   `json:"amount"`
	GameType    string    `json:"game_type"`
	Description string    `json:"description"`
	Timestamp   time.Time `json:"timestamp"`
}

// CompleteDashboardResponse representa a resposta completa do dashboard
type CompleteDashboardResponse struct {
	Dashboard      DashboardResponse    `json:"dashboard"`
	WeeklyData     []WeeklyDataResponse `json:"weekly_data"`
	RecentActivity []ActivityResponse   `json:"recent_activity"`
}

// StatsOnlyResponse representa apenas as estatísticas básicas
type StatsOnlyResponse struct {
	TotalBets      int     `json:"total_bets"`
	TotalWins      int     `json:"total_wins"`
	TotalLosses    int     `json:"total_losses"`
	TotalAmountBet float64 `json:"total_amount_bet"`
	TotalProfit    float64 `json:"total_profit"`
	WinRate        float64 `json:"win_rate"`
	ROI            float64 `json:"roi"`
}

// MonthlyDataResponse representa os dados mensais
type MonthlyDataResponse struct {
	Month  string  `json:"month"`
	Profit float64 `json:"profit"`
	Bets   int     `json:"bets"`
}

// ValidateRecordBetRequest valida a requisição de registro de aposta
func (r *RecordBetRequest) Validate() error {
	if r.GameType == "" {
		return fmt.Errorf("game_type é obrigatório")
	}

	if r.BetAmount <= 0 {
		return fmt.Errorf("bet_amount deve ser maior que zero")
	}

	if r.Result != "win" && r.Result != "loss" && r.Result != "draw" {
		return fmt.Errorf("result deve ser 'win', 'loss' ou 'draw'")
	}

	return nil
}

// ToGameStatsResponse converte GameStats para GameStatsResponse
func (gs *GameStats) ToResponse() GameStatsResponse {
	winRate := 0.0
	roi := 0.0

	if gs.TotalBets > 0 {
		winRate = (float64(gs.TotalWins) / float64(gs.TotalBets)) * 100
	}

	if gs.TotalAmountBet > 0 {
		roi = (gs.TotalProfit / gs.TotalAmountBet) * 100
	}

	return GameStatsResponse{
		GameType:        gs.GameType,
		TotalBets:       gs.TotalBets,
		TotalWins:       gs.TotalWins,
		TotalLosses:     gs.TotalLosses,
		TotalAmountBet:  gs.TotalAmountBet,
		TotalProfit:     gs.TotalProfit,
		WinRate:         winRate,
		ROI:             roi,
		BiggestWin:      gs.BiggestWin,
		BiggestLoss:     gs.BiggestLoss,
		CurrentStreak:   gs.CurrentStreak,
		BestWinStreak:   gs.BestWinStreak,
		WorstLossStreak: gs.WorstLossStreak,
		LastPlayedAt:    gs.LastPlayedAt,
	}
}

// ToBetHistory converte RecordBetRequest para BetHistory
func (r *RecordBetRequest) ToBetHistory(userID int) *BetHistory {
	return &BetHistory{
		UserID:     userID,
		GameType:   r.GameType,
		BetAmount:  r.BetAmount,
		WinAmount:  r.WinAmount,
		ProfitLoss: r.ProfitLoss,
		Result:     r.Result,
		Details:    r.Details,
	}
}
