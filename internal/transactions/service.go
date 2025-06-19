package transactions

import (
	"errors"
)

func ValidateTransaction(t Transaction) error {
	if t.UserID <= 0 {
		return errors.New("invalid user id")
	}
	if t.Amount == 0 {
		return errors.New("transaction amount cannot be zero")
	}
	if t.Type == "" {
		return errors.New("transaction type is required")
	}
	// Adicione outras validações conforme regras de negócio
	return nil
}
