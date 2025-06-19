package games

import (
	"errors"
)

func ValidateGame(game Game) error {
	if game.GameName == "" {
		return errors.New("game name is required")
	}
	if game.GameStatus == "" {
		return errors.New("game status is required")
	}
	// Adicione outras validações conforme regras de negócio
	return nil
}
