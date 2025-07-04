package user_stats

type UserStatsRequest struct {
	UserID         int64   `json:"user_id"`
	TotalBets      int64   `json:"total_bets"`
	TotalWins      int64   `json:"total_wins"`
	TotalLosses    int64   `json:"total_losses"`
	TotalAmountBet float64 `json:"total_amount_bet"`
	TotalProfit    float64 `json:"total_profit"`
	Balance        float64 `json:"balance"`
	LastBetAt      string  `json:"last_bet_at"`
}

type UserStatsResponse struct {
	ID             int64   `json:"id"`
	UserID         int64   `json:"user_id"`
	TotalBets      int64   `json:"total_bets"`
	TotalWins      int64   `json:"total_wins"`
	TotalLosses    int64   `json:"total_losses"`
	TotalAmountBet float64 `json:"total_amount_bet"`
	TotalProfit    float64 `json:"total_profit"`
	Balance        float64 `json:"balance"`
	LastBetAt      string  `json:"last_bet_at"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

func ToUserStatsResponse(s *UserStats) UserStatsResponse {
	lastBetAt := ""
	if s.LastBetAt.Valid {
		lastBetAt = s.LastBetAt.String
	}

	return UserStatsResponse{
		ID:             s.ID,
		UserID:         s.UserID,
		TotalBets:      s.TotalBets,
		TotalWins:      s.TotalWins,
		TotalLosses:    s.TotalLosses,
		TotalAmountBet: s.TotalAmountBet,
		TotalProfit:    s.TotalProfit,
		Balance:        s.Balance,
		LastBetAt:      lastBetAt,
		CreatedAt:      s.CreatedAt,
		UpdatedAt:      s.UpdatedAt,
	}
}
