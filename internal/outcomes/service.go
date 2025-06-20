package outcomes

import "errors"

type Outcome struct {
	ID     int64  `json:"id"`
	GameID int64  `json:"game_id"`
	Result string `json:"result"`
}

func ValidateOutcome(outcome Outcome) error {
	if outcome.GameID <= 0 {
		return errors.New("invalid game id")
	}
	if outcome.Result == "" {
		return errors.New("result is required")
	}
	return nil
}
