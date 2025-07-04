package roleta

type RoletaBetRequest struct {
    UserID      int64   `json:"user_id"`
    BetValue float64 `json:"valor_aposta"`
}

type RoletaBetResponse struct {
    Result      string  `json:"result"`        // e.g.: "win", "lose", "give-low", "government"
    WinAmount   float64 `json:"win_amount"`    // how much was won (or 0)
    Card        int     `json:"card"`          // card matrix sent by the backend
    CurrentBalance float64 `json:"current_balance"` // user's updated balance
    Message     string  `json:"message"`       // message to the user
}