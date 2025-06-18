package roleta

func Start(saldo_aposta float64) float64 {
	saldo_aposta = saldo_aposta + Randon_inicial(saldo_aposta)
	return saldo_aposta
}

// criar uma struct para guardar os resultados
type Dados_rodadas struct {
}

func Final(saldo_aposta float64) (float64, float64, int) {

	var limit float64 = 1000.00
	var historical_value float64 = 0
	var loser_count int = 0
	var statistical_loser int = 0

	var victory int = 0

	if Randon_fdp() {
		new_value := op_valor(saldo_aposta)
		saldo_aposta = saldo_aposta + new_value
		historical_value = historical_value + Count_money(historical_value, saldo_aposta)
		victory = victory + 1

	} else {
		saldo_aposta = 0
		historical_value = historical_value + Count_money(saldo_aposta)
		loser_count = Loser_count(loser_count)
		victory = 0
	}

	if loser_count == 3 {
		saldo_aposta = Give_low(saldo_aposta)
		statistical_loser = statistical_loser + Statistical_loser(loser_count)
		loser_count = 0
	}

	if historical_value >= limit {
		Haddad(saldo_aposta)
	}

	if victory >= 5 {
		Haddad(saldo_aposta)
	}

	return saldo_aposta, historical_value, statistical_loser
}
