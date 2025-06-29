package bets

import (
	"berry_bet/config"
	"database/sql"
	"log"
)

type BetLimits struct {
	MinAmount float64
	MaxAmount float64
}

func GetBetLimits() (BetLimits, error) {
	var limits BetLimits
	row := config.DB.QueryRow("SELECT min_amount, max_amount FROM bet_limits ORDER BY updated_at DESC LIMIT 1")
	err := row.Scan(&limits.MinAmount, &limits.MaxAmount)
	if err != nil {
		if err == sql.ErrNoRows {
			limits.MinAmount = 1.0
			limits.MaxAmount = 1000.0
			return limits, nil
		}
		log.Printf("Error fetching bet limits: %v", err)
		return limits, err
	}
	return limits, nil
}
