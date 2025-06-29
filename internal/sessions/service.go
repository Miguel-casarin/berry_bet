package sessions

import (
	"errors"
)

func ValidateSession(session Session) error {
	if session.UserID <= 0 {
		return errors.New("invalid user id")
	}
	if session.Token == "" {
		return errors.New("session token is required")
	}
	// Adicione outras validações conforme regras de negócio
	return nil
}
