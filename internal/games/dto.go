package games

type GameRequest struct {
	GameName        string `json:"game_name"`
	GameDescription string `json:"game_description"`
	StartTime       string `json:"start_time"`
	EndTime         string `json:"end_time"`
	GameStatus      string `json:"game_status"`
}

type GameResponse struct {
	ID              int64  `json:"id"`
	GameName        string `json:"game_name"`
	GameDescription string `json:"game_description"`
	StartTime       string `json:"start_time"`
	EndTime         string `json:"end_time"`
	GameStatus      string `json:"game_status"`
	CreatedAt       string `json:"created_at"`
}

func ToGameResponse(g *Game) GameResponse {
	return GameResponse{
		ID:              g.ID,
		GameName:        g.GameName,
		GameDescription: g.GameDescription,
		StartTime:       g.StartTime,
		EndTime:         g.EndTime,
		GameStatus:      g.GameStatus,
		CreatedAt:       g.CreatedAt,
	}
}
