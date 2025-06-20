package bets

import (
	"berry_bet/internal/users"
	"errors"
)

func ValidateBet(bet Bet) error {
	if bet.UserID <= 0 {
		return errors.New("invalid user id")
	}
	if bet.GameID <= 0 {
		return errors.New("invalid game id")
	}

	limits, err := GetBetLimits()
	if err != nil {
		return errors.New("could not fetch bet limits")
	}

	if bet.Amount < limits.MinAmount {
		return errors.New("bet amount is below the minimum allowed")
	}
	if bet.Amount > limits.MaxAmount {
		return errors.New("bet amount exceeds the maximum allowed")
	}
	balance, err := users.CalculateUserBalance(bet.UserID)
	if err != nil {
		return errors.New("could not check user balance")
	}
	if bet.Amount > balance {
		return errors.New("insufficient balance")
	}

	return nil
}
