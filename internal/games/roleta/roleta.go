package roleta

func Start(saldo_aposta float64) float64 {
	saldo_aposta = saldo_aposta + Randon_inicial(saldo_aposta)
	return saldo_aposta
}

// criar uma struct para guardar os resultados
type Dados_rodadas struct {
	valor_aposta      float64
	historical_value  float64
	loser_count       int
	statistical_loser int
	limit             float64
	victory           int
}

func Final(saldo_aposta float64) Dados_rodadas {
	data := Dados_rodadas{
		valor_aposta:      saldo_aposta,
		historical_value:  0,
		loser_count:       0,
		statistical_loser: 0,
		limit:             1000.00,
		victory:           0,
	}

	if Randon_fdp() {
		new_value := op_valor(data.valor_aposta)
		data.valor_aposta = data.valor_aposta + new_value
		data.historical_value = data.historical_value + Count_money(data.historical_value, data.valor_aposta)
		data.victory = data.victory + 1
	} else {
		data.valor_aposta = 0
		data.historical_value = data.historical_value + Count_money(data.historical_value, data.valor_aposta)
		data.loser_count = Loser_count(data.loser_count)
		data.victory = 0
	}

	if data.loser_count == 3 {
		data.valor_aposta = Give_low(data.valor_aposta)
		data.statistical_loser = data.statistical_loser + Statistical_loser(data.loser_count)
		data.loser_count = 0
	}

	if data.historical_value >= data.limit {
		Haddad(data.valor_aposta)
	}

	if data.victory >= 5 {
		Haddad(data.valor_aposta)
	}

	return data
}
