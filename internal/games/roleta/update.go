package roleta

import (
	"berry_bet/User"
)

var saldo float64 = CalculateUserBalance(User.ID)

func Discount(value, solado float64) (float64, error) {
	if value <= saldo {
		saldo -= value
		// fazer o updat no banco depois
		credit := value
		return credit
	}
	return credit, nil
}

func Update_saldo(credit float64) (float64, error) {
	if value > 0 {
		saldo += credit
	} else {
		return nil
	}
}
