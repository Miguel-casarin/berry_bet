package bets

type BetRequest struct {
	UserID       int64   `json:"user_id"`
	Amount       float64 `json:"amount"`
	Odds         float64 `json:"odds"`
	BetStatus    string  `json:"bet_status"`
	ProfitLoss   float64 `json:"profit_loss"`
	GameID       int64   `json:"game_id"`
	RiggingLevel int64   `json:"rigging_level"`
}

type BetResponse struct {
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

func ToBetResponse(b *Bet) BetResponse {
	return BetResponse{
		ID:           b.ID,
		UserID:       b.UserID,
		Amount:       b.Amount,
		Odds:         b.Odds,
		BetStatus:    b.BetStatus,
		ProfitLoss:   b.ProfitLoss,
		GameID:       b.GameID,
		RiggingLevel: b.RiggingLevel,
		CreatedAt:    b.CreatedAt,
	}
}
