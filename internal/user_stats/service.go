package user_stats

import (
	"errors"
)

// Funções de regras de negócio para estatísticas de usuário

// Exemplo: validação de estatísticas
func ValidateUserStats(stats UserStats) error {
	if stats.UserID <= 0 {
		return errors.New("invalid user id")
	}
	if stats.TotalBets < 0 {
		return errors.New("total bets cannot be negative")
	}
	if stats.TotalWins < 0 {
		return errors.New("total wins cannot be negative")
	}
	// Adicione outras validações conforme regras de negócio
	return nil
}
