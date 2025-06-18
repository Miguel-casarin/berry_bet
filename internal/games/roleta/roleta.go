package roleta

func main() {
	var roubo float64 = 1000.00

	var historical_value float64 = 0
	var saldo float64 = 0
	var loser_count int = 0
	var statistical_loser int = 0

	var victory int = 0

	saldo = Get_value()
	salddo = saldo + Randon_inicial(valor)

	if sorteio.Randon_fdp(saldo) {
		new_value := op_valor(saldo)
		saldo = saldo + new_value
		historical_value = historical_value + Count_money(saldo)
		victory = victory + 1

	} else {
		saldo = 0
		historical_value = historical_value + Count_money(saldo)
		loser_count = Loser_count(loser_count)
		victory = 0
	}

	if loser_count == 3 {
		saldo = Give_low(saldo)
		statistical_loser = statistical_loser + Statistical_loser(loser_count)
		loser_count = 0
	}

	if historical_value >= roubo {
		Haddad(saldo)
	}

	if victory >= 5 {
		Haddad(saldo)
	}

}
