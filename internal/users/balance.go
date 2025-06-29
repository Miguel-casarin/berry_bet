package users

import (
	"berry_bet/config"
)

func CalculateUserBalance(userID int64) (float64, error) {
	var balance float64
	rows, err := config.DB.Query(`SELECT type, amount FROM transactions WHERE user_id = ?`, userID)
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	for rows.Next() {
		var ttype string
		var amount float64
		if err := rows.Scan(&ttype, &amount); err != nil {
			return 0, err
		}
		switch ttype {
		case "deposit", "win", "bonus":
			balance += amount
		case "bet", "withdraw":
			balance -= amount
		}
	}
	return balance, nil
}
