package bets

import (
	"errors"
)

func ValidateBet(bet Bet) error {
	if bet.UserID <= 0 {
		return errors.New("invalid user id")
	}
	if bet.GameID <= 0 {
		return errors.New("invalid game id")
	}
	if bet.Amount <= 0 {
		return errors.New("bet amount must be positive")
	}
	// Adicione outras validações conforme regras de negócio
	return nil
}
