package outcomes

type OutcomeRequest struct {
	GameID int64  `json:"game_id"`
	Result string `json:"result"`
}

type OutcomeResponse struct {
	ID     int64  `json:"id"`
	GameID int64  `json:"game_id"`
	Result string `json:"result"`
}

func ToOutcomeResponse(o *Outcome) OutcomeResponse {
	return OutcomeResponse{
		ID:     o.ID,
		GameID: o.GameID,
		Result: o.Result,
	}
}
